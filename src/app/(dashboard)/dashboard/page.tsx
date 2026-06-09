import React from 'react';
import { auth } from '@clerk/nextjs/server';

export default async function DashboardPage() {
  const authData = await auth();
  const userId = authData.userId;

  return (
    <div className="p-8">
      <h1>Welcome to Lumavi</h1>
      <p>User ID: {userId}</p>
    </div>
  );
}
