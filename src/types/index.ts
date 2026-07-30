export interface User {
  id: string
  email: string
  nickname: string
  avatar_url?: string
  elo: number
  kills: number
  deaths: number
  wins: number
  losses: number
  created_at: string
}

export interface Room {
  id: string
  name: string
  host_id: string
  host_name: string
  map: 'city' | 'desert' | 'ocean' | 'random'
  mode: 'free' | 'team'
  max_players: number
  current_players: number
  has_password: boolean
  password?: string
  duration: number
  status: 'waiting' | 'playing' | 'ended'
  created_at: string
}

export interface RoomPlayer {
  id: string
  user_id: string
  nickname: string
  avatar_url?: string
  is_ready: boolean
  is_host: boolean
  role: 'plane' | 'tank'
  team?: 'red' | 'blue'
}

export interface ChatMessage {
  id: string
  user_id: string
  nickname: string
  content: string
  type: 'text' | 'system' | 'command'
  created_at: string
}

export interface GameState {
  status: 'waiting' | 'countdown' | 'playing' | 'paused' | 'ended'
  time_remaining: number
  players: GamePlayer[]
}

export interface GamePlayer {
  id: string
  nickname: string
  team?: 'red' | 'blue'
  health: number
  max_health: number
  energy: number
  max_energy: number
  kills: number
  deaths: number
  x: number
  y: number
  angle: number
}

export interface KillFeedItem {
  id: string
  killer: string
  victim: string
  weapon?: string
  timestamp: number
}

export interface Weapon {
  id: string
  name: string
  cooldown: number
  current_cooldown: number
  icon: string
}

export interface LeaderboardEntry {
  rank: number
  user_id: string
  nickname: string
  avatar_url?: string
  elo: number
  kills: number
  wins: number
  total_games: number
  win_rate: number
}

export interface GameResult {
  player_id: string
  nickname: string
  team?: 'red' | 'blue'
  kills: number
  deaths: number
  assists: number
  damage: number
  score: number
  elo_change: number
  is_winner: boolean
}

export type LeaderboardType = 'elo' | 'kills' | 'winrate'
