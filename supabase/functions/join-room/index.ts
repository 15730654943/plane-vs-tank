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
    const {
      room_code,
      player_id,
      password,
      character_type = 'airplane',
    } = body;

    if (!room_code || typeof room_code !== 'string') {
      return new Response(
        JSON.stringify({ error: '房间代码不能为空' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!player_id) {
      return new Response(
        JSON.stringify({ error: '缺少玩家ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!['airplane', 'tank'].includes(character_type)) {
      return new Response(
        JSON.stringify({ error: '角色类型无效' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 查询房间
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*, players:room_players(count)')
      .eq('room_code', room_code.toUpperCase().trim())
      .single();

    if (roomError || !room) {
      return new Response(
        JSON.stringify({ error: '房间不存在' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 检查房间状态
    if (room.status !== 'waiting') {
      return new Response(
        JSON.stringify({ error: '房间当前不可加入' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 检查是否已在房间中
    const { data: existingPlayer } = await supabase
      .from('room_players')
      .select('id')
      .eq('room_id', room.id)
      .eq('player_id', player_id)
      .single();

    if (existingPlayer) {
      return new Response(
        JSON.stringify({ error: '您已经在该房间中' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 检查密码
    if (room.password_hash) {
      if (!password) {
        return new Response(
          JSON.stringify({ error: '该房间需要密码' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const inputHash = await hashPassword(password);
      if (inputHash !== room.password_hash) {
        return new Response(
          JSON.stringify({ error: '房间密码错误' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 检查人数上限
    const playerCount = (room.players as { count: number })?.count || 0;
    if (playerCount >= room.max_players) {
      return new Response(
        JSON.stringify({ error: '房间已满' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 加入房间
    const { error: joinError } = await supabase
      .from('room_players')
      .insert({
        room_id: room.id,
        player_id,
        is_host: false,
        is_ready: false,
        character_type,
      });

    if (joinError) {
      return new Response(
        JSON.stringify({ error: `加入房间失败: ${joinError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 返回房间信息
    const { data: updatedRoom, error: updatedError } = await supabase
      .from('rooms')
      .select(`
        *,
        host:profiles!rooms_host_id_fkey(username, avatar_url),
        players:room_players(count)
      `)
      .eq('id', room.id)
      .single();

    if (updatedError) {
      return new Response(
        JSON.stringify({ error: `获取房间信息失败: ${updatedError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ room: updatedRoom }),
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

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
