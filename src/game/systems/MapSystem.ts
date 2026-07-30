import { MapConfig, MapType, Obstacle } from '../types';
import { MAP_CONFIGS, DEFAULT_MAP } from '../config/maps';

export interface MapRenderContext {
  ctx: CanvasRenderingContext2D;
  cameraX: number;
  cameraY: number;
  zoom: number;
  viewportWidth: number;
  viewportHeight: number;
}

/**
 * 地图系统
 * 地图加载，障碍物管理，可破坏障碍物
 */
export class MapSystem {
  private currentMap: MapConfig | null = null;
  private obstacles: Obstacle[] = [];

  loadMap(mapType: MapType = DEFAULT_MAP): MapConfig {
    const config = MAP_CONFIGS[mapType];
    this.currentMap = config;
    this.obstacles = config.obstacles.map((o) => ({ ...o }));
    return config;
  }

  getCurrentMap(): MapConfig | null {
    return this.currentMap;
  }

  getObstacles(): Obstacle[] {
    return this.obstacles;
  }

  getActiveObstacles(): Obstacle[] {
    return this.obstacles.filter((o) => o.hp > 0);
  }

  getMapSize(): { width: number; height: number } {
    return {
      width: this.currentMap?.width || 1600,
      height: this.currentMap?.height || 1200,
    };
  }

  getSpawnPoints(): { x: number; y: number }[] {
    return this.currentMap?.spawnPoints || [];
  }

  /**
   * 获取随机出生点
   */
  getRandomSpawnPoint(): { x: number; y: number } {
    const points = this.getSpawnPoints();
    if (points.length === 0) return { x: 100, y: 100 };
    return points[Math.floor(Math.random() * points.length)];
  }

  /**
   * 渲染背景
   */
  renderBackground(ctx: CanvasRenderingContext2D): void {
    if (!this.currentMap) return;

    const map = this.currentMap;

    // 背景色
    ctx.fillStyle = map.backgroundColor;
    ctx.fillRect(0, 0, map.width, map.height);

    // 网格
    ctx.strokeStyle = map.gridColor;
    ctx.lineWidth = 1;
    const gridSize = 50;

    ctx.beginPath();
    for (let x = 0; x <= map.width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, map.height);
    }
    for (let y = 0; y <= map.height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(map.width, y);
    }
    ctx.stroke();

    // 障碍物
    for (const obs of this.obstacles) {
      if (obs.hp <= 0) continue;

      ctx.fillStyle = obs.color;
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

      // 边框
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

      // 可破坏标记
      if (obs.destructible && obs.hp < obs.maxHp) {
        const damageRatio = 1 - obs.hp / obs.maxHp;
        ctx.fillStyle = `rgba(255, 0, 0, ${damageRatio * 0.5})`;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      }
    }
  }

  /**
   * 渲染小地图
   */
  renderMinimap(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    players: { position: { x: number; y: number }; team: number; isDead: boolean }[],
    cameraX: number,
    cameraY: number,
    cameraW: number,
    cameraH: number
  ): void {
    if (!this.currentMap) return;

    const map = this.currentMap;
    const scaleX = width / map.width;
    const scaleY = height / map.height;

    // 背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(x, y, width, height);

    // 障碍物
    for (const obs of this.obstacles) {
      if (obs.hp <= 0) continue;
      ctx.fillStyle = obs.destructible ? 'rgba(150,150,150,0.5)' : 'rgba(80,80,80,0.7)';
      ctx.fillRect(
        x + obs.x * scaleX,
        y + obs.y * scaleY,
        Math.max(2, obs.width * scaleX),
        Math.max(2, obs.height * scaleY)
      );
    }

    // 视口框
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      x + cameraX * scaleX,
      y + cameraY * scaleY,
      cameraW * scaleX,
      cameraH * scaleY
    );

    // 玩家
    for (const p of players) {
      if (p.isDead) continue;
      ctx.fillStyle = p.team === 0 ? '#4A90D9' : '#e74c3c';
      ctx.beginPath();
      ctx.arc(
        x + p.position.x * scaleX,
        y + p.position.y * scaleY,
        3,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // 边框
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
  }

  /**
   * 检查并清理已销毁的障碍物
   */
  cleanupDestroyedObstacles(): void {
    // 障碍物保留但hp=0表示已销毁
  }
}
