import React from 'react'
import { Crown, CheckCircle2, XCircle, Plane, Shield } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import Avatar from '../ui/Avatar'
import type { RoomPlayer } from '../../types'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface PlayerListProps {
  players: RoomPlayer[]
  currentUserId?: string
  maxPlayers: number
}

const roleIcons = {
  plane: <Plane size={14} className="text-blue-400" />,
  tank: <Shield size={14} className="text-green-400" />,
}

const PlayerList: React.FC<PlayerListProps> = ({ players, currentUserId, maxPlayers }) => {
  const emptySlots = Math.max(0, maxPlayers - players.length)

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white">玩家列表</h3>
        <span className="text-sm text-slate-400">
          {players.length}/{maxPlayers}
        </span>
      </div>

      <div className="space-y-2">
        {players.map((player) => (
          <div
            key={player.id}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border transition-all',
              player.user_id === currentUserId
                ? 'bg-blue-500/10 border-blue-500/30'
                : 'bg-slate-900 border-slate-700'
            )}
          >
            <Avatar src={player.avatar_url} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-white truncate">
                  {player.nickname}
                </span>
                {player.is_host && (
                  <Crown size={14} className="text-yellow-400 shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  {roleIcons[player.role]}
                  {player.role === 'plane' ? '飞机' : '坦克'}
                </span>
                {player.team && (
                  <span
                    className={cn(
                      'text-xs px-1.5 py-0.5 rounded',
                      player.team === 'red'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-blue-500/20 text-blue-400'
                    )}
                  >
                    {player.team === 'red' ? '红队' : '蓝队'}
                  </span>
                )}
              </div>
            </div>
            <div className="shrink-0">
              {player.is_ready ? (
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <CheckCircle2 size={14} />
                  已准备
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <XCircle size={14} />
                  未准备
                </span>
              )}
            </div>
          </div>
        ))}

        {Array.from({ length: emptySlots }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-slate-700 bg-slate-900/50"
          >
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
              <span className="text-slate-600 text-xs">?</span>
            </div>
            <span className="text-slate-500 text-sm">等待加入...</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PlayerList
