import React from 'react'
import { User } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface AvatarProps {
  src?: string
  alt?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  fallback?: React.ReactNode
  borderColor?: string
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-xl',
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  size = 'md',
  className,
  fallback,
  borderColor,
}) => {
  const [error, setError] = React.useState(false)

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full bg-slate-700 overflow-hidden shrink-0',
        sizeClasses[size],
        borderColor && `ring-2 ${borderColor}`,
        className
      )}
    >
      {src && !error ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full text-slate-400">
          {fallback || <User size={size === 'xs' ? 12 : size === 'sm' ? 16 : size === 'md' ? 20 : size === 'lg' ? 28 : 36} />}
        </div>
      )}
    </div>
  )
}

export default Avatar
