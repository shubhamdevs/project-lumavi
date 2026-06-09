import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { auth } from '@clerk/nextjs/server';

export async function getSupabaseServerClient() {
  const cookieStore = await cookies();

  let clerkToken: string | null = null;
  let userId: string | null = null;

  try {
    const authData = await auth();
    userId = authData.userId;
    clerkToken = await authData.getToken({ template: 'supabase' });
  } catch {
    // Auth might fail if not in a request context or if not authenticated
  }

  const headers: Record<string, string> = {};
  if (clerkToken) {
    headers['Authorization'] = `Bearer ${clerkToken}`;
  }
  if (userId) {
    headers['x-current-user-id'] = userId;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

  return createServerClient(
    url,
    key,
    {
      global: {
        headers,
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  );
}
