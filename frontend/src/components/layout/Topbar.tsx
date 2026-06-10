'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';

interface TopbarProps {
  onToggleSidebar: () => void;
}

export default function Topbar({ onToggleSidebar }: TopbarProps) {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Map routes to user-friendly titles
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname === '/brand') return 'Brand Intelligence';
    if (pathname.startsWith('/brand/')) return 'Brand Intelligence';
    return 'Lumavi';
  };

  const handleAction = (tool: string) => {
    setDropdownOpen(false);
    toast.info(`${tool} is coming soon!`);
  };

  return (
    <header className="h-16 border-b border-neutral-200/50 dark:border-neutral-800/50 bg-white/85 dark:bg-neutral-900/85 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 -ml-2 rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-neutral-800 cursor-pointer"
          aria-label="Toggle sidebar"
        >
          <i className="ti ti-menu-2 text-lg" />
        </button>

        {/* Dynamic Title */}
        <h1 className="text-base font-bold text-neutral-800 dark:text-neutral-200">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Search trigger */}
        <button
          onClick={() => toast.info('Global search is coming soon!')}
          className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition duration-150"
          aria-label="Search"
        >
          <i className="ti ti-search text-lg" />
        </button>

        {/* Notifications trigger */}
        <button
          onClick={() => toast.info('No new notifications')}
          className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition duration-150 relative"
          aria-label="Notifications"
        >
          <i className="ti ti-bell text-lg" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-neutral-900 dark:bg-white rounded-full" />
        </button>

        {/* Create Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-50 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 shadow-xs transition duration-150 cursor-pointer"
          >
            <i className="ti ti-plus text-xs" />
            <span>Create</span>
            <i className="ti ti-chevron-down text-xs" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 bg-white dark:bg-neutral-900 p-1.5 shadow-lg animate-in fade-in slide-in-from-top-1 duration-150">
              <Link
                href="/generate/image"
                onClick={() => setDropdownOpen(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-left"
              >
                <i className="ti ti-photo text-base text-neutral-400" />
                <span>Image Generator</span>
              </Link>
              <button
                onClick={() => handleAction('Video Generator')}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer text-left"
              >
                <i className="ti ti-video text-base text-neutral-400" />
                <span>Video Generator</span>
              </button>
              <button
                onClick={() => handleAction('Canvas Editor')}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer text-left"
              >
                <i className="ti ti-layout-board text-base text-neutral-400" />
                <span>Canvas Editor</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
