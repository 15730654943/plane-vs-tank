import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ResultPanel from './result/ResultPanel'
import { useGameStore } from '../stores/gameStore'
import { useAuth } from '../hooks/useAuth'
import type { GameResult } from '../types'

const ResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { hud, localPlayer, reset } = useGameStore()
  const { user } = useAuth()
  const [results, setResults] = useState<GameResult[]>([])

  useEffect(() => {
    // 基于游戏数据生成结算数据
    const playerResult: GameResult = {
      player_id: user?.id || localPlayer?.id || '1',
      nickname: user?.nickname || localPlayer?.nickname || '玩家',
      team: 'red',
      kills: hud.kills,
      deaths: hud.deaths,
      assists: 0,
      damage: hud.kills * 200,
      score: hud.score,
      elo_change: hud.kills > hud.deaths ? 15 : -10,
      is_winner: hud.kills >= hud.deaths,
    }

    // 添加一些模拟的其他玩家数据
    const otherPlayers: GameResult[] = [
      {
        player_id: 'ai-1',
        nickname: 'AI玩家1',
        team: 'blue',
        kills: Math.floor(Math.random() * 8),
        deaths: Math.floor(Math.random() * 6),
        assists: Math.floor(Math.random() * 3),
        damage: Math.floor(Math.random() * 2000),
        score: Math.floor(Math.random() * 1500),
        elo_change: Math.floor(Math.random() * 30) - 15,
        is_winner: false,
      },
      {
        player_id: 'ai-2',
        nickname: 'AI玩家2',
        team: 'red',
        kills: Math.floor(Math.random() * 6),
        deaths: Math.floor(Math.random() * 8),
        assists: Math.floor(Math.random() * 4),
        damage: Math.floor(Math.random() * 1500),
        score: Math.floor(Math.random() * 1200),
        elo_change: Math.floor(Math.random() * 25) - 12,
        is_winner: true,
      },
      {
        player_id: 'ai-3',
        nickname: 'AI玩家3',
        team: 'blue',
        kills: Math.floor(Math.random() * 5),
        deaths: Math.floor(Math.random() * 7),
        assists: Math.floor(Math.random() * 2),
        damage: Math.floor(Math.random() * 1000),
        score: Math.floor(Math.random() * 800),
        elo_change: Math.floor(Math.random() * 20) - 10,
        is_winner: false,
      },
    ]

    const allResults = [playerResult, ...otherPlayers].sort((a, b) => b.score - a.score)
    setResults(allResults)
  }, [hud.kills, hud.deaths, hud.score, user?.id, user?.nickname, localPlayer?.id, localPlayer?.nickname])

  const handlePlayAgain = () => {
    reset()
    navigate(`/room/${id || 'new'}`)
  }

  const handleReturnLobby = () => {
    reset()
    navigate('/lobby')
  }

  return (
    <ResultPanel
      results={results}
      localPlayerId={user?.id || localPlayer?.id || '1'}
      gameDuration={3}
      onPlayAgain={handlePlayAgain}
      onReturnLobby={handleReturnLobby}
    />
  )
}

export default ResultPage
