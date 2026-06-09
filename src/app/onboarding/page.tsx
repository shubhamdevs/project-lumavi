import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
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

  // Use the Supabase SERVER client (not service role) for this check.
  // Note: We use the server client which will propagate user headers to satisfy RLS.
  const supabase = await createClient();
  
  const { data: memberRows, error } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', userId)
    .limit(1);

  // If there's an active workspace membership, bypass onboarding and send to dashboard.
  if (memberRows && memberRows.length > 0) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen">
      <h1 className="sr-only">Lumavi Onboarding</h1>
      <OnboardingWizard />
    </main>
  );
}
