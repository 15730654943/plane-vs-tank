import { GameLoop } from './engine/GameLoop';
import { CanvasRenderer } from './engine/CanvasRenderer';
import { Camera } from './engine/Camera';
import { InputManager } from './engine/InputManager';
import { AssetLoader } from './engine/AssetLoader';
import { PhysicsSystem } from './systems/PhysicsSystem';
import { CombatSystem } from './systems/CombatSystem';
import { ItemSystem } from './systems/ItemSystem';
import { MapSystem } from './systems/MapSystem';
import { NetworkManager } from './network/NetworkManager';
import { SyncManager } from './network/SyncManager';
import { PredictionEngine } from './network/PredictionEngine';
import { Player } from './entities/Player';
import { Airplane } from './entities/Airplane';
import { Tank } from './entities/Tank';
import { Projectile } from './entities/Projectile';
import { Bullet } from './entities/Bullet';
import { Missile } from './entities/Missile';
import { Mine } from './entities/Mine';
import { Item } from './entities/Item';
import { generateId } from './entities/Entity';
import {
  GamePhase,
  CharacterType,
  InputState,
  MapType,
  SyncEventType,
  SyncEvent,
} from './types';
import {
  COUNTDOWN_DURATION,
  MATCH_MAX_TIME,
  RESPAWN_TIME,
  AIRPLANE_CANNON_PROJECTILE_SPEED,
  TANK_CANNON_PROJECTILE_SPEED,
  AIRPLANE_MISSILE_SPEED,
  AIRPLANE_MISSILE_EXPLOSION_RADIUS,
  TANK_MINE_TRIGGER_RADIUS,
} from './config/constants';
import { CHARACTER_WEAPONS } from './config/weapons';

export interface GameCallbacks {
  onPhaseChange?: (phase: GamePhase) => void;
  onCountdown?: (seconds: number) => void;
  onMatchEnd?: (winner: Player | null, isDraw: boolean) => void;
  onStatsUpdate?: (stats: { fps: number; frameTime: number; updateTime: number; renderTime: number }) => void;
}

/**
 * 飞机坦克大战 - 主游戏类
 * 整合所有引擎、实体、系统和网络模块
 */
export class Game {
  // 引擎
  private loop: GameLoop;
  private renderer: CanvasRenderer;
  private camera: Camera;
  private input: InputManager;
  private assets: AssetLoader;

  // 系统
  private physics: PhysicsSystem;
  private combat: CombatSystem;
  private items: ItemSystem;
  private map: MapSystem;

  // 网络
  private network: NetworkManager | null = null;
  private syncManager: SyncManager | null = null;
  private prediction: PredictionEngine;

  // 游戏状态
  private phase: GamePhase = GamePhase.WAITING;
  private countdown = COUNTDOWN_DURATION;
  private elapsedTime = 0;
  private players: Player[] = [];
  private projectiles: Projectile[] = [];
  private mines: Mine[] = [];
  private localPlayerId: string | null = null;
  private winner: Player | null = null;
  private isDraw = false;

  private callbacks: GameCallbacks;
  private mapWidth = 1600;
  private mapHeight = 1200;

  constructor(containerId: string, callbacks: GameCallbacks = {}) {
    this.callbacks = callbacks;

    this.renderer = new CanvasRenderer(containerId);
    this.camera = new Camera();
    this.input = new InputManager();
    this.assets = new AssetLoader();
    this.physics = new PhysicsSystem();
    this.combat = new CombatSystem();
    this.items = new ItemSystem();
    this.map = new MapSystem();
    this.prediction = new PredictionEngine();

    this.input.attachCanvas(this.renderer.getMainCanvas());

    this.loop = new GameLoop({
      update: this.update.bind(this),
      render: this.render.bind(this),
      networkSync: this.networkSync.bind(this),
      onStatsUpdate: (stats) => {
        this.callbacks.onStatsUpdate?.(stats);
      },
    });

    // 战斗事件监听
    this.combat.addListener((event) => {
      if (event.type === 'kill' || event.type === 'explosion') {
        this.camera.shake(event.type === 'kill' ? 8 : 5);
      }
    });
  }

  // ==================== 初始化 ====================

  init(mapType: MapType = MapType.CITY_RUINS): void {
    const mapConfig = this.map.loadMap(mapType);
    this.mapWidth = mapConfig.width;
    this.mapHeight = mapConfig.height;

    this.camera.setMapSize(this.mapWidth, this.mapHeight);
    this.physics.setMapSize(this.mapWidth, this.mapHeight);
    this.physics.setObstacles(this.map.getObstacles());
    this.items.setMapSize(this.mapWidth, this.mapHeight);

    // 渲染背景
    this.renderer.renderBackground((ctx) => {
      this.map.renderBackground(ctx);
    });
  }

  // ==================== 玩家管理 ====================

  createLocalPlayer(name: string, characterType: CharacterType, team: number): Player {
    const spawn = this.map.getRandomSpawnPoint();
    let player: Player;

    if (characterType === CharacterType.AIRPLANE) {
      player = new Airplane(name, team, spawn.x, spawn.y);
    } else {
      player = new Tank(name, team, spawn.x, spawn.y);
    }

    player.setMapSize(this.mapWidth, this.mapHeight);
    this.localPlayerId = player.id;
    this.players.push(player);
    this.prediction.setLocalPlayer(player);
    this.camera.setTarget(spawn.x, spawn.y);

    return player;
  }

  addRemotePlayer(id: string, name: string, characterType: CharacterType, team: number, x: number, y: number): Player {
    let player: Player;
    if (characterType === CharacterType.AIRPLANE) {
      player = new Airplane(name, team, x, y);
    } else {
      player = new Tank(name, team, x, y);
    }
    player.id = id;
    player.setMapSize(this.mapWidth, this.mapHeight);
    this.players.push(player);
    return player;
  }

  removePlayer(id: string): void {
    const idx = this.players.findIndex((p) => p.id === id);
    if (idx >= 0) {
      this.players.splice(idx, 1);
    }
    this.prediction.removePlayer(id);
  }

  getLocalPlayer(): Player | null {
    return this.players.find((p) => p.id === this.localPlayerId) || null;
  }

  getPlayers(): Player[] {
    return this.players;
  }

  // ==================== 网络 ====================

  async connectNetwork(config: { supabaseUrl: string; supabaseKey: string; channelName: string }): Promise<boolean> {
    if (!this.localPlayerId) return false;

    this.network = new NetworkManager({
      ...config,
      playerId: this.localPlayerId,
    });

    const connected = await this.network.connect();
    if (connected) {
      this.syncManager = new SyncManager(this.network, this.localPlayerId);
    }
    return connected;
  }

  disconnectNetwork(): void {
    this.network?.disconnect();
    this.network = null;
    this.syncManager = null;
  }

  // ==================== 游戏流程 ====================

  start(): void {
    if (this.phase !== GamePhase.WAITING) return;
    this.phase = GamePhase.COUNTDOWN;
    this.countdown = COUNTDOWN_DURATION;
    this.callbacks.onPhaseChange?.(this.phase);
    this.loop.start();
  }

  stop(): void {
    this.loop.stop();
  }

  private startPlaying(): void {
    this.phase = GamePhase.PLAYING;
    this.elapsedTime = 0;
    this.callbacks.onPhaseChange?.(this.phase);
  }

  private endMatch(): void {
    this.phase = GamePhase.RESULT;
    this.determineWinner();
    this.callbacks.onPhaseChange?.(this.phase);
    this.callbacks.onMatchEnd?.(this.winner, this.isDraw);
  }

  private determineWinner(): void {
    const activePlayers = this.players.filter((p) => p.active);
    if (activePlayers.length === 0) {
      this.isDraw = true;
      return;
    }

    // 按击杀数排序
    const sorted = [...activePlayers].sort((a, b) => {
      if (b.kills !== a.kills) return b.kills - a.kills;
      if (a.deaths !== b.deaths) return a.deaths - b.deaths;
      return b.totalDamage - a.totalDamage;
    });

    if (sorted.length >= 2 && sorted[0].kills === sorted[1].kills && sorted[0].deaths === sorted[1].deaths && sorted[0].totalDamage === sorted[1].totalDamage) {
      this.isDraw = true;
      this.winner = null;
    } else {
      this.isDraw = false;
      this.winner = sorted[0] || null;
    }
  }

  // ==================== 更新 ====================

  private update(dt: number): void {
    const dtSeconds = dt / 1000;

    // 游戏流程
    if (this.phase === GamePhase.COUNTDOWN) {
      this.countdown -= dtSeconds;
      this.callbacks.onCountdown?.(Math.ceil(this.countdown));
      if (this.countdown <= 0) {
        this.startPlaying();
      }
    } else if (this.phase === GamePhase.PLAYING) {
      this.elapsedTime += dtSeconds;
      if (this.elapsedTime >= MATCH_MAX_TIME) {
        this.endMatch();
      }
    }

    if (this.phase !== GamePhase.PLAYING) {
      return;
    }

    // 输入处理
    const localPlayer = this.getLocalPlayer();
    if (localPlayer && !localPlayer.isDead) {
      const input = this.input.getState();
      localPlayer.input = input;

      // 处理射击
      if (input.shoot && localPlayer.canFire()) {
        this.fireProjectile(localPlayer);
      }

      // 处理特殊技能
      if (input.special && (localPlayer as Airplane | Tank).canUseSpecial?.()) {
        this.useSpecial(localPlayer);
      }
    }

    // 更新所有玩家
    for (const player of this.players) {
      player.update(dt);
    }

    // 更新投射物
    for (const proj of this.projectiles) {
      proj.update(dt);
    }
    this.projectiles = this.projectiles.filter((p) => p.active || p.isExploded);

    // 更新地雷
    for (const mine of this.mines) {
      mine.update(dt);
    }
    this.mines = this.mines.filter((m) => m.active && !m.isExploded);

    // 更新道具
    this.items.update(dt, this.players, this.physics);

    // 物理系统
    this.physics.update(this.players, this.projectiles, dt);

    // 战斗系统
    this.combat.update(this.projectiles, this.mines, this.players, this.physics);

    // 相机跟随本地玩家
    if (localPlayer) {
      const pos = localPlayer.getCenter();
      this.camera.setTarget(pos.x, pos.y);
    }
    this.camera.update();

    // 预测引擎
    if (localPlayer) {
      this.prediction.interpolateRemotePlayers(this.players);
    }

    // 胜负判定：消灭所有敌方
    this.checkEliminationWin();
  }

  private checkEliminationWin(): void {
    const teams = new Map<number, number>();
    for (const p of this.players) {
      if (!p.isDead && p.active) {
        teams.set(p.team, (teams.get(p.team) || 0) + 1);
      }
    }

    if (teams.size === 1 && this.players.length > 1) {
      this.endMatch();
    }
  }

  private fireProjectile(player: Player): void {
    player.onFire();
    const weapons = CHARACTER_WEAPONS[player.characterType];
    const c = player.getCenter();
    const rotation = player.rotation - Math.PI / 2;
    const speed = weapons.primary.projectileSpeed;

    const proj = new Bullet({
      ownerId: player.id,
      type: 'BULLET' as any,
      x: c.x - 4,
      y: c.y - 4,
      velocityX: Math.cos(rotation) * speed,
      velocityY: Math.sin(rotation) * speed,
      rotation: player.rotation,
      damage: weapons.primary.damage,
    });

    this.projectiles.push(proj);

    // 网络同步
    this.syncManager?.sendPlayerShoot(
      'BULLET',
      proj.position.x,
      proj.position.y,
      proj.velocityX,
      proj.velocityY,
      proj.rotation,
      proj.damage
    );
  }

  private useSpecial(player: Player): void {
    const c = player.getCenter();

    if (player.characterType === CharacterType.AIRPLANE) {
      (player as Airplane).useSpecial();

      // 追踪导弹 - 寻找最近敌人
      let target: Player | null = null;
      let minDist = Infinity;
      for (const p of this.players) {
        if (p.id === player.id || p.isDead || p.team === player.team) continue;
        const pc = p.getCenter();
        const dist = Math.sqrt((pc.x - c.x) ** 2 + (pc.y - c.y) ** 2);
        if (dist < minDist) {
          minDist = dist;
          target = p;
        }
      }

      const rotation = player.rotation - Math.PI / 2;
      const missile = new Missile({
        ownerId: player.id,
        type: 'MISSILE' as any,
        x: c.x - 6,
        y: c.y - 6,
        velocityX: Math.cos(rotation) * AIRPLANE_MISSILE_SPEED,
        velocityY: Math.sin(rotation) * AIRPLANE_MISSILE_SPEED,
        rotation: player.rotation,
        damage: CHARACTER_WEAPONS[CharacterType.AIRPLANE].special.explosionRadius ? 35 : 0,
        explosionRadius: AIRPLANE_MISSILE_EXPLOSION_RADIUS,
        targetId: target?.id,
      });

      if (target) {
        missile.setTarget(target as any);
      }

      this.projectiles.push(missile);

      this.syncManager?.sendPlayerSpecial(
        'MISSILE',
        missile.position.x,
        missile.position.y,
        target?.id
      );
    } else if (player.characterType === CharacterType.TANK) {
      (player as Tank).useSpecial();

      const mine = new Mine({
        ownerId: player.id,
        type: 'MINE' as any,
        x: c.x - 10,
        y: c.y - 10,
        velocityX: 0,
        velocityY: 0,
        rotation: 0,
        damage: CHARACTER_WEAPONS[CharacterType.TANK].special.explosionRadius ? 50 : 0,
      });

      this.mines.push(mine);

      this.syncManager?.sendPlayerSpecial(
        'MINE',
        mine.position.x,
        mine.position.y
      );
    }
  }

  // ==================== 网络同步 ====================

  private networkSync(): void {
    if (!this.syncManager || !this.network?.isConnected()) return;

    const localPlayer = this.getLocalPlayer();
    if (localPlayer) {
      this.syncManager.sendPlayerMove(localPlayer);
    }

    // 主机广播完整状态
    this.syncManager.broadcastSnapshot(
      this.players,
      this.projectiles,
      this.items.getItems(),
      this.phase,
      this.elapsedTime
    );

    // 处理接收的事件
    const events = this.syncManager.getPendingEvents();
    for (const event of events) {
      this.handleNetworkEvent(event);
    }
  }

  private handleNetworkEvent(event: SyncEvent): void {
    switch (event.type) {
      case SyncEventType.PLAYER_MOVE: {
        const player = this.players.find((p) => p.id === event.playerId);
        if (player && player.id !== this.localPlayerId) {
          const data = event.data as { x: number; y: number; rotation: number; hp: number; energy: number };
          this.prediction.updateRemotePlayerState(player.id, { x: data.x, y: data.y }, data.rotation);
          player.hp = data.hp;
          player.energy = data.energy;
        }
        break;
      }
      case SyncEventType.PLAYER_SHOOT: {
        const data = event.data as { x: number; y: number; velocityX: number; velocityY: number; rotation: number; damage: number };
        const proj = new Bullet({
          ownerId: event.playerId,
          type: 'BULLET' as any,
          x: data.x,
          y: data.y,
          velocityX: data.velocityX,
          velocityY: data.velocityY,
          rotation: data.rotation,
          damage: data.damage,
        });
        this.projectiles.push(proj);
        break;
      }
      case SyncEventType.PLAYER_SPECIAL: {
        const data = event.data as { specialType: string; x: number; y: number; targetId?: string; rotation?: number };
        if (data.specialType === 'MISSILE') {
          const missile = new Missile({
            ownerId: event.playerId,
            type: 'MISSILE' as any,
            x: data.x,
            y: data.y,
            velocityX: Math.cos(data.rotation || 0) * AIRPLANE_MISSILE_SPEED,
            velocityY: Math.sin(data.rotation || 0) * AIRPLANE_MISSILE_SPEED,
            rotation: data.rotation || 0,
            damage: 35,
            explosionRadius: AIRPLANE_MISSILE_EXPLOSION_RADIUS,
            targetId: data.targetId,
          });
          this.projectiles.push(missile);
        } else if (data.specialType === 'MINE') {
          const mine = new Mine({
            ownerId: event.playerId,
            type: 'MINE' as any,
            x: data.x,
            y: data.y,
            velocityX: 0,
            velocityY: 0,
            rotation: 0,
            damage: 50,
          });
          this.mines.push(mine);
        }
        break;
      }
      case SyncEventType.GAME_PHASE_CHANGE: {
        const data = event.data as { phase: GamePhase; countdown?: number };
        this.phase = data.phase;
        if (data.countdown !== undefined) {
          this.countdown = data.countdown;
        }
        this.callbacks.onPhaseChange?.(this.phase);
        break;
      }
      case SyncEventType.ITEM_SPAWN: {
        const data = event.data as { itemType: any; x: number; y: number; itemId: string };
        const item = new Item(data.itemType, data.x, data.y);
        item.id = data.itemId;
        // ItemSystem 会自动管理 items
        break;
      }
    }
  }

  // ==================== 渲染 ====================

  private render(alpha: number): void {
    this.renderer.setViewport(this.camera.getX(), this.camera.getY(), this.camera.getZoom());

    // 渲染所有实体
    this.renderer.clearRenderables();

    // 地雷
    for (const mine of this.mines) {
      if (mine.active || mine.isExploded) {
        this.renderer.addRenderable({
          render: (ctx, a) => mine.render(ctx, a),
          getPosition: () => mine.position,
          getRenderLayer: () => 'game',
        });
      }
    }

    // 投射物
    for (const proj of this.projectiles) {
      if (proj.active || proj.isExploded) {
        this.renderer.addRenderable({
          render: (ctx, a) => proj.render(ctx, a),
          getPosition: () => proj.position,
          getRenderLayer: () => 'game',
        });
      }
    }

    // 道具
    for (const item of this.items.getItems()) {
      this.renderer.addRenderable({
        render: (ctx, a) => item.render(ctx, a),
        getPosition: () => item.position,
        getRenderLayer: () => 'game',
      });
    }

    // 玩家
    for (const player of this.players) {
      if (player.active) {
        this.renderer.addRenderable({
          render: (ctx, a) => player.render(ctx, a),
          getPosition: () => player.position,
          getRenderLayer: () => 'game',
        });
      }
    }

    this.renderer.render(alpha);

    // 渲染小地图和UI覆盖层
    this.renderUI(this.renderer.getMainCanvas().getContext('2d')!);
  }

  private renderUI(ctx: CanvasRenderingContext2D): void {
    // 小地图
    const localPlayer = this.getLocalPlayer();
    const bounds = this.camera.getViewBounds();
    this.map.renderMinimap(
      ctx,
      10, 10, 150, 112,
      this.players.map((p) => ({ position: p.position, team: p.team, isDead: p.isDead })),
      bounds.left, bounds.top,
      bounds.right - bounds.left, bounds.bottom - bounds.top
    );

    // 阶段显示
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';

    if (this.phase === GamePhase.COUNTDOWN) {
      ctx.fillText(`游戏开始倒计时: ${Math.ceil(this.countdown)}`, 640, 60);
    } else if (this.phase === GamePhase.PLAYING) {
      const minutes = Math.floor((MATCH_MAX_TIME - this.elapsedTime) / 60);
      const seconds = Math.floor((MATCH_MAX_TIME - this.elapsedTime) % 60);
      ctx.fillText(`剩余时间: ${minutes}:${seconds.toString().padStart(2, '0')}`, 640, 30);
    } else if (this.phase === GamePhase.RESULT) {
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 36px Arial';
      if (this.isDraw) {
        ctx.fillText('平局!', 640, 360);
      } else if (this.winner) {
        ctx.fillText(`${this.winner.name} 获胜!`, 640, 360);
      }
    }

    // 本地玩家信息
    if (localPlayer) {
      ctx.textAlign = 'left';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`HP: ${localPlayer.hp}/${localPlayer.maxHp}`, 20, 680);
      ctx.fillText(`能量: ${Math.floor(localPlayer.energy)}/${localPlayer.maxEnergy}`, 20, 700);
      ctx.fillText(`击杀: ${localPlayer.kills}  死亡: ${localPlayer.deaths}`, 20, 720);

      // 武器冷却
      const weapons = CHARACTER_WEAPONS[localPlayer.characterType];
      const canFire = localPlayer.canFire();
      ctx.fillStyle = canFire ? '#2ecc71' : '#e74c3c';
      ctx.fillText(`[空格/鼠标] ${weapons.primary.name}${canFire ? ' (就绪)' : ' (冷却)'}`, 200, 700);

      const canSpecial = (localPlayer as Airplane | Tank).canUseSpecial?.() ?? false;
      ctx.fillStyle = canSpecial ? '#2ecc71' : '#e74c3c';
      ctx.fillText(`[E] ${weapons.special.name}${canSpecial ? ' (就绪)' : ' (冷却)'}`, 200, 720);
    }
  }

  // ==================== 公共方法 ====================

  getPhase(): GamePhase {
    return this.phase;
  }

  getElapsedTime(): number {
    return this.elapsedTime;
  }

  getWinner(): Player | null {
    return this.winner;
  }

  isMatchDraw(): boolean {
    return this.isDraw;
  }

  getCamera(): Camera {
    return this.camera;
  }

  getInput(): InputManager {
    return this.input;
  }

  getRenderer(): CanvasRenderer {
    return this.renderer;
  }

  destroy(): void {
    this.loop.stop();
    this.input.detach();
    this.disconnectNetwork();
  }
}
