import { Entity } from './Entity';
import { ItemType } from '../types';
import { ITEM_LIFETIME } from '../config/constants';

const ITEM_COLORS: Record<ItemType, string> = {
  [ItemType.HEALTH_PACK]: '#e74c3c',
  [ItemType.ARMOR_BOOST]: '#95a5a6',
  [ItemType.SPEED_BOOST]: '#f1c40f',
  [ItemType.DAMAGE_BOOST]: '#e67e22',
  [ItemType.INVINCIBLE]: '#9b59b6',
  [ItemType.ENERGY_PACK]: '#3498db',
};

const ITEM_SYMBOLS: Record<ItemType, string> = {
  [ItemType.HEALTH_PACK]: '♥',
  [ItemType.ARMOR_BOOST]: '🛡',
  [ItemType.SPEED_BOOST]: '⚡',
  [ItemType.DAMAGE_BOOST]: '💥',
  [ItemType.INVINCIBLE]: '✨',
  [ItemType.ENERGY_PACK]: '🔋',
};

const ITEM_NAMES: Record<ItemType, string> = {
  [ItemType.HEALTH_PACK]: '生命恢复包',
  [ItemType.ARMOR_BOOST]: '护甲增强',
  [ItemType.SPEED_BOOST]: '速度提升',
  [ItemType.DAMAGE_BOOST]: '伤害增强',
  [ItemType.INVINCIBLE]: '无敌护盾',
  [ItemType.ENERGY_PACK]: '能量恢复',
};

/**
 * 道具实体
 */
export class Item extends Entity {
  itemType: ItemType;
  lifetime: number;
  maxLifetime: number;
  private floatPhase = 0;

  constructor(type: ItemType, x: number, y: number) {
    super(x, y, 24, 24);
    this.itemType = type;
    this.maxLifetime = ITEM_LIFETIME;
    this.lifetime = ITEM_LIFETIME;
  }

  update(dt: number): void {
    if (!this.active) return;

    const dtSeconds = dt / 1000;
    this.lifetime -= dtSeconds;
    this.floatPhase += dtSeconds * 2;

    if (this.lifetime <= 0) {
      this.active = false;
    }
  }

  render(ctx: CanvasRenderingContext2D, alpha = 1): void {
    if (!this.active) return;

    const pos = this.getInterpolatedPosition(alpha);
    const cx = pos.x + this.width / 2;
    const cy = pos.y + this.height / 2 + Math.sin(this.floatPhase) * 3;

    const fadeAlpha = this.lifetime < 3 ? this.lifetime / 3 : 1;
    ctx.globalAlpha = fadeAlpha;

    // 外圈发光
    const color = ITEM_COLORS[this.itemType];
    ctx.fillStyle = color + '40';
    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, Math.PI * 2);
    ctx.fill();

    // 主体
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.fill();

    // 边框
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.stroke();

    // 符号
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ITEM_SYMBOLS[this.itemType], cx, cy);

    ctx.globalAlpha = 1;
  }

  static getName(type: ItemType): string {
    return ITEM_NAMES[type];
  }

  static getColor(type: ItemType): string {
    return ITEM_COLORS[type];
  }
}
