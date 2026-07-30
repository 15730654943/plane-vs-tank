import React from 'react'
import { Zap } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface EnergyBarProps {
  current: number
  max: number
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const EnergyBar: React.FC<EnergyBarProps> = ({
  current,
  max,
  showText = true,
  size = 'md',
  className,
}) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100))

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  }

  return (
    <div className={cn('w-full', className)}>
      {showText && (
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1 text-yellow-400">
            <Zap size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />
            <span className={cn('font-bold', size === 'sm' ? 'text-xs' : 'text-sm')}>
              EN
            </span>
          </div>
          <span className={cn('font-mono text-slate-300', size === 'sm' ? 'text-xs' : 'text-sm')}>
            {Math.round(current)}/{max}
          </span>
        </div>
      )}
      <div className={cn('w-full bg-slate-900 rounded-full overflow-hidden border border-slate-700', sizeClasses[size])}>
        <div
          className="h-full rounded-full bg-yellow-400 transition-all duration-300"
          style={{
            width: `${percentage}%`,
            boxShadow: '0 0 8px rgba(250, 204, 21, 0.4)',
          }}
        />
      </div>
    </div>
  )
}

export default EnergyBar
