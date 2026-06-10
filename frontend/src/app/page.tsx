import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { NavBar } from '@/components/landing/NavBar';
import { HeroSection } from '@/components/landing/HeroSection';
import { ComparisonSection } from '@/components/landing/ComparisonSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { PlatformOverview } from '@/components/landing/PlatformOverview';
import { PricingSection } from '@/components/landing/PricingSection';
import { Footer } from '@/components/landing/Footer';

export default async function HomePage() {
  const authData = await auth();
  const userId = authData.userId;

  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="bg-background text-on-background font-body-md antialiased selection:bg-primary-container selection:text-on-primary-container min-h-screen">
      <NavBar />
      <main className="pt-20">
        <HeroSection />
        <ComparisonSection />
        <ProblemSection />
        <PlatformOverview />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
}
