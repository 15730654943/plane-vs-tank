import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ELO 计算常量
const ELO_BASE_GAIN_WIN = 25;
const ELO_KILL_BONUS_WIN = 5;
const ELO_MVP_BONUS = 10;
const ELO_BASE_LOSS = 10;
const ELO_KILL_MITIGATION_LOSS = 2;
const ELO_MIN_CHANGE = 0;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const {
      game_id,
      winner_id,
      actual_duration_seconds,
    } = body;

    if (!game_id) {
      return new Response(
        JSON.stringify({ error: '缺少游戏ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 获取游戏信息
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('id', game_id)
      .single();

    if (gameError || !game) {
      return new Response(
        JSON.stringify({ error: '游戏不存在' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (game.ended_at) {
      return new Response(
        JSON.stringify({ error: '游戏已结束' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 获取所有玩家数据
    const { data: gamePlayers, error: playersError } = await supabase
      .from('game_players')
      .select('*, profile:profiles(id, username, elo_rating, total_games, wins, kills, deaths, mvp_count, total_play_time_seconds)')
      .eq('game_id', game_id);

    if (playersError || !gamePlayers || gamePlayers.length === 0) {
      return new Response(
        JSON.stringify({ error: '获取玩家数据失败' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 确定赢家和MVP
    let finalWinnerId = winner_id;
    if (!finalWinnerId) {
      // 如果没有指定赢家，按击杀数排序取最高
      const sorted = [...gamePlayers].sort((a, b) => (b.kills || 0) - (a.kills || 0));
      finalWinnerId = sorted[0]?.player_id;
    }

    // 确定MVP（击杀最多且死亡最少，或按综合评分）
    const mvpPlayer = [...gamePlayers].sort((a, b) => {
      const scoreA = (a.kills || 0) * 100 - (a.deaths || 0) * 50 + (a.damage_dealt || 0);
      const scoreB = (b.kills || 0) * 100 - (b.deaths || 0) * 50 + (b.damage_dealt || 0);
      return scoreB - scoreA;
    })[0];

    const mvpId = mvpPlayer?.player_id;

    // 计算每个玩家的ELO变化
    const eloChanges: Array<{
      player_id: string;
      old_elo: number;
      new_elo: number;
      change: number;
      is_winner: boolean;
      is_mvp: boolean;
    }> = [];

    const now = new Date().toISOString();
    const duration = actual_duration_seconds ||
      (game.started_at
        ? Math.floor((new Date().getTime() - new Date(game.started_at).getTime()) / 1000)
        : 0);

    // 批量更新 game_players
    const gamePlayerUpdates = gamePlayers.map((gp: Record<string, unknown>) => {
      const isWinner = gp.player_id === finalWinnerId;
      const isMvp = gp.player_id === mvpId;
      const kills = (gp.kills as number) || 0;

      let eloChange = 0;
      if (isWinner) {
        eloChange = ELO_BASE_GAIN_WIN + ELO_KILL_BONUS_WIN * kills + (isMvp ? ELO_MVP_BONUS : 0);
      } else {
        eloChange = -(ELO_BASE_LOSS - ELO_KILL_MITIGATION_LOSS * kills);
        if (eloChange > -ELO_MIN_CHANGE) eloChange = -ELO_MIN_CHANGE;
      }

      const profile = gp.profile as Record<string, number> | undefined;
      const oldElo = profile?.elo_rating || 1000;
      const newElo = oldElo + eloChange;

      eloChanges.push({
        player_id: gp.player_id as string,
        old_elo: oldElo,
        new_elo: newElo,
        change: eloChange,
        is_winner: isWinner,
        is_mvp: isMvp,
      });

      return {
        id: gp.id,
        is_winner: isWinner,
        is_mvp: isMvp,
      };
    });

    // 更新 game_players 的 winner/mvp 标记
    for (const update of gamePlayerUpdates) {
      await supabase
        .from('game_players')
        .update({ is_winner: update.is_winner, is_mvp: update.is_mvp })
        .eq('id', update.id);
    }

    // 批量更新 profiles
    for (const change of eloChanges) {
      const gp = gamePlayers.find((p: Record<string, unknown>) => p.player_id === change.player_id);
      const profile = gp?.profile as Record<string, number> | undefined;
      if (!profile) continue;

      const newTotalGames = (profile.total_games || 0) + 1;
      const newWins = (profile.wins || 0) + (change.is_winner ? 1 : 0);
      const newKills = (profile.kills || 0) + ((gp?.kills as number) || 0);
      const newDeaths = (profile.deaths || 0) + ((gp?.deaths as number) || 0);
      const newMvpCount = (profile.mvp_count || 0) + (change.is_mvp ? 1 : 0);
      const newPlayTime = (profile.total_play_time_seconds || 0) + duration;

      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({
          elo_rating: change.new_elo,
          total_games: newTotalGames,
          wins: newWins,
          kills: newKills,
          deaths: newDeaths,
          mvp_count: newMvpCount,
          total_play_time_seconds: newPlayTime,
          updated_at: now,
        })
        .eq('id', change.player_id);

      if (profileUpdateError) {
        console.error(`更新玩家 ${change.player_id} 资料失败:`, profileUpdateError);
      }
    }

    // 更新游戏记录
    const { error: gameUpdateError } = await supabase
      .from('games')
      .update({
        winner_id: finalWinnerId,
        actual_duration_seconds: duration,
        ended_at: now,
      })
      .eq('id', game_id);

    if (gameUpdateError) {
      return new Response(
        JSON.stringify({ error: `更新游戏记录失败: ${gameUpdateError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 更新房间状态为 finished
    if (game.room_id) {
      await supabase
        .from('rooms')
        .update({ status: 'finished' })
        .eq('id', game.room_id);
    }

    return new Response(
      JSON.stringify({
        game_id,
        winner_id: finalWinnerId,
        mvp_id: mvpId,
        duration_seconds: duration,
        elo_changes: eloChanges,
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
