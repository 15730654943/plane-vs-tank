import React from 'react'
import { Swords, Skull, Crosshair, Trophy, TrendingUp, TrendingDown } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import Avatar from '../ui/Avatar'
import type { GameResult } from '../../types'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface PlayerStatsProps {
  stats: GameResult
  isLocalPlayer?: boolean
  rank?: number
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ stats, isLocalPlayer, rank }) => {
  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 rounded-xl border transition-all',
        isLocalPlayer
          ? 'bg-blue-500/10 border-blue-500/30'
          : 'bg-slate-800 border-slate-700'
      )}
    >
      {rank && (
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
            rank === 1
              ? 'bg-yellow-500/20 text-yellow-400'
              : rank === 2
              ? 'bg-slate-400/20 text-slate-300'
              : rank === 3
              ? 'bg-amber-600/20 text-amber-500'
              : 'bg-slate-700 text-slate-400'
          )}
        >
          {rank}
        </div>
      )}

      <Avatar size="md" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white truncate">{stats.nickname}</span>
          {stats.is_winner && (
            <Trophy size={14} className="text-yellow-400 shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Swords size={12} className="text-blue-400" />
            {stats.kills} 击杀
          </span>
          <span className="flex items-center gap-1">
            <Skull size={12} className="text-red-400" />
            {stats.deaths} 死亡
          </span>
          <span className="flex items-center gap-1">
            <Crosshair size={12} className="text-yellow-400" />
            {stats.assists} 助攻
          </span>
        </div>
      </div>

      <div className="text-right shrink-0">
        <div className="text-lg font-bold text-white">{stats.score}</div>
        <div
          className={cn(
            'flex items-center gap-0.5 text-xs',
            stats.elo_change >= 0 ? 'text-green-400' : 'text-red-400'
          )}
        >
          {stats.elo_change >= 0 ? (
            <TrendingUp size={12} />
          ) : (
            <TrendingDown size={12} />
          )}
          {stats.elo_change >= 0 ? '+' : ''}
          {stats.elo_change}
        </div>
      </div>
    </div>
  )
}

export default PlayerStats
