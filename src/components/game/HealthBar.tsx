import React from 'react'
import { Heart } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface HealthBarProps {
  current: number
  max: number
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const HealthBar: React.FC<HealthBarProps> = ({
  current,
  max,
  showText = true,
  size = 'md',
  className,
}) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100))

  const barColor =
    percentage > 60 ? 'bg-green-500' : percentage > 30 ? 'bg-yellow-500' : 'bg-red-500'

  const glowColor =
    percentage > 60 ? 'shadow-green-500/30' : percentage > 30 ? 'shadow-yellow-500/30' : 'shadow-red-500/30'

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  }

  return (
    <div className={cn('w-full', className)}>
      {showText && (
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1 text-red-400">
            <Heart size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />
            <span className={cn('font-bold', size === 'sm' ? 'text-xs' : 'text-sm')}>
              HP
            </span>
          </div>
          <span className={cn('font-mono text-slate-300', size === 'sm' ? 'text-xs' : 'text-sm')}>
            {Math.round(current)}/{max}
          </span>
        </div>
      )}
      <div className={cn('w-full bg-slate-900 rounded-full overflow-hidden border border-slate-700', sizeClasses[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-300', barColor, glowColor)}
          style={{
            width: `${percentage}%`,
            boxShadow: `0 0 8px currentColor`,
          }}
        />
      </div>
    </div>
  )
}

export default HealthBar
