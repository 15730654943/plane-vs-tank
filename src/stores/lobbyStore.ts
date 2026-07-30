import { create } from 'zustand'
import type { Room, LeaderboardType } from '../types'

interface FilterState {
  searchQuery: string
  searchById: boolean
  mapFilter: string
  modeFilter: string
  hideFull: boolean
  hidePassword: boolean
}

interface LobbyState {
  rooms: Room[]
  filters: FilterState
  leaderboardType: LeaderboardType
  isRefreshing: boolean
  setRooms: (rooms: Room[]) => void
  addRoom: (room: Room) => void
  updateRoom: (room: Room) => void
  removeRoom: (roomId: string) => void
  setFilters: (filters: Partial<FilterState>) => void
  setLeaderboardType: (type: LeaderboardType) => void
  setRefreshing: (refreshing: boolean) => void
  filteredRooms: () => Room[]
}

export const useLobbyStore = create<LobbyState>((set, get) => ({
  rooms: [],
  filters: {
    searchQuery: '',
    searchById: false,
    mapFilter: 'all',
    modeFilter: 'all',
    hideFull: false,
    hidePassword: false,
  },
  leaderboardType: 'elo',
  isRefreshing: false,
  setRooms: (rooms) => set({ rooms }),
  addRoom: (room) => set((state) => ({ rooms: [...state.rooms, room] })),
  updateRoom: (room) =>
    set((state) => ({
      rooms: state.rooms.map((r) => (r.id === room.id ? room : r)),
    })),
  removeRoom: (roomId) =>
    set((state) => ({
      rooms: state.rooms.filter((r) => r.id !== roomId),
    })),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  setLeaderboardType: (leaderboardType) => set({ leaderboardType }),
  setRefreshing: (isRefreshing) => set({ isRefreshing }),
  filteredRooms: () => {
    const { rooms, filters } = get()
    return rooms.filter((room) => {
      if (filters.searchQuery) {
        if (filters.searchById) {
          if (!room.id.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false
        } else {
          if (!room.name.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false
        }
      }
      if (filters.mapFilter !== 'all' && room.map !== filters.mapFilter) return false
      if (filters.modeFilter !== 'all' && room.mode !== filters.modeFilter) return false
      if (filters.hideFull && room.current_players >= room.max_players) return false
      if (filters.hidePassword && room.has_password) return false
      return true
    })
  },
}))
