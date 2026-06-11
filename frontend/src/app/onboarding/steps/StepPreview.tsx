'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface StepPreviewProps {
  data: {
    brand: {
      primaryColor: string;
      secondaryColor: string;
      fontDisplay: string;
      fontBody: string;
      tone: string;
    };
  };
  onBack: () => void;
  onSubmit: () => Promise<void>;
}

export default function StepPreview({ data, onBack, onSubmit }: StepPreviewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fallbacks for colors if not selected
  const primary = data.brand.primaryColor || '#4f46e5';
  const secondary = data.brand.secondaryColor || '#06b6d4';

  const handleFinish = async () => {
    setLoading(true);
    setError('');
    try {
      await onSubmit();
    } catch (err: unknown) {
      const submitError = err as Error;
      setError(submitError?.message || 'Failed to complete onboarding. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
          Your brand is ready! <Sparkles className="w-5 h-5 text-violet-500 animate-pulse" />
        </h2>
        <p className="text-sm text-neutral-500">
          Here is a quick preview of your brand guidelines compiled in Lumavi.
        </p>
      </div>

      {/* Generation Preview Card */}
      <div className="space-y-4">
        <div
          style={{
            background: `linear-gradient(135deg, ${primary}, ${secondary})`,
          }}
          className="w-full h-52 rounded-xl flex items-center justify-center text-white text-center p-6 shadow-lg relative overflow-hidden transition-all duration-500"
        >
          {/* Subtle overlay */}
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
          {/* Animated light effect */}
          <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/20 to-transparent rotate-12 translate-x-[-100%] animate-[shimmer_3s_infinite]" />

          <div className="relative z-10 bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/25 dark:border-white/10 p-5 rounded-xl shadow-xl max-w-[280px]">
            <span className="text-[10px] font-bold tracking-widest uppercase block text-white/90 mb-1">
              AI Creative Preview
            </span>
            <p className="text-sm font-semibold leading-relaxed">
              &ldquo;Your first branded image will appear here&rdquo;
            </p>
          </div>
        </div>

        {/* Color Swatches */}
        <div className="flex justify-center gap-6 p-4 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              Primary
            </span>
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-full border border-neutral-200 dark:border-neutral-700 shadow-sm"
                style={{ backgroundColor: primary }}
              />
              <span className="text-xs font-mono text-neutral-600 dark:text-neutral-400">
                {primary}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              Secondary
            </span>
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-full border border-neutral-200 dark:border-neutral-700 shadow-sm"
                style={{ backgroundColor: secondary }}
              />
              <span className="text-xs font-mono text-neutral-600 dark:text-neutral-400">
                {secondary}
              </span>
            </div>
          </div>
        </div>

        {/* Fonts & Tone summaries if provided */}
        {(data.brand.fontDisplay || data.brand.fontBody || data.brand.tone) && (
          <div className="grid grid-cols-2 gap-4 text-xs p-4 border border-neutral-100 dark:border-neutral-800 rounded-lg bg-neutral-50/30 dark:bg-neutral-900/30">
            <div>
              <span className="font-semibold text-neutral-400 block mb-1">TYPOGRAPHY</span>
              <span className="text-neutral-700 dark:text-neutral-300 block">
                Display: {data.brand.fontDisplay || 'Default'}
              </span>
              <span className="text-neutral-700 dark:text-neutral-300 block">
                Body: {data.brand.fontBody || 'Default'}
              </span>
            </div>
            <div>
              <span className="font-semibold text-neutral-400 block mb-1">BRAND VOICE</span>
              <span className="text-neutral-700 dark:text-neutral-300 capitalize block">
                Tone: {data.brand.tone || 'Neutral'}
              </span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg border border-rose-100 bg-rose-50/50 text-rose-800 dark:border-rose-950/20 dark:bg-rose-950/10 dark:text-rose-400">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p className="text-xs font-medium">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-4 pt-2">
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={onBack}
          className="flex-1 font-medium transition-all"
        >
          Back
        </Button>
        <Button
          type="button"
          disabled={loading}
          onClick={handleFinish}
          className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-medium shadow-md transition-all duration-200"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
            </>
          ) : (
            'Go to Dashboard'
          )}
        </Button>
      </div>
    </div>
  );
}
