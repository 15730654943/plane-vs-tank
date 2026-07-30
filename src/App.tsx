import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import HomePage from './components/HomePage'
import LobbyPage from './components/LobbyPage'
import RoomPage from './components/RoomPage'
import GamePage from './components/GamePage'
import ResultPage from './components/ResultPage'
import ProfilePage from './components/ProfilePage'
import LeaderboardPage from './components/LeaderboardPage'

function SpaRedirectHandler() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Handle GitHub Pages SPA redirect from 404.html
    const redirectPath = sessionStorage.getItem('spa-redirect')
    if (redirectPath && location.pathname === '/plane-vs-tank/') {
      sessionStorage.removeItem('spa-redirect')
      // Remove the basename prefix if present
      const cleanPath = redirectPath.replace(/^\/plane-vs-tank/, '')
      if (cleanPath && cleanPath !== '/') {
        navigate(cleanPath, { replace: true })
      }
    }
  }, [navigate, location.pathname])

  return null
}

function App() {
  return (
    <BrowserRouter basename="/plane-vs-tank">
      <SpaRedirectHandler />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="/room/:id" element={<RoomPage />} />
        <Route path="/game/:id" element={<GamePage />} />
        <Route path="/result/:id" element={<ResultPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
