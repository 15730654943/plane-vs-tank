import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config/constants';
import { Vec2 } from '../types';

/**
 * 相机系统
 * 跟随玩家，支持平滑插值
 */
export class Camera {
  private x = 0;
  private y = 0;
  private targetX = 0;
  private targetY = 0;
  private zoom = 1;
  private smoothing = 0.1;
  private shakeIntensity = 0;
  private shakeDecay = 0.9;

  private mapWidth = 1600;
  private mapHeight = 1200;

  constructor(
    private viewportWidth = CANVAS_WIDTH,
    private viewportHeight = CANVAS_HEIGHT
  ) {}

  setMapSize(width: number, height: number): void {
    this.mapWidth = width;
    this.mapHeight = height;
  }

  setTarget(x: number, y: number): void {
    this.targetX = x;
    this.targetY = y;
  }

  setTargetVec2(pos: Vec2): void {
    this.targetX = pos.x;
    this.targetY = pos.y;
  }

  setSmoothing(value: number): void {
    this.smoothing = Math.max(0, Math.min(1, value));
  }

  setZoom(zoom: number): void {
    this.zoom = Math.max(0.5, Math.min(2, zoom));
  }

  getZoom(): number {
    return this.zoom;
  }

  /**
   * 屏幕震动效果
   * @param intensity 震动强度（像素）
   */
  shake(intensity: number): void {
    this.shakeIntensity = intensity;
  }

  update(): void {
    // 平滑插值
    this.x += (this.targetX - this.x) * this.smoothing;
    this.y += (this.targetY - this.y) * this.smoothing;

    // 限制相机在地图边界内
    const halfViewW = (this.viewportWidth / 2) / this.zoom;
    const halfViewH = (this.viewportHeight / 2) / this.zoom;

    this.x = Math.max(halfViewW, Math.min(this.mapWidth - halfViewW, this.x));
    this.y = Math.max(halfViewH, Math.min(this.mapHeight - halfViewH, this.y));

    // 震动衰减
    this.shakeIntensity *= this.shakeDecay;
    if (this.shakeIntensity < 0.5) {
      this.shakeIntensity = 0;
    }
  }

  getPosition(): Vec2 {
    let sx = this.x;
    let sy = this.y;

    if (this.shakeIntensity > 0) {
      sx += (Math.random() - 0.5) * this.shakeIntensity;
      sy += (Math.random() - 0.5) * this.shakeIntensity;
    }

    return { x: sx, y: sy };
  }

  getX(): number {
    return this.getPosition().x;
  }

  getY(): number {
    return this.getPosition().y;
  }

  /**
   * 世界坐标转屏幕坐标
   */
  worldToScreen(worldX: number, worldY: number): Vec2 {
    const pos = this.getPosition();
    return {
      x: (worldX - pos.x) * this.zoom + this.viewportWidth / 2,
      y: (worldY - pos.y) * this.zoom + this.viewportHeight / 2,
    };
  }

  /**
   * 屏幕坐标转世界坐标
   */
  screenToWorld(screenX: number, screenY: number): Vec2 {
    const pos = this.getPosition();
    return {
      x: (screenX - this.viewportWidth / 2) / this.zoom + pos.x,
      y: (screenY - this.viewportHeight / 2) / this.zoom + pos.y,
    };
  }

  /**
   * 检查世界坐标是否在视口内
   */
  isInView(worldX: number, worldY: number, padding = 0): boolean {
    const pos = this.getPosition();
    const halfW = (this.viewportWidth / 2) / this.zoom + padding;
    const halfH = (this.viewportHeight / 2) / this.zoom + padding;
    return (
      worldX >= pos.x - halfW &&
      worldX <= pos.x + halfW &&
      worldY >= pos.y - halfH &&
      worldY <= pos.y + halfH
    );
  }

  getViewBounds(): { left: number; top: number; right: number; bottom: number } {
    const pos = this.getPosition();
    const halfW = (this.viewportWidth / 2) / this.zoom;
    const halfH = (this.viewportHeight / 2) / this.zoom;
    return {
      left: pos.x - halfW,
      top: pos.y - halfH,
      right: pos.x + halfW,
      bottom: pos.y + halfH,
    };
  }
}
