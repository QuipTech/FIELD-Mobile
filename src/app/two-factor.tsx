import { useLocalSearchParams } from 'expo-router';

import { toast } from '@/components';
import { TwoFactorMethod } from '@/features/auth/TwoFactorMethod';

export default function TwoFactorRoute() {
  const { email = '', phone = '' } = useLocalSearchParams<{ email?: string; phone?: string }>();
  return (
    <TwoFactorMethod
      email={email}
      phone={phone}
      // TODO(Step 2): Cognito updateMFAPreference for the chosen method, then verify a code (M1d).
      onContinue={async () => toast.show('Two-factor setup is not connected yet.')}
    />
  );
}
