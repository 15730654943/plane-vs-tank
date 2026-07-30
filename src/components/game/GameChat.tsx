import React, { useState, useRef, useEffect } from 'react'
import { Send, MessageSquare, X } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useChatStore } from '../../stores/chatStore'
import type { ChatMessage } from '../../types'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface GameChatProps {
  messages?: ChatMessage[]
  onSendMessage?: (content: string) => void
}

const GameChat: React.FC<GameChatProps> = ({ messages: propMessages, onSendMessage }) => {
  const [input, setInput] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const storeMessages = useChatStore((state) => state.messages)
  const storeQuickCommands = useChatStore((state) => state.quickCommands)
  const messages = propMessages || storeMessages

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    onSendMessage?.(input.trim())
    setInput('')
  }

  const handleQuickCommand = (cmd: string) => {
    onSendMessage?.(cmd)
  }

  return (
    <div className="relative">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
        >
          <MessageSquare size={16} />
          <span className="text-xs font-medium">聊天</span>
        </button>
      )}

      {isOpen && (
        <div className="w-72 bg-slate-900/95 border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700">
            <span className="text-sm font-bold text-white flex items-center gap-1.5">
              <MessageSquare size={14} className="text-blue-400" />
              聊天
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          <div className="h-40 overflow-y-auto p-2 space-y-1">
            {messages.length === 0 && (
              <div className="text-center text-slate-500 text-xs py-6">
                按回车发送消息
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className="text-xs">
                <span className="font-medium text-blue-400">{msg.nickname}:</span>{' '}
                <span className="text-slate-200">{msg.content}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-2 py-1.5 border-t border-slate-700 flex gap-1 overflow-x-auto">
            {storeQuickCommands.slice(0, 4).map((cmd) => (
              <button
                key={cmd}
                onClick={() => handleQuickCommand(cmd)}
                className="shrink-0 px-2 py-0.5 text-[10px] rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                {cmd}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-2 border-t border-slate-700 flex gap-1.5">
            <input
              type="text"
              placeholder="输入消息..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              autoFocus
            />
            <button
              type="submit"
              className="p-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-500 transition-colors"
            >
              <Send size={12} />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default GameChat
