/**
 * Shared types for the onboarding wizard steps.
 */
import type { Dispatch, SetStateAction } from 'react';

export interface OnboardingBrand {
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
}

/** Full wizard state — includes step for the wizard itself. */
export interface OnboardingData {
  step: number;
  org: { name: string; industry: string; useCase: string };
  workspace: { name: string; description: string };
  brand: OnboardingBrand;
  invites: string[];
}

/** Matches what React's setState dispatcher produces */
export type UpdateDataFn = Dispatch<SetStateAction<OnboardingData>>;
