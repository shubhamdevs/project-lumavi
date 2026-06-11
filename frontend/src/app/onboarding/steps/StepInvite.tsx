'use client';

import React, { useState } from 'react';
import type { UpdateDataFn } from '../types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Plus, Users } from 'lucide-react';

interface StepInviteProps {
  data: {
    invites: string[];
  };
  updateData: UpdateDataFn;
  onNext: () => void;
  onBack: () => void;
}

export default function StepInvite({
  data,
  updateData,
  onNext,
  onBack,
}: StepInviteProps) {
  const [emailInput, setEmailInput] = useState('');
  const [error, setError] = useState('');

  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const email = emailInput.trim().toLowerCase();
    if (!email) return;

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (data.invites.includes(email)) {
      setError('This email has already been added.');
      return;
    }

    if (data.invites.length >= 5) {
      setError('You can invite up to 5 team members during onboarding.');
      return;
    }

    updateData((prev) => ({
      ...prev,
      invites: [...prev.invites, email],
    }));
    setEmailInput('');
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    updateData((prev) => ({
      ...prev,
      invites: prev.invites.filter((email: string) => email !== emailToRemove),
    }));
  };

  const handleNext = () => {
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Invite your team
          </h2>
          <button
            type="button"
            onClick={handleNext}
            className="text-sm font-semibold text-violet-600 hover:text-violet-800 transition-colors"
          >
            Skip for now
          </button>
        </div>
        <p className="text-sm text-neutral-500">
          Lumavi is better with collaboration. Invite your editors or marketers.
        </p>
      </div>

      <form onSubmit={handleAddEmail} className="space-y-2">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Team Member Emails
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="e.g. member@company.com"
              value={emailInput}
              onChange={(e) => {
                setEmailInput(e.target.value);
                if (error) setError('');
              }}
              disabled={data.invites.length >= 5}
              className="w-full transition-all focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <Button
            type="submit"
            disabled={data.invites.length >= 5 || !emailInput.trim()}
            variant="secondary"
            className="flex items-center gap-1 font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200"
          >
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>
        {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
        {data.invites.length >= 5 && (
          <p className="text-xs text-amber-500 font-medium">
            Maximum limit of 5 invites reached.
          </p>
        )}
      </form>

      {/* Render Invites List */}
      {data.invites.length > 0 ? (
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Invited Members ({data.invites.length}/5)
          </label>
          <div className="flex flex-wrap gap-2 p-3 rounded-lg border border-neutral-100 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-900/50">
            {data.invites.map((email) => (
              <div
                key={email}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-neutral-200 text-neutral-700 shadow-sm dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-300 animate-in fade-in zoom-in-95 duration-150"
              >
                <span>{email}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveEmail(email)}
                  className="rounded-full p-0.5 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 border border-dashed border-neutral-200 rounded-lg dark:border-neutral-800">
          <Users className="w-8 h-8 text-neutral-300 mb-2" />
          <p className="text-xs text-neutral-400">No team members invited yet.</p>
        </div>
      )}

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
          type="button"
          onClick={handleNext}
          className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-medium shadow-md transition-all duration-200"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
