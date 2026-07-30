import React from 'react'
import { Trophy, Swords, Skull, Target, Calendar } from 'lucide-react'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import type { User } from '../../types'

interface ProfileCardProps {
  user: User
  isSelf?: boolean
  onEdit?: () => void
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user, isSelf, onEdit }) => {
  const kda = user.deaths > 0 ? (user.kills / user.deaths).toFixed(2) : user.kills.toString()
  const totalGames = user.wins + user.losses
  const winRate = totalGames > 0 ? ((user.wins / totalGames) * 100).toFixed(1) : '0'

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
      <div className="flex items-start gap-4 mb-6">
        <Avatar src={user.avatar_url} size="xl" />
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">{user.nickname}</h2>
          <p className="text-sm text-slate-400 mt-0.5">{user.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              ELO {user.elo}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 border border-slate-600">
              {totalGames} 场对战
            </span>
          </div>
        </div>
        {isSelf && (
          <Button variant="secondary" size="sm" onClick={onEdit}>
            编辑资料
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900 rounded-xl p-3 text-center border border-slate-700">
          <Trophy size={20} className="text-yellow-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-white">{user.wins}</div>
          <div className="text-xs text-slate-400">胜利</div>
        </div>
        <div className="bg-slate-900 rounded-xl p-3 text-center border border-slate-700">
          <Skull size={20} className="text-red-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-white">{user.losses}</div>
          <div className="text-xs text-slate-400">失败</div>
        </div>
        <div className="bg-slate-900 rounded-xl p-3 text-center border border-slate-700">
          <Swords size={20} className="text-blue-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-white">{user.kills}</div>
          <div className="text-xs text-slate-400">击杀</div>
        </div>
        <div className="bg-slate-900 rounded-xl p-3 text-center border border-slate-700">
          <Target size={20} className="text-green-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-white">{kda}</div>
          <div className="text-xs text-slate-400">K/D</div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <Calendar size={12} />
        <span>注册于 {new Date(user.created_at).toLocaleDateString('zh-CN')}</span>
        <span className="ml-auto">胜率 {winRate}%</span>
      </div>
    </div>
  )
}

export default ProfileCard
