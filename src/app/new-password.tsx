import { Redirect, router, useLocalSearchParams } from 'expo-router';

import { forgetBiometricSignIn } from '@/auth/biometrics';
import { authErrorMessage, isAuthError } from '@/auth/errors';
import { useAuthFlow } from '@/auth/flowStore';
import { completeNewPassword, completePasswordReset } from '@/auth/flows';
import { runAuth } from '@/auth/runAuth';
import { toast } from '@/components';
import { NewPassword } from '@/features/auth/NewPassword';

/**
 * M1e. `mode=challenge`: first sign-in with a temporary password (admin-created user).
 * Otherwise: finishing a password reset with the code from M1d.
 */
export default function NewPasswordRoute() {
  const { mode } = useLocalSearchParams<{ mode?: 'challenge' }>();
  const { email, code, reset } = useAuthFlow();

  if (mode === 'challenge') {
    return (
      <NewPassword onSubmit={({ password }) => runAuth(() => completeNewPassword(password))} />
    );
  }

  if (!email || !code) return <Redirect href="/forgot-password" />;

  const submit = async ({ password }: { password: string }) => {
    try {
      await completePasswordReset(email, code, password);
      await forgetBiometricSignIn(email); // its saved password is the old one
      reset();
      toast.success('Password updated. Sign in with your new password.');
      router.dismissTo('/sign-in');
    } catch (error) {
      toast.error(authErrorMessage(error));
      // A bad or expired code can only be fixed on the previous screen.
      if (
        isAuthError(error, 'CodeMismatchException') ||
        isAuthError(error, 'ExpiredCodeException')
      ) {
        router.back();
      }
    }
  };

  return <NewPassword onSubmit={submit} />;
}
