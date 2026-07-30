import { create } from 'zustand'
import type { ChatMessage } from '../types'

interface ChatState {
  messages: ChatMessage[]
  unreadCount: number
  isOpen: boolean
  quickCommands: string[]
  addMessage: (message: ChatMessage) => void
  addMessages: (messages: ChatMessage[]) => void
  setMessages: (messages: ChatMessage[]) => void
  clearMessages: () => void
  setUnreadCount: (count: number) => void
  incrementUnread: () => void
  setIsOpen: (isOpen: boolean) => void
  resetUnread: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  unreadCount: 0,
  isOpen: false,
  quickCommands: ['Good luck!', 'Nice shot!', 'Help!', 'Wait for me', 'Attack!', 'Defend!'],
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message].slice(-200),
      unreadCount: state.isOpen ? state.unreadCount : state.unreadCount + 1,
    })),
  addMessages: (messages) =>
    set((state) => ({
      messages: [...state.messages, ...messages].slice(-200),
    })),
  setMessages: (messages) => set({ messages }),
  clearMessages: () => set({ messages: [] }),
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  setIsOpen: (isOpen) => set((state) => ({ isOpen, unreadCount: isOpen ? 0 : state.unreadCount })),
  resetUnread: () => set({ unreadCount: 0 }),
}))
