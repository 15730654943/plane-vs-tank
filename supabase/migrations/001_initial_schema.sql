-- 飞机坦克大战 - 初始数据库 Schema

-- ==========================
-- 扩展
-- ==========================
create extension if not exists "uuid-ossp";

-- ==========================
-- Profiles 表
-- ==========================
create table if not exists public.profiles (
    id uuid primary key references auth.users on delete cascade,
    username text unique not null,
    avatar_url text,
    elo_rating integer default 1000 not null,
    total_games integer default 0 not null,
    wins integer default 0 not null,
    kills integer default 0 not null,
    deaths integer default 0 not null,
    mvp_count integer default 0 not null,
    total_play_time_seconds integer default 0 not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now()
);

comment on table public.profiles is '玩家资料表';

-- Profiles 索引
create index if not exists idx_profiles_elo on public.profiles(elo_rating desc);
create index if not exists idx_profiles_kills on public.profiles(kills desc);
create index if not exists idx_profiles_username on public.profiles(username);

-- 新用户自动创建 profile 的触发器函数
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.profiles (id, username)
    values (
        new.id,
        coalesce(
            new.raw_user_meta_data->>'username',
            split_part(new.email, '@', 1),
            'user_' || substr(new.id::text, 1, 8)
        )
    )
    on conflict (id) do nothing;
    return new;
end;
$$;

-- 绑定触发器
drop trigger if exists handle_new_user on auth.users;
create trigger handle_new_user
    after insert on auth.users
    for each row
    execute function public.handle_new_user();

-- ==========================
-- Rooms 表
-- ==========================
create table if not exists public.rooms (
    id uuid primary key default gen_random_uuid(),
    room_code text unique not null,
    name text not null,
    host_id uuid references public.profiles(id) not null,
    max_players integer default 4 not null check (max_players in (2, 3, 4)),
    password_hash text,
    game_mode text default 'free_for_all' not null check (game_mode in ('free_for_all', 'team')),
    map_type text default 'random' not null check (map_type in ('city', 'desert', 'ocean', 'random')),
    time_limit_minutes integer default 5 not null check (time_limit_minutes in (3, 5, 10)),
    status text default 'waiting' not null check (status in ('waiting', 'countdown', 'playing', 'finished')),
    created_at timestamptz default now() not null,
    updated_at timestamptz default now()
);

comment on table public.rooms is '游戏房间表';

-- Rooms 索引
create index if not exists idx_rooms_status on public.rooms(status);
create index if not exists idx_rooms_room_code on public.rooms(room_code);
create index if not exists idx_rooms_created_at on public.rooms(created_at desc);

-- ==========================
-- Room Players 表
-- ==========================
create table if not exists public.room_players (
    id uuid primary key default gen_random_uuid(),
    room_id uuid references public.rooms(id) on delete cascade not null,
    player_id uuid references public.profiles(id) not null,
    is_host boolean default false not null,
    is_ready boolean default false not null,
    character_type text default 'airplane' not null check (character_type in ('airplane', 'tank')),
    joined_at timestamptz default now() not null,
    unique (room_id, player_id)
);

comment on table public.room_players is '房间玩家关联表';

-- Room Players 索引
create index if not exists idx_room_players_room_id on public.room_players(room_id);
create index if not exists idx_room_players_player_id on public.room_players(player_id);

-- ==========================
-- Games 表
-- ==========================
create table if not exists public.games (
    id uuid primary key default gen_random_uuid(),
    room_id uuid references public.rooms(id) on delete set null,
    winner_id uuid references public.profiles(id),
    game_mode text not null,
    map_type text not null,
    time_limit_minutes integer not null,
    actual_duration_seconds integer,
    started_at timestamptz,
    ended_at timestamptz
);

comment on table public.games is '对局记录表';

-- Games 索引
create index if not exists idx_games_started_at on public.games(started_at desc);

-- ==========================
-- Game Players 表
-- ==========================
create table if not exists public.game_players (
    id uuid primary key default gen_random_uuid(),
    game_id uuid references public.games(id) on delete cascade not null,
    player_id uuid references public.profiles(id) not null,
    character_type text not null,
    kills integer default 0 not null,
    deaths integer default 0 not null,
    damage_dealt integer default 0 not null,
    damage_taken integer default 0 not null,
    items_collected integer default 0 not null,
    is_winner boolean default false not null,
    is_mvp boolean default false not null,
    unique (game_id, player_id)
);

comment on table public.game_players is '对局玩家数据表';

-- Game Players 索引
create index if not exists idx_game_players_game_id on public.game_players(game_id);
create index if not exists idx_game_players_player_id on public.game_players(player_id);

-- ==========================
-- Chat Messages 表
-- ==========================
create table if not exists public.chat_messages (
    id uuid primary key default gen_random_uuid(),
    sender_id uuid references public.profiles(id) not null,
    room_id uuid references public.rooms(id) on delete cascade not null,
    game_id uuid references public.games(id) on delete cascade,
    content text not null,
    message_type text default 'text' not null check (message_type in ('text', 'quick_command', 'system')),
    created_at timestamptz default now() not null
);

comment on table public.chat_messages is '聊天消息表';

-- Chat Messages 索引
create index if not exists idx_chat_room_id on public.chat_messages(room_id, created_at desc);
create index if not exists idx_chat_game_id on public.chat_messages(game_id, created_at desc);

-- ==========================
-- Game Events 表
-- ==========================
create table if not exists public.game_events (
    id uuid primary key default gen_random_uuid(),
    game_id uuid references public.games(id) on delete cascade not null,
    player_id uuid references public.profiles(id),
    target_id uuid references public.profiles(id),
    event_type text not null,
    position jsonb,
    data jsonb,
    created_at timestamptz default now() not null
);

comment on table public.game_events is '游戏事件表';

create index if not exists idx_game_events_game_id on public.game_events(game_id, created_at desc);
create index if not exists idx_game_events_type on public.game_events(game_id, event_type);

-- ==========================
-- 更新时间戳触发器
-- ==========================
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
    before update on public.profiles
    for each row
    execute function public.handle_updated_at();

drop trigger if exists rooms_updated_at on public.rooms;
create trigger rooms_updated_at
    before update on public.rooms
    for each row
    execute function public.handle_updated_at();

-- ==========================
-- RLS 安全策略
-- ==========================

-- 启用 RLS
alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.room_players enable row level security;
alter table public.games enable row level security;
alter table public.game_players enable row level security;
alter table public.chat_messages enable row level security;
alter table public.game_events enable row level security;

-- Profiles: 所有人可查看，只能更新自己的
create policy "Profiles are viewable by everyone"
    on public.profiles for select
    using (true);

create policy "Users can update own profile"
    on public.profiles for update
    using (auth.uid() = id)
    with check (auth.uid() = id);

-- Rooms: 所有人可查看 waiting/countdown 状态的，认证用户可创建，房主可更新/删除
create policy "Rooms are viewable by everyone"
    on public.rooms for select
    using (true);

create policy "Authenticated users can create rooms"
    on public.rooms for insert
    with check (auth.uid() = host_id);

create policy "Host can update their room"
    on public.rooms for update
    using (auth.uid() = host_id)
    with check (auth.uid() = host_id);

create policy "Host can delete their room"
    on public.rooms for delete
    using (auth.uid() = host_id);

-- Room Players: 所有人可查看，认证用户可加入，玩家可更新自己的状态，玩家可删除自己
create policy "Room players are viewable by everyone"
    on public.room_players for select
    using (true);

create policy "Authenticated users can join rooms"
    on public.room_players for insert
    with check (auth.uid() = player_id);

create policy "Players can update their own status"
    on public.room_players for update
    using (auth.uid() = player_id)
    with check (auth.uid() = player_id);

create policy "Players can leave rooms"
    on public.room_players for delete
    using (auth.uid() = player_id);

-- Games: 所有人可查看
create policy "Games are viewable by everyone"
    on public.games for select
    using (true);

create policy "Authenticated users can create games"
    on public.games for insert
    with check (true);

-- Game Players: 所有人可查看
create policy "Game players are viewable by everyone"
    on public.game_players for select
    using (true);

-- Chat Messages: 认证用户可查看房间/游戏的消息，认证用户可发送
create policy "Chat messages are viewable by authenticated users"
    on public.chat_messages for select
    using (auth.role() = 'authenticated');

create policy "Authenticated users can send messages"
    on public.chat_messages for insert
    with check (auth.uid() = sender_id);

-- Game Events: 所有人可查看
create policy "Game events are viewable by everyone"
    on public.game_events for select
    using (true);

-- ==========================
-- Realtime 发布配置
-- ==========================
do $$
begin
    -- 将表加入 realtime 发布（如果尚未加入）
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'rooms') then
        alter publication supabase_realtime add table public.rooms;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'room_players') then
        alter publication supabase_realtime add table public.room_players;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'chat_messages') then
        alter publication supabase_realtime add table public.chat_messages;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'games') then
        alter publication supabase_realtime add table public.games;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'game_players') then
        alter publication supabase_realtime add table public.game_players;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'game_events') then
        alter publication supabase_realtime add table public.game_events;
    end if;
end;
$$;
