import React from 'react'
import { Trophy, Medal, Award } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface RankBadgeProps {
  rank: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const rankConfig: Record<number, { icon: React.ReactNode; bg: string; text: string; border: string }> = {
  1: {
    icon: <Trophy size={16} />,
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-400',
    border: 'border-yellow-500/30',
  },
  2: {
    icon: <Medal size={16} />,
    bg: 'bg-slate-300/20',
    text: 'text-slate-300',
    border: 'border-slate-300/30',
  },
  3: {
    icon: <Award size={16} />,
    bg: 'bg-amber-600/20',
    text: 'text-amber-500',
    border: 'border-amber-600/30',
  },
}

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
}

const RankBadge: React.FC<RankBadgeProps> = ({ rank, size = 'md', className }) => {
  const config = rankConfig[rank]

  if (!config) {
    return (
      <div
        className={cn(
          'inline-flex items-center justify-center rounded-full bg-slate-700 text-slate-400 font-bold',
          sizeClasses[size],
          className
        )}
      >
        {rank}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full font-bold border',
        config.bg,
        config.text,
        config.border,
        sizeClasses[size],
        className
      )}
    >
      {config.icon}
    </div>
  )
}

export default RankBadge
