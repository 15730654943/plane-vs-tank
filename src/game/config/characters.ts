import { CharacterType } from '../types';
import {
  AIRPLANE_HP,
  AIRPLANE_SPEED,
  AIRPLANE_ARMOR,
  AIRPLANE_MAX_ENERGY,
  AIRPLANE_SIZE,
  TANK_HP,
  TANK_SPEED,
  TANK_ARMOR,
  TANK_MAX_ENERGY,
  TANK_SIZE,
} from './constants';

export interface CharacterConfig {
  type: CharacterType;
  name: string;
  description: string;
  maxHp: number;
  baseSpeed: number;
  baseArmor: number;
  maxEnergy: number;
  energyRegen: number;
  size: { width: number; height: number };
  // 绘制颜色
  bodyColor: string;
  detailColor: string;
  // 移动特性
  allowDiagonal: boolean; // 是否允许斜向移动
  rotationSpeed: number; // 转向速度
}

export const AIRPLANE_CONFIG: CharacterConfig = {
  type: CharacterType.AIRPLANE,
  name: '战斗机',
  description: '高机动性空中单位，速度快但装甲薄弱',
  maxHp: AIRPLANE_HP,
  baseSpeed: AIRPLANE_SPEED,
  baseArmor: AIRPLANE_ARMOR,
  maxEnergy: AIRPLANE_MAX_ENERGY,
  energyRegen: 5,
  size: { width: AIRPLANE_SIZE.x, height: AIRPLANE_SIZE.y },
  bodyColor: '#4A90D9',
  detailColor: '#87CEEB',
  allowDiagonal: true,
  rotationSpeed: 0.15,
};

export const TANK_CONFIG: CharacterConfig = {
  type: CharacterType.TANK,
  name: '主战坦克',
  description: '重装甲地面单位，火力强大但机动性差',
  maxHp: TANK_HP,
  baseSpeed: TANK_SPEED,
  baseArmor: TANK_ARMOR,
  maxEnergy: TANK_MAX_ENERGY,
  energyRegen: 3,
  size: { width: TANK_SIZE.x, height: TANK_SIZE.y },
  bodyColor: '#6B8E23',
  detailColor: '#556B2F',
  allowDiagonal: false,
  rotationSpeed: 0.08,
};

export const CHARACTER_CONFIGS: Record<CharacterType, CharacterConfig> = {
  [CharacterType.AIRPLANE]: AIRPLANE_CONFIG,
  [CharacterType.TANK]: TANK_CONFIG,
};
