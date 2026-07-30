import { TARGET_FPS, FIXED_TIME_STEP, MAX_FRAME_TIME, NETWORK_SYNC_INTERVAL } from '../config/constants';

export interface GameLoopCallbacks {
  update: (dt: number) => void;
  render: (alpha: number) => void;
  networkSync: () => void;
  onStatsUpdate?: (stats: LoopStats) => void;
}

export interface LoopStats {
  fps: number;
  frameTime: number;
  updateTime: number;
  renderTime: number;
  accumulatedTime: number;
}

/**
 * 主游戏循环
 * 使用 requestAnimationFrame，固定时间步长 (60fps)
 * 支持网络同步间隔 (100ms)
 */
export class GameLoop {
  private running = false;
  private rafId: number | null = null;
  private lastTime = 0;
  private accumulator = 0;
  private lastSyncTime = 0;

  // 统计
  private frameCount = 0;
  private fpsTimer = 0;
  private currentFps = 0;
  private lastUpdateTime = 0;
  private lastRenderTime = 0;

  constructor(private callbacks: GameLoopCallbacks) {}

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.lastSyncTime = this.lastTime;
    this.rafId = requestAnimationFrame((t) => this.loop(t));
  }

  stop(): void {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  isRunning(): boolean {
    return this.running;
  }

  private loop(timestamp: number): void {
    if (!this.running) return;

    // 计算帧时间，限制最大帧时间防止lag spike
    let frameTime = timestamp - this.lastTime;
    if (frameTime > MAX_FRAME_TIME) {
      frameTime = MAX_FRAME_TIME;
    }
    this.lastTime = timestamp;

    // 累加器用于固定时间步长
    this.accumulator += frameTime;

    // 网络同步检查
    if (timestamp - this.lastSyncTime >= NETWORK_SYNC_INTERVAL) {
      const syncStart = performance.now();
      this.callbacks.networkSync();
      this.lastSyncTime = timestamp;
    }

    // 固定时间步长更新
    const updateStart = performance.now();
    let updateSteps = 0;
    while (this.accumulator >= FIXED_TIME_STEP) {
      this.callbacks.update(FIXED_TIME_STEP);
      this.accumulator -= FIXED_TIME_STEP;
      updateSteps++;
      // 防止死亡螺旋：最多追3帧
      if (updateSteps >= 3) {
        this.accumulator = 0;
        break;
      }
    }
    const updateEnd = performance.now();
    this.lastUpdateTime = updateEnd - updateStart;

    // 渲染插值系数
    const alpha = this.accumulator / FIXED_TIME_STEP;

    const renderStart = performance.now();
    this.callbacks.render(alpha);
    const renderEnd = performance.now();
    this.lastRenderTime = renderEnd - renderStart;

    // FPS统计
    this.frameCount++;
    this.fpsTimer += frameTime;
    if (this.fpsTimer >= 1000) {
      this.currentFps = this.frameCount;
      this.frameCount = 0;
      this.fpsTimer -= 1000;
    }

    // 上报统计
    if (this.callbacks.onStatsUpdate) {
      this.callbacks.onStatsUpdate({
        fps: this.currentFps,
        frameTime,
        updateTime: this.lastUpdateTime,
        renderTime: this.lastRenderTime,
        accumulatedTime: this.accumulator,
      });
    }

    this.rafId = requestAnimationFrame((t) => this.loop(t));
  }

  getStats(): LoopStats {
    return {
      fps: this.currentFps,
      frameTime: 0,
      updateTime: this.lastUpdateTime,
      renderTime: this.lastRenderTime,
      accumulatedTime: this.accumulator,
    };
  }
}
