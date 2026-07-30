import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import Avatar from '../ui/Avatar'
import RankBadge from './RankBadge'
import type { LeaderboardEntry, LeaderboardType } from '../../types'

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  type: LeaderboardType
  onPlayerClick?: (userId: string) => void
}

const typeLabels: Record<LeaderboardType, string> = {
  elo: 'ELO',
  kills: '击杀数',
  winrate: '胜率',
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  entries,
  type,
  onPlayerClick,
}) => {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 w-16">
                排名
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">
                玩家
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-400">
                {typeLabels[type]}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 hidden md:table-cell">
                击杀
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 hidden md:table-cell">
                场次
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 hidden md:table-cell">
                胜率
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {entries.map((entry) => (
              <tr
                key={entry.user_id}
                className="hover:bg-slate-700/30 transition-colors cursor-pointer"
                onClick={() => onPlayerClick?.(entry.user_id)}
              >
                <td className="px-4 py-3">
                  <RankBadge rank={entry.rank} size="sm" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={entry.avatar_url} size="sm" />
                    <span className="font-medium text-white text-sm">
                      {entry.nickname}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-bold text-white">
                    {type === 'winrate'
                      ? `${entry.win_rate.toFixed(1)}%`
                      : type === 'elo'
                      ? entry.elo
                      : entry.kills}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm text-slate-300 hidden md:table-cell">
                  {entry.kills}
                </td>
                <td className="px-4 py-3 text-right text-sm text-slate-300 hidden md:table-cell">
                  {entry.total_games}
                </td>
                <td className="px-4 py-3 text-right hidden md:table-cell">
                  <div className="flex items-center justify-end gap-1">
                    {entry.win_rate > 50 ? (
                      <TrendingUp size={14} className="text-green-400" />
                    ) : entry.win_rate < 50 ? (
                      <TrendingDown size={14} className="text-red-400" />
                    ) : (
                      <Minus size={14} className="text-slate-400" />
                    )}
                    <span className="text-sm text-slate-300">
                      {entry.win_rate.toFixed(1)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {entries.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          暂无排行榜数据
        </div>
      )}
    </div>
  )
}

export default LeaderboardTable
