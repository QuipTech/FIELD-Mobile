import { router } from 'expo-router';

import { useAuthFlow } from '@/auth/flowStore';
import { registerAccount, signInWithProvider, type SocialProvider } from '@/auth/flows';
import { runAuth } from '@/auth/runAuth';
import { Register } from '@/features/auth/Register';

/** Google / Apple create the account on first sign-in; the session gate takes over on success. */
const social = (provider: SocialProvider) => () =>
  runAuth(async () => {
    await signInWithProvider(provider);
  });

export default function RegisterRoute() {
  const setFlow = useAuthFlow((s) => s.set);
  return (
    <Register
      onSubmit={(values) =>
        runAuth(async () => {
          await registerAccount(values);
          setFlow({
            email: values.email,
            code: '',
            profile: { companyName: values.company, phoneNumber: values.phone },
          });
          router.push('/verify-email');
        })
      }
      onGoogle={social('Google')}
      onApple={social('Apple')}
      onSignIn={() => (router.canGoBack() ? router.back() : router.replace('/sign-in'))}
    />
  );
}
