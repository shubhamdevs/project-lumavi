'use server';

import { auth } from '@clerk/nextjs/server';
import { getSupabaseServiceClient } from '@/lib/supabase/service';

export type BrandGuidelinesUpdate = {
  colors?: Partial<{ primary: string; secondary: string }>;
  typography?: Partial<{ display: string; body: string; feel: string }>;
  tone?: Partial<{ archetype: string }>;
  photography_style?: string;
  color_mood?: string;
  lighting?: string;
  composition?: string;
  brand_keywords?: string[];
  audience?: string;
  brand_is_not?: string;
  brand_personality?: string;
  logos?: Partial<{ light: string; dark: string }>;
};

function calculateCompleteness(guideline: any): number {
  let score = 0;

  const colors = guideline.colors || {};
  const primary = colors.primary;
  if (primary && primary.trim() !== '' && primary.toLowerCase() !== '#000000') {
    score += 15;
  }

  const secondary = colors.secondary;
  if (secondary && secondary.trim() !== '' && secondary.toLowerCase() !== '#ffffff') {
    score += 10;
  }

  const typography = guideline.typography || {};
  if (typography.display && typography.display.trim() !== '') {
    score += 10;
  }
  if (typography.body && typography.body.trim() !== '') {
    score += 5;
  }

  const tone = guideline.tone || {};
  if (tone.archetype && tone.archetype.trim() !== '') {
    score += 10;
  }

  if (guideline.photography_style && guideline.photography_style.trim() !== '') {
    score += 20;
  }

  if (guideline.color_mood && guideline.color_mood.trim() !== '') {
    score += 10;
  }

  if (guideline.lighting && guideline.lighting.trim() !== '') {
    score += 5;
  }

  if (guideline.composition && guideline.composition.trim() !== '') {
    score += 5;
  }

  if (guideline.brand_is_not && guideline.brand_is_not.trim() !== '') {
    score += 10;
  }

  if (guideline.audience && guideline.audience.trim() !== '') {
    score += 5;
  }

  const keywords = guideline.brand_keywords || [];
  const validKeywords = keywords.filter(
    (k: any) => typeof k === 'string' && k.trim() !== ''
  );
  if (validKeywords.length >= 3) {
    score += 5;
  }

  return Math.min(100, score);
}

export async function saveBrandSection(
  workspaceId: string,
  sectionData: Partial<BrandGuidelinesUpdate>
) {
  try {
    const authData = await auth();
    const userId = authData.userId;
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = getSupabaseServiceClient();

    // Security check: user is member of this workspace
    const { data: memberData, error: memberError } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', userId)
      .eq('workspace_id', workspaceId)
      .maybeSingle();

    if (memberError || !memberData) {
      return { success: false, error: 'Unauthorized workspace access' };
    }

    // Fetch existing guidelines
    const { data: current, error: fetchError } = await supabase
      .from('brand_guidelines')
      .select('*')
      .eq('workspace_id', workspaceId)
      .maybeSingle();

    if (fetchError) {
      return { success: false, error: `Failed to fetch brand guidelines: ${fetchError.message}` };
    }

    // Merge JSONB fields carefully
    const colors = sectionData.colors
      ? { ...(current?.colors || {}), ...sectionData.colors }
      : current?.colors;

    const typography = sectionData.typography
      ? { ...(current?.typography || {}), ...sectionData.typography }
      : current?.typography;

    const tone = sectionData.tone
      ? { ...(current?.tone || {}), ...sectionData.tone }
      : current?.tone;

    const logos = sectionData.logos
      ? { ...(current?.logos || {}), ...sectionData.logos }
      : current?.logos;

    // Build overall updated record
    const merged: any = {
      ...current,
      workspace_id: workspaceId,
    };

    if (colors !== undefined) merged.colors = colors;
    if (typography !== undefined) merged.typography = typography;
    if (tone !== undefined) merged.tone = tone;
    if (logos !== undefined) merged.logos = logos;

    const topLevelKeys: (keyof BrandGuidelinesUpdate)[] = [
      'photography_style',
      'color_mood',
      'lighting',
      'composition',
      'brand_keywords',
      'audience',
      'brand_is_not',
      'brand_personality',
    ];

    for (const key of topLevelKeys) {
      if (sectionData[key] !== undefined) {
        merged[key] = sectionData[key];
      }
    }

    // Recalculate completeness
    const newCompleteness = calculateCompleteness(merged);
    merged.completeness = newCompleteness;

    // Remove metadata fields that shouldn't be updated manually
    delete merged.id;
    delete merged.created_at;
    delete merged.updated_at;

    let upsertError;
    if (current) {
      const { error } = await supabase
        .from('brand_guidelines')
        .update(merged)
        .eq('workspace_id', workspaceId);
      upsertError = error;
    } else {
      const { error } = await supabase
        .from('brand_guidelines')
        .insert(merged);
      upsertError = error;
    }

    if (upsertError) {
      return { success: false, error: `Failed to save guidelines: ${upsertError.message}` };
    }

    return { success: true, completeness: newCompleteness };
  } catch (err: any) {
    return { success: false, error: err?.message || 'An unexpected error occurred' };
  }
}

export async function uploadBrandLogo(
  workspaceId: string,
  variant: 'light' | 'dark',
  base64Data: string,
  mimeType: string,
  extension: string
) {
  try {
    const authData = await auth();
    const userId = authData.userId;
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = getSupabaseServiceClient();

    // Security check: user is member of this workspace
    const { data: memberData, error: memberError } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', userId)
      .eq('workspace_id', workspaceId)
      .maybeSingle();

    if (memberError || !memberData) {
      return { success: false, error: 'Unauthorized workspace access' };
    }

    // Ensure storage bucket exists
    try {
      await supabase.storage.createBucket('brand-assets', {
        public: true,
      });
    } catch (e) {
      // Ignore if bucket already exists
    }

    const timestamp = Date.now();
    const path = `${workspaceId}/logo-${variant}-${timestamp}.${extension}`;
    const buffer = Buffer.from(base64Data, 'base64');

    const { error: uploadError } = await supabase.storage
      .from('brand-assets')
      .upload(path, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      return { success: false, error: `Storage upload error: ${uploadError.message}` };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('brand-assets')
      .getPublicUrl(path);

    // Update guidelines
    const saveResult = await saveBrandSection(workspaceId, {
      logos: {
        [variant]: publicUrl,
      },
    });

    if (!saveResult.success) {
      return { success: false, error: saveResult.error || 'Failed to update logo reference' };
    }

    return { success: true, url: publicUrl, completeness: saveResult.completeness };
  } catch (err: any) {
    return { success: false, error: err?.message || 'An unexpected error occurred' };
  }
}
