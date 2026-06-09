'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { IconUpload, IconLoader2, IconCheck, IconAlertCircle } from '@tabler/icons-react';
import { uploadBrandLogo } from '@/app/actions/brand';
import { BrandSignals } from '@/lib/generation/brand-extractor';

interface LogoUploaderProps {
  workspaceId: string;
  currentLogoUrl: string | null;
  variant: 'light' | 'dark';
  onAnalysisComplete: (signals: Partial<BrandSignals>) => void;
}

export default function LogoUploader({
  workspaceId,
  currentLogoUrl,
  variant,
  onAnalysisComplete,
}: LogoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const triggerInputClick = () => {
    fileInputRef.current?.click();
  };

  const processFile = async (file: File) => {
    const allowedTypes = ['image/png', 'image/svg+xml', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PNG, SVG, and JPEG logos are accepted.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must not exceed 2MB.');
      return;
    }

    setSelectedFile(file);
    setIsUploading(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.readAsDataURL(file);
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = (err) => reject(err);
      });

      const base64Data = await base64Promise;
      const extension = file.name.split('.').pop() || 'png';

      // 1. Upload logo to Supabase Storage
      const response = await uploadBrandLogo(
        workspaceId,
        variant,
        base64Data,
        file.type,
        extension
      );

      setIsUploading(false);

      if (!response.success || !response.url) {
        toast.error(response.error || 'Failed to upload logo.');
        return;
      }

      toast.success(`${variant === 'light' ? 'Light' : 'Dark'} logo uploaded successfully!`);

      // 2. Only if light background variant, call Gemini Vision
      if (variant === 'light') {
        setIsAnalyzing(true);
        toast('Analyzing your brand signals...', { icon: <IconLoader2 className="animate-spin text-blue-500" /> });

        const analyzeResponse = await fetch('/api/brand/analyze-logo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            logoBase64: base64Data,
            mimeType: file.type,
          }),
        });

        const analyzeData = await analyzeResponse.json();
        setIsAnalyzing(false);

        if (analyzeData.success && analyzeData.signals) {
          onAnalysisComplete(analyzeData.signals);
          toast.success('Brand signals extracted from your logo');
        } else {
          toast.error(analyzeData.error || 'Failed to extract brand signals.');
        }
      }
    } catch (err: any) {
      setIsUploading(false);
      setIsAnalyzing(false);
      toast.error(err?.message || 'An error occurred during upload.');
    }
  };

  return (
    <div className="space-y-3">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerInputClick}
        className={`relative flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer select-none ${
          dragActive
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/10'
            : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".png,.svg,.jpg,.jpeg"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading || isAnalyzing}
        />

        {isUploading || isAnalyzing ? (
          <div className="flex flex-col items-center space-y-2 text-center">
            <IconLoader2 className="w-8 h-8 animate-spin text-neutral-400 dark:text-neutral-500" />
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
              {isUploading ? 'Uploading...' : 'Analyzing your brand...'}
            </p>
          </div>
        ) : currentLogoUrl ? (
          <div className="flex flex-col items-center space-y-4 w-full">
            <div
              className={`p-6 rounded-lg w-full max-w-[200px] flex items-center justify-center border border-neutral-150 shadow-sm ${
                variant === 'light'
                  ? 'bg-white text-neutral-900'
                  : 'bg-neutral-900 border-neutral-800 text-white'
              }`}
            >
              <div className="relative w-28 h-14">
                <Image
                  src={currentLogoUrl}
                  alt={`${variant} logo`}
                  fill
                  sizes="(max-w-200px) 100vw"
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-green-600 dark:text-green-400 font-medium">
              <IconCheck className="w-4 h-4" />
              <span>Logo active</span>
            </div>
            <span className="text-[11px] text-neutral-400 hover:underline">
              Drag or click to replace
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-500 dark:text-neutral-400">
              <IconUpload className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                Click to upload, or drag and drop
              </p>
              <p className="text-xs text-neutral-400">
                PNG, SVG, or JPEG up to 2MB
              </p>
            </div>
          </div>
        )}

        {selectedFile && (isUploading || isAnalyzing) && (
          <div className="absolute bottom-2 left-2 right-2 text-center text-[10px] text-neutral-400 truncate">
            {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </div>
        )}
      </div>
    </div>
  );
}
