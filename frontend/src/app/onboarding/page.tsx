import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import OnboardingWizard from './OnboardingWizard';

export const metadata = {
  title: 'Onboarding | Lumavi',
  description: 'Set up your organization, workspace, and brand profile in Lumavi.',
};

export default async function OnboardingPage() {
  const authData = await auth();
  const userId = authData.userId;

  if (!userId) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen">
      <h1 className="sr-only">Lumavi Onboarding</h1>
      <OnboardingWizard />
    </main>
  );
}

