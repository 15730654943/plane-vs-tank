import React from 'react'
import { RefreshCw, Frown } from 'lucide-react'
import RoomCard from './RoomCard'
import Button from '../ui/Button'
import { useLobbyStore } from '../../stores/lobbyStore'
import type { Room } from '../../types'

interface RoomListProps {
  onJoinRoom?: (room: Room) => void
}

const RoomList: React.FC<RoomListProps> = ({ onJoinRoom }) => {
  const { rooms, isRefreshing, setRefreshing, filteredRooms } = useLobbyStore()
  const visibleRooms = filteredRooms()

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">
          房间列表
          <span className="ml-2 text-sm font-normal text-slate-400">
            ({visibleRooms.length})
          </span>
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          isLoading={isRefreshing}
          leftIcon={<RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />}
        >
          刷新
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {visibleRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Frown size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">暂无符合条件的房间</p>
            <p className="text-sm mt-1">尝试调整筛选条件或创建一个新房间</p>
          </div>
        ) : (
          visibleRooms.map((room) => (
            <RoomCard key={room.id} room={room} onClick={onJoinRoom} />
          ))
        )}
      </div>
    </div>
  )
}

export default RoomList
