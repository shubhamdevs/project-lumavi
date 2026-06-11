'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@clerk/nextjs';
import {
  IconPalette,
  IconMessage2,
  IconUsers,
  IconTypography,
  IconChevronDown,
  IconChevronUp,
  IconSparkles,
  IconLoader2,
  IconNews,
  IconCamera,
  IconPackage,
  IconBrush,
  IconLayersIntersect,
} from '@tabler/icons-react';

import LogoUploader from './LogoUploader';
import { saveBrandSection } from '@/lib/api';
import { BrandSignals } from '@/lib/generation/brand-extractor';

interface BrandInitialData {
  completeness?: number;
  logos?: { light?: string; dark?: string };
  colors?: { primary?: string; secondary?: string };
  color_mood?: string;
  photography_style?: string;
  composition?: string;
  lighting?: string;
  tone?: { archetype?: string };
  brand_keywords?: string[];
  brand_is_not?: string;
  brand_personality?: string;
  audience?: string;
  typography?: { display?: string; body?: string; feel?: string };
}

interface BrandHubProps {
  initialData: BrandInitialData;
  workspaceId: string;
}

export default function BrandHub({ initialData, workspaceId }: BrandHubProps) {
  const { getToken } = useAuth();
  const [completeness, setCompleteness] = useState<number>(initialData.completeness || 0);
  const [showAIBanner, setShowAIBanner] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);

  // Collapsible section open state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    visual: true,
    voice: false,
    audience: false,
    typography: false,
  });

  // Section 1: Visual Identity
  const [logoLight, setLogoLight] = useState<string | null>(initialData.logos?.light || null);
  const [logoDark, setLogoDark] = useState<string | null>(initialData.logos?.dark || null);
  const [primaryColor, setPrimaryColor] = useState<string>(initialData.colors?.primary || '');
  const [secondaryColor, setSecondaryColor] = useState<string>(initialData.colors?.secondary || '');
  const [colorMood, setColorMood] = useState<string>(initialData.color_mood || '');
  const [photographyStyle, setPhotographyStyle] = useState<string>(initialData.photography_style || '');
  const [composition, setComposition] = useState<string>(initialData.composition || '');
  const [lighting, setLighting] = useState<string>(initialData.lighting || '');

  // Section 2: Brand Voice
  const [toneArchetype, setToneArchetype] = useState<string>(initialData.tone?.archetype || '');
  const [keyword1, setKeyword1] = useState<string>(initialData.brand_keywords?.[0] || '');
  const [keyword2, setKeyword2] = useState<string>(initialData.brand_keywords?.[1] || '');
  const [keyword3, setKeyword3] = useState<string>(initialData.brand_keywords?.[2] || '');
  const [brandIsNot, setBrandIsNot] = useState<string>(initialData.brand_is_not || '');
  const [brandPersonality, setBrandPersonality] = useState<string>(initialData.brand_personality || '');

  // Section 3: Audience Intelligence
  const [audience, setAudience] = useState<string>(initialData.audience || '');

  // Section 4: Typography
  const [fontDisplay, setFontDisplay] = useState<string>(initialData.typography?.display || '');
  const [fontBody, setFontBody] = useState<string>(initialData.typography?.body || '');
  const [typographyFeel, setTypographyFeel] = useState<string>(initialData.typography?.feel || '');

  // Loading states for saves
  const [isSavingVisual, setIsSavingVisual] = useState(false);
  const [isSavingVoice, setIsSavingVoice] = useState(false);
  const [isSavingAudience, setIsSavingAudience] = useState(false);
  const [isSavingTypography, setIsSavingTypography] = useState(false);

  // Sync color picker inputs
  const handleColorChange = (type: 'primary' | 'secondary', value: string) => {
    if (type === 'primary') setPrimaryColor(value);
    else setSecondaryColor(value);
  };

  const sanitizeColorForPicker = (color: string, fallback: string) => {
    if (/^#[0-9A-F]{6}$/i.test(color)) {
      return color;
    }
    return fallback;
  };

  // Rubric Score Label Details
  const getScoreDetails = (score: number) => {
    if (score <= 30) return { label: 'Just getting started', color: 'text-red-500' };
    if (score <= 60) return { label: 'Taking shape', color: 'text-amber-500' };
    if (score <= 85) return { label: 'Looking strong', color: 'text-blue-500' };
    return { label: 'Brand ready', color: 'text-green-500' };
  };

  const scoreDetails = getScoreDetails(completeness);

  // Field Completion Count Calcs
  const getVisualFilledCount = () => {
    const fields = [
      logoLight,
      logoDark,
      primaryColor,
      secondaryColor,
      colorMood,
      photographyStyle,
      composition,
      lighting,
    ];
    return fields.filter((f) => f && typeof f === 'string' && f.trim() !== '').length;
  };

  const getVoiceFilledCount = () => {
    const fields = [
      toneArchetype,
      (keyword1 && keyword2 && keyword3) ? 'has_keywords' : null,
      brandIsNot,
      brandPersonality,
    ];
    return fields.filter((f) => f && typeof f === 'string' && f.trim() !== '').length;
  };

  const getAudienceFilledCount = () => {
    return audience && audience.trim() !== '' ? 1 : 0;
  };

  const getTypographyFilledCount = () => {
    const fields = [fontDisplay, fontBody, typographyFeel];
    return fields.filter((f) => f && typeof f === 'string' && f.trim() !== '').length;
  };

  const handleAnalysisComplete = (signals: Partial<BrandSignals>) => {
    if (signals.colorMood) setColorMood(signals.colorMood);
    if (signals.photographyStyle) setPhotographyStyle(signals.photographyStyle);
    if (signals.brandIsNot) setBrandIsNot(signals.brandIsNot);
    if (signals.brandPersonality) setBrandPersonality(signals.brandPersonality);
    if (signals.typographyFeel) setTypographyFeel(signals.typographyFeel);

    // Expand all sections where signals were extracted so they are visible
    setOpenSections({
      visual: true,
      voice: true,
      audience: true,
      typography: true,
    });

    setShowAIBanner(true);
    setIsHighlighted(true);

    // Turn off highlights after 3 seconds
    setTimeout(() => {
      setIsHighlighted(false);
    }, 3000);
  };

  // Save Actions
  const handleSaveVisual = async () => {
    const token = await getToken();
    if (!token) { toast.error('Not authenticated'); return; }
    setIsSavingVisual(true);
    try {
      const result = await saveBrandSection(token, workspaceId, 'visual', {
        colors: { primary: primaryColor, secondary: secondaryColor },
        color_mood: colorMood,
        photography_style: photographyStyle,
        composition,
        lighting,
      });
      setCompleteness(result.completeness ?? completeness);
      toast.success('Visual identity saved successfully');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to save visual identity');
    } finally {
      setIsSavingVisual(false);
    }
  };

  const handleSaveVoice = async () => {
    const token = await getToken();
    if (!token) { toast.error('Not authenticated'); return; }
    setIsSavingVoice(true);
    try {
      const result = await saveBrandSection(token, workspaceId, 'voice', {
        tone: { archetype: toneArchetype },
        brand_keywords: [keyword1.trim(), keyword2.trim(), keyword3.trim()].filter(Boolean),
        brand_is_not: brandIsNot,
        brand_personality: brandPersonality,
      });
      setCompleteness(result.completeness ?? completeness);
      toast.success('Brand voice saved successfully');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to save brand voice');
    } finally {
      setIsSavingVoice(false);
    }
  };

  const handleSaveAudience = async () => {
    const token = await getToken();
    if (!token) { toast.error('Not authenticated'); return; }
    setIsSavingAudience(true);
    try {
      const result = await saveBrandSection(token, workspaceId, 'audience', { audience });
      setCompleteness(result.completeness ?? completeness);
      toast.success('Audience intelligence saved successfully');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to save audience intelligence');
    } finally {
      setIsSavingAudience(false);
    }
  };

  const handleSaveTypography = async () => {
    const token = await getToken();
    if (!token) { toast.error('Not authenticated'); return; }
    setIsSavingTypography(true);
    try {
      const result = await saveBrandSection(token, workspaceId, 'typography', {
        typography: { display: fontDisplay, body: fontBody, feel: typographyFeel },
      });
      setCompleteness(result.completeness ?? completeness);
      toast.success('Typography guidelines saved successfully');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to save typography guidelines');
    } finally {
      setIsSavingTypography(false);
    }
  };

  // Photography styles catalog for selectors
  const photographyStyles = [
    { id: 'Editorial', label: 'Editorial', desc: 'Clean, editorial composition', icon: IconNews },
    { id: 'Lifestyle', label: 'Lifestyle', desc: 'Candid, warm, personal moments', icon: IconCamera },
    { id: 'Product', label: 'Product', desc: 'Sharp studio showcase', icon: IconPackage },
    { id: 'Abstract', label: 'Abstract', desc: 'Creative, conceptual themes', icon: IconSparkles },
    { id: 'Illustrated', label: 'Illustrated', desc: 'Graphic, design-forward art', icon: IconBrush },
    { id: 'Mixed', label: 'Mixed', desc: 'Blend of various visual styles', icon: IconLayersIntersect },
  ];

  const highlightClass = isHighlighted
    ? 'border-blue-400 ring-2 ring-blue-100 dark:ring-blue-900/30 transition-all duration-300'
    : 'transition-all duration-300';

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Title section */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Brand Intelligence
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          The more complete your brand profile, the more on-brand every generation becomes.
        </p>
      </div>

      {/* Scorecard Widget */}
      <Card className="border border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-neutral-50/50 to-neutral-100/30 dark:from-neutral-900/40 dark:to-neutral-900/10 p-6 rounded-2xl shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">
                Completeness scorecard
              </span>
              <h2 className={`text-xl font-bold ${scoreDetails.color}`}>
                {scoreDetails.label}
              </h2>
            </div>
            <div className="text-right">
              <span className={`text-3xl font-extrabold ${scoreDetails.color}`}>
                {completeness}%
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <Progress value={completeness} className="h-2.5 bg-neutral-200 dark:bg-neutral-800" />
            <div className="flex items-center justify-between text-[11px] text-neutral-400 dark:text-neutral-500 font-medium pt-1">
              <span>0% Initial setup</span>
              <span>100% Brand ready</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Sections Accordion */}
      <div className="space-y-4">
        {/* Section 1 — Visual Identity */}
        <Collapsible
          open={openSections.visual}
          onOpenChange={(val) => setOpenSections((prev) => ({ ...prev, visual: val }))}
        >
          <Card className="border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-all select-none">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-600 dark:text-neutral-300">
                    <IconPalette className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
                      Visual Identity
                    </h3>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">
                      Logos, brand colors, composition, and visual lighting styles
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">
                    {getVisualFilledCount()}/8 fields filled
                  </span>
                  {openSections.visual ? (
                    <IconChevronUp className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <IconChevronDown className="w-4 h-4 text-neutral-400" />
                  )}
                </div>
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <Separator className="bg-neutral-150 dark:bg-neutral-800" />
              <CardContent className="p-6 space-y-6 bg-white dark:bg-neutral-950">
                {/* AI Extracted Banner */}
                {showAIBanner && (
                  <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-3 dark:bg-blue-950/20 dark:border-blue-900/40 dark:text-blue-300">
                    <IconSparkles className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs">
                      Brand signals extracted from your logo. Review and adjust below.
                    </p>
                  </div>
                )}

                {/* Logo Uploaders */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Logo on light background
                    </label>
                    <LogoUploader
                      workspaceId={workspaceId}
                      currentLogoUrl={logoLight}
                      variant="light"
                      onUploadComplete={(url, newScore) => {
                        setLogoLight(url);
                        setCompleteness(newScore);
                      }}
                      onAnalysisComplete={(signals) => {
                        handleAnalysisComplete(signals);
                      }}
                    />
                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                      Upload to auto-extract your brand signals with AI
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Logo on dark background
                    </label>
                    <LogoUploader
                      workspaceId={workspaceId}
                      currentLogoUrl={logoDark}
                      variant="dark"
                      onUploadComplete={(url, newScore) => {
                        setLogoDark(url);
                        setCompleteness(newScore);
                      }}
                      onAnalysisComplete={() => {}}
                    />
                  </div>
                </div>

                <Separator className="bg-neutral-100 dark:bg-neutral-900" />

                {/* Brand Colors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Primary color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={sanitizeColorForPicker(primaryColor, '#000000')}
                        onChange={(e) => handleColorChange('primary', e.target.value)}
                        className="w-10 h-10 rounded-lg border border-neutral-200 dark:border-neutral-800 cursor-pointer p-0 bg-transparent flex-shrink-0"
                      />
                      <Input
                        type="text"
                        placeholder="#000000"
                        value={primaryColor}
                        onChange={(e) => handleColorChange('primary', e.target.value)}
                        maxLength={7}
                        className="font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Secondary color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={sanitizeColorForPicker(secondaryColor, '#ffffff')}
                        onChange={(e) => handleColorChange('secondary', e.target.value)}
                        className="w-10 h-10 rounded-lg border border-neutral-200 dark:border-neutral-800 cursor-pointer p-0 bg-transparent flex-shrink-0"
                      />
                      <Input
                        type="text"
                        placeholder="#FFFFFF"
                        value={secondaryColor}
                        onChange={(e) => handleColorChange('secondary', e.target.value)}
                        maxLength={7}
                        className="font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Color Mood */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Color palette description
                  </label>
                  <Input
                    placeholder="e.g. muted earth tones, warm and desaturated"
                    value={colorMood}
                    onChange={(e) => setColorMood(e.target.value)}
                    className={highlightClass}
                  />
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                    Used directly in image generation prompts
                  </p>
                </div>

                {/* Photography Style */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Photography style
                  </label>
                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 p-1 rounded-xl ${isHighlighted ? 'ring-2 ring-blue-100 dark:ring-blue-900/30' : ''}`}>
                    {photographyStyles.map((style) => {
                      const IconComponent = style.icon;
                      const isSelected = photographyStyle === style.id;
                      return (
                        <button
                          type="button"
                          key={style.id}
                          onClick={() => setPhotographyStyle(style.id)}
                          className={`flex items-start gap-3 p-3 text-left rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-neutral-900 bg-neutral-50/50 dark:border-neutral-100 dark:bg-neutral-900/20'
                              : 'border-neutral-200 hover:bg-neutral-50 dark:border-neutral-850 dark:hover:bg-neutral-900/40'
                          }`}
                        >
                          <div
                            className={`p-2 rounded-lg ${
                              isSelected
                                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                                : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
                            }`}
                          >
                            <IconComponent className="w-5 h-5 flex-shrink-0" />
                          </div>
                          <div className="space-y-0.5">
                            <span className="font-semibold text-sm text-neutral-800 dark:text-neutral-200">
                              {style.label}
                            </span>
                            <p className="text-xs text-neutral-400 dark:text-neutral-500 leading-tight">
                              {style.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Composition & Lighting selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Composition preference
                    </label>
                    <Select value={composition} onValueChange={(val) => setComposition(val)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select composition" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          'Centered subject',
                          'Rule of thirds',
                          'Minimal and spacious',
                          'Full-bleed immersive',
                          'Flat lay overhead',
                          'Close-up detail',
                        ].map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Lighting preference
                    </label>
                    <Select value={lighting} onValueChange={(val) => setLighting(val)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select lighting" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          'Soft natural light',
                          'Bright studio',
                          'Golden hour warm',
                          'Dramatic high contrast',
                          'Dark and moody',
                          'Clean artificial',
                        ].map((l) => (
                          <SelectItem key={l} value={l}>
                            {l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSaveVisual}
                    disabled={isSavingVisual}
                    className="shadow-sm"
                  >
                    {isSavingVisual && (
                      <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Save visual identity
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Section 2 — Brand Voice */}
        <Collapsible
          open={openSections.voice}
          onOpenChange={(val) => setOpenSections((prev) => ({ ...prev, voice: val }))}
        >
          <Card className="border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-all select-none">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-600 dark:text-neutral-300">
                    <IconMessage2 className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
                      Brand Voice
                    </h3>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">
                      Tone archetype, definition keywords, and personality traits
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">
                    {getVoiceFilledCount()}/4 fields filled
                  </span>
                  {openSections.voice ? (
                    <IconChevronUp className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <IconChevronDown className="w-4 h-4 text-neutral-400" />
                  )}
                </div>
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <Separator className="bg-neutral-100 dark:bg-neutral-900" />
              <CardContent className="p-6 space-y-6 bg-white dark:bg-neutral-950">
                {/* Tone Archetype */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block">
                    Tone archetype
                  </label>
                  <RadioGroup
                    value={toneArchetype}
                    onValueChange={(val) => setToneArchetype(val)}
                    className="grid grid-cols-2 sm:grid-cols-3 gap-2"
                  >
                    {['Professional', 'Playful', 'Bold', 'Elegant', 'Friendly', 'Minimalist'].map(
                      (t) => (
                        <label
                          key={t}
                          className={`flex items-center space-x-2 rounded-lg border p-3 hover:bg-neutral-50 dark:hover:bg-neutral-900/20 transition-all cursor-pointer ${
                            toneArchetype === t
                              ? 'border-neutral-900 bg-neutral-50/40 dark:border-neutral-100 dark:bg-neutral-900/10 font-medium'
                              : 'border-neutral-200 dark:border-neutral-800'
                          }`}
                        >
                          <RadioGroupItem value={t} id={`tone-${t}`} className="sr-only" />
                          <span className="text-sm text-neutral-800 dark:text-neutral-200">
                            {t}
                          </span>
                        </label>
                      )
                    )}
                  </RadioGroup>
                </div>

                {/* Brand Keywords */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    3 words that define your brand
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      placeholder="Word 1"
                      value={keyword1}
                      onChange={(e) => setKeyword1(e.target.value)}
                    />
                    <Input
                      placeholder="Word 2"
                      value={keyword2}
                      onChange={(e) => setKeyword2(e.target.value)}
                    />
                    <Input
                      placeholder="Word 3"
                      value={keyword3}
                      onChange={(e) => setKeyword3(e.target.value)}
                    />
                  </div>
                </div>

                {/* Brand Is NOT */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Your brand is never...
                  </label>
                  <Input
                    placeholder="e.g. corporate, stock photo, overly formal"
                    value={brandIsNot}
                    onChange={(e) => setBrandIsNot(e.target.value)}
                    className={highlightClass}
                  />
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                    Critical for preventing off-brand AI outputs
                  </p>
                </div>

                {/* Brand Personality */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Brand personality in one sentence
                    </label>
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                      {brandPersonality.length}/200
                    </span>
                  </div>
                  <Textarea
                    placeholder="e.g. A confident, approachable brand that values clarity"
                    value={brandPersonality}
                    onChange={(e) => setBrandPersonality(e.target.value.slice(0, 200))}
                    className={highlightClass}
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSaveVoice}
                    disabled={isSavingVoice}
                    className="shadow-sm"
                  >
                    {isSavingVoice && (
                      <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Save brand voice
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Section 3 — Audience Intelligence */}
        <Collapsible
          open={openSections.audience}
          onOpenChange={(val) => setOpenSections((prev) => ({ ...prev, audience: val }))}
        >
          <Card className="border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-all select-none">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-600 dark:text-neutral-300">
                    <IconUsers className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
                      Audience Intelligence
                    </h3>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">
                      Describe your core market, demographics, and descriptors
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">
                    {getAudienceFilledCount()}/1 fields filled
                  </span>
                  {openSections.audience ? (
                    <IconChevronUp className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <IconChevronDown className="w-4 h-4 text-neutral-400" />
                  )}
                </div>
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <Separator className="bg-neutral-100 dark:bg-neutral-900" />
              <CardContent className="p-6 space-y-4 bg-white dark:bg-neutral-950">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Describe your target audience
                    </label>
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                      {audience.length}/300
                    </span>
                  </div>
                  <Textarea
                    placeholder="e.g. Design-conscious urban professionals aged 25-35 who value sustainability and minimal aesthetics"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value.slice(0, 300))}
                    rows={4}
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSaveAudience}
                    disabled={isSavingAudience}
                    className="shadow-sm"
                  >
                    {isSavingAudience && (
                      <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Save audience info
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Section 4 — Typography */}
        <Collapsible
          open={openSections.typography}
          onOpenChange={(val) => setOpenSections((prev) => ({ ...prev, typography: val }))}
        >
          <Card className="border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-all select-none">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-600 dark:text-neutral-300">
                    <IconTypography className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
                      Typography
                    </h3>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">
                      Headline display fonts, body fonts, and overall typographic feels
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">
                    {getTypographyFilledCount()}/3 fields filled
                  </span>
                  {openSections.typography ? (
                    <IconChevronUp className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <IconChevronDown className="w-4 h-4 text-neutral-400" />
                  )}
                </div>
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <Separator className="bg-neutral-100 dark:bg-neutral-900" />
              <CardContent className="p-6 space-y-6 bg-white dark:bg-neutral-950">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Display font
                    </label>
                    <Input
                      placeholder="e.g. Playfair Display"
                      value={fontDisplay}
                      onChange={(e) => setFontDisplay(e.target.value)}
                    />
                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                      Used for headlines in generated content
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Body font
                    </label>
                    <Input
                      placeholder="e.g. Inter"
                      value={fontBody}
                      onChange={(e) => setFontBody(e.target.value)}
                    />
                  </div>
                </div>

                {/* Typography Feel */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Typography feel
                  </label>
                  <Input
                    placeholder="e.g. clean geometric sans-serif, authoritative"
                    value={typographyFeel}
                    onChange={(e) => setTypographyFeel(e.target.value)}
                    className={highlightClass}
                  />
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                    Describes the typographic personality for generation context
                  </p>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSaveTypography}
                    disabled={isSavingTypography}
                    className="shadow-sm"
                  >
                    {isSavingTypography && (
                      <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Save typography guidelines
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>
    </div>
  );
}
