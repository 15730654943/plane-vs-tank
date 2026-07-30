import { Projectile, ProjectileConfig } from './Projectile';
import { ProjectileType } from '../types';
import { AIRPLANE_MISSILE_TURN_RATE, AIRPLANE_MISSILE_SPEED } from '../config/constants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface GameEntityLike { active: boolean; getCenter: () => { x: number; y: number }; id: string; }

/**
 * 追踪导弹
 */
export class Missile extends Projectile {
  homingTarget: string | null = null;
  private targetEntity: GameEntityLike | null = null;
  private trail: { x: number; y: number; alpha: number }[] = [];
  private trailTimer = 0;

  constructor(config: ProjectileConfig & { targetId?: string }) {
    super({ ...config, type: ProjectileType.MISSILE, radius: 6, lifetime: 4 });
    this.homingTarget = config.targetId || null;
  }

  setTarget(entity: GameEntityLike | null): void {
    this.targetEntity = entity;
    if (entity) {
      this.homingTarget = (entity as unknown as { id: string }).id;
    }
  }

  update(dt: number): void {
    if (!this.active) return;

    const dtSeconds = dt / 1000;

    // 追踪逻辑
    if (this.targetEntity && (this.targetEntity as unknown as { active: boolean }).active) {
      const target = this.targetEntity as unknown as { getCenter: () => { x: number; y: number } };
      const tc = target.getCenter();
      const mc = this.getCenter();

      const dx = tc.x - mc.x;
      const dy = tc.y - mc.y;
      const targetAngle = Math.atan2(dy, dx);

      // 平滑转向
      let diff = targetAngle - this.rotation;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.rotation += Math.sign(diff) * Math.min(Math.abs(diff), AIRPLANE_MISSILE_TURN_RATE * dt);
    }

    // 更新速度方向
    this.velocityX = Math.cos(this.rotation) * AIRPLANE_MISSILE_SPEED;
    this.velocityY = Math.sin(this.rotation) * AIRPLANE_MISSILE_SPEED;

    // 移动
    this.setPosition(
      this.position.x + this.velocityX * (dt / 16.67),
      this.position.y + this.velocityY * (dt / 16.67)
    );

    // 尾迹
    this.trailTimer -= dtSeconds;
    if (this.trailTimer <= 0) {
      this.trailTimer = 0.03;
      const c = this.getCenter();
      this.trail.push({ x: c.x, y: c.y, alpha: 0.8 });
      if (this.trail.length > 15) this.trail.shift();
    }

    // 衰减尾迹
    for (let i = this.trail.length - 1; i >= 0; i--) {
      this.trail[i].alpha -= dtSeconds * 3;
      if (this.trail[i].alpha <= 0) {
        this.trail.splice(i, 1);
      }
    }

    // 生命周期
    this.lifetime -= dtSeconds;
    if (this.lifetime <= 0) {
      this.explode();
    }
  }

  render(ctx: CanvasRenderingContext2D, alpha = 1): void {
    if (!this.active && !this.isExploded) return;

    // 尾迹
    for (const t of this.trail) {
      ctx.fillStyle = `rgba(255, 100, 50, ${t.alpha * 0.4})`;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    const pos = this.getInterpolatedPosition(alpha);
    const cx = pos.x + this.width / 2;
    const cy = pos.y + this.height / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.rotation);

    // 导弹主体
    ctx.fillStyle = '#FF4444';
    ctx.beginPath();
    ctx.moveTo(6, 0);
    ctx.lineTo(-4, -4);
    ctx.lineTo(-4, 4);
    ctx.closePath();
    ctx.fill();

    // 尾焰
    ctx.fillStyle = `rgba(255, 200, 50, ${0.6 + Math.sin(Date.now() / 50) * 0.3})`;
    ctx.beginPath();
    ctx.moveTo(-4, -2);
    ctx.lineTo(-10 - Math.random() * 4, 0);
    ctx.lineTo(-4, 2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // 爆炸效果
    if (this.isExploded) {
      ctx.fillStyle = 'rgba(255, 100, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(cx, cy, this.explosionRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 150, 0, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}
