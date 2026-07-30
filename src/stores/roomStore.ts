import { create } from 'zustand'
import type { Room, RoomPlayer, ChatMessage } from '../types'

interface RoomState {
  currentRoom: Room | null
  players: RoomPlayer[]
  messages: ChatMessage[]
  isReady: boolean
  isHost: boolean
  setCurrentRoom: (room: Room | null) => void
  setPlayers: (players: RoomPlayer[]) => void
  addPlayer: (player: RoomPlayer) => void
  removePlayer: (playerId: string) => void
  updatePlayer: (playerId: string, updates: Partial<RoomPlayer>) => void
  setReady: (isReady: boolean) => void
  setHost: (isHost: boolean) => void
  addMessage: (message: ChatMessage) => void
  setMessages: (messages: ChatMessage[]) => void
  clearMessages: () => void
  reset: () => void
}

export const useRoomStore = create<RoomState>((set) => ({
  currentRoom: null,
  players: [],
  messages: [],
  isReady: false,
  isHost: false,
  setCurrentRoom: (currentRoom) => set({ currentRoom }),
  setPlayers: (players) => set({ players }),
  addPlayer: (player) => set((state) => ({ players: [...state.players, player] })),
  removePlayer: (playerId) =>
    set((state) => ({
      players: state.players.filter((p) => p.id !== playerId),
    })),
  updatePlayer: (playerId, updates) =>
    set((state) => ({
      players: state.players.map((p) => (p.id === playerId ? { ...p, ...updates } : p)),
    })),
  setReady: (isReady) => set({ isReady }),
  setHost: (isHost) => set({ isHost }),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message].slice(-100),
    })),
  setMessages: (messages) => set({ messages }),
  clearMessages: () => set({ messages: [] }),
  reset: () => set({ currentRoom: null, players: [], messages: [], isReady: false, isHost: false }),
}))
