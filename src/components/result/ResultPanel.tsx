import React from 'react'
import { Trophy, RotateCcw, Home, Clock, Target } from 'lucide-react'
import Button from '../ui/Button'
import PlayerStats from './PlayerStats'
import type { GameResult } from '../../types'

interface ResultPanelProps {
  results: GameResult[]
  localPlayerId?: string
  gameDuration?: number
  onPlayAgain?: () => void
  onReturnLobby?: () => void
}

const ResultPanel: React.FC<ResultPanelProps> = ({
  results,
  localPlayerId,
  gameDuration,
  onPlayAgain,
  onReturnLobby,
}) => {
  const sortedResults = [...results].sort((a, b) => b.score - a.score)
  const winner = sortedResults[0]
  const totalKills = results.reduce((sum, r) => sum + r.kills, 0)

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-slate-700 p-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/20 border-2 border-yellow-400 mb-3">
            <Trophy size={32} className="text-yellow-400" />
          </div>
          <h1 className="text-2xl font-black text-white mb-1">游戏结束</h1>
          <p className="text-slate-400">
            胜利者: <span className="text-yellow-400 font-bold">{winner?.nickname}</span>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 p-4 border-b border-slate-700">
          <div className="text-center p-3 bg-slate-900 rounded-xl">
            <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mb-1">
              <Clock size={12} />
              时长
            </div>
            <div className="text-lg font-bold text-white">
              {gameDuration ? `${gameDuration}分钟` : '-'}
            </div>
          </div>
          <div className="text-center p-3 bg-slate-900 rounded-xl">
            <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mb-1">
              <Target size={12} />
              总击杀
            </div>
            <div className="text-lg font-bold text-white">{totalKills}</div>
          </div>
          <div className="text-center p-3 bg-slate-900 rounded-xl">
            <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mb-1">
              <Trophy size={12} />
              参赛者
            </div>
            <div className="text-lg font-bold text-white">{results.length}人</div>
          </div>
        </div>

        <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
          {sortedResults.map((result, index) => (
            <PlayerStats
              key={result.player_id}
              stats={result}
              rank={index + 1}
              isLocalPlayer={result.player_id === localPlayerId}
            />
          ))}
        </div>

        <div className="flex gap-3 p-4 border-t border-slate-700">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onReturnLobby}
            leftIcon={<Home size={18} />}
          >
            返回大厅
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={onPlayAgain}
            leftIcon={<RotateCcw size={18} />}
          >
            再来一局
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ResultPanel
