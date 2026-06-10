import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import OnboardingWizard from './OnboardingWizard';

export const metadata = {
  title: 'Onboarding | Lumavi',
  description: 'Set up your organization, workspace, and brand profile in Lumavi.',
};

const BACKEND = process.env.BACKEND_URL || 'http://localhost:8000';

export default async function OnboardingPage() {
  const authData = await auth();
  const userId = authData.userId;

  if (!userId) {
    redirect('/login');
  }

  const token = await authData.getToken();
  if (token) {
    const res = await fetch(`${BACKEND}/onboarding/workspace`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (res.ok) {
      const { workspace_id } = await res.json();
      if (workspace_id) redirect('/dashboard');
    }
  }

  return (
    <main className="min-h-screen">
      <h1 className="sr-only">Lumavi Onboarding</h1>
      <OnboardingWizard />
    </main>
  );
}
