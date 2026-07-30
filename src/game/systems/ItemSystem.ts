import { Item } from '../entities/Item';
import { Player } from '../entities/Player';
import { ItemType } from '../types';
import { PhysicsSystem } from './PhysicsSystem';
import {
  ITEM_SPAWN_INTERVAL,
  ITEM_SPAWN_COUNT_MIN,
  ITEM_SPAWN_COUNT_MAX,
  ITEM_MAX_COUNT,
  ITEM_LIFETIME,
  HEALTH_PACK_HEAL,
  ARMOR_BOOST_AMOUNT,
  ARMOR_BOOST_DURATION,
  SPEED_BOOST_MULTIPLIER,
  SPEED_BOOST_DURATION,
  DAMAGE_BOOST_MULTIPLIER,
  DAMAGE_BOOST_DURATION,
  INVINCIBLE_DURATION,
  ENERGY_PACK_AMOUNT,
} from '../config/constants';

export interface ItemEvent {
  type: 'spawn' | 'pickup' | 'expire';
  itemId: string;
  itemType: ItemType;
  playerId?: string;
  x: number;
  y: number;
}

export type ItemEventCallback = (event: ItemEvent) => void;

const ALL_ITEM_TYPES = Object.values(ItemType);

/**
 * 道具系统
 * 道具生成(每15秒生成2-3个,最多8个,持续20秒消失)、拾取、效果应用
 */
export class ItemSystem {
  private items: Item[] = [];
  private spawnTimer = 0;
  private mapWidth = 1600;
  private mapHeight = 1200;
  private listeners: ItemEventCallback[] = [];

  addListener(cb: ItemEventCallback): void {
    this.listeners.push(cb);
  }

  removeListener(cb: ItemEventCallback): void {
    const idx = this.listeners.indexOf(cb);
    if (idx >= 0) this.listeners.splice(idx, 1);
  }

  private emit(event: ItemEvent): void {
    for (const cb of this.listeners) {
      cb(event);
    }
  }

  setMapSize(width: number, height: number): void {
    this.mapWidth = width;
    this.mapHeight = height;
  }

  getItems(): Item[] {
    return this.items.filter((i) => i.active);
  }

  spawnItem(type: ItemType, x: number, y: number): Item {
    const item = new Item(type, x, y);
    this.items.push(item);
    this.emit({
      type: 'spawn',
      itemId: item.id,
      itemType: type,
      x,
      y,
    });
    return item;
  }

  /**
   * 随机生成道具
   */
  spawnRandomItems(): void {
    const activeCount = this.items.filter((i) => i.active).length;
    if (activeCount >= ITEM_MAX_COUNT) return;

    const count = Math.min(
      ITEM_SPAWN_COUNT_MIN + Math.floor(Math.random() * (ITEM_SPAWN_COUNT_MAX - ITEM_SPAWN_COUNT_MIN + 1)),
      ITEM_MAX_COUNT - activeCount
    );

    for (let i = 0; i < count; i++) {
      const type = ALL_ITEM_TYPES[Math.floor(Math.random() * ALL_ITEM_TYPES.length)];
      const x = 50 + Math.random() * (this.mapWidth - 100);
      const y = 50 + Math.random() * (this.mapHeight - 100);
      this.spawnItem(type, x, y);
    }
  }

  /**
   * 应用道具效果
   */
  applyItemEffect(player: Player, item: Item): void {
    switch (item.itemType) {
      case ItemType.HEALTH_PACK:
        player.heal(HEALTH_PACK_HEAL);
        break;
      case ItemType.ARMOR_BOOST:
        player.armorBoostTimer = ARMOR_BOOST_DURATION;
        break;
      case ItemType.SPEED_BOOST:
        player.speedMultiplier = SPEED_BOOST_MULTIPLIER;
        player.speedBoostTimer = SPEED_BOOST_DURATION;
        break;
      case ItemType.DAMAGE_BOOST:
        player.damageMultiplier = DAMAGE_BOOST_MULTIPLIER;
        player.damageBoostTimer = DAMAGE_BOOST_DURATION;
        break;
      case ItemType.INVINCIBLE:
        player.invincible = true;
        player.invincibleTimer = INVINCIBLE_DURATION;
        break;
      case ItemType.ENERGY_PACK:
        player.addEnergy(ENERGY_PACK_AMOUNT);
        break;
    }

    this.emit({
      type: 'pickup',
      itemId: item.id,
      itemType: item.itemType,
      playerId: player.id,
      x: item.position.x,
      y: item.position.y,
    });

    item.active = false;
  }

  /**
   * 检测拾取
   */
  checkPickups(players: Player[], physics: PhysicsSystem): void {
    for (const item of this.items) {
      if (!item.active) continue;
      for (const player of players) {
        if (player.isDead || !player.active) continue;
        if (physics.checkPlayerItemCollision(player, item)) {
          this.applyItemEffect(player, item);
          break;
        }
      }
    }
  }

  update(dt: number, players: Player[], physics: PhysicsSystem): void {
    const dtSeconds = dt / 1000;

    // 更新所有道具
    for (const item of this.items) {
      if (item.active) {
        item.update(dt);
      }
    }

    // 清理已消失的道具
    this.items = this.items.filter((i) => i.active || this.items.indexOf(i) < this.items.length - 50);

    // 检测拾取
    this.checkPickups(players, physics);

    // 自动生成道具
    this.spawnTimer += dtSeconds;
    if (this.spawnTimer >= ITEM_SPAWN_INTERVAL) {
      this.spawnTimer = 0;
      this.spawnRandomItems();
    }
  }

  clear(): void {
    this.items = [];
    this.spawnTimer = 0;
  }
}
