import { router } from 'expo-router';

import { Onboarding } from '@/features/onboarding/Onboarding';
import { markOnboardingSeen } from '@/features/onboarding/onboardingStorage';

export default function OnboardingRoute() {
  return (
    <Onboarding
      onDone={() => {
        router.replace('/sign-in');
        markOnboardingSeen(); // shown once per install
      }}
    />
  );
}
