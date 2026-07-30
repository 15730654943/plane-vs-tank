import { Player } from './Player';
import { InputState, CharacterType } from '../types';
import {
  TANK_SHIELD_ENERGY_COST,
  TANK_SHIELD_AMOUNT,
  TANK_SHIELD_DURATION,
  TANK_SHIELD_COOLDOWN,
  TANK_MINE_COOLDOWN,
} from '../config/constants';
import { CHARACTER_CONFIGS } from '../config/characters';

/**
 * 坦克角色
 * HP=150, 速度=4px/帧, 护甲=30
 * 基础武器加农炮(伤害25,射速0.8s,射程350px)
 * 特殊武器地雷(CD12s,最多2颗,持续20s,伤害50)
 * 能量用于护盾(消耗50,临时护盾50,持续5s,CD15s)
 */
export class Tank extends Player {
  private mapWidth = 2000;
  private mapHeight = 1500;
  public mineCount = 0;

  constructor(name: string, team: number, x: number, y: number) {
    super(name, CharacterType.TANK, team, x, y);
  }

  setMapSize(w: number, h: number): void {
    this.mapWidth = w;
    this.mapHeight = h;
  }

  handleInput(dt: number): void {
    if (!this.input || this.isDead) return;

    const dtSeconds = dt / 1000;

    // 坦克只能四方向移动
    let dx = 0;
    let dy = 0;
    if (this.input.up) dy -= 1;
    if (this.input.down) dy += 1;
    if (this.input.left) dx -= 1;
    if (this.input.right) dx += 1;

    // 只能四方向，不能斜向
    if (dx !== 0 && dy !== 0) {
      // 优先水平方向
      dy = 0;
    }

    // 护盾（Q键）
    if (this.input.shield && this.shieldCooldownTimer <= 0 && this.energy >= TANK_SHIELD_ENERGY_COST) {
      this.activateShield();
    }

    // 移动
    const moveSpeed = this.speed * this.speedMultiplier * (dt / 16.67);
    this.setPosition(
      this.position.x + dx * moveSpeed,
      this.position.y + dy * moveSpeed
    );

    // 根据移动方向旋转炮塔
    if (dx !== 0 || dy !== 0) {
      const targetRotation = Math.atan2(dy, dx) + Math.PI / 2;
      let diff = targetRotation - this.rotation;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.rotation += diff * CHARACTER_CONFIGS[CharacterType.TANK].rotationSpeed;
    }
  }

  activateShield(): void {
    if (this.shieldCooldownTimer > 0) return;
    if (!this.consumeEnergy(TANK_SHIELD_ENERGY_COST)) return;

    this.tempShield = TANK_SHIELD_AMOUNT;
    this.shieldTimer = TANK_SHIELD_DURATION;
    this.shieldCooldownTimer = TANK_SHIELD_COOLDOWN;
  }

  canUseSpecial(): boolean {
    return this.specialCooldownTimer <= 0 && this.mineCount < 2;
  }

  useSpecial(): void {
    this.specialCooldownTimer = TANK_MINE_COOLDOWN;
    this.mineCount++;
  }

  onMineDestroyed(): void {
    this.mineCount = Math.max(0, this.mineCount - 1);
  }

  clampToMap(): void {
    this.setMapBounds(this.mapWidth, this.mapHeight);
  }

  render(ctx: CanvasRenderingContext2D, alpha = 1): void {
    if (!this.active) return;
    if (this.isDead) return;

    const pos = this.getInterpolatedPosition(alpha);
    const cx = pos.x + this.width / 2;
    const cy = pos.y + this.height / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.rotation);

    // 无敌闪烁
    if (this.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // 坦克主体 - 矩形
    ctx.fillStyle = '#6B8E23';
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

    // 履带
    ctx.fillStyle = '#3B5E03';
    ctx.fillRect(-this.width / 2 - 3, -this.height / 2, 6, this.height);
    ctx.fillRect(this.width / 2 - 3, -this.height / 2, 6, this.height);

    // 炮塔（圆形）
    ctx.fillStyle = '#556B2F';
    ctx.beginPath();
    ctx.arc(0, 0, this.width / 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 炮管
    ctx.fillStyle = '#2F3F1F';
    ctx.fillRect(-4, -this.height / 2 - 8, 8, this.height / 2 + 8);

    // 护盾效果
    if (this.tempShield > 0) {
      ctx.strokeStyle = `rgba(100, 200, 255, ${0.5 + Math.sin(Date.now() / 200) * 0.3})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, this.width / 1.5, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();

    // 血条
    this.renderHealthBar(ctx, pos.x, pos.y);
  }

  private renderHealthBar(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const barWidth = this.width + 8;
    const barHeight = 4;
    const barX = x - 4;
    const barY = y - 10;

    // 背景
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // 血量
    const hpRatio = this.hp / this.maxHp;
    ctx.fillStyle = hpRatio > 0.5 ? '#2ecc71' : hpRatio > 0.25 ? '#f39c12' : '#e74c3c';
    ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);

    // 能量条
    const energyY = barY + barHeight + 2;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(barX, energyY, barWidth, barHeight);
    ctx.fillStyle = '#3498db';
    ctx.fillRect(barX, energyY, barWidth * (this.energy / this.maxEnergy), barHeight);

    // 护盾条（如果有）
    if (this.tempShield > 0) {
      const shieldY = energyY + barHeight + 2;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(barX, shieldY, barWidth, barHeight);
      ctx.fillStyle = '#64C8FF';
      ctx.fillRect(barX, shieldY, barWidth * (this.tempShield / TANK_SHIELD_AMOUNT), barHeight);
    }
  }
}
