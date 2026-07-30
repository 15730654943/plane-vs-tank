import React, { useRef, useEffect } from 'react'
import type { GamePlayer } from '../../types'

interface MinimapProps {
  players?: GamePlayer[]
  localPlayerId?: string
  mapWidth?: number
  mapHeight?: number
  size?: number
}

const Minimap: React.FC<MinimapProps> = ({
  players = [],
  localPlayerId,
  mapWidth = 2000,
  mapHeight = 2000,
  size = 150,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const scale = size / Math.max(mapWidth, mapHeight)

    ctx.clearRect(0, 0, size, size)

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'
    ctx.fillRect(0, 0, size, size)

    ctx.strokeStyle = 'rgba(71, 85, 105, 0.5)'
    ctx.lineWidth = 0.5
    for (let i = 0; i < size; i += size / 8) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, size)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(size, i)
      ctx.stroke()
    }

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)'
    ctx.lineWidth = 1
    ctx.strokeRect(0, 0, size, size)

    players.forEach((player) => {
      const x = (player.x / mapWidth) * size
      const y = (player.y / mapHeight) * size

      const isLocal = player.id === localPlayerId
      ctx.fillStyle = isLocal ? '#3b82f6' : player.team === 'red' ? '#ef4444' : '#60a5fa'

      ctx.beginPath()
      ctx.arc(x, y, isLocal ? 3 : 2, 0, Math.PI * 2)
      ctx.fill()

      if (isLocal) {
        ctx.strokeStyle = '#3b82f6'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(x, y, 5, 0, Math.PI * 2)
        ctx.stroke()
      }
    })
  }, [players, localPlayerId, mapWidth, mapHeight, size])

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="rounded-lg border border-slate-700 shadow-lg"
      />
      <div className="absolute top-1 left-1.5 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-1 rounded">
        MAP
      </div>
    </div>
  )
}

export default Minimap
