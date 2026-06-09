'use strict';
'use server';

import { auth } from '@clerk/nextjs/server';
import { getSupabaseServiceClient } from '@/lib/supabase/service';

function calculateCompleteness(guideline: any) {
  let score = 0;

  // Colors filled: +15
  const colors = guideline.colors || {};
  if (colors.primary || colors.secondary) {
    score += 15;
  }

  // Typography filled: +10
  const typography = guideline.typography || {};
  if (typography.display || typography.body) {
    score += 10;
  }

  // Imagery & Photography style selected: +15
  if (guideline.imagery_style) {
    if (guideline.imagery_style !== 'Photography' || guideline.photography_style) {
      score += 15;
    }
  }

  // Tone selected: +10
  const tone = guideline.tone || {};
  if (tone.archetype) {
    score += 10;
  }

  // Brand keywords filled (3+): +15
  const keywords = guideline.brand_keywords || [];
  const validKeywords = keywords.filter((k: string) => k && k.trim().length > 0);
  if (validKeywords.length >= 3) {
    score += 15;
  }

  // Audience description filled: +15
  if (guideline.audience && guideline.audience.trim().length > 0) {
    score += 15;
  }

  // Color mood filled: +10
  if (guideline.color_mood && guideline.color_mood.trim().length > 0) {
    score += 10;
  }

  // Brand is not filled: +10
  if (guideline.brand_is_not && guideline.brand_is_not.trim().length > 0) {
    score += 10;
  }

  return score;
}

export async function saveBrandSection(workspaceId: string, updates: Record<string, any>) {
  try {
    const authData = await auth();
    if (!authData.userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = getSupabaseServiceClient();

    // 1. Fetch current guidelines row to merge changes and calculate correct completeness score
    const { data: current, error: fetchError } = await supabase
      .from('brand_guidelines')
      .select('*')
      .eq('workspace_id', workspaceId)
      .maybeSingle();

    if (fetchError) {
      return { success: false, error: `Database error: ${fetchError.message}` };
    }

    // Prepare updated guideline object
    const merged = {
      ...(current || {}),
      ...updates,
      workspace_id: workspaceId,
    };

    // Recalculate completeness
    const completenessScore = calculateCompleteness(merged);
    merged.completeness = completenessScore;

    // Remove metadata fields that shouldn't be written directly or are generated
    delete merged.id;
    delete merged.created_at;
    delete merged.updated_at;

    // 2. Upsert guidelines row
    const { error: upsertError } = await supabase
      .from('brand_guidelines')
      .upsert(
        {
          ...merged,
          workspace_id: workspaceId,
        },
        { onConflict: 'workspace_id' }
      );

    if (upsertError) {
      return { success: false, error: `Failed to save guidelines: ${upsertError.message}` };
    }

    return { success: true, completeness: completenessScore };
  } catch (err: any) {
    return { success: false, error: err?.message || 'An unexpected error occurred' };
  }
}

export async function uploadBrandLogo(workspaceId: string, formData: FormData) {
  try {
    const authData = await auth();
    if (!authData.userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const file = formData.get('file') as File;
    const type = formData.get('type') as 'light' | 'dark';

    if (!file || !type || !workspaceId) {
      return { success: false, error: 'Invalid parameters' };
    }

    const ext = file.name.split('.').pop() || 'png';
    const path = `${workspaceId}/logo-${type}.${ext}`;
    const supabase = getSupabaseServiceClient();

    // 1. Ensure storage bucket exists
    try {
      await supabase.storage.createBucket('brand-assets', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/svg+xml'],
        fileSizeLimit: 2 * 1024 * 1024, // 2MB
      });
    } catch {
      // Ignore if bucket already exists
    }

    // 2. Upload file
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from('brand-assets')
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return { success: false, error: `Failed to upload storage file: ${uploadError.message}` };
    }

    // 3. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('brand-assets')
      .getPublicUrl(path);

    // 4. Fetch guidelines to update logo fields
    const { data: current } = await supabase
      .from('brand_guidelines')
      .select('*')
      .eq('workspace_id', workspaceId)
      .maybeSingle();

    const currentLogos = current?.logos || {};
    const updatedLogos = {
      ...currentLogos,
      [type]: publicUrl,
    };

    const merged = {
      ...(current || {}),
      logos: updatedLogos,
      workspace_id: workspaceId,
    };

    const completenessScore = calculateCompleteness(merged);
    merged.completeness = completenessScore;

    delete merged.id;
    delete merged.created_at;
    delete merged.updated_at;

    // 5. Upsert
    const { error: upsertError } = await supabase
      .from('brand_guidelines')
      .upsert(
        {
          ...merged,
          workspace_id: workspaceId,
        },
        { onConflict: 'workspace_id' }
      );

    if (upsertError) {
      return { success: false, error: `Failed to update logo reference: ${upsertError.message}` };
    }

    return { success: true, url: publicUrl, completeness: completenessScore };
  } catch (err: any) {
    return { success: false, error: err?.message || 'An unexpected error occurred' };
  }
}
