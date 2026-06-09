import { inngest } from '../client';
import { generateImage } from '@/lib/generation/image';
import { getSupabaseServiceClient } from '@/lib/supabase/service';

export const generateImageJob = inngest.createFunction(
  { 
    id: 'generate-image',
    retries: 3,
    triggers: [{ event: 'lumavi/image.generate' }]
  },
  async ({ event, step }) => {
    const { jobId, workspaceId, userId, params } = event.data;
    const supabase = getSupabaseServiceClient();

    // Step 1: Mark job as processing
    await step.run('mark-processing', async () => {
      const { error } = await supabase
        .from('generation_jobs')
        .update({ 
          status: 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);
      if (error) throw new Error(`Failed to mark job processing: ${error.message}`);
    });

    // Step 2: Fetch brand guidelines for prompt construction
    const brand = await step.run('fetch-brand', async () => {
      const { data, error } = await supabase
        .from('brand_guidelines')
        .select('*')
        .eq('workspace_id', workspaceId)
        .maybeSingle();
      if (error) throw new Error(`Failed to fetch brand guidelines: ${error.message}`);
      return data;
    });

    // Step 3: Generate image
    const result = await step.run('generate', async () => {
      return await generateImage({
        ...params,
        brand: brand || {},
        jobId,
        workspaceId
      });
    });

    if (!result.success) {
      // Release reserved credits on failure
      await step.run('release-credits', async () => {
        await supabase
          .from('generation_jobs')
          .update({
            status: 'failed',
            error_message: result.error,
            updated_at: new Date().toISOString()
          })
          .eq('id', jobId);

        // Reverse the credit reservation
        await supabase
          .from('credit_ledger')
          .insert({
            org_id: params.orgId,
            workspace_id: workspaceId,
            user_id: userId,
            action_type: 'reservation_released',
            credits_amount: params.creditCost,
            balance_after: params.balanceBefore,
            reference_id: jobId
          });
      });
      return { success: false, error: result.error };
    }

    // Step 4: Upload to Supabase Storage
    const storageUrl = await step.run('upload-storage', async () => {
      if (!result.imageBase64) return null;
      
      const buffer = Buffer.from(result.imageBase64, 'base64');
      const ext = result.mimeType === 'image/png' ? 'png' : 
                  result.mimeType === 'image/svg+xml' ? 'svg' : 'jpg';
      const filePath = `${workspaceId}/${jobId}/output.${ext}`;

      // Ensure storage bucket exists
      try {
        await supabase.storage.createBucket('generated-assets', {
          public: true,
          fileSizeLimit: 50 * 1024 * 1024, // 50MB
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/svg+xml', 'video/mp4']
        });
      } catch (e) {
        // Ignore if bucket already exists
      }

      const { error } = await supabase.storage
        .from('generated-assets')
        .upload(filePath, buffer, {
          contentType: result.mimeType,
          upsert: true
        });

      if (error) throw new Error(`Storage upload failed: ${error.message}`);

      const { data: { publicUrl } } = supabase.storage
        .from('generated-assets')
        .getPublicUrl(filePath);

      return publicUrl;
    });

    // Step 5: Create asset record
    await step.run('create-asset', async () => {
      const { error } = await supabase.from('assets').insert({
        workspace_id: workspaceId,
        user_id: userId,
        job_id: jobId,
        type: 'image',
        name: params.userPrompt.slice(0, 60),
        url: storageUrl,
        thumbnail_url: storageUrl,
        tags: [],
        file_size: null
      });
      if (error) throw new Error(`Asset insert failed: ${error.message}`);
    });

    // Step 6: Deduct credits from ledger (only on success)
    await step.run('deduct-credits', async () => {
      const newBalance = params.balanceBefore - params.creditCost;

      const { error: ledgerError } = await supabase.from('credit_ledger').insert({
        org_id: params.orgId,
        workspace_id: workspaceId,
        user_id: userId,
        action_type: 'image_generation',
        credits_amount: -params.creditCost,
        balance_after: newBalance,
        reference_id: jobId
      });
      if (ledgerError) throw new Error(`Ledger deduction failed: ${ledgerError.message}`);

      const { error: orgError } = await supabase
        .from('organizations')
        .update({ credit_pool: newBalance })
        .eq('id', params.orgId);
      if (orgError) throw new Error(`Org balance update failed: ${orgError.message}`);
    });

    // Step 7: Mark job completed
    await step.run('mark-complete', async () => {
      const { error } = await supabase
        .from('generation_jobs')
        .update({
          status: 'completed',
          output_url: storageUrl,
          credits_cost: params.creditCost,
          prompt_constructed: result.constructedPrompt,
          model_used: result.modelUsed,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);
      if (error) throw new Error(`Failed to mark job complete: ${error.message}`);
    });

    // Dev print helper as requested
    console.log('Track job at: http://localhost:8288');

    return { success: true, outputUrl: storageUrl };
  }
);
