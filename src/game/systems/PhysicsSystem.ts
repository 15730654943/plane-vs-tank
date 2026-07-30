import { Player } from '../entities/Player';
import { Projectile } from '../entities/Projectile';
import { Entity } from '../entities/Entity';
import { Obstacle } from '../types';

export interface CollisionResult {
  collided: boolean;
  overlapX: number;
  overlapY: number;
}

/**
 * 物理系统
 * AABB矩形碰撞检测 + 圆形碰撞检测
 * 处理实体间碰撞、地图边界碰撞、障碍物碰撞
 */
export class PhysicsSystem {
  private mapWidth = 1600;
  private mapHeight = 1200;
  private obstacles: Obstacle[] = [];

  setMapSize(width: number, height: number): void {
    this.mapWidth = width;
    this.mapHeight = height;
  }

  setObstacles(obstacles: Obstacle[]): void {
    this.obstacles = obstacles;
  }

  /**
   * AABB矩形碰撞检测
   */
  static checkAABBCollision(
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number }
  ): CollisionResult {
    const aLeft = a.x;
    const aRight = a.x + a.width;
    const aTop = a.y;
    const aBottom = a.y + a.height;

    const bLeft = b.x;
    const bRight = b.x + b.width;
    const bTop = b.y;
    const bBottom = b.y + b.height;

    const overlapX = Math.min(aRight - bLeft, bRight - aLeft);
    const overlapY = Math.min(aBottom - bTop, bBottom - aTop);

    const collided = aLeft < bRight && aRight > bLeft && aTop < bBottom && aBottom > bTop;

    return { collided, overlapX, overlapY };
  }

  /**
   * 圆形碰撞检测
   */
  static checkCircleCollision(
    a: { x: number; y: number; radius: number },
    b: { x: number; y: number; radius: number }
  ): boolean {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < a.radius + b.radius;
  }

  /**
   * 矩形与圆形碰撞检测
   */
  static checkRectCircleCollision(
    rx: number, ry: number, rw: number, rh: number,
    cx: number, cy: number, cr: number
  ): boolean {
    const closestX = Math.max(rx, Math.min(cx, rx + rw));
    const closestY = Math.max(ry, Math.min(cy, ry + rh));
    const dx = cx - closestX;
    const dy = cy - closestY;
    return (dx * dx + dy * dy) < (cr * cr);
  }

  /**
   * 检测玩家与地图边界碰撞并修正位置
   */
  clampToMapBounds(player: Player): void {
    const x = Math.max(0, Math.min(this.mapWidth - player.width, player.position.x));
    const y = Math.max(0, Math.min(this.mapHeight - player.height, player.position.y));
    if (x !== player.position.x || y !== player.position.y) {
      player.setPosition(x, y);
    }
  }

  /**
   * 检测实体与障碍物碰撞
   */
  checkObstacleCollision(entity: Entity): Obstacle | null {
    const bounds = entity.getBounds();
    const cx = bounds.left + entity.width / 2;
    const cy = bounds.top + entity.height / 2;
    const radius = Math.max(entity.width, entity.height) / 2;

    for (const obs of this.obstacles) {
      if (!obs.destructible && obs.hp <= 0) continue;

      if (PhysicsSystem.checkRectCircleCollision(obs.x, obs.y, obs.width, obs.height, cx, cy, radius)) {
        return obs;
      }
    }
    return null;
  }

  /**
   * 检测玩家与障碍物碰撞并修正位置
   */
  resolvePlayerObstacleCollision(player: Player): void {
    const obs = this.checkObstacleCollision(player);
    if (obs) {
      const px = player.position.x;
      const py = player.position.y;
      const pw = player.width;
      const ph = player.height;

      // 计算从障碍物中心到玩家中心的方向
      const obsCx = obs.x + obs.width / 2;
      const obsCy = obs.y + obs.height / 2;
      const playerCx = px + pw / 2;
      const playerCy = py + ph / 2;

      const dx = playerCx - obsCx;
      const dy = playerCy - obsCy;

      // 根据方向推开
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (absDx / obs.width > absDy / obs.height) {
        // 水平方向推开
        if (dx > 0) {
          player.setPosition(obs.x + obs.width, py);
        } else {
          player.setPosition(obs.x - pw, py);
        }
      } else {
        // 垂直方向推开
        if (dy > 0) {
          player.setPosition(px, obs.y + obs.height);
        } else {
          player.setPosition(px, obs.y - ph);
        }
      }
    }
  }

  /**
   * 检测投射物与障碍物碰撞
   */
  checkProjectileObstacleCollision(projectile: Projectile): Obstacle | null {
    const c = projectile.getCenter();
    for (const obs of this.obstacles) {
      if (obs.hp <= 0) continue;
      if (PhysicsSystem.checkRectCircleCollision(obs.x, obs.y, obs.width, obs.height, c.x, c.y, projectile.radius)) {
        return obs;
      }
    }
    return null;
  }

  /**
   * 检测两个玩家碰撞
   */
  checkPlayerCollision(a: Player, b: Player): boolean {
    if (a.isDead || b.isDead || !a.active || !b.active) return false;
    const ab = a.getBounds();
    const bb = b.getBounds();
    const result = PhysicsSystem.checkAABBCollision(
      { x: ab.left, y: ab.top, width: ab.right - ab.left, height: ab.bottom - ab.top },
      { x: bb.left, y: bb.top, width: bb.right - bb.left, height: bb.bottom - bb.top }
    );
    return result.collided;
  }

  /**
   * 检测玩家与投射物碰撞
   */
  checkPlayerProjectileCollision(player: Player, projectile: Projectile): boolean {
    if (player.isDead || !player.active || !projectile.active) return false;
    if (projectile.ownerId === player.id) return false; // 不打自己

    const c = projectile.getCenter();
    return PhysicsSystem.checkRectCircleCollision(
      player.position.x, player.position.y, player.width, player.height,
      c.x, c.y, projectile.radius
    );
  }

  /**
   * 检测爆炸范围与玩家碰撞
   */
  checkExplosionPlayerCollision(
    explosionX: number,
    explosionY: number,
    radius: number,
    player: Player
  ): boolean {
    if (player.isDead || !player.active) return false;
    const pc = player.getCenter();
    const dx = pc.x - explosionX;
    const dy = pc.y - explosionY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < radius + Math.max(player.width, player.height) / 2;
  }

  /**
   * 检测玩家与道具碰撞
   */
  checkPlayerItemCollision(
    player: Player,
    item: { position: { x: number; y: number }; width: number; height: number; active: boolean }
  ): boolean {
    if (player.isDead || !player.active || !item.active) return false;
    const pb = player.getBounds();
    const result = PhysicsSystem.checkAABBCollision(
      { x: pb.left, y: pb.top, width: pb.right - pb.left, height: pb.bottom - pb.top },
      {
        x: item.position.x,
        y: item.position.y,
        width: item.width,
        height: item.height,
      }
    );
    return result.collided;
  }

  /**
   * 检测地雷触发范围
   */
  checkMineTrigger(
    mine: { position: { x: number; y: number }; radius: number; active: boolean },
    player: Player,
    triggerRadius: number
  ): boolean {
    if (player.isDead || !player.active || !mine.active) return false;
    const mc = { x: mine.position.x + 10, y: mine.position.y + 10 }; // mine center approx
    const pc = player.getCenter();
    const dx = pc.x - mc.x;
    const dy = pc.y - mc.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < triggerRadius + Math.max(player.width, player.height) / 2;
  }

  /**
   * 更新所有实体的物理
   */
  update(players: Player[], projectiles: Projectile[], dt: number): void {
    for (const player of players) {
      if (!player.active || player.isDead) continue;
      this.clampToMapBounds(player);
      this.resolvePlayerObstacleCollision(player);
    }

    // 投射物与边界/障碍物
    for (const proj of projectiles) {
      if (!proj.active) continue;
      // 边界
      const c = proj.getCenter();
      if (c.x < 0 || c.x > this.mapWidth || c.y < 0 || c.y > this.mapHeight) {
        proj.active = false;
        continue;
      }
      // 障碍物
      const obs = this.checkProjectileObstacleCollision(proj);
      if (obs) {
        if (obs.destructible) {
          obs.hp -= proj.damage;
          if (obs.hp <= 0) {
            obs.hp = 0;
          }
        }
        if (proj.explosionRadius > 0) {
          proj.explode();
        } else {
          proj.active = false;
        }
      }
    }
  }
}
