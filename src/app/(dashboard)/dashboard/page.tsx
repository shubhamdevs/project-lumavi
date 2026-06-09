import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { IconColorSwatch } from '@tabler/icons-react';

export const metadata = {
  title: 'Dashboard | Lumavi',
  description: 'Your Lumavi creative generation center.',
};

export default async function DashboardPage() {
  const authData = await auth();
  const userId = authData.userId;

  if (!userId) {
    redirect('/login');
  }

  const supabase = await createClient();

  // 1. Get workspace membership
  const { data: memberData } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (!memberData) {
    redirect('/onboarding');
  }

  const workspaceId = memberData.workspace_id;

  // 2. Query completeness score
  const { data: brandData } = await supabase
    .from('brand_guidelines')
    .select('completeness')
    .eq('workspace_id', workspaceId)
    .maybeSingle();

  const score = brandData?.completeness ?? 0;
  const showPromptCard = score < 60;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-sm text-neutral-500">
          Welcome to your Lumavi dashboard. Manage your content generation and brand guidelines.
        </p>
      </div>

      {showPromptCard && (
        <Card className="border border-violet-100 bg-violet-50/10 dark:border-neutral-800 dark:bg-neutral-900/30 overflow-hidden rounded-2xl shadow-sm max-w-xl">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-violet-100 text-violet-700 rounded-xl dark:bg-violet-950/40 dark:text-violet-300">
                <IconColorSwatch className="w-6 h-6" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="font-bold text-neutral-900 dark:text-white">
                  Complete your brand setup
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Your Brand Intelligence score is <span className="font-bold text-violet-600 dark:text-violet-400">{score}%</span>. Higher scores mean more on-brand generations.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-neutral-400 font-medium">
                <span>Scorecard progress</span>
                <span>{score}%</span>
              </div>
              <Progress value={score} className="h-2 bg-neutral-200 dark:bg-neutral-800" />
            </div>

            <div className="pt-2 flex justify-end">
              <Button asChild className="bg-violet-600 hover:bg-violet-700 text-white shadow-sm font-medium">
                <Link href="/brand">Complete brand setup</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Placeholder for future dashboard sections */}
      {!showPromptCard && (
        <Card className="border border-neutral-150 p-8 rounded-2xl flex flex-col items-center justify-center text-center text-neutral-500 py-16 dark:border-neutral-800">
          <IconColorSwatch className="w-10 h-10 text-neutral-300 mb-2" />
          <h4 className="font-semibold text-neutral-700 dark:text-neutral-300">Brand is fully configured!</h4>
          <p className="text-sm text-neutral-400 max-w-sm mt-1">
            Your brand is ready for prompt generation. Explore the generation tools to start creating content.
          </p>
        </Card>
      )}
    </div>
  );
}
