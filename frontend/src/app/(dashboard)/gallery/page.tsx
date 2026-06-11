import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import GalleryClient from '@/components/gallery/GalleryClient';

const BACKEND = process.env.BACKEND_URL || 'http://localhost:8000';

export const metadata = {
  title: 'Gallery | Lumavi',
  description: 'View and manage your generated brand image assets.',
};

export default async function GalleryPage() {
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

  return (
    <main className="p-6 md:p-10 min-h-screen">
      <GalleryClient workspaceId={workspaceId} />
    </main>
  );
}
