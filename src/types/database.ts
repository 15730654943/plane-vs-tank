export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          elo_rating: number;
          total_games: number;
          wins: number;
          kills: number;
          deaths: number;
          mvp_count: number;
          total_play_time_seconds: number;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          elo_rating?: number;
          total_games?: number;
          wins?: number;
          kills?: number;
          deaths?: number;
          mvp_count?: number;
          total_play_time_seconds?: number;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          elo_rating?: number;
          total_games?: number;
          wins?: number;
          kills?: number;
          deaths?: number;
          mvp_count?: number;
          total_play_time_seconds?: number;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      rooms: {
        Row: {
          id: string;
          room_code: string;
          name: string;
          host_id: string;
          max_players: number;
          password_hash: string | null;
          game_mode: string;
          map_type: string;
          time_limit_minutes: number;
          status: string;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          room_code: string;
          name: string;
          host_id: string;
          max_players?: number;
          password_hash?: string | null;
          game_mode?: string;
          map_type?: string;
          time_limit_minutes?: number;
          status?: string;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          room_code?: string;
          name?: string;
          host_id?: string;
          max_players?: number;
          password_hash?: string | null;
          game_mode?: string;
          map_type?: string;
          time_limit_minutes?: number;
          status?: string;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      room_players: {
        Row: {
          id: string;
          room_id: string;
          player_id: string;
          is_host: boolean;
          is_ready: boolean;
          character_type: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          player_id: string;
          is_host?: boolean;
          is_ready?: boolean;
          character_type?: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          player_id?: string;
          is_host?: boolean;
          is_ready?: boolean;
          character_type?: string;
          joined_at?: string;
        };
      };
      games: {
        Row: {
          id: string;
          room_id: string | null;
          winner_id: string | null;
          game_mode: string;
          map_type: string;
          time_limit_minutes: number;
          actual_duration_seconds: number | null;
          started_at: string | null;
          ended_at: string | null;
        };
        Insert: {
          id?: string;
          room_id?: string | null;
          winner_id?: string | null;
          game_mode: string;
          map_type: string;
          time_limit_minutes: number;
          actual_duration_seconds?: number | null;
          started_at?: string | null;
          ended_at?: string | null;
        };
        Update: {
          id?: string;
          room_id?: string | null;
          winner_id?: string | null;
          game_mode?: string;
          map_type?: string;
          time_limit_minutes?: number;
          actual_duration_seconds?: number | null;
          started_at?: string | null;
          ended_at?: string | null;
        };
      };
      game_players: {
        Row: {
          id: string;
          game_id: string;
          player_id: string;
          character_type: string;
          kills: number;
          deaths: number;
          damage_dealt: number;
          damage_taken: number;
          items_collected: number;
          is_winner: boolean;
          is_mvp: boolean;
        };
        Insert: {
          id?: string;
          game_id: string;
          player_id: string;
          character_type: string;
          kills?: number;
          deaths?: number;
          damage_dealt?: number;
          damage_taken?: number;
          items_collected?: number;
          is_winner?: boolean;
          is_mvp?: boolean;
        };
        Update: {
          id?: string;
          game_id?: string;
          player_id?: string;
          character_type?: string;
          kills?: number;
          deaths?: number;
          damage_dealt?: number;
          damage_taken?: number;
          items_collected?: number;
          is_winner?: boolean;
          is_mvp?: boolean;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          sender_id: string;
          room_id: string;
          game_id: string | null;
          content: string;
          message_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          room_id: string;
          game_id?: string | null;
          content: string;
          message_type?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          room_id?: string;
          game_id?: string | null;
          content?: string;
          message_type?: string;
          created_at?: string;
        };
      };
      game_events: {
        Row: {
          id: string;
          game_id: string;
          player_id: string | null;
          target_id: string | null;
          event_type: string;
          position: Record<string, number> | null;
          data: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          player_id?: string | null;
          target_id?: string | null;
          event_type: string;
          position?: Record<string, number> | null;
          data?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          game_id?: string;
          player_id?: string | null;
          target_id?: string | null;
          event_type?: string;
          position?: Record<string, number> | null;
          data?: Record<string, unknown> | null;
          created_at?: string;
        };
      };
    };
  };
}
