'use strict';
'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { getSupabaseServiceClient } from '@/lib/supabase/service';

export interface OnboardingData {
  org: { name: string; industry: string; useCase: string };
  workspace: { name: string; description: string };
  brand: {
    primaryColor: string;
    secondaryColor: string;
    fontDisplay: string;
    fontBody: string;
    tone: string;
    photographyStyle: string;
    brandIsNot: string;
  };
  invites: string[];
}

export async function saveOnboardingData(data: OnboardingData) {
  try {
    const authData = await auth();
    const userId = authData.userId;
    if (!userId) {
      return { success: false, error: 'Unauthorized: User not authenticated' };
    }

    const supabase = getSupabaseServiceClient();

    // 1. Ensure the user exists in the Supabase `users` table to satisfy foreign key constraints.
    // (This acts as a fallback for potential Clerk webhook latency).
    const { data: dbUser, error: checkUserError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (checkUserError) {
      return { success: false, error: `Database error during user check: ${checkUserError.message}` };
    }

    if (!dbUser) {
      const clerkUser = await currentUser();
      if (!clerkUser) {
        return { success: false, error: 'Clerk user profile not found' };
      }
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
      const avatarUrl = clerkUser.imageUrl;

      if (!email) {
        return { success: false, error: 'User email not found in Clerk profile' };
      }

      const { error: insertUserError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email,
          full_name: fullName || null,
          avatar_url: avatarUrl || null,
        });

      if (insertUserError) {
        return { success: false, error: `Failed to register user in database: ${insertUserError.message}` };
      }
    }

    // 2. Insert organization
    const { data: orgRow, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: data.org.name,
        industry: data.org.industry,
        use_case: data.org.useCase,
        plan_tier: 'starter',
        credit_pool: 100,
      })
      .select('id')
      .single();

    if (orgError) {
      return { success: false, error: `Failed to create organization: ${orgError.message}` };
    }

    // 3. Insert workspace
    const { data: wsRow, error: wsError } = await supabase
      .from('workspaces')
      .insert({
        org_id: orgRow.id,
        name: data.workspace.name,
        description: data.workspace.description || null,
      })
      .select('id')
      .single();

    if (wsError) {
      return { success: false, error: `Failed to create workspace: ${wsError.message}` };
    }

    // 4. Insert workspace member (owner status='active')
    const { error: memberError } = await supabase
      .from('workspace_members')
      .insert({
        workspace_id: wsRow.id,
        user_id: userId,
        role: 'owner',
        status: 'active',
        joined_at: new Date().toISOString(),
      });

    if (memberError) {
      return { success: false, error: `Failed to join workspace: ${memberError.message}` };
    }

    // 5. Insert brand guidelines
    const { error: brandError } = await supabase
      .from('brand_guidelines')
      .insert({
        workspace_id: wsRow.id,
        colors: { primary: data.brand.primaryColor, secondary: data.brand.secondaryColor },
        typography: { display: data.brand.fontDisplay, body: data.brand.fontBody },
        tone: { archetype: data.brand.tone },
        photography_style: data.brand.photographyStyle || null,
        brand_is_not: data.brand.brandIsNot || null,
      });

    if (brandError) {
      return { success: false, error: `Failed to create brand guidelines: ${brandError.message}` };
    }

    // 6. Insert invitations if any exist
    if (data.invites && data.invites.length > 0) {
      const inviteRows = data.invites.map((email) => ({
        workspace_id: wsRow.id,
        email,
        role: 'editor' as const,
        invited_by: userId,
        status: 'pending' as const,
      }));

      const { error: inviteError } = await supabase
        .from('invitations')
        .insert(inviteRows);

      if (inviteError) {
        return { success: false, error: `Failed to create team invitations: ${inviteError.message}` };
      }
    }

    return { success: true, workspaceId: wsRow.id };
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred' };
  }
}
