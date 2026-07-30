import { Player } from '../entities/Player';
import { InputState, Vec2 } from '../types';
import { RECONCILIATION_THRESHOLD } from '../config/constants';

export interface PredictedState {
  position: Vec2;
  rotation: number;
  timestamp: number;
  inputSequence: number;
}

export interface RemotePlayerState {
  id: string;
  position: Vec2;
  rotation: number;
  timestamp: number;
  targetPosition: Vec2;
}

/**
 * 客户端预测与平滑插值引擎
 */
export class PredictionEngine {
  private localPlayer: Player | null = null;
  private remotePlayers: Map<string, RemotePlayerState> = new Map();
  private inputHistory: { input: InputState; sequence: number; predictedPos: Vec2 }[] = [];
  private inputSequence = 0;
  private serverStateBuffer: Map<string, PredictedState[]> = new Map();

  // 平滑插值配置
  interpolationDelay = 100; // ms
  smoothingFactor = 0.15;

  setLocalPlayer(player: Player): void {
    this.localPlayer = player;
  }

  /**
   * 记录输入用于预测和回放
   */
  recordInput(input: InputState, dt: number): number {
    this.inputSequence++;

    if (this.localPlayer) {
      // 保存预测位置
      this.inputHistory.push({
        input: { ...input },
        sequence: this.inputSequence,
        predictedPos: { ...this.localPlayer.position },
      });

      // 限制历史长度
      if (this.inputHistory.length > 60) {
        this.inputHistory.shift();
      }
    }

    return this.inputSequence;
  }

  /**
   * 接收服务器状态，进行回滚与和解
   */
  reconcileServerState(playerId: string, serverPos: Vec2, serverRotation: number, sequence: number): void {
    if (!this.localPlayer || this.localPlayer.id !== playerId) {
      // 远程玩家 - 放入插值缓冲
      this.updateRemotePlayerState(playerId, serverPos, serverRotation);
      return;
    }

    // 本地玩家 - 和解
    // 找到对应输入序列的预测位置
    const index = this.inputHistory.findIndex((h) => h.sequence === sequence);
    if (index < 0) return;

    const predicted = this.inputHistory[index].predictedPos;
    const dx = serverPos.x - predicted.x;
    const dy = serverPos.y - predicted.y;
    const error = Math.sqrt(dx * dx + dy * dy);

    if (error > RECONCILIATION_THRESHOLD) {
      // 误差过大，直接 snap
      this.localPlayer.setPosition(serverPos.x, serverPos.y);
      this.localPlayer.rotation = serverRotation;
      // 清除该序列之前的所有历史
      this.inputHistory = this.inputHistory.slice(index + 1);
    } else if (error > 1) {
      // 小误差，平滑修正
      this.localPlayer.setPosition(
        this.localPlayer.position.x + dx * 0.3,
        this.localPlayer.position.y + dy * 0.3
      );
    }
  }

  /**
   * 更新远程玩家状态（用于插值）
   */
  updateRemotePlayerState(playerId: string, position: Vec2, rotation: number): void {
    const existing = this.remotePlayers.get(playerId);
    if (existing) {
      existing.targetPosition = { ...position };
      existing.rotation = rotation;
      existing.timestamp = Date.now();
    } else {
      this.remotePlayers.set(playerId, {
        id: playerId,
        position: { ...position },
        rotation,
        timestamp: Date.now(),
        targetPosition: { ...position },
      });
    }
  }

  /**
   * 对远程玩家进行平滑插值
   */
  interpolateRemotePlayers(players: Player[]): void {
    const now = Date.now();

    for (const player of players) {
      if (player === this.localPlayer) continue;

      const remote = this.remotePlayers.get(player.id);
      if (!remote) continue;

      // 延迟插值
      const timeSinceUpdate = now - remote.timestamp;
      if (timeSinceUpdate < this.interpolationDelay) {
        // 还没到插值时间，继续向目标移动
        const t = this.smoothingFactor;
        player.position.x += (remote.targetPosition.x - player.position.x) * t;
        player.position.y += (remote.targetPosition.y - player.position.y) * t;

        // 旋转插值
        let rdiff = remote.rotation - player.rotation;
        while (rdiff > Math.PI) rdiff -= Math.PI * 2;
        while (rdiff < -Math.PI) rdiff += Math.PI * 2;
        player.rotation += rdiff * t;
      }
    }
  }

  /**
   * 预测本地玩家移动（基于当前输入）
   */
  predictLocalMovement(input: InputState, dt: number): void {
    if (!this.localPlayer || this.localPlayer.isDead) return;

    // 将输入应用到本地玩家以进行预测
    this.localPlayer.input = input;
    // 实际的移动在 Player.update 中处理
  }

  /**
   * 获取远程玩家的插值位置（用于渲染）
   */
  getInterpolatedPosition(playerId: string): Vec2 | null {
    const remote = this.remotePlayers.get(playerId);
    if (!remote) return null;
    return { ...remote.position };
  }

  clear(): void {
    this.inputHistory = [];
    this.remotePlayers.clear();
    this.serverStateBuffer.clear();
    this.inputSequence = 0;
  }

  removePlayer(playerId: string): void {
    this.remotePlayers.delete(playerId);
  }
}
