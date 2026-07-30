import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Trophy, Swords, Target } from 'lucide-react'
import LeaderboardTable from './leaderboard/LeaderboardTable'
import Button from './ui/Button'
import { useLobbyStore } from '../stores/lobbyStore'
import type { LeaderboardEntry, LeaderboardType } from '../types'

const mockData: Record<LeaderboardType, LeaderboardEntry[]> = {
  elo: Array.from({ length: 20 }, (_, i) => ({
    rank: i + 1,
    user_id: `user-${i}`,
    nickname: `玩家${i + 1}`,
    elo: 2000 - i * 45,
    kills: 500 - i * 20,
    wins: 100 - i * 4,
    total_games: 150 - i * 3,
    win_rate: 65 - i * 1.5,
  })),
  kills: Array.from({ length: 20 }, (_, i) => ({
    rank: i + 1,
    user_id: `user-${i}`,
    nickname: `杀手${i + 1}`,
    elo: 1600 - i * 30,
    kills: 800 - i * 35,
    wins: 80 - i * 3,
    total_games: 120 - i * 2,
    win_rate: 55 + (i % 3) * 5,
  })),
  winrate: Array.from({ length: 20 }, (_, i) => ({
    rank: i + 1,
    user_id: `user-${i}`,
    nickname: `战神${i + 1}`,
    elo: 1700 - i * 25,
    kills: 300 - i * 10,
    wins: 50 - i * 1,
    total_games: 60 - i,
    win_rate: 90 - i * 2.5,
  })),
}

const tabs: { type: LeaderboardType; label: string; icon: React.ReactNode }[] = [
  { type: 'elo', label: 'ELO排名', icon: <Trophy size={16} /> },
  { type: 'kills', label: '击杀榜', icon: <Swords size={16} /> },
  { type: 'winrate', label: '胜率榜', icon: <Target size={16} /> },
]

const LeaderboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { leaderboardType, setLeaderboardType } = useLobbyStore()
  const [activeTab, setActiveTab] = useState<LeaderboardType>(leaderboardType)

  const handleTabChange = (type: LeaderboardType) => {
    setActiveTab(type)
    setLeaderboardType(type)
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/lobby')} leftIcon={<ArrowLeft size={16} />}>
            返回
          </Button>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy size={20} className="text-yellow-400" />
            排行榜
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.type}
              onClick={() => handleTabChange(tab.type)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                activeTab === tab.type
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <LeaderboardTable
          entries={mockData[activeTab]}
          type={activeTab}
          onPlayerClick={(userId) => navigate(`/profile/${userId}`)}
        />
      </main>
    </div>
  )
}

export default LeaderboardPage
