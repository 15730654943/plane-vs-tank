import { SyncEvent, SyncEventType } from '../types';

export type NetworkMessageHandler = (event: SyncEvent) => void;

export interface NetworkConfig {
  supabaseUrl: string;
  supabaseKey: string;
  channelName: string;
  playerId: string;
}

/**
 * 网络管理器
 * Supabase Realtime 频道管理
 * Broadcast 事件发送/接收
 */
export class NetworkManager {
  private config: NetworkConfig;
  private connected = false;
  private channel: any = null;
  private supabase: any = null;
  private handlers: Map<SyncEventType, NetworkMessageHandler[]> = new Map();
  private latency = 0;
  private lastPingTime = 0;

  constructor(config: NetworkConfig) {
    this.config = config;
  }

  async connect(): Promise<boolean> {
    try {
      // 动态导入 Supabase 客户端
      const { createClient } = await import('@supabase/supabase-js');
      this.supabase = createClient(this.config.supabaseUrl, this.config.supabaseKey);

      this.channel = this.supabase.channel(this.config.channelName, {
        config: {
          broadcast: { ack: true },
        },
      });

      this.channel
        .on('broadcast', { event: 'game_event' }, (payload: { payload: SyncEvent }) => {
          this.handleIncomingMessage(payload.payload);
        })
        .on('broadcast', { event: 'ping' }, (payload: { payload: { time: number; playerId: string } }) => {
          if (payload.payload.playerId !== this.config.playerId) {
            this.send('pong', { time: payload.payload.time, playerId: this.config.playerId });
          }
        })
        .on('broadcast', { event: 'pong' }, (payload: { payload: { time: number; playerId: string } }) => {
          if (payload.payload.playerId !== this.config.playerId) {
            this.latency = (Date.now() - payload.payload.time) / 2;
          }
        })
        .subscribe((status: string) => {
          this.connected = status === 'SUBSCRIBED';
          console.log('[Network] Subscription status:', status);
        });

      return true;
    } catch (e) {
      console.error('[Network] Connection failed:', e);
      this.connected = false;
      return false;
    }
  }

  disconnect(): void {
    if (this.channel) {
      this.channel.unsubscribe();
      this.channel = null;
    }
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  getLatency(): number {
    return this.latency;
  }

  /**
   * 发送广播消息
   */
  send(eventType: string, data: Record<string, unknown>): boolean {
    if (!this.channel || !this.connected) return false;

    try {
      this.channel.send({
        type: 'broadcast',
        event: eventType,
        payload: data,
      });
      return true;
    } catch (e) {
      console.warn('[Network] Send failed:', e);
      return false;
    }
  }

  /**
   * 发送游戏同步事件
   */
  sendSyncEvent(event: SyncEvent): boolean {
    return this.send('game_event', event as unknown as Record<string, unknown>);
  }

  /**
   * 注册事件处理器
   */
  onEvent(type: SyncEventType, handler: NetworkMessageHandler): void {
    const handlers = this.handlers.get(type) || [];
    handlers.push(handler);
    this.handlers.set(type, handlers);
  }

  offEvent(type: SyncEventType, handler: NetworkMessageHandler): void {
    const handlers = this.handlers.get(type) || [];
    const idx = handlers.indexOf(handler);
    if (idx >= 0) handlers.splice(idx, 1);
    this.handlers.set(type, handlers);
  }

  private handleIncomingMessage(event: SyncEvent): void {
    // 忽略自己发送的消息
    if (event.playerId === this.config.playerId) return;

    const handlers = this.handlers.get(event.type) || [];
    for (const handler of handlers) {
      try {
        handler(event);
      } catch (e) {
        console.warn('[Network] Handler error:', e);
      }
    }
  }

  /**
   * 发送 ping 测试延迟
   */
  ping(): void {
    this.lastPingTime = Date.now();
    this.send('ping', { time: this.lastPingTime, playerId: this.config.playerId });
  }

  /**
   * 获取频道状态
   */
  getChannelState(): string {
    return this.connected ? 'connected' : 'disconnected';
  }
}
