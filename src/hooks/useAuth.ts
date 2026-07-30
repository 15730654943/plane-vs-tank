import { useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useSupabase } from './useSupabase'

export function useAuth() {
  const supabase = useSupabase()
  const { user, isAuthenticated, isLoading, login, logout, setLoading, updateProfile } = useAuthStore()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profile) {
            login({
              id: session.user.id,
              email: session.user.email!,
              ...profile,
            })
          } else {
            login({
              id: session.user.id,
              email: session.user.email!,
              nickname: session.user.email!.split('@')[0],
              elo: 1200,
              kills: 0,
              deaths: 0,
              wins: 0,
              losses: 0,
              created_at: new Date().toISOString(),
            })
          }
        } else {
          setLoading(false)
        }
      } catch {
        setLoading(false)
      }
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          login({
            id: session.user.id,
            email: session.user.email!,
            ...profile,
          })
        }
      } else if (event === 'SIGNED_OUT') {
        logout()
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, login, logout, setLoading])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUp = async (email: string, password: string, nickname: string) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nickname } },
    })
    return { error, data }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    logout()
  }

  const signInAsGuest = () => {
    const guestId = `guest-${Date.now()}`
    login({
      id: guestId,
      email: `${guestId}@guest.local`,
      nickname: `游客${Math.floor(Math.random() * 9999)}`,
      elo: 1200,
      kills: 0,
      deaths: 0,
      wins: 0,
      losses: 0,
      created_at: new Date().toISOString(),
    })
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signUp,
    signOut,
    signInAsGuest,
    updateProfile,
  }
}
