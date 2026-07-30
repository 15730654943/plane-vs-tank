import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, LogOut, RefreshCw } from 'lucide-react'
import PlayerList from './room/PlayerList'
import RoomSettings from './room/RoomSettings'
import ChatBox from './room/ChatBox'
import ReadyButton from './room/ReadyButton'
import Button from './ui/Button'
import { useAuth } from '../hooks/useAuth'
import { useRoomStore } from '../stores/roomStore'
import { useLobbyStore } from '../stores/lobbyStore'
import type { ChatMessage, RoomPlayer, Room } from '../types'

const RoomPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const lobbyRooms = useLobbyStore(state => state.rooms)

  const {
    currentRoom,
    players,
    messages,
    isReady,
    isHost,
    setCurrentRoom,
    setPlayers,
    setReady,
    setHost,
    addMessage,
    addPlayer,
    reset,
  } = useRoomStore()

  // 初始化房间数据
  useEffect(() => {
    if (!id) return

    // 从大厅 store 中查找房间信息
    const roomFromLobby = lobbyRooms.find(r => r.id === id)
    const roomData: Room = roomFromLobby || {
      id: id,
      name: '游戏房间',
      host_id: user?.id || 'guest',
      host_name: user?.nickname || '房主',
      map: 'city',
      mode: 'free',
      max_players: 4,
      current_players: 1,
      has_password: false,
      duration: 5,
      status: 'waiting',
      created_at: new Date().toISOString(),
    }

    setCurrentRoom(roomData)

    // 判断是否是房主
    const hostStatus = roomData.host_id === user?.id || roomData.host_name === user?.nickname
    setHost(hostStatus)

    // 添加当前玩家到玩家列表
    const currentPlayer: RoomPlayer = {
      id: user?.id || 'local-player',
      user_id: user?.id || 'guest',
      nickname: user?.nickname || '游客',
      is_ready: false,
      is_host: hostStatus,
      role: 'plane',
      team: hostStatus ? 'red' : 'blue',
    }

    // 如果玩家列表为空或没有当前玩家，则添加
    if (players.length === 0 || !players.find(p => p.user_id === user?.id)) {
      setPlayers([currentPlayer])
    }

    // 添加欢迎消息
    if (messages.length === 0) {
      const welcomeMsg: ChatMessage = {
        id: `msg-welcome`,
        user_id: 'system',
        nickname: '系统',
        content: '欢迎来到房间！',
        type: 'system',
        created_at: new Date().toISOString(),
      }
      addMessage(welcomeMsg)
    }

    return () => {
      // 离开房间时清理（但保留房间状态以便返回）
    }
  }, [id, user?.id, user?.nickname])

  const handleReadyToggle = () => {
    const newReadyState = !isReady
    setReady(newReadyState)

    // 更新玩家列表中的准备状态
    const playerIndex = players.findIndex(p => p.user_id === user?.id)
    if (playerIndex >= 0) {
      const updatedPlayers = [...players]
      updatedPlayers[playerIndex] = {
        ...updatedPlayers[playerIndex],
        is_ready: newReadyState,
      }
      setPlayers(updatedPlayers)
    }
  }

  const handleSendMessage = (content: string) => {
    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      user_id: user?.id || 'guest',
      nickname: user?.nickname || '游客',
      content,
      type: 'text',
      created_at: new Date().toISOString(),
    }
    addMessage(msg)
  }

  const handleLeave = () => {
    reset()
    navigate('/lobby')
  }

  const handleStartGame = () => {
    navigate(`/game/${id}`)
  }

  const handleAddBot = () => {
    // 添加一个 AI 玩家用于测试
    const botId = `bot-${Date.now()}`
    const botPlayer: RoomPlayer = {
      id: botId,
      user_id: botId,
      nickname: `AI玩家${players.length}`,
      is_ready: true,
      is_host: false,
      role: Math.random() > 0.5 ? 'plane' : 'tank',
      team: players.length % 2 === 0 ? 'blue' : 'red',
    }
    addPlayer(botPlayer)

    const sysMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      user_id: 'system',
      nickname: '系统',
      content: `${botPlayer.nickname} 加入了房间`,
      type: 'system',
      created_at: new Date().toISOString(),
    }
    addMessage(sysMsg)
  }

  const roomData = currentRoom || {
    id: id || '1',
    name: '游戏房间',
    host_id: user?.id || '1',
    host_name: user?.nickname || '房主',
    map: 'city' as const,
    mode: 'free' as const,
    max_players: 4,
    current_players: players.length,
    has_password: false,
    duration: 5,
    status: 'waiting' as const,
    created_at: new Date().toISOString(),
  }

  const allReady = players.length > 0 && players.every((p) => p.is_ready || p.is_host)

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleLeave} leftIcon={<ArrowLeft size={16} />}>
              返回
            </Button>
            <div>
              <h1 className="text-lg font-bold text-white">{roomData.name}</h1>
              <p className="text-xs text-slate-400">房间ID: {roomData.id}</p>
            </div>
          </div>
          <Button variant="danger" size="sm" onClick={handleLeave} leftIcon={<LogOut size={16} />}>
            离开房间
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <PlayerList
              players={players}
              currentUserId={user?.id}
              maxPlayers={roomData.max_players}
            />
            <RoomSettings room={roomData} isHost={isHost} />
            <div className="space-y-2">
              <ReadyButton isReady={isReady} onToggle={handleReadyToggle} />
              {isHost && (
                <>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={handleStartGame}
                    disabled={!allReady || players.length < 1}
                    leftIcon={<Play size={18} />}
                  >
                    开始游戏
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={handleAddBot}
                    leftIcon={<RefreshCw size={18} />}
                  >
                    添加AI玩家
                  </Button>
                </>
              )}
              {!isHost && (
                <p className="text-xs text-slate-500 text-center">
                  等待房主开始游戏...
                </p>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <ChatBox
              messages={messages}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default RoomPage
