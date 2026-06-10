import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import DashboardLayoutShell from '@/components/layout/DashboardLayoutShell';

const BACKEND = process.env.BACKEND_URL || 'http://localhost:8000';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const authData = await auth();
  const userId = authData.userId;
  if (!userId) redirect('/login');

  const token = await authData.getToken();
  if (!token) redirect('/login');

  const wsRes = await fetch(`${BACKEND}/onboarding/workspace`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!wsRes.ok) redirect('/onboarding');
  const { workspace_id: workspaceId } = await wsRes.json();
  if (!workspaceId) redirect('/onboarding');

  const summaryRes = await fetch(`${BACKEND}/dashboard/${workspaceId}/summary`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!summaryRes.ok) redirect('/onboarding');
  const summary = await summaryRes.json();

  return (
    <DashboardLayoutShell
      workspaceId={workspaceId}
      workspaceName={summary.workspace.name}
      orgId={summary.organization.id}
      primaryColor=""
      initialCredits={summary.credit_balance}
    >
      {children}
    </DashboardLayoutShell>
  );
}
