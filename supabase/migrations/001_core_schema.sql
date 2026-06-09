create extension if not exists "uuid-ossp";

create table organizations (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  industry      text,
  use_case      text,
  plan_tier     text not null default 'starter',
  credit_pool   integer not null default 100,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table workspaces (
  id            uuid primary key default uuid_generate_v4(),
  org_id        uuid not null references organizations(id) on delete cascade,
  name          text not null,
  description   text,
  logo_url      text,
  settings      jsonb not null default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table users (
  id            text primary key,
  email         text not null unique,
  full_name     text,
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table workspace_members (
  id            uuid primary key default uuid_generate_v4(),
  workspace_id  uuid not null references workspaces(id) on delete cascade,
  user_id       text not null references users(id) on delete cascade,
  role          text not null check (role in ('owner', 'editor')),
  invited_by    text references users(id),
  joined_at     timestamptz,
  status        text not null default 'active' check (status in ('active', 'invited', 'removed')),
  created_at    timestamptz not null default now(),
  unique(workspace_id, user_id)
);

create table invitations (
  id            uuid primary key default uuid_generate_v4(),
  workspace_id  uuid not null references workspaces(id) on delete cascade,
  email         text not null,
  role          text not null check (role in ('owner', 'editor')),
  invited_by    text not null references users(id),
  token         text not null unique default encode(gen_random_bytes(32), 'hex'),
  expires_at    timestamptz not null default (now() + interval '7 days'),
  accepted_at   timestamptz,
  status        text not null default 'pending' check (status in ('pending', 'accepted', 'expired', 'revoked')),
  created_at    timestamptz not null default now()
);

create table brand_guidelines (
  id              uuid primary key default uuid_generate_v4(),
  workspace_id    uuid not null references workspaces(id) on delete cascade,
  version         integer not null default 1,
  colors          jsonb not null default '{}',
  typography      jsonb not null default '{}',
  logos           jsonb not null default '{}',
  tone            jsonb not null default '{}',
  imagery_style   jsonb not null default '{}',
  completeness    integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  updated_by      text references users(id)
);

create table brand_versions (
  id                  uuid primary key default uuid_generate_v4(),
  workspace_id        uuid not null references workspaces(id) on delete cascade,
  guideline_snapshot  jsonb not null,
  version_label       text,
  created_at          timestamptz not null default now(),
  created_by          text references users(id)
);

create table generation_jobs (
  id                  uuid primary key default uuid_generate_v4(),
  workspace_id        uuid not null references workspaces(id) on delete cascade,
  user_id             text not null references users(id),
  type                text not null check (type in ('image', 'video', 'music', 'copy')),
  status              text not null default 'pending'
                        check (status in ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  prompt_raw          text,
  prompt_constructed  text,
  model_used          text,
  credits_reserved    integer not null default 0,
  credits_cost        integer,
  output_url          text,
  error_message       text,
  metadata            jsonb not null default '{}',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table assets (
  id                uuid primary key default uuid_generate_v4(),
  workspace_id      uuid not null references workspaces(id) on delete cascade,
  user_id           text not null references users(id),
  job_id            uuid references generation_jobs(id),
  type              text not null check (type in ('image', 'video', 'story', 'music', 'upload')),
  name              text,
  url               text not null,
  thumbnail_url     text,
  tags              jsonb not null default '[]',
  brand_version_id  uuid references brand_versions(id),
  file_size         bigint,
  deleted_at        timestamptz,
  created_at        timestamptz not null default now()
);

create table canvas_projects (
  id              uuid primary key default uuid_generate_v4(),
  workspace_id    uuid not null references workspaces(id) on delete cascade,
  user_id         text not null references users(id),
  name            text not null default 'Untitled story',
  scenes          jsonb not null default '[]',
  music_settings  jsonb not null default '{}',
  export_url      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table credit_ledger (
  id              uuid primary key default uuid_generate_v4(),
  org_id          uuid not null references organizations(id),
  workspace_id    uuid not null references workspaces(id),
  user_id         text not null references users(id),
  action_type     text not null,
  credits_amount  integer not null,
  balance_after   integer not null,
  reference_id    uuid,
  created_at      timestamptz not null default now()
);
