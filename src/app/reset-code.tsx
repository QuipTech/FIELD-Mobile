import { Redirect, router } from 'expo-router';

import { useAuthFlow } from '@/auth/flowStore';
import { requestPasswordReset } from '@/auth/flows';
import { runAuth } from '@/auth/runAuth';
import { toast } from '@/components';
import { EnterCode } from '@/features/auth/EnterCode';

export default function ResetCodeRoute() {
  const { email, set } = useAuthFlow();
  // Opened without going through M1c (e.g. app restored) — start the flow again.
  if (!email) return <Redirect href="/forgot-password" />;

  return (
    <EnterCode
      destination={email}
      // Cognito checks the code together with the new password on M1e.
      onSubmit={async (code) => {
        set({ code });
        router.push('/new-password');
      }}
      onResend={() =>
        runAuth(async () => {
          await requestPasswordReset(email);
          toast.success(`New code sent to ${email}`);
        })
      }
    />
  );
}
