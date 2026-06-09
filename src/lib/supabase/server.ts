import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { auth } from '@clerk/nextjs/server'

/**
 * If using Fluid compute: Don't put this client in a global variable. Always create a new client within each
 * function when using it.
 */
export async function createClient() {
  const cookieStore = await cookies()

  let clerkToken: string | null = null
  let userId: string | null = null

  try {
    const authData = await auth()
    userId = authData.userId
    clerkToken = await authData.getToken({ template: 'supabase' })
  } catch {
    // Auth might fail if not in a request context or if not authenticated
  }

  const headers: Record<string, string> = {}
  if (clerkToken) {
    headers['Authorization'] = `Bearer ${clerkToken}`
  }
  if (userId) {
    headers['x-current-user-id'] = userId
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      global: {
        headers,
      },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
