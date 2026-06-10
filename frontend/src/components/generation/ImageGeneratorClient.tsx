'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@clerk/nextjs';
import { submitImageJob, submitVariations, getJob } from '@/lib/api';
import {
  IconSparkles, IconLoader2, IconAlertCircle, IconDownload,
  IconCopy, IconEdit, IconDeviceFloppy, IconChevronDown,
  IconChevronUp, IconInfoCircle, IconArrowRight, IconRefresh,
} from '@tabler/icons-react';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

interface ImageGeneratorClientProps {
  workspaceId: string;
  orgId: string;
  initialBalance: number;
  brand: any;
}

export default function ImageGeneratorClient({ workspaceId, orgId, initialBalance, brand }: ImageGeneratorClientProps) {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:5'>('1:1');
  const [quality, setQuality] = useState<'standard' | 'high'>('standard');
  const [balance, setBalance] = useState(initialBalance);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [constructedPrompt, setConstructedPrompt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [variationJobIds, setVariationJobIds] = useState<string[] | null>(null);
  const [isGeneratingVariations, setIsGeneratingVariations] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const { getToken } = useAuth();
  const creditCost = quality === 'high' ? 6 : 3;
  const isInsufficientCredits = balance < creditCost;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating && (jobStatus === 'pending' || jobStatus === 'processing')) {
      interval = setInterval(() => setActiveStep((p) => (p < 3 ? p + 1 : p)), 4000);
    } else {
      setTimeout(() => setActiveStep(0), 0);
    }
    return () => clearInterval(interval);
  }, [isGenerating, jobStatus]);

  // SSE stream for job status
  useEffect(() => {
    if (!jobId) return;
    let es: EventSource;
    let pollTimer: NodeJS.Timeout;

    const onDone = (status: string, url?: string | null, errMsg?: string | null, prompt?: string | null) => {
      setJobStatus(status);
      if (status === 'completed') {
        setOutputUrl(url ?? null);
        setConstructedPrompt(prompt ?? null);
        setBalance((p) => Math.max(0, p - creditCost));
        setIsGenerating(false);
        toast.success('Image generated successfully!');
      } else if (status === 'failed') {
        setError(errMsg || 'Generation failed');
        setIsGenerating(false);
        toast.error('Image generation failed');
      }
    };

    const startStream = async () => {
      const token = await getToken();
      if (!token) return;
      const url = `${BACKEND}/jobs/${jobId}/stream`;
      es = new EventSource(`${url}?_token=${encodeURIComponent(token)}`);
      es.onmessage = (e) => {
        const data = JSON.parse(e.data);
        setJobStatus(data.status);
        if (data.status === 'completed' || data.status === 'failed') {
          onDone(data.status, data.output_url, data.error_message, data.prompt_constructed);
          es.close();
          clearTimeout(pollTimer);
        }
      };
      es.onerror = () => {
        es.close();
        // Fallback: poll manually
        pollTimer = setInterval(async () => {
          const t = await getToken();
          if (!t) return;
          try {
            const job = await getJob(t, jobId);
            setJobStatus(job.status);
            if (job.status === 'completed' || job.status === 'failed') {
              onDone(job.status, job.output_url, job.error_message);
              clearInterval(pollTimer);
            }
          } catch { /* ignore */ }
        }, 3000);
      };
    };
    startStream();
    return () => { es?.close(); clearTimeout(pollTimer); };
  }, [jobId, getToken, creditCost]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isInsufficientCredits || isGenerating) return;
    const token = await getToken();
    if (!token) { toast.error('Not authenticated'); return; }

    setIsGenerating(true);
    setJobId(null);
    setJobStatus('pending');
    setOutputUrl(null);
    setConstructedPrompt(null);
    setError(null);
    setVariationJobIds(null);
    setActiveStep(0);

    try {
      const data = await submitImageJob(token, workspaceId, prompt, aspectRatio, quality);
      setJobId(data.job_id);
      setJobStatus('pending');
    } catch (err: any) {
      setError(err.message || 'Submission failed');
      setIsGenerating(false);
      toast.error(err.message || 'Failed to start generation');
    }
  };

  const handleVariations = async () => {
    if (!jobId || isGeneratingVariations || balance < 4) return;
    const token = await getToken();
    if (!token) return;
    setIsGeneratingVariations(true);
    setVariationJobIds(null);
    try {
      const data = await submitVariations(token, workspaceId, prompt, aspectRatio);
      setVariationJobIds(data.job_ids);
      setBalance((p) => Math.max(0, p - 4));
      toast.success('Spawning 4 concurrent image variations');
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate variations');
    } finally {
      setIsGeneratingVariations(false);
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const blob = await fetch(url).then((r) => r.blob());
      const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: filename });
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
      toast.success('Download started');
    } catch { window.open(url, '_blank'); }
  };

  const handleCopyPrompt = () => {
    if (constructedPrompt) { navigator.clipboard.writeText(constructedPrompt); toast.success('Prompt copied'); }
  };

  const hasBrandSetup = brand && brand.completeness > 0;
  const brandModifiers: string[] = [];
  if (hasBrandSetup) {
    if (brand.imagery_style) brandModifiers.push(`• Imagery style: ${brand.imagery_style}`);
    if (brand.photography_style) brandModifiers.push(`• Photography style: ${brand.photography_style}`);
    if (brand.color_mood) brandModifiers.push(`• Color treatment: ${brand.color_mood}`);
    if (brand.tone?.archetype) brandModifiers.push(`• Tone: ${brand.tone.archetype}`);
    if (brand.brand_is_not) brandModifiers.push(`• Avoid: ${brand.brand_is_not}`);
  }

  const ratioOptions = [
    { id: '1:1', label: '1:1', desc: 'Square', detail: 'Social posts', widthClass: 'w-7 h-7' },
    { id: '16:9', label: '16:9', desc: 'Landscape', detail: 'Banners, YouTube', widthClass: 'w-10 h-6' },
    { id: '9:16', label: '9:16', desc: 'Portrait', detail: 'Stories, Reels', widthClass: 'w-5 h-8' },
    { id: '4:5', label: '4:5', desc: 'Portrait', detail: 'Feed posts', widthClass: 'w-6 h-7' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8 items-stretch">
        <div className="flex-1 space-y-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">Generate Image</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Transform your descriptions into on-brand visuals powered by Imagen 4.</p>
          </div>
          <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm rounded-xl">
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Prompt</label>
                <Textarea placeholder="Describe the image you want to create..." value={prompt} onChange={(e) => setPrompt(e.target.value)} className="min-h-32 text-base rounded-xl resize-none" disabled={isGenerating} />
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5"><IconInfoCircle className="w-3.5 h-3.5" />Your brand settings are automatically applied</p>
              </div>
              <div className="border border-neutral-100 dark:border-neutral-900 rounded-xl overflow-hidden">
                <button type="button" onClick={() => setIsCollapsibleOpen(!isCollapsibleOpen)} className="w-full flex items-center justify-between p-3.5 bg-neutral-50/50 dark:bg-neutral-900/40 text-xs font-semibold text-neutral-600 dark:text-neutral-300 select-none hover:bg-neutral-50 dark:hover:bg-neutral-900/60 transition-all">
                  <span className="flex items-center gap-1.5"><IconSparkles className="w-4 h-4 text-violet-500" />Brand modifiers preview</span>
                  {isCollapsibleOpen ? <IconChevronUp className="w-4 h-4 text-neutral-400" /> : <IconChevronDown className="w-4 h-4 text-neutral-400" />}
                </button>
                {isCollapsibleOpen && (
                  <div className="p-4 bg-white dark:bg-neutral-950 text-xs text-neutral-500 dark:text-neutral-400 border-t border-neutral-100 dark:border-neutral-900 space-y-2">
                    {hasBrandSetup && brandModifiers.length > 0 ? (
                      <div className="space-y-1">
                        <p className="font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Brand modifiers that will be applied:</p>
                        {brandModifiers.map((mod, i) => <p key={i} className="leading-relaxed">{mod}</p>)}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between py-1">
                        <span>Complete your brand setup for better results</span>
                        <Link href="/brand" className="inline-flex items-center gap-1 font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">Setup brand <IconArrowRight className="w-3.5 h-3.5" /></Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <Separator className="bg-neutral-100 dark:bg-neutral-900" />
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">Aspect ratio</span>
                    <div className="grid grid-cols-2 gap-2">
                      {ratioOptions.map((opt) => (
                        <button type="button" key={opt.id} onClick={() => setAspectRatio(opt.id as any)} disabled={isGenerating} className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${aspectRatio === opt.id ? 'border-neutral-950 bg-neutral-50/50 dark:border-neutral-100 dark:bg-neutral-900/20' : 'border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900/40'}`}>
                          <div className="h-10 flex items-center justify-center mb-2"><div className={`border-2 border-neutral-400 dark:border-neutral-600 rounded bg-neutral-100 dark:bg-neutral-800/40 ${opt.widthClass}`} /></div>
                          <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 block">{opt.label}</span>
                          <span className="text-[10px] text-neutral-400 dark:text-neutral-500">{opt.detail}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">Quality</span>
                    <div className="space-y-2">
                      {[{ id: 'standard', title: 'Standard', desc: '2× faster, great for drafts', cost: 3 }, { id: 'high', title: 'High Resolution', desc: 'Best quality, production ready', cost: 6 }].map((opt) => (
                        <button type="button" key={opt.id} onClick={() => setQuality(opt.id as any)} disabled={isGenerating} className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${quality === opt.id ? 'border-neutral-950 bg-neutral-50/50 dark:border-neutral-100 dark:bg-neutral-900/20' : 'border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900/40'}`}>
                          <div className="space-y-0.5"><span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 block">{opt.title}</span><span className="text-[11px] text-neutral-400 dark:text-neutral-500 leading-tight block">{opt.desc}</span></div>
                          <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">{opt.cost} credits</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <Separator className="bg-neutral-100 dark:bg-neutral-900" />
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-neutral-50 dark:bg-neutral-900/30 p-4 rounded-xl">
                <div className="space-y-0.5">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">This generation will use <span className="font-bold text-neutral-800 dark:text-neutral-200">{creditCost} credits</span></p>
                  <p className="text-[11px] text-neutral-400">You have {balance} credits remaining</p>
                </div>
                {isInsufficientCredits && <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-300"><IconAlertCircle className="w-4 h-4 flex-shrink-0" /><span>Not enough credits. Top up to continue.</span></div>}
              </div>
              <div className="pt-2">
                <Button onClick={handleGenerate} disabled={!prompt.trim() || isInsufficientCredits || isGenerating} className="w-full h-11 text-base font-semibold rounded-xl">
                  {isGenerating ? <><IconLoader2 className="w-5 h-5 mr-2 animate-spin" />Generating...</> : <>Generate • {creditCost} credits</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 flex flex-col justify-start">
          <div className="sticky top-6 w-full max-w-lg mx-auto space-y-6">
            {variationJobIds ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Generated Variations</h3>
                  <Button variant="outline" size="xs" onClick={() => setVariationJobIds(null)} className="h-7 text-xs">Back to original</Button>
                </div>
                <div className="grid grid-cols-2 gap-3 aspect-square w-full">
                  {variationJobIds.map((id, i) => <VariationCard key={id} jobId={id} index={i} />)}
                </div>
              </div>
            ) : !jobStatus && !outputUrl && !error ? (
              <div className="flex flex-col items-center justify-center p-12 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 aspect-square w-full">
                <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 text-neutral-400 dark:text-neutral-500 rounded-2xl mb-4"><IconSparkles className="w-10 h-10" /></div>
                <div className="text-center space-y-1"><p className="text-base font-bold text-neutral-700 dark:text-neutral-200">Your image will appear here</p><p className="text-xs text-neutral-400 dark:text-neutral-500">Results stream in as they're generated</p></div>
              </div>
            ) : isGenerating || jobStatus === 'pending' || jobStatus === 'processing' ? (
              <div className="relative flex flex-col items-center justify-center p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-950/20 aspect-square w-full overflow-hidden">
                <div className="space-y-6 w-full max-w-xs z-10">
                  <div className="flex justify-center mb-2"><IconLoader2 className="w-8 h-8 animate-spin text-neutral-400 dark:text-neutral-500" /></div>
                  <div className="space-y-3">
                    {[{ label: 'Preparing your prompt', step: 0 }, { label: 'Applying brand intelligence', step: 1 }, { label: 'Generating with Imagen 4', step: 2 }, { label: 'Finalizing', step: 3 }].map((item) => (
                      <div key={item.step} className="flex items-center space-x-3 text-xs">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${activeStep > item.step ? 'bg-green-500 text-white' : activeStep === item.step ? 'bg-violet-500 text-white animate-pulse' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400'}`}>{activeStep > item.step ? '✓' : item.step + 1}</div>
                        <span className={`font-medium ${activeStep >= item.step ? 'text-neutral-800 dark:text-neutral-200' : 'text-neutral-400'}`}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-center text-neutral-400 dark:text-neutral-500">Usually takes 15-30 seconds</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-red-200 dark:border-red-950/30 bg-red-50/10 aspect-square w-full text-center">
                <div className="p-3 bg-red-50 text-red-500 dark:bg-red-950/20 dark:text-red-400 rounded-xl mb-4"><IconAlertCircle className="w-8 h-8" /></div>
                <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200 mb-1">Generation failed</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mb-4">{error}</p>
                <Button variant="outline" size="sm" onClick={handleGenerate} className="flex items-center gap-1.5"><IconRefresh className="w-4 h-4" /> Try again</Button>
              </div>
            ) : outputUrl ? (
              <div className="space-y-4 w-full">
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-neutral-100 dark:border-neutral-800 shadow-sm bg-neutral-50">
                  <Image src={outputUrl} alt="Generated output" fill sizes="(max-width: 500px) 100vw, 500px" className="object-contain" unoptimized />
                </div>
                <div className="space-y-3.5 bg-neutral-50/50 dark:bg-neutral-900/10 border border-neutral-100 dark:border-neutral-900 p-4 rounded-xl">
                  <div className="grid grid-cols-4 gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleDownload(outputUrl, `generation-${jobId}.png`)} className="flex flex-col sm:flex-row items-center justify-center gap-1 text-[11px] sm:text-xs h-9"><IconDownload className="w-4 h-4" /><span className="hidden sm:inline">Download</span></Button>
                    <Button variant="outline" size="sm" onClick={handleVariations} disabled={isGeneratingVariations || balance < 4} className="flex flex-col sm:flex-row items-center justify-center gap-1 text-[11px] sm:text-xs h-9">{isGeneratingVariations ? <IconLoader2 className="w-4 h-4 animate-spin" /> : <IconCopy className="w-4 h-4" />}<span className="hidden sm:inline">Variations</span></Button>
                    <Button variant="outline" size="sm" onClick={() => toast('Inpainting editing is coming soon!')} className="flex flex-col sm:flex-row items-center justify-center gap-1 text-[11px] sm:text-xs h-9"><IconEdit className="w-4 h-4" /><span className="hidden sm:inline">Edit</span></Button>
                    <Button variant="outline" size="sm" onClick={() => toast.success('Saved to gallery!')} className="flex flex-col sm:flex-row items-center justify-center gap-1 text-[11px] sm:text-xs h-9"><IconDeviceFloppy className="w-4 h-4" /><span className="hidden sm:inline">Save</span></Button>
                  </div>
                  <Separator className="bg-neutral-100 dark:bg-neutral-900" />
                  <div className="space-y-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                    <p className="leading-relaxed">Generated with <span className="font-semibold text-neutral-700 dark:text-neutral-300">Imagen 4</span> • <span className="font-medium">{aspectRatio}</span> • <span className="font-medium">{quality}</span></p>
                    {constructedPrompt && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Constructed prompt</span>
                          <button type="button" onClick={handleCopyPrompt} className="text-[10px] font-semibold text-violet-600 dark:text-violet-400 hover:underline">Copy prompt</button>
                        </div>
                        <p className="text-[11px] leading-relaxed text-neutral-600 dark:text-neutral-400 line-clamp-3">{constructedPrompt}</p>
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

function VariationCard({ jobId, index }: { jobId: string; index: number }) {
  const [status, setStatus] = useState<string>('pending');
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    let es: EventSource;
    let poll: NodeJS.Timeout;

    const start = async () => {
      const token = await getToken();
      if (!token) return;
      es = new EventSource(`${BACKEND}/jobs/${jobId}/stream?_token=${encodeURIComponent(token)}`);
      es.onmessage = (e) => {
        const d = JSON.parse(e.data);
        setStatus(d.status);
        if (d.status === 'completed') { setUrl(d.output_url); es.close(); clearInterval(poll); }
        if (d.status === 'failed') { setError(d.error_message || 'Failed'); es.close(); clearInterval(poll); }
      };
      es.onerror = () => {
        es.close();
        poll = setInterval(async () => {
          const t = await getToken();
          if (!t) return;
          try {
            const job = await getJob(t, jobId);
            setStatus(job.status);
            if (job.status === 'completed') { setUrl(job.output_url ?? null); clearInterval(poll); }
            if (job.status === 'failed') { setError(job.error_message ?? 'Failed'); clearInterval(poll); }
          } catch { /* ignore */ }
        }, 3000);
      };
    };
    start();
    return () => { es?.close(); clearInterval(poll); };
  }, [jobId, getToken]);

  const handleDownload = async (e: React.MouseEvent, targetUrl: string) => {
    e.stopPropagation();
    try {
      const blob = await fetch(targetUrl).then((r) => r.blob());
      const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `variation-${index + 1}.png` });
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch { window.open(targetUrl, '_blank'); }
  };

  return (
    <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 flex flex-col items-center justify-center text-center">
      {status === 'pending' || status === 'processing' ? (
        <div className="flex flex-col items-center space-y-2"><IconLoader2 className="w-5 h-5 animate-spin text-neutral-400" /><span className="text-[10px] font-medium text-neutral-500">{status === 'pending' ? 'Preparing...' : 'Generating...'}</span></div>
      ) : status === 'failed' ? (
        <div className="p-3 text-red-500"><IconAlertCircle className="w-5 h-5 mx-auto mb-1" /><span className="text-[9px] font-medium leading-tight block truncate max-w-[120px]">{error || 'Failed'}</span></div>
      ) : url ? (
        <div className="group relative w-full h-full">
          <Image src={url} alt={`Variation ${index + 1}`} fill sizes="250px" className="object-contain" unoptimized />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button variant="secondary" size="icon-xs" onClick={(e) => handleDownload(e, url)} title="Download"><IconDownload className="w-3.5 h-3.5" /></Button>
            <Button variant="secondary" size="icon-xs" onClick={(e) => { e.stopPropagation(); toast.success('Saved!'); }} title="Save"><IconDeviceFloppy className="w-3.5 h-3.5" /></Button>
          </div>
        </div>
      ) : null}
      <div className="absolute bottom-1 right-1.5 bg-black/50 text-[8px] text-white px-1 py-0.5 rounded font-mono">v{index + 1}</div>
    </div>
  );
}
