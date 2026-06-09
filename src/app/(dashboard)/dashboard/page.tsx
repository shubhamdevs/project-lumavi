import React from 'react';
import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import DashboardHome from '@/components/dashboard/DashboardHome';

export default async function DashboardPage() {
  const authData = await auth();
  const userId = authData.userId;

  if (!userId) {
    redirect('/login');
  }

  // Fetch Clerk user details to get name and account age
  const clerkUser = await currentUser();
  if (!clerkUser) {
    redirect('/login');
  }

  // Check if the account was created less than 7 days ago
  // clerkUser.createdAt is a timestamp (number of milliseconds since epoch)
  const accountAgeMs = Date.now() - (clerkUser.createdAt || Date.now());
  const isNewAccount = accountAgeMs < 7 * 24 * 60 * 60 * 1000;

  const supabase = await getSupabaseServerClient();

  // 1. Fetch active workspace membership
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
    redirect('/onboarding');
  }

  const workspace = memberData.workspaces as any;
  const workspaceId = workspace.id;
  const workspaceName = workspace.name;
  const orgId = workspace.org_id;

  // 2. Fetch Brand Guidelines details
  const { data: brandGuideline } = await supabase
    .from('brand_guidelines')
    .select('*')
    .eq('workspace_id', workspaceId)
    .maybeSingle();

  // 3. Count team members in this workspace
  const { count: teamMembersCount } = await supabase
    .from('workspace_members')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    .eq('status', 'active');

  // 4. Fetch asset counts and 6 most recent assets
  const { count: totalAssets } = await supabase
    .from('assets')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    .is('deleted_at', null);

  const { data: recentAssets } = await supabase
    .from('assets')
    .select('*')
    .eq('workspace_id', workspaceId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(6);

  // 5. Fetch remaining credits
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

  const dashboardPayload = {
    userName: clerkUser.firstName || 'Creator',
    workspaceName,
    workspaceId,
    orgId,
    credits,
    brandCompleteness: brandGuideline?.completeness ?? 0,
    totalAssets: totalAssets ?? 0,
    teamMembersCount: teamMembersCount ?? 1,
    recentAssets: recentAssets || [],
    isNewAccount,
    brandGuideline: brandGuideline || null,
  };

  return <DashboardHome data={dashboardPayload} />;
}
