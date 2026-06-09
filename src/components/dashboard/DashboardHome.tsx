'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface Asset {
  id: string;
  name: string;
  type: string;
  url: string;
  thumbnail_url?: string;
  created_at: string;
}

interface DashboardPayload {
  userName: string;
  workspaceName: string;
  workspaceId: string;
  orgId: string;
  credits: number;
  brandCompleteness: number;
  totalAssets: number;
  teamMembersCount: number;
  recentAssets: Asset[];
  isNewAccount: boolean;
  brandGuideline: any;
}

export default function DashboardHome({ data }: { data: DashboardPayload }) {
  const {
    userName,
    workspaceName,
    workspaceId,
    orgId,
    credits,
    brandCompleteness,
    totalAssets,
    teamMembersCount,
    recentAssets,
    isNewAccount,
    brandGuideline,
  } = data;

  const [greeting, setGreeting] = useState('Welcome back');

  // Set greeting based on current time of day
  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) {
      setGreeting('Good morning');
    } else if (hours < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  // Compute checklist states
  const colorsSet = !!(brandGuideline?.colors?.primary || brandGuideline?.colors?.secondary);
  const typographySet = !!(brandGuideline?.typography?.display || brandGuideline?.typography?.body);
  const audienceToneSet = !!(
    brandGuideline?.audience &&
    (brandGuideline?.tone?.archetype || brandGuideline?.tone)
  );
  const assetCreated = totalAssets > 0;
  const teamInvited = teamMembersCount > 1;

  const checklistItems = [
    { label: 'Complete onboarding setup', completed: true },
    { label: 'Define primary brand colors', completed: colorsSet, href: '/brand' },
    { label: 'Select brand typography voice', completed: typographySet, href: '/brand' },
    { label: 'Set target audience & voice tone', completed: audienceToneSet, href: '/brand' },
    { label: 'Generate your first creative asset', completed: assetCreated },
  ];

  const completedCount = checklistItems.filter((i) => i.completed).length;
  const checklistProgress = (completedCount / checklistItems.length) * 100;

  const handleComingSoon = (tool: string) => {
    toast.info(`${tool} feature is coming soon!`);
  };

  const handleOpenAsset = (asset: Asset) => {
    toast.info(`Opening asset details for: ${asset.name || 'Untitled Asset'}`);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            {greeting}, {userName}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Here is your workspace and brand intelligence health check.
          </p>
        </div>
        <div className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">
          Workspace: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{workspaceName}</span>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Credits Card */}
        <Card size="sm">
          <CardContent className="pt-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Credits Remaining</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <i className="ti ti-coins text-base" />
              </div>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono tracking-tight text-neutral-800 dark:text-neutral-100">{credits}</span>
              <span className="text-xs text-neutral-400">/ 100</span>
            </div>
            <Progress value={credits} className="h-1 mt-1.5" />
          </CardContent>
        </Card>

        {/* Brand Completeness Card */}
        <Card size="sm">
          <CardContent className="pt-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Brand Completeness</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <i className="ti ti-palette text-base" />
              </div>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono tracking-tight text-neutral-800 dark:text-neutral-100">{brandCompleteness}%</span>
            </div>
            <Progress value={brandCompleteness} className="h-1 mt-1.5" />
          </CardContent>
        </Card>

        {/* Total Assets Card */}
        <Card size="sm">
          <CardContent className="pt-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Total Assets</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <i className="ti ti-folder text-base" />
              </div>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono tracking-tight text-neutral-800 dark:text-neutral-100">{totalAssets}</span>
            </div>
            <p className="text-[10px] text-neutral-400 mt-1.5">Images, videos, and templates</p>
          </CardContent>
        </Card>

        {/* Team Members Card */}
        <Card size="sm">
          <CardContent className="pt-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Team Collaborators</span>
              <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 flex items-center justify-center">
                <i className="ti ti-users text-base" />
              </div>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono tracking-tight text-neutral-800 dark:text-neutral-100">{teamMembersCount}</span>
            </div>
            <p className="text-[10px] text-neutral-400 mt-1.5">Active workspace members</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Left Column (Content, Actions, Assets) & Right Column (Checklist) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side Content Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Brand Setup Alert Banner */}
          {brandCompleteness < 60 && (
            <div className="p-4 rounded-xl border border-amber-200/50 bg-amber-50/40 dark:border-amber-900/30 dark:bg-amber-950/10 flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                <i className="ti ti-alert-triangle text-base" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">Complete Brand Guidelines</h4>
                <p className="text-xs text-amber-700 dark:text-amber-400/90 mt-1 leading-relaxed">
                  Your brand profile is only <span className="font-semibold">{brandCompleteness}%</span> complete. To unlock the full power of Lumavi's image and video creation tools, specify your fonts, tone of voice, and brand colors.
                </p>
                <Link
                  href="/brand"
                  className="inline-flex items-center gap-1 mt-2.5 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:underline"
                >
                  <span>Go to Brand Intelligence</span>
                  <i className="ti ti-arrow-right text-xs" />
                </Link>
              </div>
            </div>
          )}

          {/* Quick Creators Block */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Creators
            </h3>

            {brandCompleteness < 20 ? (
              <div className="p-5 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20 text-center flex flex-col items-center justify-center">
                <i className="ti ti-lock text-xl text-neutral-400 mb-2" />
                <h4 className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Creators Locked</h4>
                <p className="text-[11px] text-neutral-500 max-w-sm mt-1">
                  You need at least 20% brand completeness to unlock AI creators. Specify primary colors or upload brand fonts to continue.
                </p>
                <Link href="/brand" className="mt-3.5">
                  <Button variant="outline" size="sm">
                    Configure Brand
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Image Generator Card */}
                <Link
                  href="/generate/image"
                  className="p-5 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 bg-white dark:bg-neutral-900/60 hover:bg-neutral-50/40 dark:hover:bg-neutral-800/20 transition duration-150 flex flex-col gap-3 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <i className="ti ti-photo text-lg group-hover:scale-105 transition" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Image Generator</h4>
                    <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                      Generate brand-aligned marketing graphics.
                    </p>
                  </div>
                </Link>

                {/* Video Generator Card */}
                <div
                  onClick={() => handleComingSoon('Video Generator')}
                  className="p-5 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 bg-white dark:bg-neutral-900/60 hover:bg-neutral-50/40 dark:hover:bg-neutral-800/20 transition duration-150 cursor-pointer flex flex-col gap-3 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-pink-50 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0">
                    <i className="ti ti-video text-lg group-hover:scale-105 transition" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Video Generator</h4>
                    <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                      Create animated video assets matching guidelines.
                    </p>
                  </div>
                </div>

                {/* Canvas Editor Card */}
                <div
                  onClick={() => handleComingSoon('Canvas Editor')}
                  className="p-5 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 bg-white dark:bg-neutral-900/60 hover:bg-neutral-50/40 dark:hover:bg-neutral-800/20 transition duration-150 cursor-pointer flex flex-col gap-3 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                    <i className="ti ti-layout-board text-lg group-hover:scale-105 transition" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Canvas Editor</h4>
                    <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                      Design layout templates and text grids.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recent Assets Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Recent Assets
            </h3>

            {recentAssets.length === 0 ? (
              <div className="border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-white dark:bg-neutral-900/20">
                <div className="w-12 h-12 rounded-full bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center text-neutral-400 mb-3 border border-neutral-100 dark:border-neutral-800">
                  <i className="ti ti-photo text-lg" />
                </div>
                <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">No assets generated yet</h4>
                <p className="text-[11px] text-neutral-500 max-w-[280px] mt-1">
                  Start generating or uploading assets to populate your content library.
                </p>
                {brandCompleteness >= 20 ? (
                  <Link href="/generate/image" className="mt-4 shrink-0">
                    <Button size="sm">
                      Generate First Asset
                    </Button>
                  </Link>
                ) : (
                  <Link href="/brand" className="mt-4">
                    <Button variant="outline" size="sm">
                      Configure Brand Guidelines
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {recentAssets.map((asset) => (
                  <div
                    key={asset.id}
                    onClick={() => handleOpenAsset(asset)}
                    className="group border border-neutral-200/50 dark:border-neutral-800/50 bg-white dark:bg-neutral-900/60 rounded-xl overflow-hidden cursor-pointer hover:border-neutral-300 dark:hover:border-neutral-700 transition"
                  >
                    {/* Thumbnail representation */}
                    <div className="aspect-video bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center relative overflow-hidden border-b border-neutral-200/40 dark:border-neutral-800/40">
                      {asset.thumbnail_url || asset.url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={asset.thumbnail_url || asset.url}
                          alt={asset.name || 'Creative asset'}
                          className="object-cover w-full h-full group-hover:scale-103 transition duration-300"
                          onError={(e) => {
                            // Fallback if image fails to load
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <i className="ti ti-file-text text-xl text-neutral-400" />
                      )}

                      {/* Video indicator */}
                      {asset.type === 'video' && (
                        <div className="absolute inset-0 bg-neutral-950/20 flex items-center justify-center text-white">
                          <div className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white backdrop-blur-xs">
                            <i className="ti ti-player-play text-xs pl-0.5" />
                          </div>
                        </div>
                      )}

                      {/* Type Badge */}
                      <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/60 dark:bg-neutral-900/80 text-white dark:text-neutral-200 backdrop-blur-xs select-none">
                        {asset.type}
                      </span>
                    </div>

                    <div className="p-3">
                      <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                        {asset.name || 'Untitled Asset'}
                      </p>
                      <p className="text-[10px] text-neutral-400 mt-0.5 font-mono">
                        {new Date(asset.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side Column (Getting Started Checklist) */}
        <div>
          {isNewAccount && (
            <Card>
              <CardHeader className="border-b border-neutral-100 dark:border-neutral-800">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <i className="ti ti-circle-check text-base text-neutral-900 dark:text-neutral-50" />
                  <span>Getting Started</span>
                </CardTitle>
                <CardDescription className="text-[11px] mt-0.5">
                  Setup your workspace to launch your brand profile
                </CardDescription>
              </CardHeader>
              <CardContent className="py-4 space-y-4">
                {/* Progress bar info */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                    <span>Profile Setup Progress</span>
                    <span>
                      {completedCount} of {checklistItems.length}
                    </span>
                  </div>
                  <Progress value={checklistProgress} className="h-1.5" />
                </div>

                {/* Checklist Checklist items */}
                <ul className="space-y-2.5">
                  {checklistItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-2.5 text-xs text-neutral-700 dark:text-neutral-300">
                      <span className="shrink-0 mt-0.5">
                        {item.completed ? (
                          <i className="ti ti-square-rounded-check-filled text-base text-neutral-800 dark:text-neutral-100" />
                        ) : (
                          <i className="ti ti-square-rounded text-base text-neutral-300 dark:text-neutral-600" />
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        {item.href && !item.completed ? (
                          <Link
                            href={item.href}
                            className="font-medium hover:underline hover:text-neutral-900 dark:hover:text-neutral-100 text-neutral-500 dark:text-neutral-400"
                          >
                            {item.label}
                          </Link>
                        ) : (
                          <span
                            className={
                              item.completed
                                ? 'line-through text-neutral-400 dark:text-neutral-500'
                                : 'text-neutral-600 dark:text-neutral-300'
                            }
                          >
                            {item.label}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats sidebar widget if not showing checklist, or as secondary card */}
          <Card className={isNewAccount ? 'mt-6' : ''}>
            <CardHeader className="border-b border-neutral-100 dark:border-neutral-800">
              <CardTitle className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                Workspace Health
              </CardTitle>
            </CardHeader>
            <CardContent className="py-4 space-y-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500 dark:text-neutral-400">Plan Status</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">Active</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500 dark:text-neutral-400">Billing Tier</span>
                <span className="font-semibold text-neutral-850 dark:text-neutral-200">Starter Free</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500 dark:text-neutral-400">Brand Identity Dot</span>
                <span
                  className="w-3.5 h-3.5 rounded-full border border-white dark:border-neutral-900 shadow-xs"
                  style={{ backgroundColor: brandGuideline?.colors?.primary || '#10b981' }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
