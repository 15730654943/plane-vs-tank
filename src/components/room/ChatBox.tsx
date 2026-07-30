import React, { useState, useRef, useEffect } from 'react'
import { Send, MessageSquare } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { useRoomStore } from '../../stores/roomStore'
import type { ChatMessage } from '../../types'

interface ChatBoxProps {
  messages: ChatMessage[]
  onSendMessage?: (content: string) => void
  quickCommands?: string[]
}

const ChatBox: React.FC<ChatBoxProps> = ({
  messages,
  onSendMessage,
  quickCommands = ['Good luck!', 'Nice shot!', 'Help!', 'Attack!', 'Defend!'],
}) => {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
    <div className="bg-slate-800 border border-slate-700 rounded-xl flex flex-col h-full min-h-[300px]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700">
        <MessageSquare size={18} className="text-blue-400" />
        <h3 className="font-bold text-white">聊天</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 text-sm py-8">
            暂无消息，开始聊天吧！
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`text-sm ${
              msg.type === 'system'
                ? 'text-center text-yellow-400/80 py-1'
                : 'text-slate-200'
            }`}
          >
            {msg.type !== 'system' && (
              <span className="font-medium text-blue-400 mr-1">{msg.nickname}:</span>
            )}
            <span className={msg.type === 'system' ? 'text-xs' : ''}>{msg.content}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {quickCommands.length > 0 && (
        <div className="px-3 py-2 border-t border-slate-700 flex gap-1.5 overflow-x-auto">
          {quickCommands.map((cmd) => (
            <button
              key={cmd}
              onClick={() => handleQuickCommand(cmd)}
              className="shrink-0 px-2.5 py-1 text-xs rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
            >
              {cmd}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-700 flex gap-2">
        <Input
          placeholder="输入消息..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="primary" size="sm" leftIcon={<Send size={16} />}>
          发送
        </Button>
      </form>
    </div>
  )
}

export default ChatBox
