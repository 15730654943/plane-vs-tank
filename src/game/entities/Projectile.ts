import { Entity } from './Entity';
import { ProjectileType } from '../types';

export interface ProjectileConfig {
  ownerId: string;
  type: ProjectileType;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  rotation: number;
  damage: number;
  radius?: number;
  lifetime?: number;
  explosionRadius?: number;
}

/**
 * 子弹/炮弹基类
 */
export abstract class Projectile extends Entity {
  ownerId: string;
  type: ProjectileType;
  velocityX: number;
  velocityY: number;
  damage: number;
  radius: number;
  lifetime: number;
  maxLifetime: number;
  explosionRadius: number;
  isExploded = false;

  constructor(config: ProjectileConfig) {
    const size = config.radius ? config.radius * 2 : 8;
    super(config.x, config.y, size, size);
    this.ownerId = config.ownerId;
    this.type = config.type;
    this.velocityX = config.velocityX;
    this.velocityY = config.velocityY;
    this.rotation = config.rotation;
    this.damage = config.damage;
    this.radius = config.radius || 4;
    this.maxLifetime = config.lifetime || 3;
    this.lifetime = this.maxLifetime;
    this.explosionRadius = config.explosionRadius || 0;
  }

  update(dt: number): void {
    if (!this.active) return;

    const dtSeconds = dt / 1000;

    // 移动
    this.setPosition(
      this.position.x + this.velocityX * (dt / 16.67),
      this.position.y + this.velocityY * (dt / 16.67)
    );

    // 生命周期
    this.lifetime -= dtSeconds;
    if (this.lifetime <= 0) {
      this.onExpire();
    }
  }

  /**
   * 触发爆炸
   */
  explode(): void {
    if (this.isExploded) return;
    this.isExploded = true;
    this.active = false;
    this.onExplode();
  }

  protected onExpire(): void {
    if (this.explosionRadius > 0) {
      this.explode();
    } else {
      this.active = false;
    }
  }

  protected onExplode(): void {
    // 子类覆盖
  }

  abstract render(ctx: CanvasRenderingContext2D, alpha?: number): void;

  getCenter(): { x: number; y: number } {
    return {
      x: this.position.x + this.width / 2,
      y: this.position.y + this.height / 2,
    };
  }
}
