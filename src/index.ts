import { Game, CharacterType, MapType } from './game';

// 示例：初始化并启动游戏
function initGame() {
  const game = new Game('game-container', {
    onPhaseChange: (phase) => {
      console.log('游戏阶段变化:', phase);
    },
    onCountdown: (seconds) => {
      console.log('倒计时:', seconds);
    },
    onMatchEnd: (winner, isDraw) => {
      console.log('比赛结束:', isDraw ? '平局' : winner?.name + ' 获胜');
    },
    onStatsUpdate: (stats) => {
      // 可选：显示 FPS 统计
    },
  });

  // 初始化地图
  game.init(MapType.CITY_RUINS);

  // 创建本地玩家（飞机）
  game.createLocalPlayer('玩家1', CharacterType.AIRPLANE, 0);

  // 创建 AI/测试玩家（坦克）
  game.addRemotePlayer('ai-tank-1', '电脑1', CharacterType.TANK, 1, 1400, 1000);

  // 启动游戏
  game.start();

  return game;
}

// 当 DOM 加载完成后初始化
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
  } else {
    initGame();
  }
}
