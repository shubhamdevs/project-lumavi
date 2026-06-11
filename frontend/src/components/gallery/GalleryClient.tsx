'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';
import {
  IconSearch, IconDownload, IconCopy, IconX,
  IconSparkles, IconPhoto, IconExternalLink, IconCalendar,
  IconCpu
} from '@tabler/icons-react';
import { getWorkspaceAssets } from '@/lib/api';

interface AssetData {
  id: string;
  type: string;
  name: string | null;
  url: string;
  thumbnail_url: string | null;
  created_at: string;
  prompt?: string;
  model_used?: string | null;
  metadata?: any;
}

interface GalleryClientProps {
  workspaceId: string;
}

export default function GalleryClient({ workspaceId }: GalleryClientProps) {
  const { getToken } = useAuth();
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<AssetData | null>(null);

  useEffect(() => {
    let active = true;
    async function loadAssets() {
      try {
        const token = await getToken();
        if (!token) return;
        const res = await getWorkspaceAssets(token, workspaceId);
        if (active) {
          setAssets(res.assets || []);
        }
      } catch (err: any) {
        console.error('Error fetching assets:', err);
        toast.error(err.message || 'Failed to load assets');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    loadAssets();
    return () => {
      active = false;
    };
  }, [getToken, workspaceId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Prompt copied to clipboard!');
  };

  const filteredAssets = assets.filter((asset) => {
    const textToSearch = (asset.prompt || asset.name || '').toLowerCase();
    return textToSearch.includes(searchQuery.toLowerCase());
  });

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent mb-4" />
        <p className="text-sm text-neutral-500 font-medium animate-pulse">Loading gallery assets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200/50 dark:border-neutral-800/50 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 font-syne">
            Brand Gallery
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
            Explore and retrieve your generated visual assets. ({assets.length} total)
          </p>
        </div>

        {/* Search Bar */}
        {assets.length > 0 && (
          <div className="relative w-full md:w-72">
            <IconSearch className="absolute left-3 top-2.5 h-4.5 w-4.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by prompt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 text-neutral-800 dark:text-neutral-200 shadow-xs placeholder-neutral-400"
            />
          </div>
        )}
      </div>

      {/* Main Grid content */}
      {assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white/40 dark:bg-neutral-900/10 min-h-[300px]">
          <div className="p-4 bg-violet-50 dark:bg-violet-950/30 rounded-full mb-4">
            <IconPhoto className="h-8 w-8 text-violet-600 dark:text-violet-400" />
          </div>
          <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">No assets found</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1.5 max-w-sm font-medium">
            You haven't generated any images in this workspace yet. Let's create something beautiful!
          </p>
          <Link
            href="/generate/image"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition duration-150 shadow-md shadow-violet-500/10"
          >
            <IconSparkles className="h-4 w-4" />
            <span>Generate Image</span>
          </Link>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">No assets match your search prompt.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              onClick={() => setSelectedAsset(asset)}
              className="group relative aspect-square rounded-2xl overflow-hidden border border-neutral-200/60 dark:border-neutral-800/60 bg-white dark:bg-neutral-900 shadow-xs cursor-pointer hover:shadow-lg transition-all duration-300"
            >
              {/* Image element */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset.url}
                alt={asset.name || 'Generated Asset'}
                className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />

              {/* Hover overlay detail */}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <p className="text-xs text-white/90 font-medium line-clamp-2 leading-relaxed">
                  {asset.prompt || 'Generated image'}
                </p>
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/10 text-[10px] text-white/60 font-mono">
                  <span>{formatDate(asset.created_at).split(',')[0]}</span>
                  <span className="capitalize">{asset.metadata?.aspect_ratio || '1:1'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed View Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-md transition-all duration-300 animate-fade-in">
          <div className="relative w-full max-w-4xl bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-[80vh]">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedAsset(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-neutral-100/80 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition duration-150 cursor-pointer"
              aria-label="Close modal"
            >
              <IconX className="h-4.5 w-4.5" />
            </button>

            {/* Modal Left - Image Frame */}
            <div className="flex-1 bg-neutral-950 flex items-center justify-center overflow-hidden min-h-[300px] md:min-h-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedAsset.url}
                alt={selectedAsset.name || 'Selected Asset'}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Modal Right - Details & Action Panel */}
            <div className="w-full md:w-[360px] p-6 md:p-8 flex flex-col justify-between overflow-y-auto border-t md:border-t-0 md:border-l border-neutral-100 dark:border-neutral-800 bg-neutral-50/20 dark:bg-neutral-900/20">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-mono">
                    Prompt Details
                  </h3>
                  <p className="mt-2 text-sm text-neutral-800 dark:text-neutral-200 font-medium leading-relaxed bg-white dark:bg-neutral-950 p-4 rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50">
                    {selectedAsset.prompt || 'No prompt info saved.'}
                  </p>
                </div>

                {/* Metadata details table */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-mono">
                    Properties
                  </h4>
                  <div className="space-y-2.5">
                    {selectedAsset.model_used && (
                      <div className="flex items-center gap-2.5 text-xs text-neutral-600 dark:text-neutral-400">
                        <IconCpu className="h-4 w-4 text-neutral-400" />
                        <span className="font-medium">Model:</span>
                        <span className="font-mono bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-[11px]">
                          {selectedAsset.model_used}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2.5 text-xs text-neutral-600 dark:text-neutral-400">
                      <IconCalendar className="h-4 w-4 text-neutral-400" />
                      <span className="font-medium">Generated:</span>
                      <span className="font-medium text-neutral-700 dark:text-neutral-300">
                        {formatDate(selectedAsset.created_at)}
                      </span>
                    </div>
                    {selectedAsset.metadata?.aspect_ratio && (
                      <div className="flex items-center gap-2.5 text-xs text-neutral-600 dark:text-neutral-400">
                        <span className="w-4 text-center font-bold text-[10px] text-neutral-400">AR</span>
                        <span className="font-medium">Aspect Ratio:</span>
                        <span className="font-medium text-neutral-700 dark:text-neutral-300 font-mono">
                          {selectedAsset.metadata.aspect_ratio}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Actions Panel */}
              <div className="mt-8 pt-6 border-t border-neutral-200/60 dark:border-neutral-800/60 flex flex-col gap-3">
                {selectedAsset.prompt && (
                  <button
                    onClick={() => copyToClipboard(selectedAsset.prompt!)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition duration-150 cursor-pointer"
                  >
                    <IconCopy className="h-4 w-4" />
                    <span>Copy Prompt</span>
                  </button>
                )}
                <a
                  href={selectedAsset.url}
                  download={selectedAsset.name || 'generated_image.png'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl text-white bg-violet-600 hover:bg-violet-700 transition duration-150 shadow-md shadow-violet-500/10"
                >
                  <IconDownload className="h-4 w-4" />
                  <span>Download Full Resolution</span>
                </a>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
