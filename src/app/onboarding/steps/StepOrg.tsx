'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StepOrgProps {
  data: {
    org: { name: string; industry: string; useCase: string };
  };
  updateData: (updater: (prev: any) => any) => void;
  onNext: () => void;
}

export default function StepOrg({ data, updateData, onNext }: StepOrgProps) {
  const industries = ['E-commerce', 'SaaS', 'Agency', 'Healthcare', 'Education', 'Retail', 'Other'];
  const useCases = [
    'Social media content',
    'Ad campaigns',
    'Brand content',
    'Product marketing',
    'Other',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.org.name.trim()) return;
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Tell us about your organization
        </h2>
        <p className="text-sm text-neutral-500">
          We'll customize your Lumavi experience based on your team.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Organization Name <span className="text-rose-500">*</span>
          </label>
          <Input
            required
            placeholder="e.g. Lumavi Corp"
            value={data.org.name}
            onChange={(e) =>
              updateData((prev) => ({
                ...prev,
                org: { ...prev.org, name: e.target.value },
                // Also pre-fill workspace name in Step 2 if user hasn't changed it
                workspace: {
                  ...prev.workspace,
                  name: prev.workspace.name === `${prev.org.name} Workspace` || !prev.workspace.name
                    ? `${e.target.value} Workspace`
                    : prev.workspace.name,
                },
              }))
            }
            className="w-full transition-all focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Industry
          </label>
          <Select
            value={data.org.industry}
            onValueChange={(val) =>
              updateData((prev) => ({
                ...prev,
                org: { ...prev.org, industry: val },
              }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              {industries.map((ind) => (
                <SelectItem key={ind} value={ind}>
                  {ind}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Primary Use Case
          </label>
          <Select
            value={data.org.useCase}
            onValueChange={(val) =>
              updateData((prev) => ({
                ...prev,
                org: { ...prev.org, useCase: val },
              }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="What will you create first?" />
            </SelectTrigger>
            <SelectContent>
              {useCases.map((uc) => (
                <SelectItem key={uc} value={uc}>
                  {uc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          disabled={!data.org.name.trim()}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium shadow-md transition-all duration-200"
        >
          Continue
        </Button>
      </div>
    </form>
  );
}
