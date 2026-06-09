import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import BrandIntelligenceClient from './BrandIntelligenceClient';

export const metadata = {
  title: 'Brand Intelligence | Lumavi',
  description: 'Manage and optimize your AI brand guidelines and voice attributes in Lumavi.',
};

export default async function BrandIntelligencePage() {
  const authData = await auth();
  const userId = authData.userId;

  if (!userId) {
    redirect('/login');
  }

  const supabase = await getSupabaseServerClient();

  // 1. Retrieve the user's workspace membership
  const { data: memberData, error: memberError } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (memberError || !memberData) {
    // If they have no workspace yet, force them to complete onboarding first
    redirect('/onboarding');
  }

  const workspaceId = memberData.workspace_id;

  // 2. Fetch the existing brand guidelines row
  const { data: guideline } = await supabase
    .from('brand_guidelines')
    .select('*')
    .eq('workspace_id', workspaceId)
    .maybeSingle();

  let brandGuideline = guideline;

  // 3. If no brand guidelines exist, create a default row to start with
  if (!guideline) {
    const { data: newGuideline, error: insertError } = await supabase
      .from('brand_guidelines')
      .insert({
        workspace_id: workspaceId,
        colors: { primary: '', secondary: '' },
        typography: { display: '', body: '' },
        logos: {},
        tone: { archetype: '' },
        completeness: 0,
      })
      .select('*')
      .single();

    if (!insertError && newGuideline) {
      brandGuideline = newGuideline;
    } else {
      // Fallback fallback in case of write restrictions
      brandGuideline = {
        workspace_id: workspaceId,
        colors: { primary: '', secondary: '' },
        typography: { display: '', body: '' },
        logos: {},
        tone: { archetype: '' },
        completeness: 0,
      };
    }
  }

  return (
    <main className="p-6 md:p-10 bg-neutral-50/30 dark:bg-neutral-950/20 min-h-screen">
      <h1 className="sr-only">Brand Intelligence Configuration</h1>
      <BrandIntelligenceClient initialData={brandGuideline} workspaceId={workspaceId} />
    </main>
  );
}
