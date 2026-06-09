'use strict';
'use server';

import { auth } from '@clerk/nextjs/server';
import { getSupabaseServiceClient } from '@/lib/supabase/service';
import { revalidatePath } from 'next/cache';

export async function topUpCredits(workspaceId: string, orgId: string) {
  try {
    const authData = await auth();
    const userId = authData.userId;
    if (!userId) {
      return { success: false, error: 'Unauthorized: No active session' };
    }

    const supabase = getSupabaseServiceClient();

    // 1. Get the current balance from the credit ledger (latest row) or fall back to organization
    const { data: ledgerData } = await supabase
      .from('credit_ledger')
      .select('balance_after')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let currentBalance = ledgerData?.balance_after;

    if (currentBalance === undefined || currentBalance === null) {
      const { data: orgData } = await supabase
        .from('organizations')
        .select('credit_pool')
        .eq('id', orgId)
        .maybeSingle();
      currentBalance = orgData?.credit_pool ?? 100;
    }

    const newBalance = currentBalance + 100;

    // 2. Record the transaction in the ledger
    const { error: ledgerError } = await supabase
      .from('credit_ledger')
      .insert({
        org_id: orgId,
        workspace_id: workspaceId,
        user_id: userId,
        action_type: 'top_up',
        credits_amount: 100,
        balance_after: newBalance,
      });

    if (ledgerError) {
      console.error('Ledger insert error:', ledgerError);
      return { success: false, error: `Failed to insert ledger entry: ${ledgerError.message}` };
    }

    // 3. Update the organization pool
    const { error: orgError } = await supabase
      .from('organizations')
      .update({ credit_pool: newBalance })
      .eq('id', orgId);

    if (orgError) {
      console.error('Organization update error:', orgError);
      return { success: false, error: `Failed to update organization credits: ${orgError.message}` };
    }

    // Revalidate paths to refresh components fetching credits
    revalidatePath('/dashboard');
    revalidatePath('/brand');

    return { success: true, balance: newBalance };
  } catch (err: any) {
    console.error('Unexpected error in topUpCredits:', err);
    return { success: false, error: err?.message || 'An unexpected error occurred' };
  }
}
