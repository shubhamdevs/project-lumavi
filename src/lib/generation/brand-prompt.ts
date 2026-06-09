export type BrandGuidelines = {
  colors: { primary: string; secondary: string };
  typography: { display: string; body: string };
  photography_style: string;
  color_mood: string;
  lighting: string;
  composition: string;
  tone: { archetype: string };
  brand_keywords: string[];
  audience: string;
  brand_is_not: string;
  imagery_style: string;
};

export function buildImagePrompt(
  userPrompt: string,
  brand: Partial<BrandGuidelines>
): string {
  const layers: string[] = [];

  // Layer 1 — user input, never overridden
  layers.push(userPrompt);

  // Layer 2 — visual modifiers
  if (brand.imagery_style) {
    layers.push(`Imagery style: ${brand.imagery_style}`);
  }
  if (brand.photography_style && (!brand.imagery_style || brand.imagery_style === 'Photography')) {
    layers.push(`Photography style: ${brand.photography_style}`);
  }
  if (brand.color_mood) {
    layers.push(`Color treatment: ${brand.color_mood}`);
  }
  if (brand.lighting) {
    layers.push(`Lighting: ${brand.lighting}`);
  }
  if (brand.composition) {
    layers.push(`Composition: ${brand.composition}`);
  }

  // Layer 3 — voice and tone modifiers
  if (brand.tone?.archetype) {
    layers.push(`Tone and mood: ${brand.tone.archetype}`);
  }
  if (brand.brand_keywords?.length) {
    const validKeywords = brand.brand_keywords.filter(Boolean);
    if (validKeywords.length > 0) {
      layers.push(`Brand feel: ${validKeywords.join(', ')}`);
    }
  }

  // Layer 4 — audience context
  if (brand.audience) {
    layers.push(`Created for: ${brand.audience}`);
  }

  // Layer 5 — negative constraints (critical)
  if (brand.brand_is_not) {
    layers.push(
      `Avoid: ${brand.brand_is_not}. Never stock photo, never generic.`
    );
  }

  return layers.join('. ');
}

export function buildVideoPrompt(
  userPrompt: string,
  brand: Partial<BrandGuidelines>
): string {
  const imagePrompt = buildImagePrompt(userPrompt, brand);
  return `${imagePrompt}. Cinematic, smooth motion`;
}
