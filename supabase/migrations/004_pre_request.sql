-- Create a function to set app.current_user_id from JWT claims or headers
create or replace function public.set_app_user_id()
returns void language plpgsql security definer as $$
begin
  perform set_config(
    'app.current_user_id',
    coalesce(
      nullif(current_setting('request.jwt.claims', true)::jsonb->>'sub', ''),
      nullif(current_setting('request.headers', true)::jsonb->>'x-current-user-id', '')
    ),
    true
  );
end;
$$;

-- Configure PostgREST to call this function before executing any request
alter role authenticator set pgrst.db_pre_request = 'public.set_app_user_id';
