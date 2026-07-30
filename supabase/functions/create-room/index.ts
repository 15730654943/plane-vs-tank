import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const {
      name,
      host_id,
      max_players = 4,
      game_mode = 'free_for_all',
      map_type = 'random',
      time_limit_minutes = 5,
      password,
    } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: '房间名称不能为空' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!host_id) {
      return new Response(
        JSON.stringify({ error: '缺少房主ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (![2, 3, 4].includes(max_players)) {
      return new Response(
        JSON.stringify({ error: '最大玩家数必须是 2、3 或 4' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!['free_for_all', 'team'].includes(game_mode)) {
      return new Response(
        JSON.stringify({ error: '游戏模式无效' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!['city', 'desert', 'ocean', 'random'].includes(map_type)) {
      return new Response(
        JSON.stringify({ error: '地图类型无效' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (![3, 5, 10].includes(time_limit_minutes)) {
      return new Response(
        JSON.stringify({ error: '时间限制必须是 3、5 或 10 分钟' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 生成唯一的 room_code
    let roomCode = generateRoomCode();
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const { data: existing } = await supabase
        .from('rooms')
        .select('room_code')
        .eq('room_code', roomCode)
        .single();

      if (!existing) break;
      roomCode = generateRoomCode();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return new Response(
        JSON.stringify({ error: '生成房间代码失败，请重试' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const passwordHash = password ? await hashPassword(password) : null;

    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .insert({
        room_code: roomCode,
        name: name.trim(),
        host_id,
        max_players,
        password_hash: passwordHash,
        game_mode,
        map_type,
        time_limit_minutes,
        status: 'waiting',
      })
      .select()
      .single();

    if (roomError) {
      return new Response(
        JSON.stringify({ error: `创建房间失败: ${roomError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 将房主加入房间
    const { error: playerError } = await supabase
      .from('room_players')
      .insert({
        room_id: room.id,
        player_id: host_id,
        is_host: true,
        is_ready: false,
        character_type: 'airplane',
      });

    if (playerError) {
      return new Response(
        JSON.stringify({ error: `添加房主到房间失败: ${playerError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ room }),
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
