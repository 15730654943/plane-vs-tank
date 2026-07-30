export const GAME_CONSTANTS = {
  // 游戏数值
  AIRPLANE_MAX_HP: 100,
  TANK_MAX_HP: 150,
  AIRPLANE_SPEED: 200,
  TANK_SPEED: 120,
  AIRPLANE_ENERGY: 100,
  TANK_ENERGY: 80,
  BULLET_SPEED_AIRPLANE: 400,
  BULLET_SPEED_TANK: 350,
  BULLET_DAMAGE_AIRPLANE: 15,
  BULLET_DAMAGE_TANK: 25,
  FIRE_RATE_AIRPLANE: 0.15,
  FIRE_RATE_TANK: 0.5,
  MAX_PLAYERS_PER_ROOM: 4,
  MIN_PLAYERS_TO_START: 2,
  COUNTDOWN_SECONDS: 5,

  // 地图尺寸
  MAP_WIDTH: 2000,
  MAP_HEIGHT: 2000,

  // 碰撞
  AIRPLANE_HITBOX_RADIUS: 16,
  TANK_HITBOX_RADIUS: 24,
  BULLET_HITBOX_RADIUS: 4,

  // 物品
  ITEM_SPAWN_INTERVAL_MS: 10000,
  ITEM_DESPAWN_SECONDS: 30,
  HEALTH_PACK_HEAL: 30,
  AMMO_PACK_AMMO: 20,
  SPEED_BOOST_MULTIPLIER: 1.5,
  SPEED_BOOST_DURATION_SECONDS: 5,
  SHIELD_DURATION_SECONDS: 5,
  DAMAGE_BOOST_MULTIPLIER: 1.5,
  DAMAGE_BOOST_DURATION_SECONDS: 5,

  // 网络同步
  SYNC_INTERVAL_MS: 50,
  PREDICTION_BUFFER_SIZE: 32,
  MAX_RECONNECT_ATTEMPTS: 5,
  RECONNECT_INTERVAL_MS: 3000,

  // ELO
  ELO_BASE_GAIN_WIN: 25,
  ELO_KILL_BONUS_WIN: 5,
  ELO_MVP_BONUS: 10,
  ELO_BASE_LOSS: 10,
  ELO_KILL_MITIGATION_LOSS: 2,
  ELO_MIN_CHANGE: 0,
} as const;

export const ROOM_STATUS_LABELS: Record<string, string> = {
  waiting: '等待中',
  countdown: '即将开始',
  playing: '进行中',
  finished: '已结束',
};

export const MAP_TYPE_LABELS: Record<string, string> = {
  city: '城市',
  desert: '沙漠',
  ocean: '海洋',
  random: '随机',
};

export const GAME_MODE_LABELS: Record<string, string> = {
  free_for_all: '自由混战',
  team: '团队对抗',
};

export const CHARACTER_TYPE_LABELS: Record<string, string> = {
  airplane: '飞机',
  tank: '坦克',
};

export const ITEM_TYPE_LABELS: Record<string, string> = {
  health_pack: '医疗包',
  ammo_pack: '弹药包',
  speed_boost: '加速',
  shield: '护盾',
  damage_boost: '伤害提升',
};

export const CHAT_MESSAGE_TYPE_COLORS: Record<string, string> = {
  text: '#ffffff',
  quick_command: '#00ffcc',
  system: '#ffaa00',
};
