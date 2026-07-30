import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// 游戏常量校验阈值
const VALIDATION_CONSTANTS = {
  MAP_WIDTH: 2000,
  MAP_HEIGHT: 2000,
  AIRPLANE_MAX_HP: 100,
  TANK_MAX_HP: 150,
  MAX_ENERGY: 100,
  MAX_SPEED_PER_FRAME: 15, // 每帧最大移动距离（像素）
  MAX_HP_REGEN_PER_SECOND: 5,
  MAX_ENERGY_REGEN_PER_SECOND: 10,
  MAX_POSITION_DELTA: 50, // 位置突变阈值
  BULLET_SPEED: 400,
  MAX_BULLETS_PER_SECOND: 10,
};

interface PlayerState {
  player_id: string;
  position: { x: number; y: number };
  hp: number;
  energy: number;
  timestamp: number;
  character_type?: 'airplane' | 'tank';
}

interface ValidationResult {
  valid: boolean;
  violations: Array<{ player_id: string; reason: string }>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const {
      game_id,
      player_states,
      previous_states,
    } = body as {
      game_id?: string;
      player_states?: PlayerState[];
      previous_states?: PlayerState[];
    };

    if (!game_id) {
      return new Response(
        JSON.stringify({ error: '缺少游戏ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!player_states || !Array.isArray(player_states) || player_states.length === 0) {
      return new Response(
        JSON.stringify({ error: '缺少玩家状态数据' }),
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

    // 获取游戏玩家信息（用于确认角色类型）
    const { data: gamePlayers } = await supabase
      .from('game_players')
      .select('player_id, character_type')
      .eq('game_id', game_id);

    const characterMap = new Map<string, string>();
    if (gamePlayers) {
      for (const gp of gamePlayers) {
        characterMap.set(gp.player_id, gp.character_type);
      }
    }

    const result: ValidationResult = {
      valid: true,
      violations: [],
    };

    const prevStateMap = new Map<string, PlayerState>();
    if (previous_states) {
      for (const ps of previous_states) {
        prevStateMap.set(ps.player_id, ps);
      }
    }

    for (const state of player_states) {
      const characterType = characterMap.get(state.player_id) || state.character_type || 'airplane';
      const maxHp = characterType === 'tank' ? VALIDATION_CONSTANTS.TANK_MAX_HP : VALIDATION_CONSTANTS.AIRPLANE_MAX_HP;

      // 校验位置边界
      if (
        state.position.x < 0 ||
        state.position.x > VALIDATION_CONSTANTS.MAP_WIDTH ||
        state.position.y < 0 ||
        state.position.y > VALIDATION_CONSTANTS.MAP_HEIGHT
      ) {
        result.valid = false;
        result.violations.push({
          player_id: state.player_id,
          reason: `位置越界: (${state.position.x.toFixed(1)}, ${state.position.y.toFixed(1)})`,
        });
        continue;
      }

      // 校验HP范围
      if (state.hp < 0 || state.hp > maxHp) {
        result.valid = false;
        result.violations.push({
          player_id: state.player_id,
          reason: `HP异常: ${state.hp} (最大值应为 ${maxHp})`,
        });
      }

      // 校验能量范围
      if (state.energy < 0 || state.energy > VALIDATION_CONSTANTS.MAX_ENERGY) {
        result.valid = false;
        result.violations.push({
          player_id: state.player_id,
          reason: `能量异常: ${state.energy} (范围 0-${VALIDATION_CONSTANTS.MAX_ENERGY})`,
        });
      }

      // 校验位置突变（瞬移检测）
      const prev = prevStateMap.get(state.player_id);
      if (prev) {
        const dx = state.position.x - prev.position.x;
        const dy = state.position.y - prev.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const dt = (state.timestamp - prev.timestamp) / 1000; // 秒

        if (dt > 0) {
          const speed = distance / dt;
          // 允许一定的网络延迟和插值误差
          const maxAllowedSpeed = characterType === 'airplane' ? 250 : 150;

          if (speed > maxAllowedSpeed * 1.5) {
            result.valid = false;
            result.violations.push({
              player_id: state.player_id,
              reason: `移动速度异常: ${speed.toFixed(1)} px/s (最大允许 ${maxAllowedSpeed} px/s)`,
            });
          }
        }

        if (distance > VALIDATION_CONSTANTS.MAX_POSITION_DELTA && dt < 0.1) {
          result.valid = false;
          result.violations.push({
            player_id: state.player_id,
            reason: `位置突变: 单次移动 ${distance.toFixed(1)} px`,
          });
        }

        // 校验HP异常增长
        const hpDelta = state.hp - prev.hp;
        if (hpDelta > 0 && dt > 0) {
          const hpRegenRate = hpDelta / dt;
          if (hpRegenRate > VALIDATION_CONSTANTS.MAX_HP_REGEN_PER_SECOND) {
            result.valid = false;
            result.violations.push({
              player_id: state.player_id,
              reason: `HP恢复速度异常: ${hpRegenRate.toFixed(1)}/s`,
            });
          }
        }

        // 校验能量异常增长
        const energyDelta = state.energy - prev.energy;
        if (energyDelta > 0 && dt > 0) {
          const energyRegenRate = energyDelta / dt;
          if (energyRegenRate > VALIDATION_CONSTANTS.MAX_ENERGY_REGEN_PER_SECOND) {
            result.valid = false;
            result.violations.push({
              player_id: state.player_id,
              reason: `能量恢复速度异常: ${energyRegenRate.toFixed(1)}/s`,
            });
          }
        }
      }

      // 校验NaN/Infinity
      if (
        !Number.isFinite(state.position.x) ||
        !Number.isFinite(state.position.y) ||
        !Number.isFinite(state.hp) ||
        !Number.isFinite(state.energy)
      ) {
        result.valid = false;
        result.violations.push({
          player_id: state.player_id,
          reason: '状态数据包含非法数值(NaN/Infinity)',
        });
      }
    }

    // 额外校验：检查是否有未知玩家
    const validPlayerIds = new Set(gamePlayers?.map((gp) => gp.player_id) || []);
    for (const state of player_states) {
      if (!validPlayerIds.has(state.player_id)) {
        result.valid = false;
        result.violations.push({
          player_id: state.player_id,
          reason: '未知玩家ID，未参与本场游戏',
        });
      }
    }

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return new Response(
      JSON.stringify({ valid: false, violations: [], error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
