import React from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import Button from '../ui/Button'

interface ReadyButtonProps {
  isReady: boolean
  onToggle: () => void
  disabled?: boolean
}

const ReadyButton: React.FC<ReadyButtonProps> = ({ isReady, onToggle, disabled }) => {
  return (
    <Button
      variant={isReady ? 'danger' : 'primary'}
      size="lg"
      className="w-full"
      onClick={onToggle}
      disabled={disabled}
      leftIcon={isReady ? <XCircle size={20} /> : <CheckCircle2 size={20} />}
    >
      {isReady ? '取消准备' : '准备就绪'}
    </Button>
  )
}

export default ReadyButton
