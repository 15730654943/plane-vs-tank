import { Player } from '../entities/Player';
import { Projectile } from '../entities/Projectile';
import { Mine } from '../entities/Mine';
import { Missile } from '../entities/Missile';
import { PhysicsSystem } from './PhysicsSystem';
import { CharacterType } from '../types';
import {
  AIRPLANE_MISSILE_EXPLOSION_RADIUS,
  TANK_MINE_EXPLOSION_RADIUS,
  TANK_MINE_TRIGGER_RADIUS,
} from '../config/constants';

export interface CombatEvent {
  type: 'hit' | 'kill' | 'explosion';
  attackerId: string;
  victimId: string;
  damage: number;
  x: number;
  y: number;
}

export type CombatEventCallback = (event: CombatEvent) => void;

/**
 * 战斗系统
 * 伤害计算 = 基础伤害 × (1 + 伤害加成%) × (1 - 护甲值/(护甲值+100))
 * 处理攻击、受伤、死亡判定
 */
export class CombatSystem {
  private events: CombatEvent[] = [];
  private listeners: CombatEventCallback[] = [];

  addListener(cb: CombatEventCallback): void {
    this.listeners.push(cb);
  }

  removeListener(cb: CombatEventCallback): void {
    const idx = this.listeners.indexOf(cb);
    if (idx >= 0) this.listeners.splice(idx, 1);
  }

  private emit(event: CombatEvent): void {
    this.events.push(event);
    for (const cb of this.listeners) {
      cb(event);
    }
  }

  getEvents(): CombatEvent[] {
    return [...this.events];
  }

  clearEvents(): void {
    this.events = [];
  }

  /**
   * 处理子弹/炮弹命中
   */
  processProjectileHit(projectile: Projectile, victim: Player, physics: PhysicsSystem): void {
    if (!projectile.active || victim.isDead) return;

    const attacker = this.findPlayerById(projectile.ownerId, [victim]); // hack: pass victim to avoid self-damage check
    let attackerMultiplier = 1;
    if (attacker) {
      attackerMultiplier = attacker.getDamageMultiplier();
    }

    const actualDamage = victim.takeDamage(projectile.damage, attackerMultiplier);

    if (actualDamage > 0 && attacker) {
      attacker.totalDamage += actualDamage;
    }

    const c = projectile.getCenter();

    // 爆炸类投射物（导弹、地雷）
    if (projectile.explosionRadius > 0) {
      projectile.explode();
      this.processExplosion(c.x, c.y, projectile.explosionRadius, projectile.damage, projectile.ownerId, [victim], physics);
    } else {
      projectile.active = false;
    }

    this.emit({
      type: victim.isDead ? 'kill' : 'hit',
      attackerId: projectile.ownerId,
      victimId: victim.id,
      damage: actualDamage,
      x: c.x,
      y: c.y,
    });

    if (victim.isDead && attacker) {
      attacker.kills++;
    }
  }

  /**
   * 处理范围爆炸伤害
   */
  processExplosion(
    x: number,
    y: number,
    radius: number,
    baseDamage: number,
    attackerId: string,
    alreadyHit: Player[],
    physics: PhysicsSystem,
    allPlayers: Player[] = []
  ): void {
    const attacker = this.findPlayerById(attackerId, allPlayers);
    const attackerMultiplier = attacker ? attacker.getDamageMultiplier() : 1;

    for (const player of allPlayers) {
      if (player.isDead || !player.active) continue;
      if (alreadyHit.includes(player)) continue;
      if (player.id === attackerId) continue; // 不打自己

      if (physics.checkExplosionPlayerCollision(x, y, radius, player)) {
        // 距离衰减伤害
        const pc = player.getCenter();
        const dx = pc.x - x;
        const dy = pc.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const falloff = Math.max(0.3, 1 - dist / radius);
        const damage = Math.round(baseDamage * falloff);

        const actualDamage = player.takeDamage(damage, attackerMultiplier);
        if (actualDamage > 0 && attacker) {
          attacker.totalDamage += actualDamage;
        }

        this.emit({
          type: player.isDead ? 'kill' : 'hit',
          attackerId,
          victimId: player.id,
          damage: actualDamage,
          x,
          y,
        });

        if (player.isDead && attacker) {
          attacker.kills++;
        }
      }
    }

    this.emit({
      type: 'explosion',
      attackerId,
      victimId: '',
      damage: 0,
      x,
      y,
    });
  }

  /**
   * 处理地雷触发
   */
  processMineTrigger(mine: Mine, victim: Player, physics: PhysicsSystem, allPlayers: Player[]): void {
    if (!mine.active || mine.isExploded || victim.isDead) return;

    mine.trigger();

    // 延迟爆炸在 mine.update 中处理，这里只记录
    // 但为了即时性，我们直接处理爆炸
    const c = mine.getCenter();
    this.processExplosion(
      c.x, c.y,
      TANK_MINE_EXPLOSION_RADIUS,
      mine.damage,
      mine.ownerId,
      [],
      physics,
      allPlayers
    );
  }

  /**
   * 处理玩家之间的碰撞（推开，无伤害）
   */
  resolvePlayerCollisions(players: Player[], physics: PhysicsSystem): void {
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const a = players[i];
        const b = players[j];
        if (a.isDead || b.isDead) continue;

        if (physics.checkPlayerCollision(a, b)) {
          // 简单推开
          const ax = a.getCenter().x;
          const ay = a.getCenter().y;
          const bx = b.getCenter().x;
          const by = b.getCenter().y;
          const dx = ax - bx;
          const dy = ay - by;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const pushX = (dx / dist) * 2;
          const pushY = (dy / dist) * 2;

          a.setPosition(a.position.x + pushX, a.position.y + pushY);
          b.setPosition(b.position.x - pushX, b.position.y - pushY);
        }
      }
    }
  }

  /**
   * 检测子弹命中
   */
  checkProjectileHits(
    projectiles: Projectile[],
    players: Player[],
    physics: PhysicsSystem
  ): void {
    for (const proj of projectiles) {
      if (!proj.active) continue;
      for (const player of players) {
        if (physics.checkPlayerProjectileCollision(player, proj)) {
          this.processProjectileHit(proj, player, physics);
          break; // 一颗子弹只打一个人
        }
      }
    }
  }

  /**
   * 检测地雷触发
   */
  checkMineTriggers(
    mines: Mine[],
    players: Player[],
    physics: PhysicsSystem
  ): void {
    for (const mine of mines) {
      if (!mine.active || mine.isExploded || mine.triggered) continue;
      for (const player of players) {
        if (player.id === mine.ownerId) continue; // 自己不会触发自己的地雷
        if (physics.checkMineTrigger(mine, player, TANK_MINE_TRIGGER_RADIUS)) {
          this.processMineTrigger(mine, player, physics, players);
          break;
        }
      }
    }
  }

  private findPlayerById(id: string, players: Player[]): Player | undefined {
    return players.find((p) => p.id === id);
  }

  update(
    projectiles: Projectile[],
    mines: Mine[],
    players: Player[],
    physics: PhysicsSystem
  ): void {
    this.resolvePlayerCollisions(players, physics);
    this.checkProjectileHits(projectiles, players, physics);
    this.checkMineTriggers(mines, players, physics);
  }
}
