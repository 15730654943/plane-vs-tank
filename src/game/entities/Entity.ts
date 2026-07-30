import { Vec2 } from '../types';

let entityIdCounter = 0;

export function generateId(prefix = 'ent'): string {
  return `${prefix}-${++entityIdCounter}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * 实体基类
 * 所有游戏对象的父类
 */
export abstract class Entity {
  id: string;
  position: Vec2;
  rotation: number;
  width: number;
  height: number;
  active: boolean;

  // 用于渲染插值的前一帧位置
  prevPosition: Vec2;

  constructor(
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    id?: string
  ) {
    this.id = id || generateId();
    this.position = { x, y };
    this.prevPosition = { x, y };
    this.rotation = 0;
    this.width = width;
    this.height = height;
    this.active = true;
  }

  setPosition(x: number, y: number): void {
    this.prevPosition.x = this.position.x;
    this.prevPosition.y = this.position.y;
    this.position.x = x;
    this.position.y = y;
  }

  getInterpolatedPosition(alpha: number): Vec2 {
    return {
      x: this.prevPosition.x + (this.position.x - this.prevPosition.x) * alpha,
      y: this.prevPosition.y + (this.position.y - this.prevPosition.y) * alpha,
    };
  }

  getCenter(): Vec2 {
    return {
      x: this.position.x + this.width / 2,
      y: this.position.y + this.height / 2,
    };
  }

  getBounds(): { left: number; top: number; right: number; bottom: number } {
    return {
      left: this.position.x,
      top: this.position.y,
      right: this.position.x + this.width,
      bottom: this.position.y + this.height,
    };
  }

  /**
   * 每帧更新
   * @param dt 固定时间步长(ms)
   */
  abstract update(dt: number): void;

  /**
   * 渲染
   * @param ctx Canvas 2D上下文
   * @param alpha 插值系数
   */
  abstract render(ctx: CanvasRenderingContext2D, alpha?: number): void;

  destroy(): void {
    this.active = false;
  }
}
