import { Projectile, ProjectileConfig } from './Projectile';
import { ProjectileType } from '../types';

/**
 * 航炮/加农炮子弹
 */
export class Bullet extends Projectile {
  constructor(config: ProjectileConfig) {
    super({ ...config, type: ProjectileType.BULLET });
  }

  render(ctx: CanvasRenderingContext2D, alpha = 1): void {
    if (!this.active && !this.isExploded) return;

    const pos = this.getInterpolatedPosition(alpha);
    const cx = pos.x + this.width / 2;
    const cy = pos.y + this.height / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.rotation);

    // 子弹 - 椭圆形
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // 尾焰
    ctx.fillStyle = 'rgba(255, 200, 50, 0.5)';
    ctx.beginPath();
    ctx.ellipse(0, this.height / 2, this.width / 3, this.height / 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
