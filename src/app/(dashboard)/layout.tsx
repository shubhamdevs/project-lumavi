import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authData = await auth();
  const userId = authData.userId;

  // Protect all dashboard routes
  if (!userId) {
    redirect('/login');
  }

  const supabase = await getSupabaseServerClient();
  const { data: memberData, error: memberError } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (memberError || !memberData) {
    redirect('/onboarding');
  }

  return <div>{children}</div>;
}
