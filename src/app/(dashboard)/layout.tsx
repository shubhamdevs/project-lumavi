import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import DashboardLayoutShell from '@/components/layout/DashboardLayoutShell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authData = await auth();
  const userId = authData.userId;

  // Protect all dashboard routes
  if (!userId) {
    redirect('/login');
  }

  const supabase = await getSupabaseServerClient();

  // 1. Fetch the user's active workspace membership and workspace details
  const { data: memberData, error: memberError } = await supabase
    .from('workspace_members')
    .select(`
      workspace_id,
      role,
      workspaces!inner (
        id,
        name,
        org_id,
        logo_url
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle();

  if (memberError || !memberData || !memberData.workspaces) {
    console.log('No active workspace membership found, redirecting to onboarding');
    redirect('/onboarding');
  }

  const workspace = memberData.workspaces as any;
  const workspaceId = workspace.id;
  const workspaceName = workspace.name;
  const orgId = workspace.org_id;

  // 2. Fetch the primary color guideline if set
  const { data: brandData } = await supabase
    .from('brand_guidelines')
    .select('colors')
    .eq('workspace_id', workspaceId)
    .maybeSingle();

  const primaryColor = (brandData?.colors as any)?.primary || '';

  // 3. Fetch current remaining credits from ledger or fallback to organization pool
  const { data: ledgerData } = await supabase
    .from('credit_ledger')
    .select('balance_after')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let credits = ledgerData?.balance_after;

  if (credits === undefined || credits === null) {
    const { data: orgData } = await supabase
      .from('organizations')
      .select('credit_pool')
      .eq('id', orgId)
      .maybeSingle();
    credits = orgData?.credit_pool ?? 100;
  }

  return (
    <DashboardLayoutShell
      workspaceId={workspaceId}
      workspaceName={workspaceName}
      orgId={orgId}
      primaryColor={primaryColor}
      initialCredits={credits}
    >
      {children}
    </DashboardLayoutShell>
  );
}
