import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { extractBrandFromLogo } from '@/lib/generation/brand-extractor';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { logoBase64, mimeType } = body;

    if (!logoBase64 || !mimeType) {
      return NextResponse.json(
        { success: false, error: 'Missing logoBase64 or mimeType' },
        { status: 400 }
      );
    }

    const signals = await extractBrandFromLogo(logoBase64, mimeType);
    return NextResponse.json({ success: true, signals });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
