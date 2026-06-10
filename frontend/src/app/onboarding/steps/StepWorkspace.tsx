'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface StepWorkspaceProps {
  data: {
    workspace: { name: string; description: string };
  };
  updateData: (updater: (prev: any) => any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepWorkspace({
  data,
  updateData,
  onNext,
  onBack,
}: StepWorkspaceProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.workspace.name.trim()) return;
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Create your workspace
        </h2>
        <p className="text-sm text-neutral-500">
          This is where your projects, brand files, and team assets live.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Workspace Name <span className="text-rose-500">*</span>
          </label>
          <Input
            required
            placeholder="e.g. Design Team Workspace"
            value={data.workspace.name}
            onChange={(e) =>
              updateData((prev) => ({
                ...prev,
                workspace: { ...prev.workspace, name: e.target.value },
              }))
            }
            className="w-full transition-all focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Description <span className="text-neutral-400 font-normal">(Optional)</span>
          </label>
          <textarea
            placeholder="What is this workspace mainly used for? (e.g. Marketing campaigns, Social Media creatives)"
            value={data.workspace.description}
            onChange={(e) =>
              updateData((prev) => ({
                ...prev,
                workspace: { ...prev.workspace, description: e.target.value },
              }))
            }
            rows={4}
            className="flex min-h-[100px] w-full rounded-md border border-neutral-200 bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-white placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:placeholder:text-neutral-400 dark:focus-visible:ring-violet-500"
          />
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
          disabled={!data.workspace.name.trim()}
          className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-medium shadow-md transition-all duration-200"
        >
          Continue
        </Button>
      </div>
    </form>
  );
}
