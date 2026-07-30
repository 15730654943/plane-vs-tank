import React, { useRef, useEffect, useCallback, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import HUD from './game/HUD'
import { useGameStore } from '../stores/gameStore'
import { useAuth } from '../hooks/useAuth'
import type { GamePlayer, Weapon, KillFeedItem } from '../types'

interface Bullet {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  ownerId: string
  damage: number
  color: string
}

interface Obstacle {
  x: number
  y: number
  width: number
  height: number
}

const GamePage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { user } = useAuth()
  const keysRef = useRef<Set<string>>(new Set())
  const bulletsRef = useRef<Bullet[]>([])
  const obstaclesRef = useRef<Obstacle[]>([])
  const lastShotRef = useRef<number>(0)
  const animationRef = useRef<number>(0)
  const gameStartTimeRef = useRef<number>(0)
  const [gameEnded, setGameEnded] = useState(false)

  const {
    setPaused,
    setGameState,
    setLocalPlayer,
    updateHUD,
    addKillFeed,
    hud,
    gameState,
    isPaused,
    setCountdown,
    countdown,
    reset,
  } = useGameStore()

  // 初始化游戏
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // 创建障碍物
    const obstacles: Obstacle[] = []
    for (let i = 0; i < 15; i++) {
      obstacles.push({
        x: Math.random() * (canvas.width - 80) + 40,
        y: Math.random() * (canvas.height - 80) + 40,
        width: 40 + Math.random() * 60,
        height: 40 + Math.random() * 60,
      })
    }
    obstaclesRef.current = obstacles

    // 初始化本地玩家
    const localPlayer: GamePlayer = {
      id: user?.id || 'local-player',
      nickname: user?.nickname || '玩家',
      team: 'red',
      health: 100,
      max_health: 100,
      energy: 100,
      max_energy: 100,
      kills: 0,
      deaths: 0,
      x: canvas.width / 4,
      y: canvas.height / 2,
      angle: 0,
    }
    setLocalPlayer(localPlayer)

    // 初始化武器
    const weapons: Weapon[] = [
      { id: 'mg', name: '机枪', cooldown: 150, current_cooldown: 0, icon: '🔫' },
      { id: 'missile', name: '导弹', cooldown: 1000, current_cooldown: 0, icon: '🚀' },
    ]
    updateHUD({
      weapons,
      currentWeapon: weapons[0],
      health: localPlayer.health,
      maxHealth: localPlayer.max_health,
      energy: localPlayer.energy,
      maxEnergy: localPlayer.max_energy,
      kills: 0,
      deaths: 0,
      score: 0,
    })

    // 设置游戏状态
    const gameDuration = 180 // 3分钟
    setGameState({
      status: 'countdown',
      time_remaining: gameDuration,
      players: [localPlayer],
    })

    // 开始倒计时
    setCountdown(3)
    let count = 3
    const countdownInterval = setInterval(() => {
      count--
      setCountdown(count)
      if (count <= 0) {
        clearInterval(countdownInterval)
        setGameState({ status: 'playing' })
        gameStartTimeRef.current = Date.now()
      }
    }, 1000)

    return () => {
      clearInterval(countdownInterval)
    }
  }, [user?.id, user?.nickname, setLocalPlayer, updateHUD, setGameState, setCountdown])

  // 键盘事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase())

      // 暂停
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        setPaused(!isPaused)
      }

      // 切换武器 1/2
      if (e.key === '1' || e.key === '2') {
        const weaponIndex = parseInt(e.key) - 1
        const weapons = hud.weapons
        if (weapons[weaponIndex]) {
          updateHUD({ currentWeapon: weapons[weaponIndex] })
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase())
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isPaused, setPaused, hud.weapons, updateHUD])

  // 射击
  const shoot = useCallback((player: GamePlayer) => {
    const now = Date.now()
    const weapon = hud.currentWeapon
    if (!weapon) return
    if (now - lastShotRef.current < weapon.cooldown) return

    lastShotRef.current = now

    const speed = 8
    const bullet: Bullet = {
      id: `bullet-${now}`,
      x: player.x,
      y: player.y,
      vx: Math.cos(player.angle) * speed,
      vy: Math.sin(player.angle) * speed,
      ownerId: player.id,
      damage: weapon.id === 'missile' ? 30 : 10,
      color: weapon.id === 'missile' ? '#f59e0b' : '#22d3ee',
    }
    bulletsRef.current.push(bullet)
  }, [hud.currentWeapon])

  // 游戏主循环
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let localPlayer = useGameStore.getState().localPlayer
    let gameEndedLocal = false

    const gameLoop = () => {
      const state = useGameStore.getState()

      // 暂停状态只渲染
      if (state.isPaused || state.gameState.status === 'countdown') {
        render(ctx, canvas, state.localPlayer, state.gameState.players)
        animationRef.current = requestAnimationFrame(gameLoop)
        return
      }

      if (state.gameState.status !== 'playing') {
        animationRef.current = requestAnimationFrame(gameLoop)
        return
      }

      localPlayer = state.localPlayer
      if (!localPlayer) {
        animationRef.current = requestAnimationFrame(gameLoop)
        return
      }

      const keys = keysRef.current
      let newX = localPlayer.x
      let newY = localPlayer.y
      let newAngle = localPlayer.angle
      const speed = 4

      // 移动控制 - WASD 或方向键
      if (keys.has('w') || keys.has('arrowup')) newY -= speed
      if (keys.has('s') || keys.has('arrowdown')) newY += speed
      if (keys.has('a') || keys.has('arrowleft')) newX -= speed
      if (keys.has('d') || keys.has('arrowright')) newX += speed

      // 朝向鼠标（简化：用 Q/E 旋转）
      if (keys.has('q')) newAngle -= 0.05
      if (keys.has('e')) newAngle += 0.05

      // 边界检测
      newX = Math.max(20, Math.min(canvas.width - 20, newX))
      newY = Math.max(20, Math.min(canvas.height - 20, newY))

      // 障碍物碰撞检测
      for (const obs of obstaclesRef.current) {
        if (
          newX + 15 > obs.x &&
          newX - 15 < obs.x + obs.width &&
          newY + 15 > obs.y &&
          newY - 15 < obs.y + obs.height
        ) {
          newX = localPlayer.x
          newY = localPlayer.y
          break
        }
      }

      // 射击 - 空格键
      if (keys.has(' ')) {
        shoot(localPlayer)
      }

      // 更新子弹
      const remainingBullets: Bullet[] = []
      for (const bullet of bulletsRef.current) {
        bullet.x += bullet.vx
        bullet.y += bullet.vy

        // 边界检测
        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
          continue
        }

        // 障碍物碰撞
        let hitObstacle = false
        for (const obs of obstaclesRef.current) {
          if (
            bullet.x > obs.x &&
            bullet.x < obs.x + obs.width &&
            bullet.y > obs.y &&
            bullet.y < obs.y + obs.height
          ) {
            hitObstacle = true
            break
          }
        }
        if (hitObstacle) continue

        remainingBullets.push(bullet)
      }
      bulletsRef.current = remainingBullets

      // 更新玩家位置
      const updatedPlayer = {
        ...localPlayer,
        x: newX,
        y: newY,
        angle: newAngle,
      }
      setLocalPlayer(updatedPlayer)

      // 更新游戏时间
      const elapsed = Math.floor((Date.now() - gameStartTimeRef.current) / 1000)
      const remaining = Math.max(0, 180 - elapsed)
      setGameState({ time_remaining: remaining })

      // 游戏结束检测
      if (remaining <= 0 && !gameEndedLocal) {
        gameEndedLocal = true
        setGameEnded(true)
        setGameState({ status: 'ended' })
        setTimeout(() => {
          navigate(`/result/${id}`)
        }, 2000)
      }

      // 能量恢复
      const newEnergy = Math.min(localPlayer.max_energy, localPlayer.energy + 0.1)

      if (newEnergy !== localPlayer.energy) {
        updateHUD({ energy: newEnergy })
      }

      render(ctx, canvas, updatedPlayer, state.gameState.players)
      animationRef.current = requestAnimationFrame(gameLoop)
    }

    animationRef.current = requestAnimationFrame(gameLoop)

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [shoot, setLocalPlayer, setGameState, updateHUD, navigate, id])

  // 渲染函数
  const render = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    localPlayer: GamePlayer | null,
    players: GamePlayer[]
  ) => {
    // 背景
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 网格
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.2)'
    ctx.lineWidth = 1
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y < canvas.height; y += 50) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // 障碍物
    for (const obs of obstaclesRef.current) {
      ctx.fillStyle = '#1e293b'
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height)
      ctx.strokeStyle = '#334155'
      ctx.lineWidth = 2
      ctx.strokeRect(obs.x, obs.y, obs.width, obs.height)
    }

    // 子弹
    for (const bullet of bulletsRef.current) {
      ctx.fillStyle = bullet.color
      ctx.beginPath()
      ctx.arc(bullet.x, bullet.y, 4, 0, Math.PI * 2)
      ctx.fill()

      // 子弹拖尾
      ctx.strokeStyle = bullet.color + '80'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(bullet.x, bullet.y)
      ctx.lineTo(bullet.x - bullet.vx * 2, bullet.y - bullet.vy * 2)
      ctx.stroke()
    }

    // 玩家（本地玩家）
    if (localPlayer) {
      ctx.save()
      ctx.translate(localPlayer.x, localPlayer.y)
      ctx.rotate(localPlayer.angle)

      // 玩家主体 - 飞机形状
      ctx.fillStyle = '#3b82f6'
      ctx.beginPath()
      ctx.moveTo(20, 0)
      ctx.lineTo(-12, -12)
      ctx.lineTo(-6, 0)
      ctx.lineTo(-12, 12)
      ctx.closePath()
      ctx.fill()

      // 发光效果
      ctx.shadowColor = '#3b82f6'
      ctx.shadowBlur = 15
      ctx.fill()
      ctx.shadowBlur = 0

      ctx.restore()

      // 玩家名字
      ctx.fillStyle = '#fff'
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(localPlayer.nickname, localPlayer.x, localPlayer.y - 25)

      // 血条
      const barWidth = 40
      const barHeight = 4
      const healthPercent = localPlayer.health / localPlayer.max_health
      ctx.fillStyle = '#1e293b'
      ctx.fillRect(localPlayer.x - barWidth / 2, localPlayer.y - 20, barWidth, barHeight)
      ctx.fillStyle = healthPercent > 0.3 ? '#22c55e' : '#ef4444'
      ctx.fillRect(localPlayer.x - barWidth / 2, localPlayer.y - 20, barWidth * healthPercent, barHeight)
    }

    // 游戏结束遮罩
    if (gameEnded) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 48px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('游戏结束', canvas.width / 2, canvas.height / 2)
      ctx.font = '20px sans-serif'
      ctx.fillStyle = '#94a3b8'
      ctx.fillText('正在进入结算页面...', canvas.width / 2, canvas.height / 2 + 40)
    }
  }

  const handlePause = () => setPaused(true)
  const handleResume = () => setPaused(false)
  const handleSettings = () => {}

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      <HUD onPause={handlePause} onResume={handleResume} onSettings={handleSettings} />

      {/* 操作提示 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-slate-500 pointer-events-none">
        WASD/方向键移动 | Q/E转向 | 空格射击 | 1/2切换武器 | ESC暂停
      </div>
    </div>
  )
}

export default GamePage
