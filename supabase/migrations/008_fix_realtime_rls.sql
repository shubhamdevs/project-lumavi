-- Fix get_my_workspace_ids function to support both PostgREST (pre-request headers) and Realtime (JWT claims)
create or replace function public.get_my_workspace_ids()
returns setof uuid language sql security definer as $$
  select workspace_id from public.workspace_members
  where user_id = coalesce(
    nullif(current_setting('app.current_user_id', true), ''),
    nullif(current_setting('request.jwt.claims', true)::jsonb->>'sub', '')
  )
  and status = 'active';
$$;
