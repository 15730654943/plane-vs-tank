// 游戏引擎
export { GameLoop } from './engine/GameLoop';
export type { LoopStats, GameLoopCallbacks } from './engine/GameLoop';
export { CanvasRenderer } from './engine/CanvasRenderer';
export type { Renderable } from './engine/CanvasRenderer';
export { Camera } from './engine/Camera';
export { InputManager } from './engine/InputManager';
export { AssetLoader } from './engine/AssetLoader';
export type { AssetManifest } from './engine/AssetLoader';

// 游戏实体
export { Entity, generateId } from './entities/Entity';
export { Player } from './entities/Player';
export type { PlayerStats } from './entities/Player';
export { Airplane } from './entities/Airplane';
export { Tank } from './entities/Tank';
export { Projectile } from './entities/Projectile';
export type { ProjectileConfig } from './entities/Projectile';
export { Bullet } from './entities/Bullet';
export { Missile } from './entities/Missile';
export { Mine } from './entities/Mine';
export { Item } from './entities/Item';

// 游戏系统
export { PhysicsSystem } from './systems/PhysicsSystem';
export type { CollisionResult } from './systems/PhysicsSystem';
export { CombatSystem } from './systems/CombatSystem';
export type { CombatEvent, CombatEventCallback } from './systems/CombatSystem';
export { ItemSystem } from './systems/ItemSystem';
export type { ItemEvent, ItemEventCallback } from './systems/ItemSystem';
export { MapSystem } from './systems/MapSystem';
export type { MapRenderContext } from './systems/MapSystem';

// 网络同步
export { NetworkManager } from './network/NetworkManager';
export type { NetworkConfig, NetworkMessageHandler } from './network/NetworkManager';
export { SyncManager } from './network/SyncManager';
export type { GameSnapshot, SnapshotCallback } from './network/SyncManager';
export { PredictionEngine } from './network/PredictionEngine';
export type { PredictedState, RemotePlayerState } from './network/PredictionEngine';

// 主游戏类
export { Game } from './Game';
export type { GameCallbacks } from './Game';

// 类型
export * from './types';

// 配置
export * from './config/constants';
export * from './config/characters';
export * from './config/weapons';
export * from './config/maps';
