-- Create folders table
create table folders (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Create notes table
create table notes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  folder_id uuid not null references folders(id) on delete cascade,
  title text not null default 'Untitled',
  markdown text not null default '',
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- RLS on folders
alter table folders enable row level security;
create policy "owner can read folders" on folders for select using (auth.uid() = owner_id);
create policy "owner can insert folders" on folders for insert with check (auth.uid() = owner_id);
create policy "owner can update folders" on folders for update using (auth.uid() = owner_id);
create policy "owner can delete folders" on folders for delete using (auth.uid() = owner_id);

-- RLS on notes
alter table notes enable row level security;
create policy "owner can read notes" on notes for select using (auth.uid() = owner_id);
create policy "owner can insert notes" on notes for insert with check (auth.uid() = owner_id);
create policy "owner can update notes" on notes for update using (auth.uid() = owner_id);
create policy "owner can delete notes" on notes for delete using (auth.uid() = owner_id);
