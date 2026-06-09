import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Lumavi | AI Branded Creative Platform',
  description: 'Generate on-brand marketing creatives with deep Brand Intelligence.',
};

export default async function Home() {
  const authData = await auth();
  const userId = authData.userId;

  // If already logged in, redirect to dashboard (which handles workspace checks)
  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 p-6">
      <main className="w-full max-w-lg text-center space-y-8 bg-white dark:bg-neutral-900 p-8 sm:p-12 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xl">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400 border border-violet-100 mx-auto">
            <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            Introducing Lumavi
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Lumavi
          </h1>
          <p className="text-sm text-neutral-500 max-w-sm mx-auto leading-relaxed">
            Generate on-brand marketing content, visuals, and copy using deep Brand Intelligence prompt engines.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button asChild className="h-11 px-8 bg-violet-600 hover:bg-violet-700 text-white font-medium shadow-md transition-all">
            <Link href="/register">Create Account</Link>
          </Button>
          <Button asChild variant="outline" className="h-11 px-8 font-medium transition-all">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
