import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { getSupabaseServiceClient } from '@/lib/supabase/service';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!CLERK_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env.local' },
      { status: 500 }
    );
  }

  // 1. Read raw request body as text using request.text()
  const payload = await req.text();

  // 2. Extract these headers: svix-id, svix-timestamp, svix-signature
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Error occurred -- missing svix headers' },
      { status: 400 }
    );
  }

  // 3. Verify signature using Webhook from svix package and CLERK_WEBHOOK_SECRET
  const wh = new Webhook(CLERK_WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err: any) {
    // 4. If verification fails, return status 400
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // 5. Parse the verified payload as JSON
  const eventType = evt.type;

  // 6. Handle event type user.created
  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const email = email_addresses?.[0]?.email_address;
    const fullName = [first_name, last_name].filter(Boolean).join(' ') || null;
    const avatarUrl = image_url || null;

    if (!email) {
      return NextResponse.json({ error: 'Missing email address' }, { status: 400 });
    }

    try {
      const supabase = getSupabaseServiceClient();

      // Upsert into users table
      const { error } = await supabase
        .from('users')
        .upsert(
          {
            id,
            email,
            full_name: fullName,
            avatar_url: avatarUrl,
          },
          {
            onConflict: 'id',
          }
        );

      if (error) {
        // 8. Handle errors: return status 500
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } catch (err: any) {
      // 8. Handle errors: return status 500
      return NextResponse.json({ error: err.message || 'Database error' }, { status: 500 });
    }
  }

  // 7. Return status 200
  return NextResponse.json({ success: true }, { status: 200 });
}
