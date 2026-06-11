import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { LandingPageClient } from '@/components/LandingPageClient';

export default async function HomePage() {
  const authData = await auth();
  const userId = authData.userId;

  if (userId) {
    redirect('/dashboard');
  }

  return <LandingPageClient />;
}
