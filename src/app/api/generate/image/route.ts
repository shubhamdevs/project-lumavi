import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseServiceClient } from '@/lib/supabase/service';
import { inngest } from '@/lib/inngest/client';
import { getCurrentBalance } from '@/lib/credits';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { prompt, aspectRatio, quality, workspaceId } = body;

    if (!prompt || prompt.trim() === '') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();

    // Verify user belongs to workspace and fetch org_id
    const { data: member, error: memberError } = await supabase
      .from('workspace_members')
      .select('role, workspaces(id, org_id)')
      .eq('user_id', userId)
      .eq('workspace_id', workspaceId)
      .limit(1)
      .maybeSingle();

    if (memberError || !member || !member.workspaces) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have access to this workspace' },
        { status: 403 }
      );
    }

    const orgId = (member.workspaces as any).org_id;

    // Check balance
    const currentBalance = await getCurrentBalance(workspaceId, orgId);

    // Calculate credit cost
    const creditCost = quality === 'high' ? 6 : 3;

    if (currentBalance < creditCost) {
      return NextResponse.json(
        { error: 'Insufficient credits. Top up to continue.' },
        { status: 402 }
      );
    }

    // Create job record
    const { data: job, error: jobError } = await supabase
      .from('generation_jobs')
      .insert({
        workspace_id: workspaceId,
        user_id: userId,
        type: 'image',
        status: 'pending',
        prompt_raw: prompt,
        credits_reserved: creditCost,
        metadata: { aspectRatio, quality }
      })
      .select('id')
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: `Failed to create generation job: ${jobError?.message}` },
        { status: 500 }
      );
    }

    // Send Inngest event
    await inngest.send({
      name: 'lumavi/image.generate',
      data: {
        jobId: job.id,
        workspaceId,
        userId,
        params: {
          userPrompt: prompt,
          aspectRatio,
          quality,
          creditCost,
          balanceBefore: currentBalance,
          orgId
        }
      }
    });

    return NextResponse.json({
      jobId: job.id,
      status: 'pending',
      creditCost
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
