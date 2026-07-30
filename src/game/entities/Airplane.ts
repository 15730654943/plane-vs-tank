import { Player } from './Player';
import { InputState, CharacterType } from '../types';
import {
  AIRPLANE_SPRINT_ENERGY_COST,
  AIRPLANE_SPRINT_SPEED_MULTIPLIER,
  AIRPLANE_SPRINT_DURATION,
  AIRPLANE_MISSILE_COOLDOWN,
} from '../config/constants';
import { CHARACTER_CONFIGS } from '../config/characters';

/**
 * 飞机角色
 * HP=80, 速度=8px/帧, 护甲=10
 * 基础武器航炮(伤害8,射速0.1s,射程400px)
 * 特殊武器导弹(CD8s,追踪,范围伤害35,爆炸半径80px)
 * 能量用于加速冲刺(消耗30/秒,速度×2,持续3s)
 */
export class Airplane extends Player {
  private mapWidth = 2000;
  private mapHeight = 1500;
  private trailTimer = 0;
  public trail: { x: number; y: number; alpha: number }[] = [];

  constructor(name: string, team: number, x: number, y: number) {
    super(name, CharacterType.AIRPLANE, team, x, y);
  }

  setMapSize(w: number, h: number): void {
    this.mapWidth = w;
    this.mapHeight = h;
  }

  handleInput(dt: number): void {
    if (!this.input || this.isDead) return;

    const dtSeconds = dt / 1000;

    // 8方向自由飞行
    let dx = 0;
    let dy = 0;
    if (this.input.up) dy -= 1;
    if (this.input.down) dy += 1;
    if (this.input.left) dx -= 1;
    if (this.input.right) dx += 1;

    // 归一化
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0) {
      dx /= len;
      dy /= len;
    }

    // 冲刺（Shift键）
    if (this.input.sprint && !this.isSprinting && this.energy >= 10) {
      this.isSprinting = true;
      this.sprintTimer = AIRPLANE_SPRINT_DURATION;
      this.speedMultiplier = AIRPLANE_SPRINT_SPEED_MULTIPLIER;
    }

    if (this.isSprinting) {
      const cost = AIRPLANE_SPRINT_ENERGY_COST * dtSeconds;
      if (this.energy >= cost) {
        this.energy -= cost;
      } else {
        this.isSprinting = false;
        this.sprintTimer = 0;
        this.speedMultiplier = 1;
      }
    }

    // 移动
    const moveSpeed = this.speed * this.speedMultiplier * (dt / 16.67);
    this.setPosition(
      this.position.x + dx * moveSpeed,
      this.position.y + dy * moveSpeed
    );

    // 根据移动方向旋转
    if (len > 0) {
      const targetRotation = Math.atan2(dy, dx) + Math.PI / 2;
      // 平滑旋转
      let diff = targetRotation - this.rotation;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.rotation += diff * CHARACTER_CONFIGS[CharacterType.AIRPLANE].rotationSpeed;
    }

    // 尾迹
    this.trailTimer -= dtSeconds;
    if (this.trailTimer <= 0 && len > 0) {
      this.trailTimer = 0.05;
      this.trail.push({
        x: this.getCenter().x,
        y: this.getCenter().y,
        alpha: 0.6,
      });
      if (this.trail.length > 10) this.trail.shift();
    }

    // 衰减尾迹
    for (let i = this.trail.length - 1; i >= 0; i--) {
      this.trail[i].alpha -= dtSeconds * 2;
      if (this.trail[i].alpha <= 0) {
        this.trail.splice(i, 1);
      }
    }
  }

  canUseSpecial(): boolean {
    return this.specialCooldownTimer <= 0;
  }

  useSpecial(): void {
    this.specialCooldownTimer = AIRPLANE_MISSILE_COOLDOWN;
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

    // 飞机主体 - 三角形
    ctx.fillStyle = '#4A90D9';
    ctx.beginPath();
    ctx.moveTo(0, -this.height / 2); // 机头
    ctx.lineTo(-this.width / 2, this.height / 2); // 左翼
    ctx.lineTo(0, this.height / 3); // 尾翼中心
    ctx.lineTo(this.width / 2, this.height / 2); // 右翼
    ctx.closePath();
    ctx.fill();

    // 机翼细节
    ctx.fillStyle = '#87CEEB';
    ctx.beginPath();
    ctx.moveTo(0, -this.height / 3);
    ctx.lineTo(-this.width / 3, this.height / 4);
    ctx.lineTo(this.width / 3, this.height / 4);
    ctx.closePath();
    ctx.fill();

    // 驾驶舱
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.arc(0, -this.height / 6, 4, 0, Math.PI * 2);
    ctx.fill();

    // 冲刺效果
    if (this.isSprinting) {
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-this.width / 3, this.height / 2);
      ctx.lineTo(0, this.height / 2 + 10);
      ctx.lineTo(this.width / 3, this.height / 2);
      ctx.stroke();
    }

    ctx.restore();

    // 绘制尾迹
    for (const t of this.trail) {
      ctx.fillStyle = `rgba(135, 206, 235, ${t.alpha * 0.3})`;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

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
  }
}
