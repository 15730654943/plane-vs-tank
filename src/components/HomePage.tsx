import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plane, Shield, Zap, ChevronRight, LogIn, UserPlus } from 'lucide-react'
import Button from './ui/Button'
import Input from './ui/Input'
import Modal from './ui/Modal'
import { useAuth } from '../hooks/useAuth'

const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const { isAuthenticated, signInAsGuest } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [loginError, setLoginError] = useState('')
  const [registerError, setRegisterError] = useState('')
  const [registerSuccess, setRegisterSuccess] = useState('')
  const { signIn, signUp } = useAuth()

  const handleGuestPlay = () => {
    signInAsGuest()
    navigate('/lobby')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    const { error } = await signIn(email, password)
    if (error) {
      setLoginError(error.message)
    } else {
      setShowLogin(false)
      navigate('/lobby')
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterError('')
    setRegisterSuccess('')
    const { error } = await signUp(email, password, nickname)
    if (error) {
      setRegisterError(error.message)
    } else {
      setShowRegister(false)
      setShowLogin(true)
      setRegisterSuccess('注册成功，请登录')
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-red-500 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center px-4">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-500/20 border-2 border-blue-400 rounded-2xl flex items-center justify-center rotate-12">
            <Plane size={32} className="text-blue-400" />
          </div>
          <div className="text-5xl font-black text-white">VS</div>
          <div className="w-16 h-16 bg-red-500/20 border-2 border-red-400 rounded-2xl flex items-center justify-center -rotate-12">
            <Shield size={32} className="text-red-400" />
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
          飞机坦克大战
        </h1>
        <p className="text-lg text-slate-400 mb-8 max-w-md mx-auto">
          选择你的阵营，驾驶战机或操控坦克，在激烈的多人对战中称霸战场！
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
          {!isAuthenticated ? (
            <>
              <Button
                variant="primary"
                size="lg"
                onClick={() => setShowLogin(true)}
                leftIcon={<LogIn size={20} />}
              >
                登录
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setShowRegister(true)}
                leftIcon={<UserPlus size={20} />}
              >
                注册
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={handleGuestPlay}
                rightIcon={<ChevronRight size={18} />}
              >
                游客试玩
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/lobby')}
              leftIcon={<Zap size={20} />}
              rightIcon={<ChevronRight size={18} />}
            >
              开始游戏
            </Button>
          )}
        </div>
      </div>

      <Modal isOpen={showLogin} onClose={() => setShowLogin(false)} title="登录" size="sm">
        <form onSubmit={handleLogin} className="space-y-4">
          {loginError && <p className="text-sm text-red-400">{loginError}</p>}
          {registerSuccess && <p className="text-sm text-green-400">{registerSuccess}</p>}
          <Input
            label="邮箱"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="密码"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="primary" className="w-full">
            登录
          </Button>
        </form>
      </Modal>

      <Modal isOpen={showRegister} onClose={() => setShowRegister(false)} title="注册" size="sm">
        <form onSubmit={handleRegister} className="space-y-4">
          {registerError && <p className="text-sm text-red-400">{registerError}</p>}
          <Input
            label="昵称"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
          />
          <Input
            label="邮箱"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="密码"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="primary" className="w-full">
            注册
          </Button>
        </form>
      </Modal>
    </div>
  )
}

export default HomePage
