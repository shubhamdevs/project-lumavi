'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  IconNews,
  IconCamera,
  IconPackage,
  IconSparkles,
  IconBrush,
  IconLayersIntersect,
} from '@tabler/icons-react';

interface StepBrandProps {
  data: {
    brand: {
      primaryColor: string;
      secondaryColor: string;
      fontDisplay: string;
      fontBody: string;
      tone: string;
      photographyStyle: string;
      brandIsNot: string;
    };
  };
  updateData: (updater: (prev: any) => any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepBrand({
  data,
  updateData,
  onNext,
  onBack,
}: StepBrandProps) {
  const tones = ['Professional', 'Playful', 'Bold', 'Elegant', 'Friendly'];

  const photographyStyles = [
    { id: 'Editorial', label: 'Editorial', desc: 'Clean, minimal, lots of white space', icon: IconNews },
    { id: 'Lifestyle', label: 'Lifestyle', desc: 'Real people, real moments, warm and candid', icon: IconCamera },
    { id: 'Product', label: 'Product', desc: 'Sharp focus on the product, studio or clean background', icon: IconPackage },
    { id: 'Abstract', label: 'Abstract', desc: 'Conceptual, artistic, mood-driven visuals', icon: IconSparkles },
    { id: 'Illustrated', label: 'Illustrated', desc: 'Graphic, drawn, or design-forward imagery', icon: IconBrush },
    { id: 'Mixed', label: 'Mixed', desc: 'Combination of styles depending on campaign', icon: IconLayersIntersect },
  ];

  const handleColorChange = (key: 'primaryColor' | 'secondaryColor', value: string) => {
    updateData((prev) => ({
      ...prev,
      brand: {
        ...prev.brand,
        [key]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const sanitizeColorForPicker = (color: string, fallback: string) => {
    if (/^#[0-9A-F]{6}$/i.test(color)) {
      return color;
    }
    return fallback;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Brand quick setup
          </h2>
          <button
            type="button"
            onClick={onNext}
            className="text-sm font-semibold text-violet-600 hover:text-violet-800 transition-colors cursor-pointer"
          >
            Skip for now
          </button>
        </div>
        <p className="text-sm text-neutral-500">
          Establish your brand colors, fonts, and core messaging tone.
        </p>
      </div>

      <div className="space-y-5">
        {/* Colors Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Primary Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={sanitizeColorForPicker(data.brand.primaryColor, '#4f46e5')}
                onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                className="w-10 h-10 rounded-lg border border-neutral-200 cursor-pointer p-0 bg-transparent flex-shrink-0"
              />
              <Input
                type="text"
                placeholder="#4F46E5"
                value={data.brand.primaryColor}
                onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                maxLength={7}
                className="font-mono transition-all focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Secondary Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={sanitizeColorForPicker(data.brand.secondaryColor, '#06b6d4')}
                onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                className="w-10 h-10 rounded-lg border border-neutral-200 cursor-pointer p-0 bg-transparent flex-shrink-0"
              />
              <Input
                type="text"
                placeholder="#06B6D4"
                value={data.brand.secondaryColor}
                onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                maxLength={7}
                className="font-mono transition-all focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>
        </div>

        {/* Fonts Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Display Font
            </label>
            <Input
              placeholder="e.g. Playfair Display"
              value={data.brand.fontDisplay}
              onChange={(e) =>
                updateData((prev) => ({
                  ...prev,
                  brand: { ...prev.brand, fontDisplay: e.target.value },
                }))
              }
              className="transition-all focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Body Font
            </label>
            <Input
              placeholder="e.g. Inter"
              value={data.brand.fontBody}
              onChange={(e) =>
                updateData((prev) => ({
                  ...prev,
                  brand: { ...prev.brand, fontBody: e.target.value },
                }))
              }
              className="transition-all focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        {/* Brand Tone Radio Group */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Brand Tone
          </label>
          <RadioGroup
            value={data.brand.tone}
            onValueChange={(val) =>
              updateData((prev) => ({
                ...prev,
                brand: { ...prev.brand, tone: val },
              }))
            }
            className="grid grid-cols-2 sm:grid-cols-3 gap-2"
          >
            {tones.map((tone) => (
              <label
                key={tone}
                className={`flex items-center space-x-2 rounded-lg border p-3 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all cursor-pointer ${
                  data.brand.tone === tone
                    ? 'border-violet-600 bg-violet-50/50 dark:bg-violet-950/20'
                    : 'border-neutral-200 dark:border-neutral-800'
                }`}
              >
                <RadioGroupItem value={tone} id={`tone-${tone}`} className="sr-only" />
                <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  {tone}
                </span>
              </label>
            ))}
          </RadioGroup>
        </div>

        {/* Photography Style Grid */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            What best describes your visual style?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {photographyStyles.map((style) => {
              const IconComponent = style.icon;
              const isSelected = data.brand.photographyStyle === style.id;
              return (
                <button
                  type="button"
                  key={style.id}
                  onClick={() =>
                    updateData((prev) => ({
                      ...prev,
                      brand: { ...prev.brand, photographyStyle: style.id },
                    }))
                  }
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

        {/* Brand is NOT Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Your brand is never...
          </label>
          <Input
            placeholder="e.g. corporate, stock photo, overly formal, cluttered"
            value={data.brand.brandIsNot}
            onChange={(e) =>
              updateData((prev) => ({
                ...prev,
                brand: { ...prev.brand, brandIsNot: e.target.value },
              }))
            }
            className="transition-all focus:ring-2 focus:ring-violet-500"
          />
          <p className="text-[11px] text-neutral-500">
            This helps the AI avoid generating off-brand content.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1 font-medium transition-all"
        >
          Back
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-medium shadow-md transition-all duration-200"
        >
          Continue
        </Button>
      </div>
    </form>
  );
}
