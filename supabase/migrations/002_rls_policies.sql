alter table organizations       enable row level security;
alter table workspaces          enable row level security;
alter table users               enable row level security;
alter table workspace_members   enable row level security;
alter table invitations         enable row level security;
alter table brand_guidelines    enable row level security;
alter table brand_versions      enable row level security;
alter table generation_jobs     enable row level security;
alter table assets              enable row level security;
alter table canvas_projects     enable row level security;
alter table credit_ledger       enable row level security;

create or replace function get_my_workspace_ids()
returns setof uuid language sql security definer as $$
  select workspace_id from workspace_members
  where user_id = current_setting('app.current_user_id', true)
  and status = 'active';
$$;

create policy "members_select" on workspace_members
  for select using (
    user_id = current_setting('app.current_user_id', true)
    or workspace_id in (select get_my_workspace_ids())
  );

create policy "workspaces_select" on workspaces
  for select using (id in (select get_my_workspace_ids()));

create policy "workspaces_insert" on workspaces
  for insert with check (true);

create policy "workspaces_update" on workspaces
  for update using (id in (select get_my_workspace_ids()));

create policy "brand_select" on brand_guidelines
  for select using (workspace_id in (select get_my_workspace_ids()));

create policy "brand_insert" on brand_guidelines
  for insert with check (workspace_id in (select get_my_workspace_ids()));

create policy "brand_update" on brand_guidelines
  for update using (workspace_id in (select get_my_workspace_ids()));

create policy "assets_select" on assets
  for select using (
    workspace_id in (select get_my_workspace_ids())
    and deleted_at is null
  );

create policy "assets_insert" on assets
  for insert with check (workspace_id in (select get_my_workspace_ids()));

create policy "jobs_select" on generation_jobs
  for select using (workspace_id in (select get_my_workspace_ids()));

create policy "jobs_insert" on generation_jobs
  for insert with check (workspace_id in (select get_my_workspace_ids()));

create policy "ledger_select" on credit_ledger
  for select using (workspace_id in (select get_my_workspace_ids()));

create policy "canvas_select" on canvas_projects
  for select using (workspace_id in (select get_my_workspace_ids()));

create policy "canvas_insert" on canvas_projects
  for insert with check (workspace_id in (select get_my_workspace_ids()));

create policy "canvas_update" on canvas_projects
  for update using (workspace_id in (select get_my_workspace_ids()));
