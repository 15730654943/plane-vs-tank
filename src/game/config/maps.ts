import { MapConfig, MapType, Vec2 } from '../types';

function generateGridObstacles(
  mapWidth: number,
  mapHeight: number,
  gridSize: number,
  density: number,
  destructible: boolean,
  color: string
) {
  const obstacles = [];
  const cols = Math.floor(mapWidth / gridSize);
  const rows = Math.floor(mapHeight / gridSize);
  let id = 0;

  for (let r = 2; r < rows - 2; r++) {
    for (let c = 2; c < cols - 2; c++) {
      if (Math.random() < density) {
        const size = gridSize * (0.5 + Math.random() * 0.5);
        const hp = destructible ? Math.floor(30 + Math.random() * 50) : 9999;
        obstacles.push({
          id: `obs-${id++}`,
          x: c * gridSize + (gridSize - size) / 2,
          y: r * gridSize + (gridSize - size) / 2,
          width: size,
          height: size,
          hp,
          maxHp: hp,
          destructible,
          color,
        });
      }
    }
  }
  return obstacles;
}

function generateSpawnPoints(mapWidth: number, mapHeight: number, count: number): Vec2[] {
  const points: Vec2[] = [];
  const margin = 150;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const dist = Math.min(mapWidth, mapHeight) * 0.35;
    points.push({
      x: mapWidth / 2 + Math.cos(angle) * dist,
      y: mapHeight / 2 + Math.sin(angle) * dist,
    });
  }
  // 添加边缘出生点
  points.push({ x: margin, y: margin });
  points.push({ x: mapWidth - margin, y: margin });
  points.push({ x: margin, y: mapHeight - margin });
  points.push({ x: mapWidth - margin, y: mapHeight - margin });
  return points;
}

// ==================== 城市废墟 ====================
export const CITY_RUINS_MAP: MapConfig = {
  name: '城市废墟',
  type: MapType.CITY_RUINS,
  width: 1600,
  height: 1200,
  backgroundColor: '#3a3a3a',
  gridColor: '#4a4a4a',
  obstacles: [
    // 中心广场建筑
    { id: 'center-1', x: 700, y: 500, width: 200, height: 200, hp: 100, maxHp: 100, destructible: true, color: '#6B6B6B' },
    { id: 'center-2', x: 750, y: 550, width: 100, height: 100, hp: 80, maxHp: 80, destructible: true, color: '#7B7B7B' },
    // 街道建筑
    { id: 'street-1', x: 200, y: 200, width: 120, height: 80, hp: 60, maxHp: 60, destructible: true, color: '#5B5B5B' },
    { id: 'street-2', x: 400, y: 300, width: 80, height: 120, hp: 60, maxHp: 60, destructible: true, color: '#5B5B5B' },
    { id: 'street-3', x: 1000, y: 200, width: 150, height: 90, hp: 70, maxHp: 70, destructible: true, color: '#5B5B5B' },
    { id: 'street-4', x: 1200, y: 400, width: 100, height: 150, hp: 60, maxHp: 60, destructible: true, color: '#5B5B5B' },
    { id: 'street-5', x: 300, y: 800, width: 140, height: 100, hp: 60, maxHp: 60, destructible: true, color: '#5B5B5B' },
    { id: 'street-6', x: 1100, y: 900, width: 120, height: 80, hp: 60, maxHp: 60, destructible: true, color: '#5B5B5B' },
    { id: 'street-7', x: 600, y: 1000, width: 90, height: 140, hp: 50, maxHp: 50, destructible: true, color: '#5B5B5B' },
    // 不可破坏边界墙
    { id: 'wall-top', x: 0, y: 0, width: 1600, height: 40, hp: 9999, maxHp: 9999, destructible: false, color: '#2A2A2A' },
    { id: 'wall-bottom', x: 0, y: 1160, width: 1600, height: 40, hp: 9999, maxHp: 9999, destructible: false, color: '#2A2A2A' },
    { id: 'wall-left', x: 0, y: 0, width: 40, height: 1200, hp: 9999, maxHp: 9999, destructible: false, color: '#2A2A2A' },
    { id: 'wall-right', x: 1560, y: 0, width: 40, height: 1200, hp: 9999, maxHp: 9999, destructible: false, color: '#2A2A2A' },
    // 随机废墟
    ...generateGridObstacles(1600, 1200, 100, 0.12, true, '#656565'),
  ],
  spawnPoints: generateSpawnPoints(1600, 1200, 4),
};

// ==================== 沙漠战场 ====================
export const DESERT_MAP: MapConfig = {
  name: '沙漠战场',
  type: MapType.DESERT_BATTLEFIELD,
  width: 2000,
  height: 1500,
  backgroundColor: '#C2B280',
  gridColor: '#B8A878',
  obstacles: [
    // 沙丘
    { id: 'dune-1', x: 400, y: 300, width: 200, height: 150, hp: 9999, maxHp: 9999, destructible: false, color: '#D4C494' },
    { id: 'dune-2', x: 1400, y: 200, width: 250, height: 180, hp: 9999, maxHp: 9999, destructible: false, color: '#D4C494' },
    { id: 'dune-3', x: 300, y: 1000, width: 180, height: 200, hp: 9999, maxHp: 9999, destructible: false, color: '#D4C494' },
    { id: 'dune-4', x: 1500, y: 1100, width: 220, height: 160, hp: 9999, maxHp: 9999, destructible: false, color: '#D4C494' },
    { id: 'dune-5', x: 900, y: 600, width: 300, height: 200, hp: 9999, maxHp: 9999, destructible: false, color: '#D4C494' },
    // 军事掩体
    { id: 'bunker-1', x: 600, y: 400, width: 80, height: 80, hp: 150, maxHp: 150, destructible: true, color: '#8B7D6B' },
    { id: 'bunker-2', x: 1300, y: 500, width: 80, height: 80, hp: 150, maxHp: 150, destructible: true, color: '#8B7D6B' },
    { id: 'bunker-3', x: 500, y: 1200, width: 80, height: 80, hp: 150, maxHp: 150, destructible: true, color: '#8B7D6B' },
    { id: 'bunker-4', x: 1600, y: 1000, width: 80, height: 80, hp: 150, maxHp: 150, destructible: true, color: '#8B7D6B' },
    // 边界
    { id: 'wall-top', x: 0, y: 0, width: 2000, height: 40, hp: 9999, maxHp: 9999, destructible: false, color: '#A89868' },
    { id: 'wall-bottom', x: 0, y: 1460, width: 2000, height: 40, hp: 9999, maxHp: 9999, destructible: false, color: '#A89868' },
    { id: 'wall-left', x: 0, y: 0, width: 40, height: 1500, hp: 9999, maxHp: 9999, destructible: false, color: '#A89868' },
    { id: 'wall-right', x: 1960, y: 0, width: 40, height: 1500, hp: 9999, maxHp: 9999, destructible: false, color: '#A89868' },
  ],
  spawnPoints: generateSpawnPoints(2000, 1500, 4),
};

// ==================== 海洋群岛 ====================
export const OCEAN_MAP: MapConfig = {
  name: '海洋群岛',
  type: MapType.OCEAN_ISLANDS,
  width: 1800,
  height: 1800,
  backgroundColor: '#2E8B9A',
  gridColor: '#3A9BA8',
  obstacles: [
    // 岛屿
    { id: 'island-1', x: 300, y: 300, width: 200, height: 180, hp: 9999, maxHp: 9999, destructible: false, color: '#228B22' },
    { id: 'island-2', x: 1300, y: 200, width: 250, height: 200, hp: 9999, maxHp: 9999, destructible: false, color: '#228B22' },
    { id: 'island-3', x: 200, y: 1300, width: 220, height: 220, hp: 9999, maxHp: 9999, destructible: false, color: '#228B22' },
    { id: 'island-4', x: 1400, y: 1400, width: 180, height: 180, hp: 9999, maxHp: 9999, destructible: false, color: '#228B22' },
    { id: 'island-center', x: 750, y: 750, width: 300, height: 300, hp: 9999, maxHp: 9999, destructible: false, color: '#228B22' },
    // 小岛礁
    { id: 'reef-1', x: 700, y: 200, width: 100, height: 80, hp: 50, maxHp: 50, destructible: true, color: '#20B2AA' },
    { id: 'reef-2', x: 1200, y: 800, width: 90, height: 100, hp: 50, maxHp: 50, destructible: true, color: '#20B2AA' },
    { id: 'reef-3', x: 500, y: 1000, width: 80, height: 80, hp: 50, maxHp: 50, destructible: true, color: '#20B2AA' },
    { id: 'reef-4', x: 1000, y: 1300, width: 100, height: 90, hp: 50, maxHp: 50, destructible: true, color: '#20B2AA' },
    // 边界
    { id: 'wall-top', x: 0, y: 0, width: 1800, height: 40, hp: 9999, maxHp: 9999, destructible: false, color: '#1E6B78' },
    { id: 'wall-bottom', x: 0, y: 1760, width: 1800, height: 40, hp: 9999, maxHp: 9999, destructible: false, color: '#1E6B78' },
    { id: 'wall-left', x: 0, y: 0, width: 40, height: 1800, hp: 9999, maxHp: 9999, destructible: false, color: '#1E6B78' },
    { id: 'wall-right', x: 1760, y: 0, width: 40, height: 1800, hp: 9999, maxHp: 9999, destructible: false, color: '#1E6B78' },
  ],
  spawnPoints: generateSpawnPoints(1800, 1800, 4),
};

export const MAP_CONFIGS: Record<MapType, MapConfig> = {
  [MapType.CITY_RUINS]: CITY_RUINS_MAP,
  [MapType.DESERT_BATTLEFIELD]: DESERT_MAP,
  [MapType.OCEAN_ISLANDS]: OCEAN_MAP,
};

export const DEFAULT_MAP = MapType.CITY_RUINS;
