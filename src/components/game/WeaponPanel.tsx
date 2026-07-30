import React from 'react'
import { Crosshair } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Weapon } from '../../types'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface WeaponPanelProps {
  weapons: Weapon[]
  currentWeaponId?: string
  className?: string
}

const WeaponPanel: React.FC<WeaponPanelProps> = ({ weapons, currentWeaponId, className }) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {weapons.map((weapon, index) => {
        const isActive = weapon.id === currentWeaponId
        const isOnCooldown = weapon.current_cooldown > 0
        const cooldownPercent = isOnCooldown
          ? (weapon.current_cooldown / weapon.cooldown) * 100
          : 0

        return (
          <div
            key={weapon.id}
            className={cn(
              'relative w-12 h-12 rounded-lg border flex items-center justify-center transition-all',
              isActive
                ? 'border-blue-500 bg-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                : 'border-slate-700 bg-slate-900'
            )}
          >
            <Crosshair
              size={20}
              className={cn(
                isActive ? 'text-blue-400' : 'text-slate-500',
                isOnCooldown && 'opacity-50'
              )}
            />
            <span className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-slate-800 border border-slate-600 rounded-full text-[10px] flex items-center justify-center text-slate-300">
              {index + 1}
            </span>
            {isOnCooldown && (
              <div
                className="absolute inset-0 bg-slate-900/70 rounded-lg flex items-center justify-center"
                style={{ clipPath: `inset(${100 - cooldownPercent}% 0 0 0)` }}
              >
                <span className="text-xs font-mono text-slate-300">
                  {Math.ceil(weapon.current_cooldown / 1000)}
                </span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default WeaponPanel
