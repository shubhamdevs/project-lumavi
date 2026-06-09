-- Fallback policies to allow unauthenticated (anon) select access for Realtime updates
-- in case the Clerk Supabase JWT template is not configured.
create policy "jobs_anon_select" on public.generation_jobs
  for select to anon using (true);

create policy "assets_anon_select" on public.assets
  for select to anon using (true);
