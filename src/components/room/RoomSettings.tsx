import React, { useState } from 'react'
import { Settings, MapPin, Users, Clock, Swords } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import type { Room } from '../../types'

interface RoomSettingsProps {
  room: Room
  isHost: boolean
  onUpdateSettings?: (settings: Partial<Room>) => void
}

const maps = [
  { value: 'city', label: '城市' },
  { value: 'desert', label: '沙漠' },
  { value: 'ocean', label: '海洋' },
  { value: 'random', label: '随机' },
] as const

const modes = [
  { value: 'free', label: '自由混战' },
  { value: 'team', label: '团队战' },
] as const

const durations = [3, 5, 10] as const
const maxPlayersOpts = [2, 3, 4] as const

const RoomSettings: React.FC<RoomSettingsProps> = ({ room, isHost, onUpdateSettings }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [settings, setSettings] = useState({
    name: room.name,
    map: room.map,
    mode: room.mode,
    max_players: room.max_players,
    duration: room.duration,
  })

  const handleSave = () => {
    onUpdateSettings?.(settings)
    setIsEditing(false)
  }

  if (!isHost) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Settings size={18} className="text-slate-400" />
          <h3 className="font-bold text-white">房间设置</h3>
        </div>
        <div className="space-y-2 text-sm text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-400">地图</span>
            <span>{maps.find((m) => m.value === room.map)?.label}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">模式</span>
            <span>{modes.find((m) => m.value === room.mode)?.label}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">人数上限</span>
            <span>{room.max_players}人</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">时长</span>
            <span>{room.duration}分钟</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Settings size={18} className="text-blue-400" />
          <h3 className="font-bold text-white">房间设置</h3>
        </div>
        {!isEditing && (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            编辑
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <Input
            label="房间名称"
            value={settings.name}
            onChange={(e) => setSettings({ ...settings, name: e.target.value })}
          />
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 flex items-center gap-1">
              <MapPin size={12} /> 地图
            </label>
            <div className="grid grid-cols-4 gap-2">
              {maps.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setSettings({ ...settings, map: m.value as any })}
                  className={`p-2 rounded-lg border text-xs transition-all ${
                    settings.map === m.value
                      ? 'border-blue-500 bg-blue-500/20 text-white'
                      : 'border-slate-700 bg-slate-900 text-slate-400'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 flex items-center gap-1">
              <Swords size={12} /> 模式
            </label>
            <div className="flex gap-2">
              {modes.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setSettings({ ...settings, mode: m.value as any })}
                  className={`flex-1 p-2 rounded-lg border text-xs transition-all ${
                    settings.mode === m.value
                      ? 'border-blue-500 bg-blue-500/20 text-white'
                      : 'border-slate-700 bg-slate-900 text-slate-400'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 flex items-center gap-1">
              <Users size={12} /> 最大人数
            </label>
            <div className="flex gap-2">
              {maxPlayersOpts.map((n) => (
                <button
                  key={n}
                  onClick={() => setSettings({ ...settings, max_players: n })}
                  className={`flex-1 p-2 rounded-lg border text-xs transition-all ${
                    settings.max_players === n
                      ? 'border-blue-500 bg-blue-500/20 text-white'
                      : 'border-slate-700 bg-slate-900 text-slate-400'
                  }`}
                >
                  {n}人
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 flex items-center gap-1">
              <Clock size={12} /> 时长
            </label>
            <div className="flex gap-2">
              {durations.map((d) => (
                <button
                  key={d}
                  onClick={() => setSettings({ ...settings, duration: d })}
                  className={`flex-1 p-2 rounded-lg border text-xs transition-all ${
                    settings.duration === d
                      ? 'border-blue-500 bg-blue-500/20 text-white'
                      : 'border-slate-700 bg-slate-900 text-slate-400'
                  }`}
                >
                  {d}分钟
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="secondary" size="sm" className="flex-1" onClick={() => setIsEditing(false)}>
              取消
            </Button>
            <Button variant="primary" size="sm" className="flex-1" onClick={handleSave}>
              保存
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2 text-sm text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-400">地图</span>
            <span>{maps.find((m) => m.value === room.map)?.label}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">模式</span>
            <span>{modes.find((m) => m.value === room.mode)?.label}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">人数上限</span>
            <span>{room.max_players}人</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">时长</span>
            <span>{room.duration}分钟</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default RoomSettings
