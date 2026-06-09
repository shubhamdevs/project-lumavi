'use client';

import React, { useState, useMemo, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  IconChevronDown,
  IconChevronUp,
  IconSparkles,
  IconNews,
  IconCamera,
  IconPackage,
  IconBrush,
  IconLayersIntersect,
  IconUpload,
  IconLoader2,
  IconAlertCircle,
  IconCheck,
} from '@tabler/icons-react';
import { saveBrandSection, uploadBrandLogo } from './actions';

interface BrandIntelligenceClientProps {
  initialData: any;
  workspaceId: string;
}

export default function BrandIntelligenceClient({
  initialData,
  workspaceId,
}: BrandIntelligenceClientProps) {
  // Section states
  const [openSection, setOpenSection] = useState<Record<string, boolean>>({
    visual: true,
    voice: false,
    audience: false,
    logos: false,
  });

  // Main guideline inputs state
  const [primaryColor, setPrimaryColor] = useState(initialData.colors?.primary || '');
  const [secondaryColor, setSecondaryColor] = useState(initialData.colors?.secondary || '');
  const [fontDisplay, setFontDisplay] = useState(initialData.typography?.display || '');
  const [fontBody, setFontBody] = useState(initialData.typography?.body || '');
  const [photographyStyle, setPhotographyStyle] = useState(initialData.photography_style || '');
  const [colorMood, setColorMood] = useState(initialData.color_mood || '');
  const [composition, setComposition] = useState(initialData.composition || '');
  const [lighting, setLighting] = useState(initialData.lighting || '');
  const [tone, setTone] = useState(initialData.tone?.archetype || '');

  // Voice Inputs
  const [keyword1, setKeyword1] = useState(initialData.brand_keywords?.[0] || '');
  const [keyword2, setKeyword2] = useState(initialData.brand_keywords?.[1] || '');
  const [keyword3, setKeyword3] = useState(initialData.brand_keywords?.[2] || '');
  const [brandIsNot, setBrandIsNot] = useState(initialData.brand_is_not || '');

  // Audience
  const [audience, setAudience] = useState(initialData.audience || '');

  // Logos state
  const [logoLight, setLogoLight] = useState(initialData.logos?.light || '');
  const [logoDark, setLogoDark] = useState(initialData.logos?.dark || '');

  // Save states
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState<'light' | 'dark' | null>(null);
  const [currentCompleteness, setCurrentCompleteness] = useState(initialData.completeness || 0);

  // File inputs references
  const lightInputRef = useRef<HTMLInputElement>(null);
  const darkInputRef = useRef<HTMLInputElement>(null);

  // Photographic Styles mapping
  const photographyStyles = [
    { id: 'Editorial', label: 'Editorial', desc: 'Clean, minimal, lots of white space', icon: IconNews },
    { id: 'Lifestyle', label: 'Lifestyle', desc: 'Real people, real moments, warm and candid', icon: IconCamera },
    { id: 'Product', label: 'Product', desc: 'Sharp focus on the product, studio or clean background', icon: IconPackage },
    { id: 'Abstract', label: 'Abstract', desc: 'Conceptual, artistic, mood-driven visuals', icon: IconSparkles },
    { id: 'Illustrated', label: 'Illustrated', desc: 'Graphic, drawn, or design-forward imagery', icon: IconBrush },
    { id: 'Mixed', label: 'Mixed', desc: 'Combination of styles depending on campaign', icon: IconLayersIntersect },
  ];

  // Dynamic client-side completeness score
  const liveScore = useMemo(() => {
    let score = 0;

    // Colors: +15
    if (primaryColor || secondaryColor) {
      score += 15;
    }

    // Typography: +10
    if (fontDisplay || fontBody) {
      score += 10;
    }

    // Photography style: +15
    if (photographyStyle) {
      score += 15;
    }

    // Tone archetype: +10
    if (tone) {
      score += 10;
    }

    // Brand keywords (3+): +15
    const validKeywords = [keyword1, keyword2, keyword3].filter((k) => k.trim().length > 0);
    if (validKeywords.length >= 3) {
      score += 15;
    }

    // Audience: +15
    if (audience.trim().length > 0) {
      score += 15;
    }

    // Color mood: +10
    if (colorMood.trim().length > 0) {
      score += 10;
    }

    // Brand is not: +10
    if (brandIsNot.trim().length > 0) {
      score += 10;
    }

    return score;
  }, [
    primaryColor,
    secondaryColor,
    fontDisplay,
    fontBody,
    photographyStyle,
    tone,
    keyword1,
    keyword2,
    keyword3,
    audience,
    colorMood,
    brandIsNot,
  ]);

  // Completeness score text mapping
  const scoreLabel = useMemo(() => {
    if (liveScore <= 30) return 'Just getting started';
    if (liveScore <= 60) return 'Taking shape';
    if (liveScore <= 85) return 'Looking strong';
    return 'Brand ready';
  }, [liveScore]);

  // Color logic helpers
  const handleColorChange = (key: 'primary' | 'secondary', value: string) => {
    if (key === 'primary') setPrimaryColor(value);
    else setSecondaryColor(value);
  };

  const sanitizeColorForPicker = (color: string, fallback: string) => {
    if (/^#[0-9A-F]{6}$/i.test(color)) {
      return color;
    }
    return fallback;
  };

  // Section saving handlers
  const handleSaveVisual = async () => {
    setSavingSection('visual');
    const response = await saveBrandSection(workspaceId, {
      colors: { primary: primaryColor, secondary: secondaryColor },
      typography: { display: fontDisplay, body: fontBody },
      photography_style: photographyStyle || null,
      color_mood: colorMood || null,
      composition: composition || null,
      lighting: lighting || null,
    });

    setSavingSection(null);
    if (response.success) {
      setCurrentCompleteness(response.completeness ?? 0);
      toast.success('Visual Identity updated successfully!');
    } else {
      toast.error(response.error || 'Failed to update section.');
    }
  };

  const handleSaveVoice = async () => {
    setSavingSection('voice');
    const response = await saveBrandSection(workspaceId, {
      tone: { archetype: tone },
      brand_keywords: [keyword1.trim(), keyword2.trim(), keyword3.trim()],
      brand_is_not: brandIsNot || null,
    });

    setSavingSection(null);
    if (response.success) {
      setCurrentCompleteness(response.completeness ?? 0);
      toast.success('Brand Voice updated successfully!');
    } else {
      toast.error(response.error || 'Failed to update section.');
    }
  };

  const handleSaveAudience = async () => {
    setSavingSection('audience');
    const response = await saveBrandSection(workspaceId, {
      audience: audience || null,
    });

    setSavingSection(null);
    if (response.success) {
      setCurrentCompleteness(response.completeness ?? 0);
      toast.success('Target Audience updated successfully!');
    } else {
      toast.error(response.error || 'Failed to update section.');
    }
  };

  const handleLogoUpload = async (type: 'light' | 'dark', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation checks
    const allowedTypes = ['image/png', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PNG and SVG logos are accepted.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must not exceed 2MB.');
      return;
    }

    setUploadingLogo(type);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await uploadBrandLogo(workspaceId, formData);
    setUploadingLogo(null);

    if (response.success && response.url) {
      setCurrentCompleteness(response.completeness ?? 0);
      if (type === 'light') setLogoLight(response.url);
      else setLogoDark(response.url);
      toast.success(`${type === 'light' ? 'Light' : 'Dark'} logo uploaded successfully!`);
    } else {
      toast.error(response.error || 'Failed to upload logo.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      {/* Page Heading */}
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
          Brand Intelligence
        </h2>
        <p className="text-sm text-neutral-500">
          The more you define here, the more on-brand every generation becomes.
        </p>
      </div>

      {/* Scorecard Widget */}
      <Card className="border border-violet-150 bg-gradient-to-br from-violet-50/20 to-indigo-50/20 dark:from-neutral-900/50 dark:to-neutral-900/10 p-6 rounded-2xl shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest block">
                Completeness Score
              </span>
              <h4 className="text-xl font-bold text-neutral-900 dark:text-white">
                {scoreLabel}
              </h4>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-violet-600 dark:text-violet-400">
                {liveScore}%
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <Progress value={liveScore} className="h-2.5 bg-neutral-200 dark:bg-neutral-800" />
            <div className="flex items-center justify-between text-[11px] text-neutral-400 font-medium pt-1">
              <span>0% Initial setup</span>
              <span>100% Brand prompt ready</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Collapsible Accordion Flow */}
      <div className="space-y-4">
        {/* Section 1 — Visual Identity */}
        <Collapsible
          open={openSection.visual}
          onOpenChange={(val) => setOpenSection((prev) => ({ ...prev, visual: val }))}
        >
          <Card className="border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-all select-none">
                <div className="space-y-0.5">
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    Visual Identity
                    {currentCompleteness >= 40 && (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                        <IconCheck className="w-3.5 h-3.5 mr-0.5" /> Ready
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-neutral-500">Colors, style, lighting, and composition</p>
                </div>
                {openSection.visual ? (
                  <IconChevronUp className="w-5 h-5 text-neutral-400" />
                ) : (
                  <IconChevronDown className="w-5 h-5 text-neutral-400" />
                )}
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <Separator />
              <CardContent className="p-6 space-y-6 bg-white dark:bg-neutral-900">
                {/* Colors Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Primary Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={sanitizeColorForPicker(primaryColor, '#4f46e5')}
                        onChange={(e) => handleColorChange('primary', e.target.value)}
                        className="w-10 h-10 rounded-lg border border-neutral-200 cursor-pointer p-0 bg-transparent flex-shrink-0"
                      />
                      <Input
                        type="text"
                        placeholder="#4F46E5"
                        value={primaryColor}
                        onChange={(e) => handleColorChange('primary', e.target.value)}
                        maxLength={7}
                        className="font-mono transition-all focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Secondary Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={sanitizeColorForPicker(secondaryColor, '#06b6d4')}
                        onChange={(e) => handleColorChange('secondary', e.target.value)}
                        className="w-10 h-10 rounded-lg border border-neutral-200 cursor-pointer p-0 bg-transparent flex-shrink-0"
                      />
                      <Input
                        type="text"
                        placeholder="#06B6D4"
                        value={secondaryColor}
                        onChange={(e) => handleColorChange('secondary', e.target.value)}
                        maxLength={7}
                        className="font-mono transition-all focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Display Font
                    </label>
                    <Input
                      placeholder="e.g. Playfair Display"
                      value={fontDisplay}
                      onChange={(e) => setFontDisplay(e.target.value)}
                      className="transition-all focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Body Font
                    </label>
                    <Input
                      placeholder="e.g. Inter"
                      value={fontBody}
                      onChange={(e) => setFontBody(e.target.value)}
                      className="transition-all focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>

                {/* Photography Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    What best describes your visual style?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                              ? 'border-violet-600 bg-violet-50/50 dark:bg-violet-950/20'
                              : 'border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${isSelected ? 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300' : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'}`}>
                            <IconComponent className="w-5 h-5 flex-shrink-0" />
                          </div>
                          <div className="space-y-0.5">
                            <span className="font-semibold text-sm text-neutral-800 dark:text-neutral-200">
                              {style.label}
                            </span>
                            <p className="text-xs text-neutral-500 leading-tight">
                              {style.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color Mood */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    How would you describe your color palette in words?
                  </label>
                  <Input
                    placeholder="e.g. muted earth tones, warm and desaturated, bold and high contrast"
                    value={colorMood}
                    onChange={(e) => setColorMood(e.target.value)}
                    className="transition-all focus:ring-2 focus:ring-violet-500"
                  />
                  <p className="text-[11px] text-neutral-500">
                    Used directly in image generation prompts.
                  </p>
                </div>

                {/* Composition & Lighting selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Preferred composition style
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
                      Preferred lighting style
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
                    disabled={savingSection === 'visual'}
                    className="bg-violet-600 hover:bg-violet-700 text-white shadow-sm"
                  >
                    {savingSection === 'visual' && (
                      <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Save Visual Identity
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Section 2 — Brand Voice */}
        <Collapsible
          open={openSection.voice}
          onOpenChange={(val) => setOpenSection((prev) => ({ ...prev, voice: val }))}
        >
          <Card className="border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-all select-none">
                <div className="space-y-0.5">
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    Brand Voice
                    {tone && keyword1 && keyword2 && keyword3 && brandIsNot && (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                        <IconCheck className="w-3.5 h-3.5 mr-0.5" /> Ready
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-neutral-500">Tone archetype, attributes, and negative guidelines</p>
                </div>
                {openSection.voice ? (
                  <IconChevronUp className="w-5 h-5 text-neutral-400" />
                ) : (
                  <IconChevronDown className="w-5 h-5 text-neutral-400" />
                )}
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <Separator />
              <CardContent className="p-6 space-y-6 bg-white dark:bg-neutral-900">
                {/* Tone selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Tone Archetype
                  </label>
                  <RadioGroup
                    value={tone}
                    onValueChange={(val) => setTone(val)}
                    className="grid grid-cols-2 sm:grid-cols-5 gap-2"
                  >
                    {['Professional', 'Playful', 'Bold', 'Elegant', 'Friendly'].map((t) => (
                      <label
                        key={t}
                        className={`flex items-center space-x-2 rounded-lg border p-3 hover:bg-neutral-50 dark:hover:bg-neutral-950 transition-all cursor-pointer ${
                          tone === t
                            ? 'border-violet-600 bg-violet-50/50 dark:bg-violet-950/20'
                            : 'border-neutral-200 dark:border-neutral-800'
                        }`}
                      >
                        <RadioGroupItem value={t} id={`voice-tone-${t}`} className="sr-only" />
                        <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                          {t}
                        </span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                {/* Keywords inputs */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    3 words that define your brand
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      placeholder="Word 1"
                      value={keyword1}
                      onChange={(e) => setKeyword1(e.target.value)}
                      className="transition-all focus:ring-2 focus:ring-violet-500"
                    />
                    <Input
                      placeholder="Word 2"
                      value={keyword2}
                      onChange={(e) => setKeyword2(e.target.value)}
                      className="transition-all focus:ring-2 focus:ring-violet-500"
                    />
                    <Input
                      placeholder="Word 3"
                      value={keyword3}
                      onChange={(e) => setKeyword3(e.target.value)}
                      className="transition-all focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>

                {/* Brand is NOT */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Your brand is never...
                  </label>
                  <Input
                    placeholder="e.g. corporate, stock photo, overly formal, cluttered"
                    value={brandIsNot}
                    onChange={(e) => setBrandIsNot(e.target.value)}
                    className="transition-all focus:ring-2 focus:ring-violet-500"
                  />
                  <p className="text-[11px] text-neutral-500">
                    Helps filter out off-brand visual aesthetics.
                  </p>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSaveVoice}
                    disabled={savingSection === 'voice'}
                    className="bg-violet-600 hover:bg-violet-700 text-white shadow-sm"
                  >
                    {savingSection === 'voice' && (
                      <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Save Brand Voice
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Section 3 — Audience Intelligence */}
        <Collapsible
          open={openSection.audience}
          onOpenChange={(val) => setOpenSection((prev) => ({ ...prev, audience: val }))}
        >
          <Card className="border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-all select-none">
                <div className="space-y-0.5">
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    Audience Intelligence
                    {audience.trim() && (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                        <IconCheck className="w-3.5 h-3.5 mr-0.5" /> Ready
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-neutral-500">Target market and audience descriptors</p>
                </div>
                {openSection.audience ? (
                  <IconChevronUp className="w-5 h-5 text-neutral-400" />
                ) : (
                  <IconChevronDown className="w-5 h-5 text-neutral-400" />
                )}
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <Separator />
              <CardContent className="p-6 space-y-4 bg-white dark:bg-neutral-900">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Describe your target audience in one sentence
                    </label>
                    <span className={`text-[10px] font-bold ${audience.length > 200 ? 'text-rose-500' : 'text-neutral-400'}`}>
                      {audience.length}/200
                    </span>
                  </div>
                  <textarea
                    placeholder="e.g. Design-conscious urban professionals aged 25-35 who value sustainability"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value.slice(0, 200))}
                    rows={3}
                    className="flex w-full rounded-md border border-neutral-200 bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-white placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:placeholder:text-neutral-400 dark:focus-visible:ring-violet-500"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSaveAudience}
                    disabled={savingSection === 'audience' || audience.length > 200}
                    className="bg-violet-600 hover:bg-violet-700 text-white shadow-sm"
                  >
                    {savingSection === 'audience' && (
                      <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Save Audience Info
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Section 4 — Logo and Assets */}
        <Collapsible
          open={openSection.logos}
          onOpenChange={(val) => setOpenSection((prev) => ({ ...prev, logos: val }))}
        >
          <Card className="border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-all select-none">
                <div className="space-y-0.5">
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    Logo and Assets
                    {(logoLight || logoDark) && (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                        <IconCheck className="w-3.5 h-3.5 mr-0.5" /> Ready
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-neutral-500">Upload variations of your logo for watermarking</p>
                </div>
                {openSection.logos ? (
                  <IconChevronUp className="w-5 h-5 text-neutral-400" />
                ) : (
                  <IconChevronDown className="w-5 h-5 text-neutral-400" />
                )}
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <Separator />
              <CardContent className="p-6 space-y-6 bg-white dark:bg-neutral-900">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Light Logo Uploader */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 block">
                      Logo (Light background variant)
                    </label>

                    {logoLight ? (
                      <div className="border border-neutral-200 dark:border-neutral-800 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 relative group overflow-hidden flex flex-col items-center justify-center min-h-[140px]">
                        <img
                          src={logoLight}
                          alt="Light logo preview"
                          className="max-h-[80px] object-contain mb-2"
                        />
                        <button
                          type="button"
                          onClick={() => lightInputRef.current?.click()}
                          className="text-xs font-semibold text-violet-600 hover:text-violet-800 cursor-pointer"
                        >
                          Change logo
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => lightInputRef.current?.click()}
                        className="border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl p-6 text-center cursor-pointer hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-all min-h-[140px] flex flex-col items-center justify-center gap-2"
                      >
                        {uploadingLogo === 'light' ? (
                          <IconLoader2 className="w-6 h-6 text-violet-500 animate-spin" />
                        ) : (
                          <>
                            <IconUpload className="w-6 h-6 text-neutral-400" />
                            <div>
                              <span className="text-xs font-semibold text-violet-600 hover:underline">
                                Upload logo
                              </span>
                              <p className="text-[10px] text-neutral-400 mt-0.5">
                                PNG, SVG up to 2MB
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    <input
                      type="file"
                      ref={lightInputRef}
                      className="hidden"
                      accept=".png,.svg"
                      onChange={(e) => handleLogoUpload('light', e)}
                    />
                  </div>

                  {/* Dark Logo Uploader */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 block">
                      Logo (Dark background variant)
                    </label>

                    {logoDark ? (
                      <div className="border border-neutral-200 dark:border-neutral-800 p-4 rounded-xl bg-neutral-950 relative group overflow-hidden flex flex-col items-center justify-center min-h-[140px]">
                        <img
                          src={logoDark}
                          alt="Dark logo preview"
                          className="max-h-[80px] object-contain mb-2 filter brightness-95"
                        />
                        <button
                          type="button"
                          onClick={() => darkInputRef.current?.click()}
                          className="text-xs font-semibold text-violet-400 hover:text-violet-300 cursor-pointer"
                        >
                          Change logo
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => darkInputRef.current?.click()}
                        className="border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl p-6 text-center cursor-pointer hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-all min-h-[140px] flex flex-col items-center justify-center gap-2"
                      >
                        {uploadingLogo === 'dark' ? (
                          <IconLoader2 className="w-6 h-6 text-violet-500 animate-spin" />
                        ) : (
                          <>
                            <IconUpload className="w-6 h-6 text-neutral-400" />
                            <div>
                              <span className="text-xs font-semibold text-violet-600 hover:underline">
                                Upload logo
                              </span>
                              <p className="text-[10px] text-neutral-400 mt-0.5">
                                PNG, SVG up to 2MB
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    <input
                      type="file"
                      ref={darkInputRef}
                      className="hidden"
                      accept=".png,.svg"
                      onChange={(e) => handleLogoUpload('dark', e)}
                    />
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>
    </div>
  );
}
