import { Redirect, router } from 'expo-router';

import { useAuthFlow } from '@/auth/flowStore';
import { resendVerificationCode, verifyEmail } from '@/auth/flows';
import { runAuth } from '@/auth/runAuth';
import { toast } from '@/components';
import { EnterCode } from '@/features/auth/EnterCode';

/** Sign-up email verification (M1d layout). */
export default function VerifyEmailRoute() {
  const email = useAuthFlow((s) => s.email);
  if (!email) return <Redirect href="/sign-in" />;

  return (
    <EnterCode
      destination={email}
      onSubmit={(code) =>
        runAuth(async () => {
          const signedIn = await verifyEmail(email, code);
          if (signedIn) return; // The session gate swaps to the signed-in stack.
          toast.success('Email verified. Sign in to continue.');
          router.dismissTo('/sign-in');
        })
      }
      onResend={() =>
        runAuth(async () => {
          await resendVerificationCode(email);
          toast.success(`New code sent to ${email}`);
        })
      }
    />
  );
}
