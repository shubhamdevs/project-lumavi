'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { topUpCredits } from '@/app/(dashboard)/actions';

interface SidebarProps {
  workspaceId: string;
  workspaceName: string;
  orgId: string;
  primaryColor?: string;
  initialCredits: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  workspaceId,
  workspaceName,
  orgId,
  primaryColor,
  initialCredits,
  isOpen,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const { user } = useUser();
  const [credits, setCredits] = useState(initialCredits);
  const [isToppingUp, setIsToppingUp] = useState(false);

  // Core navigation links
  const coreLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: 'ti-smart-home' },
    { name: 'Brand Intelligence', href: '/brand', icon: 'ti-palette' },
  ];

  // Mock links for upcoming features
  const creatorLinks = [
    { name: 'Image Generator', icon: 'ti-photo' },
    { name: 'Video Generator', icon: 'ti-video' },
    { name: 'Canvas Creator', icon: 'ti-layout-board' },
  ];

  const libraryLinks = [
    { name: 'Asset Library', icon: 'ti-folder' },
    { name: 'Team Members', icon: 'ti-users' },
  ];

  const handleComingSoon = (feature: string) => {
    toast.info(`${feature} feature is coming soon!`);
  };

  const handleTopUp = async () => {
    if (isToppingUp) return;
    setIsToppingUp(true);

    try {
      const res = await topUpCredits(workspaceId, orgId);
      if (res.success && typeof res.balance === 'number') {
        setCredits(res.balance);
        toast.success('Credits successfully topped up (+100)!');
      } else {
        toast.error(res.error || 'Failed to top up credits');
      }
    } catch (err: any) {
      toast.error('An unexpected error occurred during top up.');
    } finally {
      setIsToppingUp(false);
    }
  };

  // Sidebar container styles
  const sidebarClass = `
    fixed inset-y-0 left-0 z-40 w-60 flex flex-col h-full bg-white dark:bg-neutral-900 border-r border-neutral-200/50 dark:border-neutral-800/50
    transform transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    md:translate-x-0 md:static md:z-0
  `;

  return (
    <>
      {/* Mobile Sidebar backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-neutral-950/45 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={sidebarClass}>
        {/* Header Branding */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-200/50 dark:border-neutral-800/50">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-neutral-900 dark:bg-white flex items-center justify-center font-bold text-sm text-white dark:text-neutral-950">
              L
            </div>
            <span className="font-bold text-base tracking-tight text-neutral-900 dark:text-neutral-50">
              Lumavi
            </span>
          </Link>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
            aria-label="Close sidebar"
          >
            <i className="ti ti-x text-lg" />
          </button>
        </div>

        {/* Workspace Display */}
        <div className="p-4 border-b border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-50/30 dark:bg-neutral-950/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                  {workspaceName}
                </h2>
                <div
                  className="w-2 h-2 rounded-full shrink-0 border border-white dark:border-neutral-900 shadow-xs"
                  style={{ backgroundColor: primaryColor || '#10b981' }}
                  title={`Brand Color: ${primaryColor || 'Not configured'}`}
                />
              </div>
              <p className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider font-mono">
                Starter Plan
              </p>
            </div>
          </div>
        </div>

        {/* Navigation links scroll area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* Core navigation */}
          <div>
            <span className="px-3 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block mb-2">
              Core
            </span>
            <ul className="space-y-1">
              {coreLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 group
                        ${
                          isActive
                            ? 'bg-neutral-100 dark:bg-neutral-800/60 text-neutral-900 dark:text-neutral-50 font-medium'
                            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/30'
                        }
                      `}
                    >
                      <i className={`ti ${link.icon} text-base shrink-0`} />
                      <span>{link.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Content generators */}
          <div>
            <span className="px-3 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block mb-2">
              Creators
            </span>
            <ul className="space-y-1">
              {creatorLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => handleComingSoon(link.name)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-neutral-400 dark:text-neutral-500 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/10 cursor-pointer group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <i className={`ti ${link.icon} text-base shrink-0`} />
                      <span>{link.name}</span>
                    </div>
                    <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 px-1.5 py-0.5 rounded font-medium opacity-80 group-hover:opacity-100">
                      Soon
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Library and teams */}
          <div>
            <span className="px-3 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block mb-2">
              Library & Workspace
            </span>
            <ul className="space-y-1">
              {libraryLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => handleComingSoon(link.name)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-neutral-400 dark:text-neutral-500 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/10 cursor-pointer group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <i className={`ti ${link.icon} text-base shrink-0`} />
                      <span>{link.name}</span>
                    </div>
                    <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 px-1.5 py-0.5 rounded font-medium opacity-80 group-hover:opacity-100">
                      Soon
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Credit balance indicator */}
        <div className="p-4 border-t border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-50/30 dark:bg-neutral-950/10">
          <div className="p-3.5 rounded-xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white dark:bg-neutral-900/55 shadow-xs flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                Remaining Credits
              </span>
              <i className="ti ti-coins text-amber-500 text-base" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono tracking-tight text-neutral-800 dark:text-neutral-100">
                {credits}
              </span>
              <span className="text-xs text-neutral-400 dark:text-neutral-500">/ 100</span>
            </div>
            {/* Simple progress bar */}
            <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-neutral-950 dark:bg-neutral-20 transition-all duration-500 h-full rounded-full"
                style={{
                  width: `${Math.min(100, Math.max(0, credits))}%`,
                  backgroundColor: credits > 20 ? undefined : '#ef4444',
                }}
              />
            </div>
            <button
              onClick={handleTopUp}
              disabled={isToppingUp}
              className="mt-1 w-full text-center text-xs font-semibold py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isToppingUp ? (
                <span className="animate-spin w-3 h-3 border-2 border-neutral-500 border-t-transparent rounded-full" />
              ) : (
                <>
                  <i className="ti ti-plus text-xs" />
                  <span>Top up credits</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* User profile section */}
        <div className="p-4 border-t border-neutral-200/50 dark:border-neutral-800/50 flex items-center gap-3">
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8 rounded-lg border border-neutral-200/50 dark:border-neutral-800/50 shadow-xs',
              },
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 truncate leading-snug">
              {user?.fullName || 'My Account'}
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate font-medium">
              {user?.primaryEmailAddress?.emailAddress || 'User Profile'}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
