'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface DashboardLayoutShellProps {
  children: React.ReactNode;
  workspaceId: string;
  workspaceName: string;
  orgId: string;
  primaryColor?: string;
  initialCredits: number;
}

export default function DashboardLayoutShell({
  children,
  workspaceId,
  workspaceName,
  orgId,
  primaryColor,
  initialCredits,
}: DashboardLayoutShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-50/40 dark:bg-neutral-950/25">
      {/* Sidebar Navigation Panel */}
      <Sidebar
        workspaceId={workspaceId}
        workspaceName={workspaceName}
        orgId={orgId}
        primaryColor={primaryColor}
        initialCredits={initialCredits}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Sticky Header */}
        <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Main Routing Screen */}
        <main className="flex-1 overflow-y-auto bg-neutral-50/20 dark:bg-neutral-950/15">
          {children}
        </main>
      </div>
    </div>
  );
}
