import { router } from 'expo-router';

import { useAuthFlow } from '@/auth/flowStore';
import { requestPasswordReset } from '@/auth/flows';
import { runAuth } from '@/auth/runAuth';
import { ForgotPassword } from '@/features/auth/ForgotPassword';

export default function ForgotPasswordRoute() {
  const { email, set } = useAuthFlow();
  return (
    <ForgotPassword
      defaultEmail={email}
      onSubmit={(values) =>
        runAuth(async () => {
          await requestPasswordReset(values.email);
          set({ email: values.email, code: '' });
          router.push('/reset-code');
        })
      }
      onBackToSignIn={() => (router.canGoBack() ? router.back() : router.replace('/sign-in'))}
    />
  );
}
