export type RoomStatus = 'waiting' | 'countdown' | 'playing' | 'finished';

export interface RoomSettings {
  max_players: 2 | 3 | 4;
  game_mode: 'free_for_all' | 'team';
  map_type: 'city' | 'desert' | 'ocean' | 'random';
  time_limit_minutes: 3 | 5 | 10;
  password?: string;
}

export interface RoomPlayer {
  id: string;
  room_id: string;
  player_id: string;
  is_host: boolean;
  is_ready: boolean;
  character_type: 'airplane' | 'tank';
  joined_at: string;
  profile?: {
    username: string;
    avatar_url?: string;
    elo_rating: number;
  };
}

export interface Room {
  id: string;
  room_code: string;
  name: string;
  host_id: string;
  max_players: number;
  password_hash?: string;
  password?: string;
  game_mode: 'free_for_all' | 'team';
  map_type: 'city' | 'desert' | 'ocean' | 'random';
  time_limit_minutes: number;
  status: RoomStatus;
  created_at: string;
  updated_at?: string;
  players?: RoomPlayer[];
  host?: {
    username: string;
    avatar_url?: string;
  };
  player_count?: number;
}
