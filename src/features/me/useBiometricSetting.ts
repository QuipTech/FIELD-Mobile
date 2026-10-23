import { useState } from 'react';

import { disableBiometricSignIn, enableBiometricSignIn, useBiometrics } from '@/auth/biometrics';
import { sessionPassword } from '@/auth/sessionCredentials';
import { toast } from '@/components';
import type { BiometricSheetProps } from './BiometricSheet';
import type { MeSectionsProps } from './MeSections';

/**
 * The Settings "Sign in with Face ID" switch for the signed-in account. Turning it on takes
 * effect straight away using this session's password; only when there is none (Google / Apple
 * sign-in) does BiometricSheet ask for it. Turning it off is immediate.
 */
export function useBiometricSetting(email: string | undefined): {
  row: MeSectionsProps['biometric'];
  sheet: BiometricSheetProps;
} {
  const { support, email: saved } = useBiometrics();
  const [settingUp, setSettingUp] = useState(false);
  // Shows the switch on while it saves (Android asks for a fingerprint meanwhile).
  const [turningOn, setTurningOn] = useState(false);
  const label = support?.label ?? '';

  const enable = async (password: string) => {
    if (!email) return;
    try {
      if (!(await enableBiometricSignIn(email, password))) return;
      setSettingUp(false);
      toast.success(`${label} sign-in is on.`);
    } catch {
      toast.error(`Couldn’t turn on ${label}. Please try again.`);
    }
  };
  const onToggle = async (on: boolean) => {
    if (!on) {
      await disableBiometricSignIn();
      return toast.show(`${label} sign-in is off.`);
    }
    const password = email ? await sessionPassword(email) : null;
    if (!password) return setSettingUp(true);
    setTurningOn(true);
    await enable(password);
    setTurningOn(false);
  };

  const on = turningOn || (!!email && saved?.toLowerCase() === email.toLowerCase());
  return {
    row: support ? { support, on, onToggle } : undefined,
    sheet: {
      support: settingUp ? support : null,
      onClose: () => setSettingUp(false),
      onConfirm: enable,
    },
  };
}
