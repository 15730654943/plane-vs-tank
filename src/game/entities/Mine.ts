import { Projectile, ProjectileConfig } from './Projectile';
import { ProjectileType } from '../types';
import { TANK_MINE_TRIGGER_RADIUS, TANK_MINE_LIFETIME } from '../config/constants';

/**
 * 地雷
 */
export class Mine extends Projectile {
  triggered = false;
  triggerTimer = 0;
  private pulsePhase = 0;

  constructor(config: ProjectileConfig) {
    super({
      ...config,
      type: ProjectileType.MINE,
      radius: 10,
      lifetime: TANK_MINE_LIFETIME,
      explosionRadius: 60,
    });
  }

  update(dt: number): void {
    if (!this.active) return;

    const dtSeconds = dt / 1000;
    this.pulsePhase += dtSeconds * 3;

    if (this.triggered) {
      this.triggerTimer -= dtSeconds;
      if (this.triggerTimer <= 0) {
        this.explode();
      }
      return;
    }

    // 生命周期
    this.lifetime -= dtSeconds;
    if (this.lifetime <= 0) {
      this.active = false;
    }
  }

  /**
   * 被触发
   */
  trigger(): void {
    if (this.triggered) return;
    this.triggered = true;
    this.triggerTimer = 0.3; // 0.3秒后爆炸
  }

  render(ctx: CanvasRenderingContext2D, alpha = 1): void {
    if (!this.active && !this.isExploded) return;

    const pos = this.getInterpolatedPosition(alpha);
    const cx = pos.x + this.width / 2;
    const cy = pos.y + this.height / 2;

    ctx.save();
    ctx.translate(cx, cy);

    if (this.triggered) {
      // 被触发后闪烁
      const flash = Math.sin(Date.now() / 30) > 0;
      ctx.fillStyle = flash ? '#FF0000' : '#FF8800';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // 地雷主体
      ctx.fillStyle = '#555555';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();

      // 脉冲指示器
      const pulseAlpha = 0.3 + Math.sin(this.pulsePhase) * 0.2;
      ctx.fillStyle = `rgba(255, 0, 0, ${pulseAlpha})`;
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();

      // 触发范围（微弱显示）
      ctx.strokeStyle = `rgba(255, 0, 0, ${0.1 + Math.sin(this.pulsePhase) * 0.05})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, TANK_MINE_TRIGGER_RADIUS, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();

    // 爆炸效果
    if (this.isExploded) {
      ctx.fillStyle = 'rgba(255, 80, 0, 0.25)';
      ctx.beginPath();
      ctx.arc(cx, cy, this.explosionRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 120, 0, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}
