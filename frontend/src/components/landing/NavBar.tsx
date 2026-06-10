import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';

export async function NavBar() {
  const { userId } = await auth();

  return (
    <nav className="bg-surface/80 dark:bg-surface/80 backdrop-blur-md fixed top-0 w-full z-50 border-b border-outline-variant/30 shadow-sm transition-all duration-300">
      <div className="flex justify-between items-center h-20 px-gutter max-w-container-max mx-auto">
        <Link className="font-headline-h2 text-headline-h2 font-bold text-primary dark:text-primary-fixed hover:opacity-80 transition-opacity" href="/">
          Lumavi
        </Link>
        <div className="hidden md:flex items-center gap-unit-6">
          <Link className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors font-body-md text-body-md font-medium" href="#platform">Platform</Link>
          <Link className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors font-body-md text-body-md font-medium" href="#solutions">Solutions</Link>
          <Link className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors font-body-md text-body-md font-medium" href="#resources">Resources</Link>
          <Link className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors font-body-md text-body-md font-medium" href="#pricing">Pricing</Link>
        </div>
        <div className="flex items-center gap-unit-4">
          {userId ? (
             <Link className="inline-flex items-center justify-center bg-primary-container text-on-primary-container font-button-text text-button-text px-6 py-2.5 rounded-lg glow-hover transition-all duration-300 active:scale-95 hover:-translate-y-0.5" href="/dashboard">
               Go to Dashboard
             </Link>
          ) : (
            <>
              <Link className="hidden md:inline-flex text-primary font-button-text text-button-text hover:text-primary-fixed transition-colors" href="/login">
                Log In
              </Link>
              <Link className="inline-flex items-center justify-center bg-primary-container text-on-primary-container font-button-text text-button-text px-6 py-2.5 rounded-lg glow-hover transition-all duration-300 active:scale-95 hover:-translate-y-0.5" href="/register">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
