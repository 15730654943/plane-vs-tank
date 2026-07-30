import React from 'react'
import { Clock } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface TimerProps {
  seconds: number
  isCountdown?: boolean
  className?: string
}

const Timer: React.FC<TimerProps> = ({ seconds, isCountdown = false, className }) => {
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const timeStr = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`

  const isLow = seconds <= 30 && !isCountdown

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/90 border border-slate-700',
        isLow && 'border-red-500/50 animate-pulse',
        className
      )}
    >
      <Clock size={18} className={cn(isLow ? 'text-red-400' : 'text-slate-300')} />
      <span
        className={cn(
          'font-mono text-xl font-bold tabular-nums',
          isLow ? 'text-red-400' : 'text-white'
        )}
      >
        {timeStr}
      </span>
    </div>
  )
}

export default Timer
