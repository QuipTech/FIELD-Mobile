import { router } from 'expo-router';

import { Onboarding } from '@/features/onboarding/Onboarding';

export default function OnboardingRoute() {
  return <Onboarding onDone={() => router.replace('/sign-in')} />;
}
