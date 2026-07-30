import { supabase } from './supabase';
import type { Game, GamePlayer, GameEvent } from '../types/game';

export class GameService {
  /**
   * 获取游戏数据
   */
  static async getGame(gameId: string): Promise<{ game: Game | null; error: string | null }> {
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        winner:profiles!games_winner_id_fkey(username),
        players:game_players(
          *,
          profile:profiles(username, avatar_url, elo_rating)
        )
      `)
      .eq('id', gameId)
      .single();

    if (error) {
      return { game: null, error: error.message };
    }

    return { game: data as Game, error: null };
  }

  /**
   * 通过房间ID获取当前进行中的游戏
   */
  static async getActiveGameByRoom(roomId: string): Promise<{ game: Game | null; error: string | null }> {
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        winner:profiles!games_winner_id_fkey(username),
        players:game_players(
          *,
          profile:profiles(username, avatar_url, elo_rating)
        )
      `)
      .eq('room_id', roomId)
      .is('ended_at', null)
      .order('started_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { game: null, error: null };
      }
      return { game: null, error: error.message };
    }

    return { game: data as Game, error: null };
  }

  /**
   * 更新游戏状态
   */
  static async updateGameState(
    gameId: string,
    updates: Partial<Game>
  ): Promise<{ game: Game | null; error: string | null }> {
    const { data, error } = await supabase
      .from('games')
      .update(updates)
      .eq('id', gameId)
      .select()
      .single();

    if (error) {
      return { game: null, error: error.message };
    }

    return { game: data as Game, error: null };
  }

  /**
   * 结束游戏
   */
  static async endGame(
    gameId: string,
    winnerId?: string,
    actualDurationSeconds?: number
  ): Promise<{ result: Record<string, unknown> | null; error: string | null }> {
    const { data, error } = await supabase.functions.invoke('end-game', {
      body: {
        game_id: gameId,
        winner_id: winnerId,
        actual_duration_seconds: actualDurationSeconds,
      },
    });

    if (error) {
      return { result: null, error: error.message };
    }

    return { result: data || null, error: data?.error || null };
  }

  /**
   * 发送游戏事件
   */
  static async sendGameEvent(event: Omit<GameEvent, 'id' | 'created_at'>): Promise<{ event: GameEvent | null; error: string | null }> {
    const { data, error } = await supabase
      .from('game_events')
      .insert(event)
      .select()
      .single();

    if (error) {
      return { event: null, error: error.message };
    }

    return { event: data as GameEvent, error: null };
  }

  /**
   * 批量发送游戏事件
   */
  static async sendGameEvents(events: Omit<GameEvent, 'id' | 'created_at'>[]): Promise<{ events: GameEvent[] | null; error: string | null }> {
    const { data, error } = await supabase
      .from('game_events')
      .insert(events)
      .select();

    if (error) {
      return { events: null, error: error.message };
    }

    return { events: data as GameEvent[], error: null };
  }

  /**
   * 获取游戏事件列表
   */
  static async getGameEvents(
    gameId: string,
    options?: {
      eventType?: string;
      playerId?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ events: GameEvent[]; error: string | null }> {
    let query = supabase
      .from('game_events')
      .select('*')
      .eq('game_id', gameId)
      .order('created_at', { ascending: true });

    if (options?.eventType) {
      query = query.eq('event_type', options.eventType);
    }
    if (options?.playerId) {
      query = query.eq('player_id', options.playerId);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      return { events: [], error: error.message };
    }

    return { events: (data || []) as GameEvent[], error: null };
  }

  /**
   * 更新游戏玩家数据
   */
  static async updateGamePlayer(
    gameId: string,
    playerId: string,
    updates: Partial<GamePlayer>
  ): Promise<{ player: GamePlayer | null; error: string | null }> {
    const { data, error } = await supabase
      .from('game_players')
      .update(updates)
      .eq('game_id', gameId)
      .eq('player_id', playerId)
      .select()
      .single();

    if (error) {
      return { player: null, error: error.message };
    }

    return { player: data as GamePlayer, error: null };
  }

  /**
   * 校验游戏数据（防作弊）
   */
  static async validateGameData(
    gameId: string,
    playerStates: Array<{
      player_id: string;
      position: { x: number; y: number };
      hp: number;
      energy: number;
      timestamp: number;
    }>
  ): Promise<{ valid: boolean; violations: Array<{ player_id: string; reason: string }>; error: string | null }> {
    const { data, error } = await supabase.functions.invoke('game-validate', {
      body: {
        game_id: gameId,
        player_states: playerStates,
      },
    });

    if (error) {
      return { valid: false, violations: [], error: error.message };
    }

    return {
      valid: data?.valid ?? false,
      violations: data?.violations || [],
      error: data?.error || null,
    };
  }

  /**
   * 获取用户历史对局
   */
  static async getUserGameHistory(
    userId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<{ games: Game[]; error: string | null }> {
    const { data, error } = await supabase
      .from('game_players')
      .select(`
        game:games(
          *,
          winner:profiles!games_winner_id_fkey(username),
          players:game_players(
            *,
            profile:profiles(username, avatar_url, elo_rating)
          )
        )
      `)
      .eq('player_id', userId)
      .order('game(started_at)', { ascending: false })
      .limit(options?.limit || 20)
      .range(options?.offset || 0, (options?.offset || 0) + (options?.limit || 20) - 1);

    if (error) {
      return { games: [], error: error.message };
    }

    const games = ((data || []) as unknown as Array<{ game: Game }>).map((d) => d.game);
    return { games, error: null };
  }

  /**
   * 订阅游戏变化
   */
  static subscribeToGame(gameId: string, callback: (game: Game) => void) {
    const channel = supabase
      .channel(`game:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          callback(payload.new as Game);
        }
      )
      .subscribe();

    return channel;
  }

  /**
   * 订阅游戏事件
   */
  static subscribeToGameEvents(gameId: string, callback: (event: GameEvent) => void) {
    const channel = supabase
      .channel(`game_events:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_events',
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          callback(payload.new as GameEvent);
        }
      )
      .subscribe();

    return channel;
  }
}
