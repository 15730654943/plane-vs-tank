import { useEffect, useRef, useCallback } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { useSupabase } from './useSupabase'

interface UseRealtimeOptions {
  channelName: string
  events?: {
    event: string
    table: string
    filter?: string
    handler: (payload: any) => void
  }[]
  broadcastEvents?: {
    event: string
    handler: (payload: any) => void
  }[]
  onSubscribe?: (channel: RealtimeChannel) => void
}

export function useRealtime({ channelName, events = [], broadcastEvents = [], onSubscribe }: UseRealtimeOptions) {
  const supabase = useSupabase()
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    const channel = supabase.channel(channelName)

    events.forEach(({ event, table, filter, handler }) => {
      channel.on(
        'postgres_changes' as any,
        { event, schema: 'public', table, filter },
        handler
      )
    })

    broadcastEvents.forEach(({ event, handler }) => {
      channel.on('broadcast', { event }, handler)
    })

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Realtime channel ${channelName} subscribed`)
        onSubscribe?.(channel)
      }
    })

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
      channelRef.current = null
    }
  }, [channelName, supabase])

  const sendBroadcast = useCallback(
    (event: string, payload: any) => {
      channelRef.current?.send({
        type: 'broadcast',
        event,
        payload,
      })
    },
    []
  )

  return { channel: channelRef, sendBroadcast }
}
