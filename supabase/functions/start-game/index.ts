import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { room_id } = body;

    if (!room_id) {
      return new Response(
        JSON.stringify({ error: '缺少房间ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 获取房间信息及玩家列表
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select(`
        *,
        players:room_players(*, profile:profiles(username))
      `)
      .eq('id', room_id)
      .single();

    if (roomError || !room) {
      return new Response(
        JSON.stringify({ error: '房间不存在' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (room.status !== 'waiting') {
      return new Response(
        JSON.stringify({ error: '房间当前状态不可开始游戏' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const players = (room.players as Array<Record<string, unknown>>) || [];

    if (players.length < 2) {
      return new Response(
        JSON.stringify({ error: '至少需要2名玩家才能开始游戏' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 检查是否所有玩家都已准备（房主除外也可以不准备，但这里要求所有非房主玩家准备）
    const notReadyPlayers = players.filter(
      (p) => !(p.is_host as boolean) && !(p.is_ready as boolean)
    );

    if (notReadyPlayers.length > 0) {
      return new Response(
        JSON.stringify({ error: '还有玩家未准备就绪' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 创建游戏记录
    const { data: game, error: gameError } = await supabase
      .from('games')
      .insert({
        room_id,
        game_mode: room.game_mode,
        map_type: room.map_type,
        time_limit_minutes: room.time_limit_minutes,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (gameError || !game) {
      return new Response(
        JSON.stringify({ error: `创建游戏记录失败: ${gameError?.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 创建 game_players 记录
    const gamePlayers = players.map((p) => ({
      game_id: game.id,
      player_id: p.player_id as string,
      character_type: p.character_type as string,
      kills: 0,
      deaths: 0,
      damage_dealt: 0,
      damage_taken: 0,
      items_collected: 0,
      is_winner: false,
      is_mvp: false,
    }));

    const { error: gamePlayersError } = await supabase
      .from('game_players')
      .insert(gamePlayers);

    if (gamePlayersError) {
      return new Response(
        JSON.stringify({ error: `创建玩家游戏数据失败: ${gamePlayersError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 更新房间状态为 countdown
    const { error: updateError } = await supabase
      .from('rooms')
      .update({ status: 'countdown' })
      .eq('id', room_id);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: `更新房间状态失败: ${updateError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        game_id: game.id,
        room_id,
        status: 'countdown',
        countdown_seconds: 5,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
