import React from 'react'
import { Skull } from 'lucide-react'
import { useGameStore } from '../../stores/gameStore'
import type { KillFeedItem } from '../../types'

interface KillFeedProps {
  items?: KillFeedItem[]
}

const KillFeedItemComponent: React.FC<{ item: KillFeedItem }> = ({ item }) => {
  return (
    <div className="flex items-center gap-1.5 text-sm animate-in slide-in-from-right fade-in duration-200">
      <span className="font-bold text-blue-400">{item.killer}</span>
      <Skull size={12} className="text-slate-400" />
      <span className="font-bold text-red-400">{item.victim}</span>
      {item.weapon && (
        <span className="text-xs text-slate-500">({item.weapon})</span>
      )}
    </div>
  )
}

const KillFeed: React.FC<KillFeedProps> = ({ items }) => {
  const storeItems = useGameStore((state) => state.killFeed)
  const feedItems = items || storeItems

  return (
    <div className="flex flex-col items-end gap-1 pointer-events-none">
      {feedItems.slice(0, 5).map((item) => (
        <KillFeedItemComponent key={item.id} item={item} />
      ))}
    </div>
  )
}

export default KillFeed
