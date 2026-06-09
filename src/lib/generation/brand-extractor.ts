import { GoogleGenerativeAI } from '@google/generative-ai';

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
  if (process.env.MOCK_GENERATION === 'true') {
    return {
      colorMood: 'clean and professional with neutral tones',
      styleDescriptors: ['minimal', 'modern', 'trustworthy'],
      formality: 'semi-formal',
      brandPersonality: 'A confident, approachable brand that values clarity',
      photographyStyle: 'Editorial',
      brandIsNot: 'corporate, cluttered, aggressive',
      typographyFeel: 'clean geometric sans-serif'
    };
  }

  const genAI = new GoogleGenerativeAI(
    process.env.GOOGLE_GENERATIVE_AI_API_KEY!
  );
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `Analyze this brand logo carefully and return ONLY a valid 
JSON object with no explanation, no markdown, no code blocks. 
Return exactly this structure:
{
  "colorMood": "describe the color palette feeling in 6-10 words",
  "styleDescriptors": ["word1", "word2", "word3"],
  "formality": "formal OR semi-formal OR casual",
  "brandPersonality": "one sentence describing the brand feel",
  "photographyStyle": "Editorial OR Lifestyle OR Product OR Abstract OR Illustrated OR Mixed",
  "brandIsNot": "3 comma-separated things this brand visually avoids",
  "typographyFeel": "describe implied typography style in 5-8 words"
}`;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        mimeType: mimeType,
        data: logoBase64
      }
    }
  ]);

  const text = result.response.text().trim();
  
  try {
    const cleaned = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(cleaned) as BrandSignals;
  } catch {
    return {};
  }
}
