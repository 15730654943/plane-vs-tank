import React from 'react'
import { Search, Hash } from 'lucide-react'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { useLobbyStore } from '../../stores/lobbyStore'

const SearchBar: React.FC = () => {
  const { filters, setFilters } = useLobbyStore()

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <Input
          placeholder={filters.searchById ? '按ID搜索房间...' : '按名称搜索房间...'}
          value={filters.searchQuery}
          onChange={(e) => setFilters({ searchQuery: e.target.value })}
          leftIcon={<Search size={18} />}
        />
      </div>
      <Button
        variant={filters.searchById ? 'primary' : 'secondary'}
        size="sm"
        onClick={() => setFilters({ searchById: !filters.searchById })}
        leftIcon={<Hash size={16} />}
        className="shrink-0"
      >
        ID
      </Button>
    </div>
  )
}

export default SearchBar
