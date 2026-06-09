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
    const { originalJobId, workspaceId } = body;

    if (!originalJobId || !workspaceId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();

    // Verify user belongs to workspace and fetch org_id
    const { data: member, error: memberError } = await supabase
      .from('workspace_members')
      .select('workspaces(org_id)')
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

    // Fetch original job
    const { data: originalJob, error: jobFetchError } = await supabase
      .from('generation_jobs')
      .select('*')
      .eq('id', originalJobId)
      .maybeSingle();

    if (jobFetchError || !originalJob) {
      return NextResponse.json({ error: 'Original job not found' }, { status: 404 });
    }

    const prompt = originalJob.prompt_raw;
    const { aspectRatio, quality } = originalJob.metadata as any;

    // Variations cost 4 credits total (1 credit per variation)
    const totalCost = 4;
    let balance = await getCurrentBalance(workspaceId, orgId);

    if (balance < totalCost) {
      return NextResponse.json(
        { error: 'Insufficient credits for variations. Requires 4 credits.' },
        { status: 402 }
      );
    }

    const jobIds: string[] = [];

    for (let i = 0; i < 4; i++) {
      // Create a job for each variation
      const { data: job, error: insertError } = await supabase
        .from('generation_jobs')
        .insert({
          workspace_id: workspaceId,
          user_id: userId,
          type: 'image',
          status: 'pending',
          prompt_raw: prompt,
          credits_reserved: 1, // 1 credit reserved per variation
          metadata: {
            aspectRatio,
            quality,
            variationOf: originalJobId,
            variationIndex: i
          }
        })
        .select('id')
        .single();

      if (insertError || !job) {
        throw new Error(`Failed to create variation job: ${insertError?.message}`);
      }

      jobIds.push(job.id);

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
            creditCost: 1,
            balanceBefore: balance,
            orgId,
            seed: Math.floor(Math.random() * 1000000) + i
          }
        }
      });

      // Decrement the balance locally for the next iterations
      balance -= 1;
    }

    return NextResponse.json({ success: true, jobIds });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
