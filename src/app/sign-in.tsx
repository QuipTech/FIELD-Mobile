import { router } from 'expo-router';

import { useAuthFlow } from '@/auth/flowStore';
import { signInWithEmail, signInWithProvider, type SocialProvider } from '@/auth/flows';
import { runAuth } from '@/auth/runAuth';
import { toast } from '@/components';
import { SignIn } from '@/features/auth/SignIn';

// TODO: biometric sign-in needs a stored session to unlock.
const notConnected = () => toast.show('Biometric sign-in is not available yet.');

/** Google / Apple: success is picked up by the session gate in _layout; cancel is silent. */
const social = (provider: SocialProvider) => () =>
  runAuth(async () => {
    await signInWithProvider(provider);
  });

export default function SignInRoute() {
  const setFlow = useAuthFlow((s) => s.set);

  const submit = ({ email, password }: { email: string; password: string }) =>
    runAuth(async () => {
      const outcome = await signInWithEmail(email, password);
      setFlow({ email, code: '' });
      switch (outcome) {
        case 'done':
          return; // The session gate in _layout swaps to the signed-in stack.
        case 'confirmSignUp':
          toast.show('Verify your email to finish setting up your account.');
          return router.push('/verify-email');
        case 'resetPassword':
          toast.show('You need to reset your password before signing in.');
          return router.push('/forgot-password');
        case 'newPasswordRequired':
          return router.push({ pathname: '/new-password', params: { mode: 'challenge' } });
        case 'unsupported':
          return toast.error("This account needs a sign-in step the app doesn't support yet.");
      }
    });

  return (
    <SignIn
      onSubmit={submit}
      onGoogle={social('Google')}
      onApple={social('Apple')}
      onBiometric={notConnected}
      onCreateAccount={() => router.push('/register')}
      onForgotPassword={() => router.push('/forgot-password')}
    />
  );
}
