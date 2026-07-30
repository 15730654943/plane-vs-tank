export type CharacterType = 'airplane' | 'tank';
export type GameMode = 'free_for_all' | 'team';
export type MapType = 'city' | 'desert' | 'ocean' | 'random';
export type ItemType = 'health_pack' | 'ammo_pack' | 'speed_boost' | 'shield' | 'damage_boost';
export type GameEventType =
  | 'player_move'
  | 'player_shoot'
  | 'player_hit'
  | 'player_kill'
  | 'player_death'
  | 'item_spawn'
  | 'item_collect'
  | 'game_start'
  | 'game_end'
  | 'player_join'
  | 'player_leave';

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export interface GamePlayer {
  id: string;
  game_id: string;
  player_id: string;
  character_type: CharacterType;
  kills: number;
  deaths: number;
  damage_dealt: number;
  damage_taken: number;
  items_collected: number;
  is_winner: boolean;
  is_mvp: boolean;
  profile?: {
    username: string;
    avatar_url?: string;
    elo_rating: number;
  };
}

export interface GameStats {
  total_kills: number;
  total_deaths: number;
  total_damage_dealt: number;
  total_damage_taken: number;
  total_items_collected: number;
  game_duration_seconds: number;
}

export interface Game {
  id: string;
  room_id?: string;
  winner_id?: string;
  game_mode: GameMode;
  map_type: MapType;
  time_limit_minutes: number;
  actual_duration_seconds?: number;
  started_at?: string;
  ended_at?: string;
  players?: GamePlayer[];
  winner?: {
    username: string;
  };
}

export interface GameEvent {
  id?: string;
  game_id: string;
  player_id?: string;
  target_id?: string;
  event_type: GameEventType;
  position?: Position;
  data?: Record<string, unknown>;
  created_at?: string;
}

export interface ItemSpawn {
  id: string;
  item_type: ItemType;
  position: Position;
  spawned_at: string;
  expires_at: string;
}
