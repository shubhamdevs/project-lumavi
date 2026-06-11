'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { completeOnboarding, getOnboardingWorkspace } from '@/lib/api';
import StepOrg from './steps/StepOrg';
import StepWorkspace from './steps/StepWorkspace';
import StepBrand from './steps/StepBrand';
import StepInvite from './steps/StepInvite';
import StepPreview from './steps/StepPreview';

export default function OnboardingWizard() {
  const router = useRouter();
  const { getToken } = useAuth();

  const [checkingWorkspace, setCheckingWorkspace] = useState(true);

  useEffect(() => {
    let active = true;
    async function checkWorkspace() {
      try {
        const token = await getToken();
        if (!token) return;
        const data = await getOnboardingWorkspace(token);
        if (active) {
          if (data && data.workspace_id) {
            router.push('/dashboard');
          } else {
            setCheckingWorkspace(false);
          }
        }
      } catch (err) {
        console.error('Error checking workspace status:', err);
        if (active) {
          setCheckingWorkspace(false);
        }
      }
    }

    checkWorkspace();
    return () => {
      active = false;
    };
  }, [getToken, router]);

  const [wizardState, setWizardState] = useState({


    step: 1,
    org: { name: '', industry: '', useCase: '' },
    workspace: { name: '', description: '' },
    brand: {
      primaryColor: '',
      secondaryColor: '',
      fontDisplay: '',
      fontBody: '',
      tone: '',
      photographyStyle: '',
      brandIsNot: '',
      imageryStyle: 'Photography',
      colorMood: '',
      brandKeywords: ['', '', ''],
      audience: '',
      lighting: '',
      composition: '',
    },
    invites: [] as string[],
  });

  const stepLabels = [
    'Organization Setup',
    'Workspace Creation',
    'Brand Quick Setup',
    'Invite Team',
    'Generation Preview',
  ];

  const handleNext = () => {
    setWizardState((prev) => ({
      ...prev,
      step: Math.min(prev.step + 1, 5),
    }));
  };

  const handleBack = () => {
    setWizardState((prev) => ({
      ...prev,
      step: Math.max(prev.step - 1, 1),
    }));
  };

  const handleSubmit = async () => {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    const response = await completeOnboarding(token, {
      org: wizardState.org,
      workspace: wizardState.workspace,
      brand: wizardState.brand,
      invites: wizardState.invites,
    });
    if (response.success) {
      router.push('/dashboard');
      router.refresh();
    } else {
      throw new Error('Failed to save onboarding data');
    }
  };

  const renderStepContent = () => {
    switch (wizardState.step) {
      case 1:
        return (
          <StepOrg
            data={wizardState}
            updateData={setWizardState}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <StepWorkspace
            data={wizardState}
            updateData={setWizardState}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <StepBrand
            data={wizardState}
            updateData={setWizardState}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <StepInvite
            data={wizardState}
            updateData={setWizardState}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 5:
        return (
          <StepPreview
            data={wizardState}
            onBack={handleBack}
            onSubmit={handleSubmit}
          />
        );
      default:
        return null;
    }
  };

  const progressPercentage = (wizardState.step / 5) * 100;

  if (checkingWorkspace) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-neutral-50/50 dark:bg-neutral-950/40">
        <div className="w-full max-w-[420px] text-center space-y-6">
          <Card className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl rounded-2xl overflow-hidden p-8">
            <CardContent className="flex flex-col items-center justify-center space-y-4 p-0">
              <div className="p-3 bg-violet-50 dark:bg-violet-950/40 rounded-2xl border border-violet-100 dark:border-violet-900/30 animate-pulse">
                <Loader2 className="h-8 w-8 animate-spin text-violet-600 dark:text-violet-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-200">
                  Verifying your configuration
                </h3>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">
                  Checking setup details...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-neutral-50/50 dark:bg-neutral-950/40">
      <div className="w-full max-w-[560px] space-y-6">
        {/* Progress & Steps Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            <span>Step {wizardState.step} of 5 — {stepLabels[wizardState.step - 1]}</span>
            <span className="font-mono text-violet-600 dark:text-violet-400">{Math.round(progressPercentage)}%</span>
          </div>
          {/* Progress Bar Container */}
          <div className="h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
            <div
              style={{ width: `${progressPercentage}%` }}
              className="h-full bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full transition-all duration-300 ease-out"
            />
          </div>
        </div>

        {/* Form Wizard Card */}
        <Card className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl rounded-2xl overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            {renderStepContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
