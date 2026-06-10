import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import ImageGeneratorClient from '@/components/generation/ImageGeneratorClient';

const BACKEND = process.env.BACKEND_URL || 'http://localhost:8000';

export const metadata = {
  title: 'Generate Image | Lumavi',
  description: 'Create premium, on-brand visual assets using Google Imagen 4.',
};

export default async function GenerateImagePage() {
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
  const summary = summaryRes.ok ? await summaryRes.json() : null;

  const brandRes = await fetch(`${BACKEND}/brand/${workspaceId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const brand = brandRes.ok ? await brandRes.json() : null;

  return (
    <main className="p-6 md:p-10 min-h-screen">
      <ImageGeneratorClient
        workspaceId={workspaceId}
        orgId={summary?.organization?.id ?? ''}
        initialBalance={summary?.credit_balance ?? 100}
        brand={brand}
      />
    </main>
  );
}
