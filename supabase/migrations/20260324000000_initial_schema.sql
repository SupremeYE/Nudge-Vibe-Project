-- pgvector 확장 활성화
create extension if not exists vector with schema extensions;

-- reading_status enum
create type reading_status as enum ('unread', 'reading', 'done');

-- folders 테이블
create table folders (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  color       text,
  icon        text,
  parent_id   uuid references folders(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- items 테이블
create table items (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  url            text not null,
  title          text,
  summary        text,
  content        text,
  image_url      text,
  folder_id      uuid references folders(id) on delete set null,
  auto_category  text,
  reading_status reading_status not null default 'unread',
  ai_model       text,
  embedding      vector(1536),
  created_at     timestamptz not null default now(),
  reminded_at    timestamptz
);

-- tags 테이블
create table tags (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  item_id    uuid not null references items(id) on delete cascade,
  name       text not null,
  created_at timestamptz not null default now()
);

-- reminders 테이블
create type reminder_type as enum ('manual', 'spaced');

create table reminders (
  id         uuid primary key default gen_random_uuid(),
  item_id    uuid not null references items(id) on delete cascade,
  remind_at  timestamptz not null,
  type       reminder_type not null default 'manual',
  is_sent    boolean not null default false,
  created_at timestamptz not null default now()
);

-- 인덱스
create index items_user_id_idx        on items(user_id);
create index items_folder_id_idx      on items(folder_id);
create index items_created_at_idx     on items(created_at desc);
create index items_reading_status_idx on items(reading_status);
create index tags_item_id_idx         on tags(item_id);
create index tags_user_id_name_idx    on tags(user_id, name);
create index reminders_remind_at_idx  on reminders(remind_at) where is_sent = false;
create index folders_user_id_idx      on folders(user_id);

-- 벡터 유사도 검색 인덱스 (HNSW)
create index items_embedding_idx on items using hnsw (embedding vector_cosine_ops);

-- RLS 활성화
alter table folders   enable row level security;
alter table items     enable row level security;
alter table tags      enable row level security;
alter table reminders enable row level security;

-- folders RLS
create policy "folders: 본인 데이터만 조회"  on folders for select using (auth.uid() = user_id);
create policy "folders: 본인 데이터만 삽입"  on folders for insert with check (auth.uid() = user_id);
create policy "folders: 본인 데이터만 수정"  on folders for update using (auth.uid() = user_id);
create policy "folders: 본인 데이터만 삭제"  on folders for delete using (auth.uid() = user_id);

-- items RLS
create policy "items: 본인 데이터만 조회"  on items for select using (auth.uid() = user_id);
create policy "items: 본인 데이터만 삽입"  on items for insert with check (auth.uid() = user_id);
create policy "items: 본인 데이터만 수정"  on items for update using (auth.uid() = user_id);
create policy "items: 본인 데이터만 삭제"  on items for delete using (auth.uid() = user_id);

-- tags RLS
create policy "tags: 본인 데이터만 조회"  on tags for select using (auth.uid() = user_id);
create policy "tags: 본인 데이터만 삽입"  on tags for insert with check (auth.uid() = user_id);
create policy "tags: 본인 데이터만 수정"  on tags for update using (auth.uid() = user_id);
create policy "tags: 본인 데이터만 삭제"  on tags for delete using (auth.uid() = user_id);

-- reminders RLS (item owner 기준)
create policy "reminders: 본인 아이템만 조회" on reminders for select
  using (exists (select 1 from items where items.id = reminders.item_id and items.user_id = auth.uid()));
create policy "reminders: 본인 아이템만 삽입" on reminders for insert
  with check (exists (select 1 from items where items.id = reminders.item_id and items.user_id = auth.uid()));
create policy "reminders: 본인 아이템만 수정" on reminders for update
  using (exists (select 1 from items where items.id = reminders.item_id and items.user_id = auth.uid()));
create policy "reminders: 본인 아이템만 삭제" on reminders for delete
  using (exists (select 1 from items where items.id = reminders.item_id and items.user_id = auth.uid()));
