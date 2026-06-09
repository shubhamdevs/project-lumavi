import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getCurrentBalance } from '@/lib/credits';
import ImageGeneratorClient from '@/components/generation/ImageGeneratorClient';

export const metadata = {
  title: 'Generate Image | Lumavi',
  description: 'Create premium, on-brand visual assets using Google Imagen 4 customized with your brand intelligence.',
};

export default async function GenerateImagePage() {
  const authData = await auth();
  const userId = authData.userId;

  if (!userId) {
    redirect('/login');
  }

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
  const orgId = workspace.org_id;

  // 2. Fetch Brand Guidelines details
  const { data: brandGuideline } = await supabase
    .from('brand_guidelines')
    .select('*')
    .eq('workspace_id', workspaceId)
    .maybeSingle();

  // 3. Fetch remaining credits using getCurrentBalance helper
  const credits = await getCurrentBalance(workspaceId, orgId);

  return (
    <main className="p-6 md:p-10 min-h-screen">
      <ImageGeneratorClient
        workspaceId={workspaceId}
        orgId={orgId}
        initialBalance={credits}
        brand={brandGuideline || null}
      />
    </main>
  );
}
