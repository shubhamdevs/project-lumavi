'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useAuth } from '@clerk/nextjs';
import {
  IconSparkles,
  IconLoader2,
  IconAlertCircle,
  IconDownload,
  IconCopy,
  IconEdit,
  IconDeviceFloppy,
  IconChevronDown,
  IconChevronUp,
  IconInfoCircle,
  IconArrowRight,
  IconRefresh,
} from '@tabler/icons-react';

interface ImageGeneratorClientProps {
  workspaceId: string;
  orgId: string;
  initialBalance: number;
  brand: any;
}

export default function ImageGeneratorClient({
  workspaceId,
  orgId,
  initialBalance,
  brand,
}: ImageGeneratorClientProps) {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:5'>('1:1');
  const [quality, setQuality] = useState<'standard' | 'high'>('standard');
  const [balance, setBalance] = useState(initialBalance);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);

  // Active Job State
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<'pending' | 'processing' | 'completed' | 'failed' | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [constructedPrompt, setConstructedPrompt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Variations State
  const [variationJobIds, setVariationJobIds] = useState<string[] | null>(null);
  const [isGeneratingVariations, setIsGeneratingVariations] = useState(false);

  // Progress steps timer
  const [activeStep, setActiveStep] = useState(0);

  const supabase = getSupabaseBrowserClient();
  const { getToken } = useAuth();

  // Sync Clerk authentication with Supabase browser client
  useEffect(() => {
    const syncAuth = async () => {
      try {
        const token = await getToken({ template: 'supabase' });
        if (token) {
          await supabase.auth.setSession({
            access_token: token,
            refresh_token: '',
          });
        }
      } catch (err) {
        console.error('Failed to sync auth token with Supabase client:', err);
      }
    };
    syncAuth();
  }, [getToken, supabase]);

  // Calculate current credit cost
  const creditCost = quality === 'high' ? 6 : 3;
  const isInsufficientCredits = balance < creditCost;

  // Track progress steps simulation during processing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating && (jobStatus === 'pending' || jobStatus === 'processing')) {
      interval = setInterval(() => {
        setActiveStep((prev) => {
          if (prev < 3) return prev + 1;
          return prev;
        });
      }, 4000);
    } else {
      setActiveStep(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating, jobStatus]);

  // Real-time listener for main job
  useEffect(() => {
    if (!jobId) return;

    // Check current status immediately in case it changed before the channel subscribed
    const checkInitialStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('generation_jobs')
          .select('*')
          .eq('id', jobId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching initial job status:', error);
          return;
        }

        if (data) {
          setJobStatus(data.status);
          if (data.status === 'completed') {
            setOutputUrl(data.output_url);
            setConstructedPrompt(data.prompt_constructed);
            setBalance((prev) => Math.max(0, prev - (data.credits_cost || creditCost)));
            setIsGenerating(false);
          } else if (data.status === 'failed') {
            setError(data.error_message || 'Generation failed');
            setIsGenerating(false);
          }
        }
      } catch (err) {
        console.error('Failed to check initial job status:', err);
      }
    };

    checkInitialStatus();

    const channel = supabase
      .channel(`job-status-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'generation_jobs',
          filter: `id=eq.${jobId}`,
        },
        (payload: any) => {
          const newJob = payload.new;
          setJobStatus(newJob.status);
          if (newJob.status === 'completed') {
            setOutputUrl(newJob.output_url);
            setConstructedPrompt(newJob.prompt_constructed);
            setBalance((prev) => Math.max(0, prev - (newJob.credits_cost || creditCost)));
            setIsGenerating(false);
            toast.success('Image generated successfully!');
          }
          if (newJob.status === 'failed') {
            setError(newJob.error_message || 'Generation failed');
            setIsGenerating(false);
            toast.error('Image generation failed');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId, supabase, creditCost]);

  // Submit main job
  const handleGenerate = async () => {
    if (!prompt.trim() || isInsufficientCredits || isGenerating) return;

    setIsGenerating(true);
    setJobId(null);
    setJobStatus('pending');
    setOutputUrl(null);
    setConstructedPrompt(null);
    setError(null);
    setVariationJobIds(null);
    setActiveStep(0);

    try {
      const response = await fetch('/api/generate/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          aspectRatio,
          quality,
          workspaceId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit generation job');
      }

      setJobId(data.jobId);
      setJobStatus('pending');
    } catch (err: any) {
      setError(err.message || 'Submission failed');
      setIsGenerating(false);
      toast.error(err.message || 'Failed to start generation');
    }
  };

  // Submit variations
  const handleVariations = async () => {
    if (!jobId || isGeneratingVariations || balance < 4) return;

    setIsGeneratingVariations(true);
    setVariationJobIds(null);

    try {
      const response = await fetch('/api/generate/image/variations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalJobId: jobId,
          workspaceId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate variations');
      }

      setVariationJobIds(data.jobIds);
      setBalance((prev) => Math.max(0, prev - 4)); // deduct 4 credits locally
      toast.success('Spawning 4 concurrent image variations');
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate variations');
    } finally {
      setIsGeneratingVariations(false);
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success('Download started');
    } catch (err) {
      window.open(url, '_blank');
    }
  };

  const handleCopyPrompt = () => {
    if (constructedPrompt) {
      navigator.clipboard.writeText(constructedPrompt);
      toast.success('Constructed prompt copied to clipboard');
    }
  };

  // Brand signals formatting helpers
  const hasBrandSetup = brand && brand.completeness > 0;
  const brandModifiers = [];
  if (hasBrandSetup) {
    if (brand.imagery_style) {
      brandModifiers.push(`• Imagery style: ${brand.imagery_style}`);
    }
    if (brand.photography_style && (!brand.imagery_style || brand.imagery_style === 'Photography')) {
      brandModifiers.push(`• Photography style: ${brand.photography_style}`);
    }
    if (brand.color_mood) {
      brandModifiers.push(`• Color treatment: ${brand.color_mood}`);
    }
    if (brand.tone?.archetype) {
      brandModifiers.push(`• Tone: ${brand.tone.archetype}`);
    }
    if (brand.brand_is_not) {
      brandModifiers.push(`• Avoid: ${brand.brand_is_not}`);
    }
  }

  // Aspect ratio option layouts
  const ratioOptions = [
    { id: '1:1', label: '1:1', desc: 'Square', detail: 'Social posts', widthClass: 'w-7 h-7' },
    { id: '16:9', label: '16:9', desc: 'Landscape', detail: 'Banners, YouTube', widthClass: 'w-10 h-6' },
    { id: '9:16', label: '9:16', desc: 'Portrait', detail: 'Stories, Reels', widthClass: 'w-5 h-8' },
    { id: '4:5', label: '4:5', desc: 'Portrait', detail: 'Feed posts', widthClass: 'w-6 h-7.5' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8 items-stretch">
        
        {/* Left Column: Input and settings */}
        <div className="flex-1 space-y-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              Generate Image
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Transform your descriptions into on-brand visuals powered by Imagen 4.
            </p>
          </div>

          <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm rounded-xl">
            <CardContent className="p-6 space-y-5">
              
              {/* Section: Prompt */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Prompt
                </label>
                <Textarea
                  placeholder="Describe the image you want to create..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-32 text-base rounded-xl resize-none"
                  disabled={isGenerating}
                />
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
                  <IconInfoCircle className="w-3.5 h-3.5" />
                  Your brand settings are automatically applied
                </p>
              </div>

              {/* Brand Modifier Preview */}
              <div className="border border-neutral-100 dark:border-neutral-900 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsCollapsibleOpen(!isCollapsibleOpen)}
                  className="w-full flex items-center justify-between p-3.5 bg-neutral-50/50 dark:bg-neutral-900/40 text-xs font-semibold text-neutral-600 dark:text-neutral-300 select-none hover:bg-neutral-50 dark:hover:bg-neutral-900/60 transition-all"
                >
                  <span className="flex items-center gap-1.5">
                    <IconSparkles className="w-4 h-4 text-violet-500" />
                    Brand modifiers preview
                  </span>
                  {isCollapsibleOpen ? (
                    <IconChevronUp className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <IconChevronDown className="w-4 h-4 text-neutral-400" />
                  )}
                </button>

                {isCollapsibleOpen && (
                  <div className="p-4 bg-white dark:bg-neutral-950 text-xs text-neutral-500 dark:text-neutral-400 border-t border-neutral-100 dark:border-neutral-900 space-y-2">
                    {hasBrandSetup && brandModifiers.length > 0 ? (
                      <div className="space-y-1">
                        <p className="font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                          Brand modifiers that will be applied:
                        </p>
                        {brandModifiers.map((mod, i) => (
                          <p key={i} className="leading-relaxed">
                            {mod}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between py-1">
                        <span>Complete your brand setup for better results</span>
                        <Link
                          href="/brand"
                          className="inline-flex items-center gap-1 font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                        >
                          Setup brand <IconArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Separator className="bg-neutral-100 dark:bg-neutral-900" />

              {/* Section: Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Settings
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Aspect Ratio Selector */}
                  <div className="space-y-2.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
                      Aspect ratio
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {ratioOptions.map((opt) => {
                        const isSelected = aspectRatio === opt.id;
                        return (
                          <button
                            type="button"
                            key={opt.id}
                            onClick={() => setAspectRatio(opt.id as any)}
                            disabled={isGenerating}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'border-neutral-950 bg-neutral-50/50 dark:border-neutral-100 dark:bg-neutral-900/20'
                                : 'border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900/40'
                            }`}
                          >
                            <div className="h-10 flex items-center justify-center mb-2">
                              <div
                                className={`border-2 border-neutral-400 dark:border-neutral-600 rounded bg-neutral-100 dark:bg-neutral-800/40 ${opt.widthClass}`}
                              />
                            </div>
                            <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 block">
                              {opt.label}
                            </span>
                            <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                              {opt.detail}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quality Selector */}
                  <div className="space-y-2.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
                      Quality
                    </span>
                    <div className="space-y-2">
                      {[
                        { id: 'standard', title: 'Standard', desc: '2× faster, great for drafts', cost: 3 },
                        { id: 'high', title: 'High Resolution', desc: 'Best quality, production ready', cost: 6 },
                      ].map((opt) => {
                        const isSelected = quality === opt.id;
                        return (
                          <button
                            type="button"
                            key={opt.id}
                            onClick={() => setQuality(opt.id as any)}
                            disabled={isGenerating}
                            className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'border-neutral-950 bg-neutral-50/50 dark:border-neutral-100 dark:bg-neutral-900/20'
                                : 'border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900/40'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 block">
                                {opt.title}
                              </span>
                              <span className="text-[11px] text-neutral-400 dark:text-neutral-500 leading-tight block">
                                {opt.desc}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                                {opt.cost} credits
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-neutral-100 dark:bg-neutral-900" />

              {/* Credit Cost Preview */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-neutral-50 dark:bg-neutral-900/30 p-4 rounded-xl">
                <div className="space-y-0.5">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    This generation will use <span className="font-bold text-neutral-800 dark:text-neutral-200">{creditCost} credits</span>
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    You have {balance} credits remaining
                  </p>
                </div>

                {isInsufficientCredits && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-300">
                    <IconAlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Not enough credits. Top up to continue.</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isInsufficientCredits || isGenerating}
                  className="w-full h-11 text-base font-semibold rounded-xl"
                >
                  {isGenerating ? (
                    <>
                      <IconLoader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate • {creditCost} credits
                    </>
                  )}
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Right Column: Result Display */}
        <div className="flex-1 flex flex-col justify-start">
          <div className="sticky top-6 w-full max-w-lg mx-auto space-y-6">
            
            {/* Variation Grid or Single Result rendering */}
            {variationJobIds ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    Generated Variations
                  </h3>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => setVariationJobIds(null)}
                    className="h-7 text-xs"
                  >
                    Back to original
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3 aspect-square w-full">
                  {variationJobIds.map((id, index) => (
                    <VariationCard
                      key={id}
                      jobId={id}
                      index={index}
                      workspaceId={workspaceId}
                    />
                  ))}
                </div>
              </div>
            ) : !jobStatus && !outputUrl && !error ? (
              /* Before any generation */
              <div className="flex flex-col items-center justify-center p-12 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-850 aspect-square w-full">
                <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 text-neutral-400 dark:text-neutral-500 rounded-2xl mb-4">
                  <IconSparkles className="w-10 h-10" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-base font-bold text-neutral-700 dark:text-neutral-200">
                    Your image will appear here
                  </p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500">
                    Results stream in as they're generated
                  </p>
                </div>
              </div>
            ) : isGenerating || jobStatus === 'pending' || jobStatus === 'processing' ? (
              /* Generating state */
              <div className="relative flex flex-col items-center justify-center p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-950/20 aspect-square w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-100/10 to-transparent animate-pulse" />
                
                <div className="space-y-6 w-full max-w-xs z-10">
                  <div className="flex justify-center mb-2">
                    <IconLoader2 className="w-8 h-8 animate-spin text-neutral-400 dark:text-neutral-500" />
                  </div>
                  
                  {/* Progress steps checklist */}
                  <div className="space-y-3">
                    {[
                      { label: 'Preparing your prompt', step: 0 },
                      { label: 'Applying brand intelligence', step: 1 },
                      { label: 'Generating with Imagen 4', step: 2 },
                      { label: 'Finalizing', step: 3 },
                    ].map((item) => {
                      const isCompleted = activeStep > item.step;
                      const isActive = activeStep === item.step;
                      return (
                        <div key={item.step} className="flex items-center space-x-3 text-xs">
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                              isCompleted
                                ? 'bg-green-500 text-white'
                                : isActive
                                ? 'bg-violet-500 text-white animate-pulse'
                                : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400'
                            }`}
                          >
                            {isCompleted ? '✓' : item.step + 1}
                          </div>
                          <span
                            className={`font-medium ${
                              isCompleted || isActive
                                ? 'text-neutral-800 dark:text-neutral-200'
                                : 'text-neutral-400'
                            }`}
                          >
                            {item.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <p className="text-[10px] text-center text-neutral-400 dark:text-neutral-500">
                    Usually takes 15-30 seconds
                  </p>
                </div>
              </div>
            ) : error ? (
              /* Failed state */
              <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-red-200 dark:border-red-950/30 bg-red-50/10 aspect-square w-full text-center">
                <div className="p-3 bg-red-50 text-red-500 dark:bg-red-950/20 dark:text-red-400 rounded-xl mb-4">
                  <IconAlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                  Generation failed
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mb-4">
                  {error}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerate}
                  className="flex items-center gap-1.5"
                >
                  <IconRefresh className="w-4 h-4" /> Try again
                </Button>
              </div>
            ) : outputUrl ? (
              /* Completed result */
              <div className="space-y-4 w-full">
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-neutral-100 dark:border-neutral-850 shadow-sm bg-neutral-50">
                  <Image
                    src={outputUrl}
                    alt="Generated output"
                    fill
                    sizes="(max-w-500px) 100vw"
                    className="object-contain"
                    unoptimized
                  />
                </div>

                {/* Metadata & Prompts */}
                <div className="space-y-3.5 bg-neutral-50/50 dark:bg-neutral-900/10 border border-neutral-100 dark:border-neutral-900 p-4 rounded-xl">
                  
                  {/* Actions Row */}
                  <div className="grid grid-cols-4 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(outputUrl, `generation-${jobId}.png`)}
                      className="flex flex-col sm:flex-row items-center justify-center gap-1 text-[11px] sm:text-xs h-9"
                    >
                      <IconDownload className="w-4 h-4" />
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleVariations}
                      disabled={isGeneratingVariations || balance < 4}
                      className="flex flex-col sm:flex-row items-center justify-center gap-1 text-[11px] sm:text-xs h-9"
                    >
                      {isGeneratingVariations ? (
                        <IconLoader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <IconCopy className="w-4 h-4" />
                      )}
                      <span className="hidden sm:inline">Variations</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast('Inpainting editing is coming soon!', { icon: <IconInfoCircle className="text-blue-500" /> })}
                      className="flex flex-col sm:flex-row items-center justify-center gap-1 text-[11px] sm:text-xs h-9"
                    >
                      <IconEdit className="w-4 h-4" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.success('Saved to gallery!')}
                      className="flex flex-col sm:flex-row items-center justify-center gap-1 text-[11px] sm:text-xs h-9"
                    >
                      <IconDeviceFloppy className="w-4 h-4" />
                      <span className="hidden sm:inline">Save</span>
                    </Button>
                  </div>

                  <Separator className="bg-neutral-100 dark:bg-neutral-900" />

                  <div className="space-y-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                    <p className="leading-relaxed">
                      Generated with <span className="font-semibold text-neutral-700 dark:text-neutral-300">Imagen 4</span> • <span className="font-medium text-neutral-600 dark:text-neutral-450">{aspectRatio}</span> • <span className="font-medium text-neutral-600 dark:text-neutral-450">{quality}</span>
                    </p>
                    {constructedPrompt && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                            Constructed prompt
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyPrompt}
                            className="text-[10px] font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-0.5"
                          >
                            Copy prompt
                          </button>
                        </div>
                        <p className="text-[11px] leading-relaxed text-neutral-600 dark:text-neutral-350 line-clamp-3">
                          {constructedPrompt}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

          </div>
        </div>

      </div>
    </div>
  );
}

// Inner Component: Card that tracks its own variation progress using Supabase Realtime
function VariationCard({
  jobId,
  index,
  workspaceId,
}: {
  jobId: string;
  index: number;
  workspaceId: string;
}) {
  const [status, setStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    // Check initial status in case it changed before subscription
    const checkStatus = async () => {
      const { data } = await supabase
        .from('generation_jobs')
        .select('*')
        .eq('id', jobId)
        .maybeSingle();

      if (data) {
        setStatus(data.status);
        if (data.status === 'completed') setUrl(data.output_url);
        if (data.status === 'failed') setError(data.error_message || 'Failed');
      }
    };
    checkStatus();

    const channel = supabase
      .channel(`variation-status-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'generation_jobs',
          filter: `id=eq.${jobId}`,
        },
        (payload: any) => {
          const newJob = payload.new;
          setStatus(newJob.status);
          if (newJob.status === 'completed') {
            setUrl(newJob.output_url);
          }
          if (newJob.status === 'failed') {
            setError(newJob.error_message || 'Failed');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId, supabase]);

  const handleDownload = async (e: React.MouseEvent, targetUrl: string) => {
    e.stopPropagation();
    try {
      const response = await fetch(targetUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `variation-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(targetUrl, '_blank');
    }
  };

  return (
    <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 flex flex-col items-center justify-center text-center">
      {status === 'pending' || status === 'processing' ? (
        <div className="flex flex-col items-center space-y-2">
          <IconLoader2 className="w-5 h-5 animate-spin text-neutral-400" />
          <span className="text-[10px] font-medium text-neutral-500">
            {status === 'pending' ? 'Preparing...' : 'Generating...'}
          </span>
        </div>
      ) : status === 'failed' ? (
        <div className="p-3 text-red-500">
          <IconAlertCircle className="w-5 h-5 mx-auto mb-1" />
          <span className="text-[9px] font-medium leading-tight block truncate max-w-[120px]">
            {error || 'Failed'}
          </span>
        </div>
      ) : url ? (
        <div className="group relative w-full h-full">
          <Image
            src={url}
            alt={`Variation ${index + 1}`}
            fill
            sizes="(max-w-250px) 50vw"
            className="object-contain"
            unoptimized
          />
          {/* Hover Action Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              variant="secondary"
              size="icon-xs"
              onClick={(e) => handleDownload(e, url)}
              title="Download variation"
            >
              <IconDownload className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="secondary"
              size="icon-xs"
              onClick={(e) => {
                e.stopPropagation();
                toast.success('Saved variation to gallery!');
              }}
              title="Save variation"
            >
              <IconDeviceFloppy className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      ) : null}
      <div className="absolute bottom-1 right-1.5 bg-black/50 text-[8px] text-white px-1 py-0.5 rounded font-mono">
        v{index + 1}
      </div>
    </div>
  );
}
