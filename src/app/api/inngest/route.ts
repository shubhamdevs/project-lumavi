import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest/client';
import { generateImageJob } from '@/lib/inngest/jobs/generateImage';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateImageJob]
});
