import { NetworkManager } from './NetworkManager';
import { SyncEvent, SyncEventType, GamePhase, CharacterType, ItemType } from '../types';
import { Player } from '../entities/Player';
import { Airplane } from '../entities/Airplane';
import { Tank } from '../entities/Tank';
import { Projectile } from '../entities/Projectile';
import { Bullet } from '../entities/Bullet';
import { Missile } from '../entities/Missile';
import { Mine } from '../entities/Mine';
import { Item } from '../entities/Item';
import { NETWORK_SYNC_INTERVAL } from '../config/constants';

export interface GameSnapshot {
  timestamp: number;
  players: Array<{
    id: string;
    x: number;
    y: number;
    rotation: number;
    hp: number;
    energy: number;
    isDead: boolean;
    kills: number;
    deaths: number;
  }>;
  projectiles: Array<{
    id: string;
    x: number;
    y: number;
    rotation: number;
    type: string;
    active: boolean;
  }>;
  items: Array<{
    id: string;
    x: number;
    y: number;
    type: ItemType;
    active: boolean;
  }>;
  phase: GamePhase;
  elapsedTime: number;
}

export type SnapshotCallback = (snapshot: GameSnapshot) => void;

/**
 * 状态同步管理器
 * 处理玩家位置/射击/受伤/死亡/道具等事件
 */
export class SyncManager {
  private network: NetworkManager;
  private localPlayerId: string;
  private snapshotListeners: SnapshotCallback[] = [];
  private lastSnapshotTime = 0;
  private pendingEvents: SyncEvent[] = [];
  private isHost = false;

  constructor(network: NetworkManager, localPlayerId: string, isHost = false) {
    this.network = network;
    this.localPlayerId = localPlayerId;
    this.isHost = isHost;
    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.network.onEvent(SyncEventType.PLAYER_MOVE, (e) => this.pendingEvents.push(e));
    this.network.onEvent(SyncEventType.PLAYER_SHOOT, (e) => this.pendingEvents.push(e));
    this.network.onEvent(SyncEventType.PLAYER_SPECIAL, (e) => this.pendingEvents.push(e));
    this.network.onEvent(SyncEventType.PLAYER_HIT, (e) => this.pendingEvents.push(e));
    this.network.onEvent(SyncEventType.PLAYER_DEATH, (e) => this.pendingEvents.push(e));
    this.network.onEvent(SyncEventType.PLAYER_RESPAWN, (e) => this.pendingEvents.push(e));
    this.network.onEvent(SyncEventType.PROJECTILE_SPAWN, (e) => this.pendingEvents.push(e));
    this.network.onEvent(SyncEventType.PROJECTILE_DESTROY, (e) => this.pendingEvents.push(e));
    this.network.onEvent(SyncEventType.ITEM_SPAWN, (e) => this.pendingEvents.push(e));
    this.network.onEvent(SyncEventType.ITEM_PICKUP, (e) => this.pendingEvents.push(e));
    this.network.onEvent(SyncEventType.GAME_PHASE_CHANGE, (e) => this.pendingEvents.push(e));
    this.network.onEvent(SyncEventType.GAME_STATE_FULL, (e) => this.pendingEvents.push(e));
  }

  addSnapshotListener(cb: SnapshotCallback): void {
    this.snapshotListeners.push(cb);
  }

  removeSnapshotListener(cb: SnapshotCallback): void {
    const idx = this.snapshotListeners.indexOf(cb);
    if (idx >= 0) this.snapshotListeners.splice(idx, 1);
  }

  /**
   * 发送本地玩家位置同步
   */
  sendPlayerMove(player: Player): boolean {
    return this.network.sendSyncEvent({
      type: SyncEventType.PLAYER_MOVE,
      timestamp: Date.now(),
      playerId: this.localPlayerId,
      data: {
        x: player.position.x,
        y: player.position.y,
        rotation: player.rotation,
        hp: player.hp,
        energy: player.energy,
        isDead: player.isDead,
        velocityX: 0,
        velocityY: 0,
      },
    });
  }

  /**
   * 发送射击事件
   */
  sendPlayerShoot(
    projectileType: string,
    x: number,
    y: number,
    velocityX: number,
    velocityY: number,
    rotation: number,
    damage: number
  ): boolean {
    return this.network.sendSyncEvent({
      type: SyncEventType.PLAYER_SHOOT,
      timestamp: Date.now(),
      playerId: this.localPlayerId,
      data: {
        projectileType,
        x,
        y,
        velocityX,
        velocityY,
        rotation,
        damage,
      },
    });
  }

  /**
   * 发送特殊技能事件
   */
  sendPlayerSpecial(specialType: string, x: number, y: number, targetId?: string): boolean {
    return this.network.sendSyncEvent({
      type: SyncEventType.PLAYER_SPECIAL,
      timestamp: Date.now(),
      playerId: this.localPlayerId,
      data: { specialType, x, y, targetId },
    });
  }

  /**
   * 发送受伤事件
   */
  sendPlayerHit(victimId: string, damage: number): boolean {
    return this.network.sendSyncEvent({
      type: SyncEventType.PLAYER_HIT,
      timestamp: Date.now(),
      playerId: this.localPlayerId,
      data: { victimId, damage },
    });
  }

  /**
   * 发送死亡事件
   */
  sendPlayerDeath(victimId: string, x: number, y: number): boolean {
    return this.network.sendSyncEvent({
      type: SyncEventType.PLAYER_DEATH,
      timestamp: Date.now(),
      playerId: this.localPlayerId,
      data: { victimId, x, y },
    });
  }

  /**
   * 发送重生事件
   */
  sendPlayerRespawn(x: number, y: number): boolean {
    return this.network.sendSyncEvent({
      type: SyncEventType.PLAYER_RESPAWN,
      timestamp: Date.now(),
      playerId: this.localPlayerId,
      data: { x, y },
    });
  }

  /**
   * 发送道具生成事件
   */
  sendItemSpawn(itemType: ItemType, x: number, y: number, itemId: string): boolean {
    return this.network.sendSyncEvent({
      type: SyncEventType.ITEM_SPAWN,
      timestamp: Date.now(),
      playerId: this.localPlayerId,
      data: { itemType, x, y, itemId },
    });
  }

  /**
   * 发送道具拾取事件
   */
  sendItemPickup(itemId: string, playerId: string): boolean {
    return this.network.sendSyncEvent({
      type: SyncEventType.ITEM_PICKUP,
      timestamp: Date.now(),
      playerId,
      data: { itemId },
    });
  }

  /**
   * 发送游戏阶段变化
   */
  sendGamePhaseChange(phase: GamePhase, countdown?: number): boolean {
    return this.network.sendSyncEvent({
      type: SyncEventType.GAME_PHASE_CHANGE,
      timestamp: Date.now(),
      playerId: this.localPlayerId,
      data: { phase, countdown },
    });
  }

  /**
   * 发送完整游戏状态（主机用）
   */
  sendFullGameState(snapshot: GameSnapshot): boolean {
    return this.network.sendSyncEvent({
      type: SyncEventType.GAME_STATE_FULL,
      timestamp: Date.now(),
      playerId: this.localPlayerId,
      data: snapshot as unknown as Record<string, unknown>,
    });
  }

  /**
   * 广播游戏快照（主机每100ms发送一次）
   */
  broadcastSnapshot(
    players: Player[],
    projectiles: Projectile[],
    items: Item[],
    phase: GamePhase,
    elapsedTime: number
  ): void {
    if (!this.isHost) return;

    const now = Date.now();
    if (now - this.lastSnapshotTime < NETWORK_SYNC_INTERVAL) return;
    this.lastSnapshotTime = now;

    const snapshot: GameSnapshot = {
      timestamp: now,
      players: players.map((p) => ({
        id: p.id,
        x: p.position.x,
        y: p.position.y,
        rotation: p.rotation,
        hp: p.hp,
        energy: p.energy,
        isDead: p.isDead,
        kills: p.kills,
        deaths: p.deaths,
      })),
      projectiles: projectiles.map((pr) => ({
        id: pr.id,
        x: pr.position.x,
        y: pr.position.y,
        rotation: pr.rotation,
        type: pr.type,
        active: pr.active,
      })),
      items: items.map((i) => ({
        id: i.id,
        x: i.position.x,
        y: i.position.y,
        type: i.itemType,
        active: i.active,
      })),
      phase,
      elapsedTime,
    };

    this.sendFullGameState(snapshot);

    for (const cb of this.snapshotListeners) {
      cb(snapshot);
    }
  }

  /**
   * 获取并清空待处理的事件
   */
  getPendingEvents(): SyncEvent[] {
    const events = [...this.pendingEvents];
    this.pendingEvents = [];
    return events;
  }

  setHost(isHost: boolean): void {
    this.isHost = isHost;
  }
}
