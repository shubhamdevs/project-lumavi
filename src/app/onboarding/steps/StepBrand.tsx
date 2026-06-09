'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface StepBrandProps {
  data: {
    brand: {
      primaryColor: string;
      secondaryColor: string;
      fontDisplay: string;
      fontBody: string;
      tone: string;
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

  // Helper to ensure color has '#' prefix for the input[type=color]
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
            className="text-sm font-semibold text-violet-600 hover:text-violet-800 transition-colors"
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
