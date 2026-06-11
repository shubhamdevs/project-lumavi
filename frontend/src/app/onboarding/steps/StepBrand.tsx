'use client';

import React from 'react';
import type { UpdateDataFn } from '../types';
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
  IconCube,
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
      imageryStyle: string;
      colorMood: string;
      brandKeywords: string[];
      audience: string;
      lighting: string;
      composition: string;
    };
  };
  updateData: UpdateDataFn;
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

  const imageryStyles = [
    { id: 'Photography', label: 'Photography', desc: 'Camera lens, real-life scenes and products', icon: IconCamera },
    { id: '3D Render', label: '3D Render', desc: 'CGI, octane render, stylized or clay 3D', icon: IconCube },
    { id: 'Illustration', label: 'Illustration', desc: 'Digital painting, flat vector art, drawings', icon: IconBrush },
  ];

  const photographyStyles = [
    { id: 'Editorial', label: 'Editorial', desc: 'Clean, minimal, lots of white space', icon: IconNews },
    { id: 'Lifestyle', label: 'Lifestyle', desc: 'Real people, real moments, warm and candid', icon: IconCamera },
    { id: 'Product', label: 'Product', desc: 'Sharp focus on the product, studio background', icon: IconPackage },
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

  const handleKeywordChange = (index: number, value: string) => {
    updateData((prev) => {
      const newKeywords = [...(prev.brand.brandKeywords || ['', '', ''])];
      newKeywords[index] = value;
      return {
        ...prev,
        brand: {
          ...prev.brand,
          brandKeywords: newKeywords,
        },
      };
    });
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

  const currentKeywords = data.brand.brandKeywords || ['', '', ''];

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
          Establish your brand colors, fonts, visual guidelines, and core messaging.
        </p>
      </div>

      <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
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

        {/* Imagery Style Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Imagery Style
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {imageryStyles.map((style) => {
              const IconComponent = style.icon;
              const isSelected = (data.brand.imageryStyle || 'Photography') === style.id;
              return (
                <button
                  type="button"
                  key={style.id}
                  onClick={() =>
                    updateData((prev) => ({
                      ...prev,
                      brand: { ...prev.brand, imageryStyle: style.id },
                    }))
                  }
                  className={`flex flex-col items-center justify-center p-3 text-center rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-violet-600 bg-violet-50/50 dark:bg-violet-950/20'
                      : 'border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900'
                  }`}
                >
                  <div className={`p-2 rounded-lg mb-2 ${isSelected ? 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300' : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'}`}>
                    <IconComponent className="w-5 h-5 flex-shrink-0" />
                  </div>
                  <span className="font-semibold text-sm text-neutral-800 dark:text-neutral-200 block mb-0.5">
                    {style.label}
                  </span>
                  <p className="text-[10px] text-neutral-400 leading-tight">
                    {style.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Photography Style Grid (Only shown if Imagery Style is Photography) */}
        {(data.brand.imageryStyle === 'Photography' || !data.brand.imageryStyle) && (
          <div className="space-y-2 border-t pt-4 border-neutral-100 dark:border-neutral-800">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              What best describes your photography style?
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
        )}

        {/* Color Mood / Palette description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            How would you describe your color palette in words?
          </label>
          <Input
            placeholder="e.g. muted earth tones, warm and desaturated, bold and high contrast"
            value={data.brand.colorMood}
            onChange={(e) =>
              updateData((prev) => ({
                ...prev,
                brand: { ...prev.brand, colorMood: e.target.value },
              }))
            }
            className="transition-all focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {/* Brand Tone Radio Group */}
        <div className="space-y-2 border-t pt-4 border-neutral-100 dark:border-neutral-800">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Brand Tone Archetype
          </label>
          <RadioGroup
            value={data.brand.tone}
            onValueChange={(val) =>
              updateData((prev) => ({
                ...prev,
                brand: { ...prev.brand, tone: val },
              }))
            }
            className="grid grid-cols-2 sm:grid-cols-5 gap-2"
          >
            {tones.map((tone) => (
              <label
                key={tone}
                className={`flex items-center justify-center text-center space-x-2 rounded-lg border p-3 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all cursor-pointer ${
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

        {/* 3 words that define your brand */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            3 words that define your brand
          </label>
          <div className="grid grid-cols-3 gap-3">
            <Input
              placeholder="Word 1"
              value={currentKeywords[0] || ''}
              onChange={(e) => handleKeywordChange(0, e.target.value)}
              className="transition-all focus:ring-2 focus:ring-violet-500"
            />
            <Input
              placeholder="Word 2"
              value={currentKeywords[1] || ''}
              onChange={(e) => handleKeywordChange(1, e.target.value)}
              className="transition-all focus:ring-2 focus:ring-violet-500"
            />
            <Input
              placeholder="Word 3"
              value={currentKeywords[2] || ''}
              onChange={(e) => handleKeywordChange(2, e.target.value)}
              className="transition-all focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        {/* Target Audience Description */}
        <div className="space-y-2 border-t pt-4 border-neutral-100 dark:border-neutral-800">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Target Audience
          </label>
          <textarea
            placeholder="e.g. Design-conscious urban professionals aged 25-35 who value sustainability"
            value={data.brand.audience}
            onChange={(e) =>
              updateData((prev) => ({
                ...prev,
                brand: { ...prev.brand, audience: e.target.value.slice(0, 200) },
              }))
            }
            rows={2}
            className="flex w-full rounded-md border border-neutral-200 bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-white placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:placeholder:text-neutral-400 dark:focus-visible:ring-violet-500"
          />
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
