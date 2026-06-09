// NEVER import this file in client components, pages, or anywhere 
// that runs in the browser. Service role key bypasses all RLS policies.

import { createClient } from '@supabase/supabase-js';

export function getSupabaseServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
