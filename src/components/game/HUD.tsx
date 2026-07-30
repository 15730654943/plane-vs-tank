import React from 'react'
import { Pause, Play, Settings } from 'lucide-react'
import HealthBar from './HealthBar'
import EnergyBar from './EnergyBar'
import KillFeed from './KillFeed'
import Minimap from './Minimap'
import Timer from './Timer'
import WeaponPanel from './WeaponPanel'
import GameChat from './GameChat'
import { useGameStore } from '../../stores/gameStore'
import Button from '../ui/Button'

interface HUDProps {
  onPause?: () => void
  onResume?: () => void
  onSettings?: () => void
}

const HUD: React.FC<HUDProps> = ({ onPause, onResume, onSettings }) => {
  const { hud, gameState, isPaused, countdown, localPlayer } = useGameStore()

  return (
    <div className="absolute inset-0 pointer-events-none">
      {countdown > 0 && gameState.status === 'countdown' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
          <div className="text-7xl font-black text-white animate-pulse">
            {countdown}
          </div>
        </div>
      )}

      {isPaused && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-30 pointer-events-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center space-y-4 shadow-2xl">
            <h2 className="text-2xl font-bold text-white">游戏暂停</h2>
            <div className="flex flex-col gap-2">
              <Button variant="primary" onClick={onResume} leftIcon={<Play size={18} />}>
                继续游戏
              </Button>
              <Button variant="secondary" onClick={onSettings} leftIcon={<Settings size={18} />}>
                设置
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
        <div className="flex items-center gap-4">
          <Timer seconds={gameState.time_remaining} />
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-900/90 border border-slate-700">
            <div className="text-center">
              <div className="text-xs text-slate-400">击杀</div>
              <div className="text-lg font-bold text-white">{hud.kills}</div>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div className="text-center">
              <div className="text-xs text-slate-400">死亡</div>
              <div className="text-lg font-bold text-white">{hud.deaths}</div>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div className="text-center">
              <div className="text-xs text-slate-400">分数</div>
              <div className="text-lg font-bold text-yellow-400">{hud.score}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 pointer-events-auto">
          <KillFeed />
          <Minimap
            players={gameState.players}
            localPlayerId={localPlayer?.id}
          />
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between z-10">
        <div className="w-64 space-y-2 pointer-events-auto">
          <HealthBar current={hud.health} max={hud.maxHealth} size="md" />
          <EnergyBar current={hud.energy} max={hud.maxEnergy} size="md" />
        </div>

        <div className="flex items-end gap-3 pointer-events-auto">
          <WeaponPanel
            weapons={hud.weapons}
            currentWeaponId={hud.currentWeapon?.id}
          />
          <GameChat />
          <Button
            variant="secondary"
            size="sm"
            onClick={onPause}
            className="pointer-events-auto"
          >
            <Pause size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default HUD
