import React, { useState } from 'react'
import { MapPin, Users, Clock, Swords, Lock } from 'lucide-react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'
import type { Room } from '../../types'

interface CreateRoomModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate?: (roomData: Partial<Room>) => void
}

const maps = [
  { value: 'city', label: '城市', icon: '🏙️' },
  { value: 'desert', label: '沙漠', icon: '🏜️' },
  { value: 'ocean', label: '海洋', icon: '🌊' },
  { value: 'random', label: '随机', icon: '🎲' },
] as const

const modes = [
  { value: 'free', label: '自由混战' },
  { value: 'team', label: '团队战' },
] as const

const durations = [3, 5, 10] as const
const maxPlayers = [2, 3, 4] as const

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [selectedMap, setSelectedMap] = useState<string>('city')
  const [mode, setMode] = useState<string>('free')
  const [maxPlayer, setMaxPlayer] = useState<number>(4)
  const [duration, setDuration] = useState<number>(5)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreate?.({
      name: name.trim() || `${name || '未命名房间'}`,
      password: password || undefined,
      map: selectedMap as any,
      mode: mode as any,
      max_players: maxPlayer,
      duration: duration,
    })
    onClose()
    setName('')
    setPassword('')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="创建房间" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="房间名称"
          placeholder="输入房间名称"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="房间密码（可选）"
          placeholder="不设置则为公开房间"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock size={18} />}
        />

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <span className="flex items-center gap-1.5">
              <MapPin size={16} />
              地图选择
            </span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {maps.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setSelectedMap(m.value)}
                className={`p-3 rounded-lg border text-center transition-all ${
                  selectedMap === m.value
                    ? 'border-blue-500 bg-blue-500/20 text-white'
                    : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500'
                }`}
              >
                <div className="text-2xl mb-1">{m.icon}</div>
                <div className="text-xs">{m.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <span className="flex items-center gap-1.5">
              <Swords size={16} />
              游戏模式
            </span>
          </label>
          <div className="flex gap-2">
            {modes.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMode(m.value)}
                className={`flex-1 p-2.5 rounded-lg border text-sm font-medium transition-all ${
                  mode === m.value
                    ? 'border-blue-500 bg-blue-500/20 text-white'
                    : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <span className="flex items-center gap-1.5">
              <Users size={16} />
              最大人数
            </span>
          </label>
          <div className="flex gap-2">
            {maxPlayers.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setMaxPlayer(n)}
                className={`flex-1 p-2.5 rounded-lg border text-sm font-medium transition-all ${
                  maxPlayer === n
                    ? 'border-blue-500 bg-blue-500/20 text-white'
                    : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500'
                }`}
              >
                {n}人
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <span className="flex items-center gap-1.5">
              <Clock size={16} />
              游戏时长
            </span>
          </label>
          <div className="flex gap-2">
            {durations.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                className={`flex-1 p-2.5 rounded-lg border text-sm font-medium transition-all ${
                  duration === d
                    ? 'border-blue-500 bg-blue-500/20 text-white'
                    : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500'
                }`}
              >
                {d}分钟
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            取消
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            创建房间
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default CreateRoomModal
