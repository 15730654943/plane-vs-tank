import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, History } from 'lucide-react'
import ProfileCard from './profile/ProfileCard'
import EditProfileModal from './profile/EditProfileModal'
import Button from './ui/Button'
import { useAuth } from '../hooks/useAuth'
import type { User } from '../types'

const mockHistory = [
  { id: '1', mode: '自由混战', map: '城市', result: 'win', kills: 12, deaths: 3, score: 1500, date: '2024-01-15' },
  { id: '2', mode: '团队战', map: '沙漠', result: 'loss', kills: 8, deaths: 5, score: 1200, date: '2024-01-14' },
  { id: '3', mode: '自由混战', map: '海洋', result: 'win', kills: 15, deaths: 2, score: 1800, date: '2024-01-13' },
]

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user: authUser, updateProfile } = useAuth()
  const [showEditModal, setShowEditModal] = useState(false)

  const isSelf = !id || id === authUser?.id
  const user: User = isSelf && authUser ? authUser : {
    id: id || '1',
    email: 'player@example.com',
    nickname: `玩家${id || '1'}`,
    elo: 1350,
    kills: 420,
    deaths: 180,
    wins: 35,
    losses: 20,
    created_at: '2024-01-01T00:00:00Z',
  }

  const handleSaveProfile = (updates: Partial<User>) => {
    updateProfile(updates)
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/lobby')} leftIcon={<ArrowLeft size={16} />}>
            返回
          </Button>
          <h1 className="text-lg font-bold text-white">
            {isSelf ? '个人中心' : `${user.nickname} 的资料`}
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <ProfileCard
          user={user}
          isSelf={isSelf}
          onEdit={() => setShowEditModal(true)}
        />

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <History size={18} className="text-blue-400" />
            <h2 className="text-lg font-bold text-white">最近战绩</h2>
          </div>

          <div className="space-y-2">
            {mockHistory.map((game) => (
              <div
                key={game.id}
                className="flex items-center gap-4 p-3 bg-slate-900 rounded-xl border border-slate-700"
              >
                <div
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    game.result === 'win' ? 'bg-green-400' : 'bg-red-400'
                  }`}
                />
                <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                  <div className="text-slate-300">{game.date}</div>
                  <div className="text-slate-400">{game.mode}</div>
                  <div className="text-slate-400">{game.map}</div>
                  <div className="text-slate-300">
                    <span className="text-blue-400">{game.kills}</span>
                    <span className="text-slate-500"> / </span>
                    <span className="text-red-400">{game.deaths}</span>
                  </div>
                  <div className="text-yellow-400 font-bold">{game.score} 分</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={user}
        onSave={handleSaveProfile}
      />
    </div>
  )
}

export default ProfilePage
