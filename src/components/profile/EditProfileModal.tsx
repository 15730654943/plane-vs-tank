import React, { useState } from 'react'
import { User as UserIcon, Mail } from 'lucide-react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'
import type { User } from '../../types'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: User
  onSave?: (updates: Partial<User>) => void
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
}) => {
  const [nickname, setNickname] = useState(user.nickname)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nickname.trim()) return
    setIsLoading(true)
    await onSave?.({ nickname: nickname.trim() })
    setIsLoading(false)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="编辑资料" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center">
            <UserIcon size={28} className="text-slate-400" />
          </div>
          <div>
            <p className="text-sm text-slate-300">头像功能即将上线</p>
            <p className="text-xs text-slate-500">支持上传自定义头像</p>
          </div>
        </div>

        <Input
          label="昵称"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          leftIcon={<UserIcon size={18} />}
          required
        />

        <Input
          label="邮箱"
          value={user.email}
          disabled
          leftIcon={<Mail size={18} />}
        />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            取消
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            isLoading={isLoading}
          >
            保存
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default EditProfileModal
