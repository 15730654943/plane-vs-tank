import { supabase } from './supabase';
import type { Profile } from '../types/user';

export interface LeaderboardEntry {
  rank: number;
  player_id: string;
  username: string;
  avatar_url?: string;
  value: number;
  extra?: Record<string, unknown>;
}

export class LeaderboardService {
  /**
   * 获取ELO排名榜
   */
  static async getEloLeaderboard(limit: number = 50): Promise<{ entries: LeaderboardEntry[]; error: string | null }> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, elo_rating, total_games, wins')
      .order('elo_rating', { ascending: false })
      .limit(limit);

    if (error) {
      return { entries: [], error: error.message };
    }

    const entries: LeaderboardEntry[] = (data || []).map((profile: Record<string, unknown>, index: number) => ({
      rank: index + 1,
      player_id: profile.id as string,
      username: profile.username as string,
      avatar_url: profile.avatar_url as string | undefined,
      value: profile.elo_rating as number,
      extra: {
        total_games: profile.total_games,
        wins: profile.wins,
        win_rate: (profile.total_games as number) > 0
          ? (((profile.wins as number) / (profile.total_games as number)) * 100).toFixed(1) + '%'
          : '0%',
      },
    }));

    return { entries, error: null };
  }

  /**
   * 获取击杀排行榜
   */
  static async getKillsLeaderboard(limit: number = 50): Promise<{ entries: LeaderboardEntry[]; error: string | null }> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, kills, deaths, total_games')
      .order('kills', { ascending: false })
      .limit(limit);

    if (error) {
      return { entries: [], error: error.message };
    }

    const entries: LeaderboardEntry[] = (data || []).map((profile: Record<string, unknown>, index: number) => ({
      rank: index + 1,
      player_id: profile.id as string,
      username: profile.username as string,
      avatar_url: profile.avatar_url as string | undefined,
      value: profile.kills as number,
      extra: {
        deaths: profile.deaths,
        kd_ratio: (profile.deaths as number) > 0
          ? ((profile.kills as number) / (profile.deaths as number)).toFixed(2)
          : (profile.kills as number) > 0 ? '∞' : '0.00',
      },
    }));

    return { entries, error: null };
  }

  /**
   * 获取胜率排行榜
   */
  static async getWinRateLeaderboard(
    minGames: number = 10,
    limit: number = 50
  ): Promise<{ entries: LeaderboardEntry[]; error: string | null }> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, wins, total_games, elo_rating')
      .gte('total_games', minGames)
      .order('wins', { ascending: false })
      .limit(limit);

    if (error) {
      return { entries: [], error: error.message };
    }

    const sorted = (data || [])
      .map((profile: Record<string, unknown>) => ({
        ...profile,
        win_rate: (profile.total_games as number) > 0
          ? (profile.wins as number) / (profile.total_games as number)
          : 0,
      }))
      .sort((a: Record<string, unknown>, b: Record<string, unknown>) => (b.win_rate as number) - (a.win_rate as number));

    const entries: LeaderboardEntry[] = sorted.slice(0, limit).map((profile: Record<string, unknown>, index: number) => ({
      rank: index + 1,
      player_id: profile.id as string,
      username: profile.username as string,
      avatar_url: profile.avatar_url as string | undefined,
      value: parseFloat(((profile.win_rate as number) * 100).toFixed(1)),
      extra: {
        wins: profile.wins,
        total_games: profile.total_games,
        elo_rating: profile.elo_rating,
      },
    }));

    return { entries, error: null };
  }

  /**
   * 获取MVP排行榜
   */
  static async getMvpLeaderboard(limit: number = 50): Promise<{ entries: LeaderboardEntry[]; error: string | null }> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, mvp_count, total_games, wins')
      .order('mvp_count', { ascending: false })
      .limit(limit);

    if (error) {
      return { entries: [], error: error.message };
    }

    const entries: LeaderboardEntry[] = (data || []).map((profile: Record<string, unknown>, index: number) => ({
      rank: index + 1,
      player_id: profile.id as string,
      username: profile.username as string,
      avatar_url: profile.avatar_url as string | undefined,
      value: profile.mvp_count as number,
      extra: {
        total_games: profile.total_games,
        wins: profile.wins,
      },
    }));

    return { entries, error: null };
  }

  /**
   * 获取玩家排行位置
   */
  static async getPlayerRank(
    playerId: string,
    type: 'elo' | 'kills' | 'win_rate' | 'mvp' = 'elo'
  ): Promise<{ rank: number | null; totalPlayers: number; error: string | null }> {
    const orderColumn = type === 'elo' ? 'elo_rating' : type === 'kills' ? 'kills' : type === 'mvp' ? 'mvp_count' : 'wins';

    const { data: allData, error } = await supabase
      .from('profiles')
      .select('id')
      .order(orderColumn, { ascending: false });

    if (error) {
      return { rank: null, totalPlayers: 0, error: error.message };
    }

    const ranks = (allData || []) as Array<{ id: string }>;
    const rank = ranks.findIndex((p) => p.id === playerId) + 1;

    return {
      rank: rank > 0 ? rank : null,
      totalPlayers: ranks.length,
      error: null,
    };
  }

  /**
   * 获取综合排行榜（按多种指标加权）
   */
  static async getCompositeLeaderboard(limit: number = 50): Promise<{ entries: LeaderboardEntry[]; error: string | null }> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .gte('total_games', 5)
      .order('elo_rating', { ascending: false })
      .limit(limit * 2);

    if (error) {
      return { entries: [], error: error.message };
    }

    const profiles = (data || []) as Profile[];

    const scored = profiles.map((profile) => {
      const winRate = profile.total_games > 0 ? profile.wins / profile.total_games : 0;
      const kdRatio = profile.deaths > 0 ? profile.kills / profile.deaths : profile.kills > 0 ? Infinity : 0;
      const compositeScore =
        profile.elo_rating * 0.4 +
        winRate * 1000 * 0.25 +
        Math.min(kdRatio, 5) * 100 * 0.2 +
        profile.mvp_count * 10 * 0.15;

      return {
        profile,
        compositeScore,
        winRate,
        kdRatio: kdRatio === Infinity ? profile.kills : kdRatio,
      };
    });

    scored.sort((a, b) => b.compositeScore - a.compositeScore);

    const entries: LeaderboardEntry[] = scored.slice(0, limit).map((item, index) => ({
      rank: index + 1,
      player_id: item.profile.id,
      username: item.profile.username,
      avatar_url: item.profile.avatar_url,
      value: Math.round(item.compositeScore),
      extra: {
        elo_rating: item.profile.elo_rating,
        win_rate: (item.winRate * 100).toFixed(1) + '%',
        kd_ratio: item.kdRatio.toFixed(2),
        mvp_count: item.profile.mvp_count,
      },
    }));

    return { entries, error: null };
  }
}
