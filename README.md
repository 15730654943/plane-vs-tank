# 飞机坦克大战 - 在线多人对战游戏

基于 React + TypeScript + Supabase 的实时多人在线对战游戏。

## 技术栈

- **前端**: React 18 + TypeScript + Vite + TailwindCSS + HTML5 Canvas 2D
- **后端**: Supabase (Auth + PostgreSQL + Realtime + Edge Functions)
- **部署**: GitHub Pages (前端) + Supabase Cloud (后端)

## 功能特性

- 用户注册/登录系统（支持邮箱+密码）
- 房间创建、加入、搜索系统
- 实时多人对战（2-4人）
- 飞机 vs 坦克双角色系统
- 完整伤害计算与道具系统
- 排行榜与ELO评分系统
- 游戏内聊天与快捷指令
- 响应式设计，支持PC和平板

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local`，并填入你的 Supabase 项目信息：

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. 启动开发服务器

```bash
npm run dev
```

### 4. 构建生产版本

```bash
npm run build
```

### 5. 部署到 GitHub Pages

```bash
npm run deploy
```

## Supabase 后端配置

### 数据库迁移

```bash
supabase login
supabase link --project-ref {your-project-ref}
supabase db push
```

### Edge Functions 部署

```bash
supabase functions deploy create-room
supabase functions deploy join-room
supabase functions deploy start-game
supabase functions deploy end-game
supabase functions deploy game-validate
```

## 项目结构

```
plane-vs-tank/
├── src/
│   ├── components/     # React UI 组件
│   ├── game/           # 游戏引擎核心
│   ├── stores/         # Zustand 状态管理
│   ├── hooks/          # 自定义 Hooks
│   ├── services/       # API 服务层
│   ├── types/          # TypeScript 类型定义
│   └── utils/          # 工具函数
├── supabase/
│   ├── functions/      # Edge Functions
│   └── migrations/     # 数据库迁移脚本
└── dist/               # 构建输出
```

## 游戏操作

| 操作 | 按键 |
|------|------|
| 移动 | WASD |
| 基础攻击 | 鼠标左键 / 空格 |
| 特殊武器 | E |
| 加速/护盾 | Shift |
| 切换武器 | 1 / 2 |

## 许可证

MIT
