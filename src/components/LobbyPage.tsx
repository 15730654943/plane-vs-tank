import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trophy, Filter, LogOut, User } from 'lucide-react'
import RoomList from './lobby/RoomList'
import SearchBar from './lobby/SearchBar'
import CreateRoomModal from './lobby/CreateRoomModal'
import Button from './ui/Button'
import { useAuth } from '../hooks/useAuth'
import { useLobbyStore } from '../stores/lobbyStore'
import type { Room } from '../types'

const LobbyPage: React.FC = () => {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const { filters, setFilters, addRoom } = useLobbyStore()

  const handleJoinRoom = (room: Room) => {
    navigate(`/room/${room.id}`)
  }

  const handleCreateRoom = (roomData: Partial<Room>) => {
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      name: roomData.name || '新房间',
      host_id: user?.id || 'guest',
      host_name: user?.nickname || '游客',
      map: roomData.map || 'random',
      mode: roomData.mode || 'free',
      max_players: roomData.max_players || 4,
      current_players: 1,
      has_password: !!roomData.password,
      duration: roomData.duration || 5,
      status: 'waiting',
      created_at: new Date().toISOString(),
    }
    addRoom(newRoom)
    navigate(`/room/${newRoom.id}`)
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1
              className="text-xl font-black text-white cursor-pointer"
              onClick={() => navigate('/')}
            >
              飞机坦克大战
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/leaderboard')}
              leftIcon={<Trophy size={16} />}
            >
              排行榜
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
              leftIcon={<User size={16} />}
            >
              {user?.nickname || '个人中心'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              leftIcon={<LogOut size={16} />}
            >
              退出
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-80 shrink-0 space-y-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => setShowCreateModal(true)}
                leftIcon={<Plus size={18} />}
              >
                创建房间
              </Button>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white flex items-center gap-1.5">
                  <Filter size={16} className="text-blue-400" />
                  筛选
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? '收起' : '展开'}
                </Button>
              </div>

              <SearchBar />

              {showFilters && (
                <div className="space-y-3 pt-2 border-t border-slate-700">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">地图</label>
                    <select
                      value={filters.mapFilter}
                      onChange={(e) => setFilters({ mapFilter: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="all">全部地图</option>
                      <option value="city">城市</option>
                      <option value="desert">沙漠</option>
                      <option value="ocean">海洋</option>
                      <option value="random">随机</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">模式</label>
                    <select
                      value={filters.modeFilter}
                      onChange={(e) => setFilters({ modeFilter: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="all">全部模式</option>
                      <option value="free">自由混战</option>
                      <option value="team">团队战</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.hideFull}
                        onChange={(e) => setFilters({ hideFull: e.target.checked })}
                        className="rounded border-slate-600 bg-slate-900 text-blue-500"
                      />
                      隐藏已满房间
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.hidePassword}
                        onChange={(e) => setFilters({ hidePassword: e.target.checked })}
                        className="rounded border-slate-600 bg-slate-900 text-blue-500"
                      />
                      隐藏密码房
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-h-[500px]">
            <RoomList onJoinRoom={handleJoinRoom} />
          </div>
        </div>
      </main>

      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateRoom}
      />
    </div>
  )
}

export default LobbyPage
