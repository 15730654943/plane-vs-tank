import React from 'react'
import { Lock, Users, MapPin, Swords } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Room } from '../../types'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface RoomCardProps {
  room: Room
  onClick?: (room: Room) => void
  className?: string
}

const mapLabels: Record<string, string> = {
  city: '城市',
  desert: '沙漠',
  ocean: '海洋',
  random: '随机',
}

const modeLabels: Record<string, string> = {
  free: '自由混战',
  team: '团队战',
}

const mapColors: Record<string, string> = {
  city: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  desert: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  ocean: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  random: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onClick, className }) => {
  const isFull = room.current_players >= room.max_players

  return (
    <div
      onClick={() => onClick?.(room)}
      className={cn(
        'group relative bg-slate-800 border border-slate-700 rounded-xl p-4 cursor-pointer',
        'hover:border-slate-500 hover:bg-slate-750 transition-all duration-200',
        'hover:shadow-lg hover:shadow-black/20',
        isFull && 'opacity-60',
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {room.has_password && (
            <Lock size={14} className="text-yellow-400 shrink-0" />
          )}
          <h3 className="font-bold text-white truncate">{room.name}</h3>
        </div>
        <div
          className={cn(
            'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border shrink-0',
            isFull ? 'text-red-400 bg-red-500/20 border-red-500/30' : 'text-green-400 bg-green-500/20 border-green-500/30'
          )}
        >
          <Users size={12} />
          <span>
            {room.current_players}/{room.max_players}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={cn(
            'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border',
            mapColors[room.map] || mapColors.random
          )}
        >
          <MapPin size={12} />
          {mapLabels[room.map]}
        </span>
        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-slate-700 text-slate-300 border border-slate-600">
          <Swords size={12} />
          {modeLabels[room.mode]}
        </span>
        <span className="text-xs text-slate-400 ml-auto">
          房主: {room.host_name}
        </span>
      </div>

      {isFull && (
        <div className="absolute top-2 right-2 text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
          已满
        </div>
      )}
    </div>
  )
}

export default RoomCard
