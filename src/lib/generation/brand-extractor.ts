export type BrandSignals = {
  colorMood: string;
  styleDescriptors: string[];
  formality: string;
  brandPersonality: string;
  photographyStyle: string;
  brandIsNot: string;
  typographyFeel: string;
};

export async function extractBrandFromLogo(
  logoBase64: string,
  mimeType: string
): Promise<Partial<BrandSignals>> {
  // Gemini Vision integration added in Brand Hub step
  // Returns empty object until then
  if (process.env.MOCK_GENERATION === 'true') {
    return {};
  }
  return {};
}
