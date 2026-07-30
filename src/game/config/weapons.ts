import { WeaponConfig, WeaponType, CharacterType } from '../types';
import {
  AIRPLANE_CANNON_DAMAGE,
  AIRPLANE_CANNON_FIRE_RATE,
  AIRPLANE_CANNON_RANGE,
  AIRPLANE_CANNON_PROJECTILE_SPEED,
  AIRPLANE_MISSILE_DAMAGE,
  AIRPLANE_MISSILE_COOLDOWN,
  AIRPLANE_MISSILE_EXPLOSION_RADIUS,
  AIRPLANE_MISSILE_SPEED,
  TANK_CANNON_DAMAGE,
  TANK_CANNON_FIRE_RATE,
  TANK_CANNON_RANGE,
  TANK_CANNON_PROJECTILE_SPEED,
  TANK_MINE_DAMAGE,
  TANK_MINE_COOLDOWN,
  TANK_MINE_MAX_COUNT,
  TANK_MINE_LIFETIME,
  TANK_MINE_TRIGGER_RADIUS,
  TANK_MINE_EXPLOSION_RADIUS,
} from './constants';

export interface CharacterWeaponSet {
  primary: WeaponConfig;
  special: SpecialWeaponConfig;
}

export interface SpecialWeaponConfig {
  name: string;
  cooldown: number; // seconds
  description: string;
  // 导弹特有
  explosionRadius?: number;
  homingSpeed?: number;
  turnRate?: number;
  lifetime?: number;
  // 地雷特有
  maxCount?: number;
  triggerRadius?: number;
  // 护盾特有
  shieldAmount?: number;
  shieldDuration?: number;
  energyCost?: number;
}

export const AIRPLANE_PRIMARY_WEAPON: WeaponConfig = {
  name: '航炮',
  damage: AIRPLANE_CANNON_DAMAGE,
  fireRate: AIRPLANE_CANNON_FIRE_RATE,
  range: AIRPLANE_CANNON_RANGE,
  projectileSpeed: AIRPLANE_CANNON_PROJECTILE_SPEED,
  projectileSize: { width: 4, height: 8 },
  specialCooldown: AIRPLANE_MISSILE_COOLDOWN,
  type: WeaponType.CANNON,
};

export const AIRPLANE_SPECIAL_WEAPON: SpecialWeaponConfig = {
  name: '追踪导弹',
  cooldown: AIRPLANE_MISSILE_COOLDOWN,
  description: '发射一枚追踪导弹，自动追踪最近敌人，造成范围伤害',
  explosionRadius: AIRPLANE_MISSILE_EXPLOSION_RADIUS,
  homingSpeed: AIRPLANE_MISSILE_SPEED,
  turnRate: 0.08,
  lifetime: 4,
};

export const TANK_PRIMARY_WEAPON: WeaponConfig = {
  name: '加农炮',
  damage: TANK_CANNON_DAMAGE,
  fireRate: TANK_CANNON_FIRE_RATE,
  range: TANK_CANNON_RANGE,
  projectileSpeed: TANK_CANNON_PROJECTILE_SPEED,
  projectileSize: { width: 6, height: 10 },
  specialCooldown: TANK_MINE_COOLDOWN,
  type: WeaponType.CANNON,
};

export const TANK_SPECIAL_WEAPON: SpecialWeaponConfig = {
  name: '反坦克地雷',
  cooldown: TANK_MINE_COOLDOWN,
  description: '部署反坦克地雷，敌人接近时爆炸，最多部署2颗',
  maxCount: TANK_MINE_MAX_COUNT,
  triggerRadius: TANK_MINE_TRIGGER_RADIUS,
  explosionRadius: TANK_MINE_EXPLOSION_RADIUS,
  lifetime: TANK_MINE_LIFETIME,
};

export const TANK_SHIELD_ABILITY: SpecialWeaponConfig = {
  name: '能量护盾',
  cooldown: 15,
  description: '激活临时护盾，吸收50点伤害，持续5秒',
  shieldAmount: 50,
  shieldDuration: 5,
  energyCost: 50,
};

export const CHARACTER_WEAPONS: Record<CharacterType, CharacterWeaponSet> = {
  [CharacterType.AIRPLANE]: {
    primary: AIRPLANE_PRIMARY_WEAPON,
    special: AIRPLANE_SPECIAL_WEAPON,
  },
  [CharacterType.TANK]: {
    primary: TANK_PRIMARY_WEAPON,
    special: TANK_SPECIAL_WEAPON,
  },
};
