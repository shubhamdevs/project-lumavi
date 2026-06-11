import React from 'react';
import { Loader2 } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <div className="flex flex-col items-center space-y-4">
        <div className="p-3 bg-violet-50 dark:bg-violet-950/40 rounded-2xl border border-violet-100 dark:border-violet-900/30">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600 dark:text-violet-400" />
        </div>
        <p className="text-sm font-medium text-neutral-500 animate-pulse">Loading dashboard...</p>
      </div>
    </div>
  );
}
