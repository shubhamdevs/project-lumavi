import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

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

  return <div>{children}</div>;
}
