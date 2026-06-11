import React from 'react';
import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
import DashboardHome from '@/components/dashboard/DashboardHome';

const BACKEND = process.env.BACKEND_URL || 'http://localhost:8000';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
// Capture time at module load (server startup) — acceptable for new-account UI hinting
const MODULE_LOAD_TIME = Date.now();

function isNewAccount(createdAt: number | null | undefined): boolean {
  if (!createdAt) return false;
  return MODULE_LOAD_TIME - createdAt < SEVEN_DAYS_MS;
}

async function fetchDashboardSummary(token: string, workspaceId: string) {
  const res = await fetch(`${BACKEND}/dashboard/${workspaceId}/summary`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

async function getWorkspaceId(token: string): Promise<string | null> {
  // Get the first active workspace for this user via the dashboard summary
  // We hit a lightweight endpoint — fall back to onboarding if no workspace
  const res = await fetch(`${BACKEND}/onboarding/workspace`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.workspace_id ?? null;
}

export default async function DashboardPage() {
  const authData = await auth();
  const userId = authData.userId;
  if (!userId) redirect('/login');

  const clerkUser = await currentUser();
  if (!clerkUser) redirect('/login');

  const token = await authData.getToken();
  if (!token) redirect('/login');

  const workspaceId = await getWorkspaceId(token);
  if (!workspaceId) redirect('/onboarding');

  const summary = await fetchDashboardSummary(token, workspaceId);
  if (!summary) redirect('/onboarding');


  return (
    <DashboardHome
      data={{
        userName: clerkUser.firstName || 'Creator',
        workspaceName: summary.workspace.name,
        workspaceId,
        orgId: summary.organization.id,
        credits: summary.credit_balance,
        brandCompleteness: summary.brand_completeness,
        totalAssets: summary.asset_count,
        teamMembersCount: summary.member_count,
        recentAssets: summary.recent_assets,
        isNewAccount: isNewAccount(clerkUser.createdAt),
        brandGuideline: null,
      }}
    />
  );
}
