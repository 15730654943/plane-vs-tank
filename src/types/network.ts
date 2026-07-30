export interface NetworkState {
  isConnected: boolean;
  latency: number;
  lastPingAt: string | null;
  reconnectAttempts: number;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'disconnected';
}

export interface SyncData {
  timestamp: number;
  sequenceNumber: number;
  playerStates: PlayerSyncState[];
  gameEvents: GameSyncEvent[];
}

export interface PlayerSyncState {
  player_id: string;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  rotation: number;
  hp: number;
  energy: number;
  timestamp: number;
}

export interface GameSyncEvent {
  sequenceNumber: number;
  event_type: string;
  player_id?: string;
  target_id?: string;
  data: Record<string, unknown>;
  timestamp: number;
}

export interface BroadcastEvent {
  type: 'player_joined' | 'player_left' | 'player_ready' | 'game_started' | 'game_ended' | 'chat_message' | 'system_notification';
  room_id?: string;
  game_id?: string;
  player_id?: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

export interface PresenceState {
  [key: string]: PresenceEntry[];
}

export interface PresenceEntry {
  presence_ref: string;
  user_id: string;
  username: string;
  status: 'online' | 'away' | 'in_game';
  current_room_id?: string;
  last_seen_at: string;
}

export interface RealtimeMessage<T = unknown> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  new: T;
  old: T;
  commit_timestamp: string;
}
