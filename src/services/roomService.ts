import { supabase } from './supabase';
import type { Room, RoomPlayer, RoomSettings, RoomStatus } from '../types/room';

export class RoomService {
  /**
   * 获取房间列表
   */
  static async getRoomList(status?: RoomStatus[]): Promise<{ rooms: Room[]; error: string | null }> {
    let query = supabase
      .from('rooms')
      .select(`
        *,
        host:profiles!rooms_host_id_fkey(username, avatar_url),
        players:room_players(count)
      `)
      .order('created_at', { ascending: false });

    if (status && status.length > 0) {
      query = query.in('status', status);
    } else {
      query = query.in('status', ['waiting', 'countdown']);
    }

    const { data, error } = await query;

    if (error) {
      return { rooms: [], error: error.message };
    }

    const rooms: Room[] = (data || []).map((room: Record<string, unknown>) => ({
      ...room,
      player_count: (room.players as { count: number })?.count || 0,
    })) as Room[];

    return { rooms, error: null };
  }

  /**
   * 通过room_code获取房间
   */
  static async getRoomByCode(roomCode: string): Promise<{ room: Room | null; error: string | null }> {
    const { data, error } = await supabase
      .from('rooms')
      .select(`
        *,
        host:profiles!rooms_host_id_fkey(username, avatar_url),
        players:room_players(count)
      `)
      .eq('room_code', roomCode)
      .single();

    if (error) {
      return { room: null, error: error.message };
    }

    const room: Room = {
      ...data,
      player_count: (data.players as { count: number })?.count || 0,
    } as Room;

    return { room, error: null };
  }

  /**
   * 创建房间
   */
  static async createRoom(
    name: string,
    settings: RoomSettings
  ): Promise<{ room: Room | null; error: string | null }> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return { room: null, error: userError?.message || '用户未登录' };
    }

    const { data, error } = await supabase.functions.invoke('create-room', {
      body: {
        name,
        host_id: userData.user.id,
        max_players: settings.max_players,
        game_mode: settings.game_mode,
        map_type: settings.map_type,
        time_limit_minutes: settings.time_limit_minutes,
        password: settings.password,
      },
    });

    if (error) {
      return { room: null, error: error.message };
    }

    return { room: data?.room || null, error: data?.error || null };
  }

  /**
   * 加入房间
   */
  static async joinRoom(
    roomCode: string,
    password?: string,
    characterType: 'airplane' | 'tank' = 'airplane'
  ): Promise<{ room: Room | null; error: string | null }> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return { room: null, error: userError?.message || '用户未登录' };
    }

    const { data, error } = await supabase.functions.invoke('join-room', {
      body: {
        room_code: roomCode,
        player_id: userData.user.id,
        password,
        character_type: characterType,
      },
    });

    if (error) {
      return { room: null, error: error.message };
    }

    return { room: data?.room || null, error: data?.error || null };
  }

  /**
   * 离开房间
   */
  static async leaveRoom(roomId: string): Promise<{ error: string | null }> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return { error: userError?.message || '用户未登录' };
    }

    const { error } = await supabase
      .from('room_players')
      .delete()
      .eq('room_id', roomId)
      .eq('player_id', userData.user.id);

    return { error: error?.message || null };
  }

  /**
   * 更新房间设置
   */
  static async updateRoomSettings(
    roomId: string,
    settings: Partial<RoomSettings>
  ): Promise<{ room: Room | null; error: string | null }> {
    const updateData: Record<string, unknown> = {};
    if (settings.max_players !== undefined) updateData.max_players = settings.max_players;
    if (settings.game_mode !== undefined) updateData.game_mode = settings.game_mode;
    if (settings.map_type !== undefined) updateData.map_type = settings.map_type;
    if (settings.time_limit_minutes !== undefined) updateData.time_limit_minutes = settings.time_limit_minutes;

    const { data, error } = await supabase
      .from('rooms')
      .update(updateData)
      .eq('id', roomId)
      .select()
      .single();

    if (error) {
      return { room: null, error: error.message };
    }

    return { room: data as Room, error: null };
  }

  /**
   * 更新玩家准备状态
   */
  static async setReady(
    roomId: string,
    isReady: boolean
  ): Promise<{ error: string | null }> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return { error: userError?.message || '用户未登录' };
    }

    const { error } = await supabase
      .from('room_players')
      .update({ is_ready: isReady })
      .eq('room_id', roomId)
      .eq('player_id', userData.user.id);

    return { error: error?.message || null };
  }

  /**
   * 切换角色类型
   */
  static async switchCharacter(
    roomId: string,
    characterType: 'airplane' | 'tank'
  ): Promise<{ error: string | null }> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return { error: userError?.message || '用户未登录' };
    }

    const { error } = await supabase
      .from('room_players')
      .update({ character_type: characterType })
      .eq('room_id', roomId)
      .eq('player_id', userData.user.id);

    return { error: error?.message || null };
  }

  /**
   * 开始游戏
   */
  static async startGame(roomId: string): Promise<{ gameId: string | null; error: string | null }> {
    const { data, error } = await supabase.functions.invoke('start-game', {
      body: { room_id: roomId },
    });

    if (error) {
      return { gameId: null, error: error.message };
    }

    return { gameId: data?.game_id || null, error: data?.error || null };
  }

  /**
   * 获取房间内的玩家列表
   */
  static async getRoomPlayers(roomId: string): Promise<{ players: RoomPlayer[]; error: string | null }> {
    const { data, error } = await supabase
      .from('room_players')
      .select(`
        *,
        profile:profiles(username, avatar_url, elo_rating)
      `)
      .eq('room_id', roomId)
      .order('joined_at', { ascending: true });

    if (error) {
      return { players: [], error: error.message };
    }

    const players = (data || []).map((p: Record<string, unknown>) => ({
      ...p,
      profile: p.profile as { username: string; avatar_url?: string; elo_rating: number } | undefined,
    })) as RoomPlayer[];

    return { players, error: null };
  }

  /**
   * 订阅房间变化
   */
  static subscribeToRoom(roomId: string, callback: (room: Room) => void) {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          callback(payload.new as Room);
        }
      )
      .subscribe();

    return channel;
  }

  /**
   * 订阅房间玩家变化
   */
  static subscribeToRoomPlayers(roomId: string, callback: (players: RoomPlayer[]) => void) {
    const channel = supabase
      .channel(`room_players:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_players',
          filter: `room_id=eq.${roomId}`,
        },
        async () => {
          const { players } = await this.getRoomPlayers(roomId);
          callback(players);
        }
      )
      .subscribe();

    return channel;
  }
}
