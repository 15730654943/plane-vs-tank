import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config/constants';
import { RenderLayer } from '../types';

export interface Renderable {
  render(ctx: CanvasRenderingContext2D, alpha?: number): void;
  getPosition(): { x: number; y: number };
  getRenderLayer(): 'background' | 'game';
}

/**
 * Canvas 2D 渲染器
 * 支持分层渲染（背景层 + 游戏层）
 * 支持视口裁剪，离屏渲染优化
 */
export class CanvasRenderer {
  private container: HTMLElement;
  private mainCanvas: HTMLCanvasElement;
  private mainCtx: CanvasRenderingContext2D;

  // 离屏层
  private backgroundLayer: RenderLayer;
  private gameLayer: RenderLayer;

  // 视口
  private viewportX = 0;
  private viewportY = 0;
  private viewportWidth = CANVAS_WIDTH;
  private viewportHeight = CANVAS_HEIGHT;
  private zoom = 1;

  private renderables: Renderable[] = [];
  private backgroundDirty = true;
  private gameDirty = true;

  constructor(containerId: string) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Canvas container #${containerId} not found`);
    this.container = el;

    // 主画布
    this.mainCanvas = document.createElement('canvas');
    this.mainCanvas.width = CANVAS_WIDTH;
    this.mainCanvas.height = CANVAS_HEIGHT;
    this.mainCanvas.style.width = '100%';
    this.mainCanvas.style.height = '100%';
    this.mainCanvas.style.display = 'block';
    this.container.appendChild(this.mainCanvas);

    const ctx = this.mainCanvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');
    this.mainCtx = ctx;

    // 背景层（静态，很少更新）
    this.backgroundLayer = this.createLayer();
    // 游戏层（动态，每帧更新）
    this.gameLayer = this.createLayer();

    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
  }

  private createLayer(): RenderLayer {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');
    return { canvas, ctx, dirty: true };
  }

  private handleResize(): void {
    const rect = this.container.getBoundingClientRect();
    this.viewportWidth = rect.width;
    this.viewportHeight = rect.height;
  }

  setViewport(x: number, y: number, zoom = 1): void {
    this.viewportX = x;
    this.viewportY = y;
    this.zoom = zoom;
    this.gameDirty = true;
  }

  markBackgroundDirty(): void {
    this.backgroundDirty = true;
  }

  markGameDirty(): void {
    this.gameDirty = true;
  }

  addRenderable(renderable: Renderable): void {
    this.renderables.push(renderable);
    this.gameDirty = true;
  }

  removeRenderable(renderable: Renderable): void {
    const idx = this.renderables.indexOf(renderable);
    if (idx >= 0) {
      this.renderables.splice(idx, 1);
      this.gameDirty = true;
    }
  }

  clearRenderables(): void {
    this.renderables = [];
    this.gameDirty = true;
  }

  /**
   * 渲染背景层（地图、障碍物等静态内容）
   */
  renderBackground(renderFn: (ctx: CanvasRenderingContext2D) => void): void {
    const { ctx } = this.backgroundLayer;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    renderFn(ctx);
    this.backgroundDirty = false;
  }

  /**
   * 主渲染方法
   * @param alpha 插值系数 (0-1)
   */
  render(alpha: number): void {
    const { mainCtx } = this;

    // 清空主画布
    mainCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    mainCtx.save();

    // 应用缩放
    mainCtx.scale(this.zoom, this.zoom);

    // 应用视口偏移（居中）
    const offsetX = -this.viewportX + CANVAS_WIDTH / (2 * this.zoom);
    const offsetY = -this.viewportY + CANVAS_HEIGHT / (2 * this.zoom);
    mainCtx.translate(offsetX, offsetY);

    // 绘制背景层
    mainCtx.drawImage(this.backgroundLayer.canvas, 0, 0);

    // 绘制游戏层（实体）
    // 视口裁剪范围
    const clipLeft = this.viewportX - CANVAS_WIDTH / (2 * this.zoom);
    const clipTop = this.viewportY - CANVAS_HEIGHT / (2 * this.zoom);
    const clipRight = clipLeft + CANVAS_WIDTH / this.zoom;
    const clipBottom = clipTop + CANVAS_HEIGHT / this.zoom;

    for (const r of this.renderables) {
      const pos = r.getPosition();
      // 视口裁剪
      if (pos.x < clipLeft - 100 || pos.x > clipRight + 100 ||
          pos.y < clipTop - 100 || pos.y > clipBottom + 100) {
        continue;
      }
      mainCtx.save();
      r.render(mainCtx, alpha);
      mainCtx.restore();
    }

    mainCtx.restore();
  }

  /**
   * 直接在游戏层上渲染（用于不通过renderables的临时效果）
   */
  getGameContext(): CanvasRenderingContext2D {
    return this.gameLayer.ctx;
  }

  getMainCanvas(): HTMLCanvasElement {
    return this.mainCanvas;
  }

  getViewport(): { x: number; y: number; width: number; height: number; zoom: number } {
    return {
      x: this.viewportX,
      y: this.viewportY,
      width: this.viewportWidth,
      height: this.viewportHeight,
      zoom: this.zoom,
    };
  }

  resize(width: number, height: number): void {
    this.mainCanvas.width = width;
    this.mainCanvas.height = height;
    this.backgroundLayer.canvas.width = width;
    this.backgroundLayer.canvas.height = height;
    this.gameLayer.canvas.width = width;
    this.gameLayer.canvas.height = height;
    this.viewportWidth = width;
    this.viewportHeight = height;
    this.backgroundDirty = true;
    this.gameDirty = true;
  }
}
