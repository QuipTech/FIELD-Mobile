import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform } from 'react-native';

import {
  disableBiometricSignIn,
  enableBiometricSignIn,
  signInWithBiometrics,
  useBiometrics,
  type BiometricSupport,
} from '@/auth/biometrics';
import { useAuthFlow } from '@/auth/flowStore';
import { rememberSessionCredentials } from '@/auth/sessionCredentials';
import {
  signInWithEmail,
  signInWithProvider,
  type SignInOutcome,
  type SocialProvider,
} from '@/auth/flows';
import { runAuth } from '@/auth/runAuth';
import { toast } from '@/components';
import { SignIn } from '@/features/auth/SignIn';

/** The button always shows; on a phone without enrolled biometrics it names the usual kind. */
const FALLBACK: BiometricSupport =
  Platform.OS === 'ios'
    ? { kind: 'face', label: 'Face ID' }
    : { kind: 'fingerprint', label: 'fingerprint' };

/** Why biometric sign-in can't run yet, or null when it can. */
function biometricBlocker(support: BiometricSupport | null, savedEmail: string | null) {
  if (!support) {
    return Platform.OS === 'ios'
      ? 'Set up Face ID in your iPhone Settings (Face ID & Passcode) first.'
      : 'Add a fingerprint in your phone’s Settings (Security) first.';
  }
  if (!savedEmail) {
    return `Sign in with your password, then turn on ${support.label} in Me → Security.`;
  }
  return null;
}

/** Google / Apple: success is picked up by the session gate in _layout; cancel is silent. */
const social = (provider: SocialProvider) => () =>
  runAuth(async () => {
    await signInWithProvider(provider);
  });

/** After a password sign-in, offers Face ID / fingerprint for next time (or swaps accounts). */
async function offerBiometricSignIn(email: string, password: string) {
  const { support, email: saved } = useBiometrics.getState();
  if (!support || saved?.toLowerCase() === email.toLowerCase()) return;
  if (saved) await disableBiometricSignIn(); // it belonged to another account
  Alert.alert(
    `Sign in with ${support.label}?`,
    `Next time, use ${support.label} instead of typing your password.`,
    [
      { text: 'Not now', style: 'cancel' },
      {
        text: 'Turn on',
        onPress: () =>
          enableBiometricSignIn(email, password)
            .then((on) => on && toast.success(`${support.label} sign-in is on.`))
            .catch(() => toast.error(`Couldn’t turn on ${support.label}. Try again in Settings.`)),
      },
    ],
  );
}

/** Follows a sign-in outcome that isn't `done` to the screen that finishes it. */
function continueSignIn(outcome: SignInOutcome) {
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
}

export default function SignInRoute() {
  const setFlow = useAuthFlow((s) => s.set);
  const support = useBiometrics((s) => s.support);
  const biometricEmail = useBiometrics((s) => s.email);
  const [biometricBusy, setBiometricBusy] = useState(false);

  const submit = ({ email, password }: { email: string; password: string }) =>
    runAuth(async () => {
      const outcome = await signInWithEmail(email, password);
      setFlow({ email, code: '' });
      if (outcome === 'done') {
        await rememberSessionCredentials(email, password);
        await offerBiometricSignIn(email, password);
      }
      continueSignIn(outcome);
    });

  const biometric = () => {
    if (biometricBusy) return;
    const blocker = biometricBlocker(support, biometricEmail);
    if (blocker) return toast.show(blocker);
    setBiometricBusy(true);
    runAuth(async () => {
      const outcome = await signInWithBiometrics();
      if (outcome === 'cancelled') return;
      setFlow({ email: biometricEmail ?? '', code: '' });
      continueSignIn(outcome);
    }).finally(() => setBiometricBusy(false));
  };

  return (
    <SignIn
      onSubmit={submit}
      onGoogle={social('Google')}
      onApple={social('Apple')}
      biometric={support ?? FALLBACK}
      biometricBusy={biometricBusy}
      onBiometric={biometric}
      onCreateAccount={() => router.push('/register')}
      onForgotPassword={() => router.push('/forgot-password')}
      version={Constants.expoConfig?.version}
    />
  );
}
