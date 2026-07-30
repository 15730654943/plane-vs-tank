export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at?: string;
  role?: string;
}

export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  elo_rating: number;
  total_games: number;
  wins: number;
  kills: number;
  deaths: number;
  mvp_count: number;
  total_play_time_seconds: number;
  created_at: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  username: string;
}

export interface UpdatePasswordPayload {
  currentPassword?: string;
  newPassword: string;
}
