import { create } from 'zustand'
import type { GameState, GamePlayer, KillFeedItem, Weapon } from '../types'

interface HUDState {
  health: number
  maxHealth: number
  energy: number
  maxEnergy: number
  kills: number
  deaths: number
  score: number
  currentWeapon: Weapon | null
  weapons: Weapon[]
}

interface GameStoreState {
  gameState: GameState
  localPlayer: GamePlayer | null
  hud: HUDState
  killFeed: KillFeedItem[]
  isPaused: boolean
  countdown: number
  setGameState: (state: Partial<GameState>) => void
  setLocalPlayer: (player: GamePlayer | null) => void
  updateHUD: (updates: Partial<HUDState>) => void
  addKillFeed: (item: KillFeedItem) => void
  clearKillFeed: () => void
  setPaused: (paused: boolean) => void
  setCountdown: (count: number) => void
  reset: () => void
}

const initialHUD: HUDState = {
  health: 100,
  maxHealth: 100,
  energy: 100,
  maxEnergy: 100,
  kills: 0,
  deaths: 0,
  score: 0,
  currentWeapon: null,
  weapons: [],
}

const initialGameState: GameState = {
  status: 'waiting',
  time_remaining: 0,
  players: [],
}

export const useGameStore = create<GameStoreState>((set) => ({
  gameState: initialGameState,
  localPlayer: null,
  hud: initialHUD,
  killFeed: [],
  isPaused: false,
  countdown: 0,
  setGameState: (state) =>
    set((prev) => ({
      gameState: { ...prev.gameState, ...state },
    })),
  setLocalPlayer: (localPlayer) => set({ localPlayer }),
  updateHUD: (updates) =>
    set((prev) => ({
      hud: { ...prev.hud, ...updates },
    })),
  addKillFeed: (item) =>
    set((prev) => ({
      killFeed: [item, ...prev.killFeed].slice(0, 20),
    })),
  clearKillFeed: () => set({ killFeed: [] }),
  setPaused: (isPaused) => set({ isPaused }),
  setCountdown: (countdown) => set({ countdown }),
  reset: () =>
    set({
      gameState: initialGameState,
      localPlayer: null,
      hud: initialHUD,
      killFeed: [],
      isPaused: false,
      countdown: 0,
    }),
}))
