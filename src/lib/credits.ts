import { getSupabaseServiceClient } from '@/lib/supabase/service';

export async function getCurrentBalance(
  workspaceId: string,
  orgId: string
): Promise<number> {
  const supabase = getSupabaseServiceClient();
  
  // Try latest ledger entry first
  const { data: ledger } = await supabase
    .from('credit_ledger')
    .select('balance_after')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (ledger) return ledger.balance_after;

  // Fall back to org credit pool
  const { data: org } = await supabase
    .from('organizations')
    .select('credit_pool')
    .eq('id', orgId)
    .maybeSingle();

  return org?.credit_pool ?? 0;
}
