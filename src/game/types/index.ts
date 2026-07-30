// ==================== 通用类型 ====================

export interface Vec2 {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Circle {
  x: number;
  y: number;
  radius: number;
}

// ==================== 游戏状态 ====================

export enum GamePhase {
  WAITING = 'WAITING',
  COUNTDOWN = 'COUNTDOWN',
  PLAYING = 'PLAYING',
  RESULT = 'RESULT',
}

export interface GameState {
  phase: GamePhase;
  countdown: number;
  elapsedTime: number;
  maxTime: number;
  players: Map<string, PlayerState>;
  projectiles: Map<string, ProjectileState>;
  items: Map<string, ItemState>;
  winner: string | null;
  isDraw: boolean;
}

// ==================== 玩家类型 ====================

export enum CharacterType {
  AIRPLANE = 'AIRPLANE',
  TANK = 'TANK',
}

export interface PlayerState {
  id: string;
  name: string;
  characterType: CharacterType;
  team: number;
  position: Vec2;
  rotation: number;
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  armor: number;
  baseArmor: number;
  speed: number;
  baseSpeed: number;
  damageMultiplier: number;
  speedMultiplier: number;
  invincible: boolean;
  invincibleTimer: number;
  armorBoostTimer: number;
  damageBoostTimer: number;
  speedBoostTimer: number;
  isDead: boolean;
  respawnTimer: number;
  kills: number;
  deaths: number;
  totalDamage: number;
  active: boolean;
}

// ==================== 输入类型 ====================

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  shoot: boolean;
  special: boolean;
  sprint: boolean;
  shield: boolean;
  mouseX: number;
  mouseY: number;
  mouseDown: boolean;
  slot1: boolean;
  slot2: boolean;
  slot3: boolean;
  slot4: boolean;
  slot5: boolean;
}

// ==================== 武器/投射物类型 ====================

export enum WeaponType {
  CANNON = 'CANNON',
  MISSILE = 'MISSILE',
  MINE = 'MINE',
}

export enum ProjectileType {
  BULLET = 'BULLET',
  MISSILE = 'MISSILE',
  MINE = 'MINE',
}

export interface WeaponConfig {
  name: string;
  damage: number;
  fireRate: number; // seconds
  range: number;
  projectileSpeed: number;
  projectileSize: Size;
  specialCooldown: number;
  type: WeaponType;
}

export interface ProjectileState {
  id: string;
  ownerId: string;
  type: ProjectileType;
  position: Vec2;
  velocity: Vec2;
  rotation: number;
  damage: number;
  radius: number;
  active: boolean;
  lifetime: number;
  maxLifetime: number;
  homingTarget: string | null;
  explosionRadius: number;
  isExploded: boolean;
}

// ==================== 道具类型 ====================

export enum ItemType {
  HEALTH_PACK = 'HEALTH_PACK',
  ARMOR_BOOST = 'ARMOR_BOOST',
  SPEED_BOOST = 'SPEED_BOOST',
  DAMAGE_BOOST = 'DAMAGE_BOOST',
  INVINCIBLE = 'INVINCIBLE',
  ENERGY_PACK = 'ENERGY_PACK',
}

export interface ItemState {
  id: string;
  type: ItemType;
  position: Vec2;
  active: boolean;
  lifetime: number;
  maxLifetime: number;
}

// ==================== 地图类型 ====================

export enum MapType {
  CITY_RUINS = 'CITY_RUINS',
  DESERT_BATTLEFIELD = 'DESERT_BATTLEFIELD',
  OCEAN_ISLANDS = 'OCEAN_ISLANDS',
}

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  destructible: boolean;
  color: string;
}

export interface MapConfig {
  name: string;
  type: MapType;
  width: number;
  height: number;
  backgroundColor: string;
  gridColor: string;
  obstacles: Obstacle[];
  spawnPoints: Vec2[];
}

// ==================== 网络同步类型 ====================

export enum SyncEventType {
  PLAYER_MOVE = 'PLAYER_MOVE',
  PLAYER_SHOOT = 'PLAYER_SHOOT',
  PLAYER_SPECIAL = 'PLAYER_SPECIAL',
  PLAYER_HIT = 'PLAYER_HIT',
  PLAYER_DEATH = 'PLAYER_DEATH',
  PLAYER_RESPAWN = 'PLAYER_RESPAWN',
  PROJECTILE_SPAWN = 'PROJECTILE_SPAWN',
  PROJECTILE_DESTROY = 'PROJECTILE_DESTROY',
  ITEM_SPAWN = 'ITEM_SPAWN',
  ITEM_PICKUP = 'ITEM_PICKUP',
  GAME_PHASE_CHANGE = 'GAME_PHASE_CHANGE',
  GAME_STATE_FULL = 'GAME_STATE_FULL',
}

export interface SyncEvent {
  type: SyncEventType;
  timestamp: number;
  playerId: string;
  data: Record<string, unknown>;
}

export interface NetworkState {
  connected: boolean;
  latency: number;
  lastSyncTime: number;
  syncInterval: number;
  pendingInputs: InputState[];
}

// ==================== 渲染类型 ====================

export interface RenderLayer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  dirty: boolean;
}

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
  target: Vec2 | null;
  smoothing: number;
  viewportWidth: number;
  viewportHeight: number;
}
