import { Vec2 } from '../types';

// ==================== 画布与显示 ====================
export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;
export const VIEWPORT_PADDING = 100;

// ==================== 游戏循环 ====================
export const TARGET_FPS = 60;
export const FIXED_TIME_STEP = 1000 / TARGET_FPS; // ~16.67ms
export const MAX_FRAME_TIME = 100; // 最大帧时间，防止lag spike

// ==================== 网络同步 ====================
export const NETWORK_SYNC_INTERVAL = 100; // ms
export const NETWORK_BROADCAST_RATE = 30; // Hz (for high-frequency events)
export const PREDICTION_MAX_INPUTS = 60;
export const INTERPOLATION_DELAY = 100; // ms
export const RECONCILIATION_THRESHOLD = 50; // px, 超过则回滚

// ==================== 游戏流程 ====================
export const COUNTDOWN_DURATION = 5; // seconds
export const MATCH_MAX_TIME = 180; // seconds (3 minutes)
export const RESPAWN_TIME = 3; // seconds

// ==================== 道具系统 ====================
export const ITEM_SPAWN_INTERVAL = 15; // seconds
export const ITEM_SPAWN_COUNT_MIN = 2;
export const ITEM_SPAWN_COUNT_MAX = 3;
export const ITEM_MAX_COUNT = 8;
export const ITEM_LIFETIME = 20; // seconds

// ==================== 道具效果 ====================
export const HEALTH_PACK_HEAL = 30;
export const ARMOR_BOOST_AMOUNT = 20;
export const ARMOR_BOOST_DURATION = 15; // seconds
export const SPEED_BOOST_MULTIPLIER = 1.5;
export const SPEED_BOOST_DURATION = 10; // seconds
export const DAMAGE_BOOST_MULTIPLIER = 1.5;
export const DAMAGE_BOOST_DURATION = 8; // seconds
export const INVINCIBLE_DURATION = 3; // seconds
export const ENERGY_PACK_AMOUNT = 50;

// ==================== 飞机属性 ====================
export const AIRPLANE_HP = 80;
export const AIRPLANE_SPEED = 8; // px/frame at 60fps
export const AIRPLANE_ARMOR = 10;
export const AIRPLANE_MAX_ENERGY = 100;
export const AIRPLANE_ENERGY_REGEN = 5; // per second
export const AIRPLANE_SIZE: Vec2 = { x: 24, y: 32 };

// 飞机冲刺
export const AIRPLANE_SPRINT_ENERGY_COST = 30; // per second
export const AIRPLANE_SPRINT_SPEED_MULTIPLIER = 2;
export const AIRPLANE_SPRINT_DURATION = 3; // seconds

// 飞机武器
export const AIRPLANE_CANNON_DAMAGE = 8;
export const AIRPLANE_CANNON_FIRE_RATE = 0.1; // seconds
export const AIRPLANE_CANNON_RANGE = 400;
export const AIRPLANE_CANNON_PROJECTILE_SPEED = 12;

export const AIRPLANE_MISSILE_DAMAGE = 35;
export const AIRPLANE_MISSILE_COOLDOWN = 8; // seconds
export const AIRPLANE_MISSILE_EXPLOSION_RADIUS = 80;
export const AIRPLANE_MISSILE_SPEED = 6;
export const AIRPLANE_MISSILE_TURN_RATE = 0.08; // radians per frame
export const AIRPLANE_MISSILE_LIFETIME = 4; // seconds

// ==================== 坦克属性 ====================
export const TANK_HP = 150;
export const TANK_SPEED = 4; // px/frame at 60fps
export const TANK_ARMOR = 30;
export const TANK_MAX_ENERGY = 100;
export const TANK_ENERGY_REGEN = 3; // per second
export const TANK_SIZE: Vec2 = { x: 36, y: 44 };

// 坦克护盾
export const TANK_SHIELD_ENERGY_COST = 50;
export const TANK_SHIELD_AMOUNT = 50;
export const TANK_SHIELD_DURATION = 5; // seconds
export const TANK_SHIELD_COOLDOWN = 15; // seconds

// 坦克武器
export const TANK_CANNON_DAMAGE = 25;
export const TANK_CANNON_FIRE_RATE = 0.8; // seconds
export const TANK_CANNON_RANGE = 350;
export const TANK_CANNON_PROJECTILE_SPEED = 9;

export const TANK_MINE_DAMAGE = 50;
export const TANK_MINE_COOLDOWN = 12; // seconds
export const TANK_MINE_MAX_COUNT = 2;
export const TANK_MINE_LIFETIME = 20; // seconds
export const TANK_MINE_TRIGGER_RADIUS = 30;
export const TANK_MINE_EXPLOSION_RADIUS = 60;

// ==================== 伤害计算 ====================
export function calculateArmorReduction(armor: number): number {
  return armor / (armor + 100);
}

export function calculateDamage(
  baseDamage: number,
  damageMultiplier: number,
  targetArmor: number
): number {
  const armorReduction = calculateArmorReduction(targetArmor);
  return Math.max(1, Math.round(baseDamage * (1 + damageMultiplier - 1) * (1 - armorReduction)));
}

// ==================== 通用物理 ====================
export const FRICTION = 0.9;
export const MAP_BOUNDARY_BOUNCE = 0.5;
