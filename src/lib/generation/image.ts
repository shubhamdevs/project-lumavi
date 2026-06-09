import { buildImagePrompt, BrandGuidelines } from './brand-prompt';

export type ImageGenerationParams = {
  userPrompt: string;
  brand: Partial<BrandGuidelines>;
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:5';
  quality: 'standard' | 'high';
  jobId: string;
  workspaceId: string;
};

export type ImageGenerationResult = {
  success: boolean;
  imageBase64?: string;
  mimeType?: string;
  error?: string;
  modelUsed?: string;
  constructedPrompt?: string;
};

export async function generateImage(
  params: ImageGenerationParams
): Promise<ImageGenerationResult> {
  const constructedPrompt = buildImagePrompt(params.userPrompt, params.brand);

  if (process.env.MOCK_GENERATION === 'true') {
    await new Promise((r) => setTimeout(r, 2000));
    
    const width = 512;
    const height = 512;
    const svg = `<svg width="${width}" height="${height}" 
      xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <rect x="40" y="40" width="${width-80}" height="${height-80}" 
        rx="12" fill="#e0e0e0"/>
      <text x="50%" y="45%" text-anchor="middle" 
        font-family="sans-serif" font-size="18" fill="#888">
        Mock Generation
      </text>
      <text x="50%" y="55%" text-anchor="middle" 
        font-family="sans-serif" font-size="12" fill="#aaa">
        ${params.aspectRatio} • ${params.quality}
      </text>
    </svg>`;
    
    const base64 = Buffer.from(svg).toString('base64');
    return {
      success: true,
      imageBase64: base64,
      mimeType: 'image/svg+xml',
      modelUsed: 'mock',
      constructedPrompt,
    };
  }

  try {
    const { PredictionServiceClient } = 
      await import('@google-cloud/aiplatform').then((m) => m.v1);
    const { helpers } = await import('@google-cloud/aiplatform');
    
    const client = new PredictionServiceClient({
      apiEndpoint: `${process.env.GOOGLE_CLOUD_LOCATION}-aiplatform.googleapis.com`,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || undefined,
    });

    const modelId = params.quality === 'high' 
      ? 'imagen-4.0-ultra-generate-001'
      : 'imagen-4.0-fast-generate-001';

    const endpoint = 
      `projects/${process.env.GOOGLE_CLOUD_PROJECT_ID}` +
      `/locations/${process.env.GOOGLE_CLOUD_LOCATION}` +
      `/publishers/google/models/${modelId}`;

    const aspectRatioMap = {
      '1:1': '1:1',
      '16:9': '16:9', 
      '9:16': '9:16',
      '4:5': '4:5',
    };

    const instanceValue = helpers.toValue({
      prompt: constructedPrompt,
    });

    const parameters = helpers.toValue({
      sampleCount: 1,
      aspectRatio: aspectRatioMap[params.aspectRatio],
      safetySetting: 'block_some',
      personGeneration: 'allow_adult',
      addWatermark: false,
    });

    const [response] = await client.predict({
      endpoint,
      instances: [instanceValue!],
      parameters,
    });

    const predictions = response.predictions;
    if (!predictions || predictions.length === 0) {
      return { success: false, error: 'No predictions returned' };
    }

    const prediction = helpers.fromValue(predictions[0] as any) as any;
    const imageBase64 = prediction.bytesBase64Encoded;

    return {
      success: true,
      imageBase64,
      mimeType: 'image/png',
      modelUsed: modelId,
      constructedPrompt,
    };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Generation failed',
    };
  }
}
