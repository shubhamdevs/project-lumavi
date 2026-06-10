import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import BrandHub from '@/components/brand/BrandHub';

const BACKEND = process.env.BACKEND_URL || 'http://localhost:8000';

export const metadata = {
  title: 'Brand Intelligence | Lumavi',
  description: 'Manage your AI brand guidelines in Lumavi.',
};

export default async function BrandIntelligencePage() {
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

  const brandRes = await fetch(`${BACKEND}/brand/${workspaceId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const brandGuideline = brandRes.ok ? await brandRes.json() : null;

  return (
    <main className="p-6 md:p-10 min-h-screen">
      <h1 className="sr-only">Brand Intelligence Configuration</h1>
      <BrandHub initialData={brandGuideline} workspaceId={workspaceId} />
    </main>
  );
}
