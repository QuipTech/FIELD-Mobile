import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useState } from 'react';

import type { BiometricSupport } from '@/auth/biometrics';
import { Button } from '@/components/Button/Button';
import { Sheet } from '@/components/Sheet/Sheet';
import { Text } from '@/components/Text/Text';
import { borders, layout, makeStyles, radii, spacing, typeScale, useTheme } from '@/theme';

export type BiometricSheetProps = {
  /** Shown while set; null hides the sheet. */
  support: BiometricSupport | null;
  onClose: () => void;
  /** Saves the password behind biometrics. Resolves once done (or cancelled). */
  onConfirm: (password: string) => Promise<void>;
};

/**
 * Turning on Face ID / fingerprint sign-in from Settings: the app never keeps the password
 * after signing in, so it asks for it once and stores it behind the device's biometrics.
 */
export function BiometricSheet({ support, onClose, onConfirm }: BiometricSheetProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const label = support?.label ?? '';

  const close = () => {
    setPassword('');
    onClose();
  };
  const confirm = async () => {
    if (!password || saving) return;
    setSaving(true);
    try {
      await onConfirm(password);
    } finally {
      setSaving(false);
      setPassword('');
    }
  };

  return (
    <Sheet
      visible={!!support}
      onClose={close}
      title={`Turn on ${label}`}
      footer={
        <Button label="Turn on" onPress={confirm} disabled={!password} loading={saving} fullWidth />
      }
    >
      <Text color="muted">
        Enter your FIELD password. It’s kept on this phone, locked by {label}, and used only to sign
        you in.
      </Text>
      <BottomSheetTextInput
        value={password}
        onChangeText={setPassword}
        onSubmitEditing={confirm}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="done"
        placeholder="Password"
        placeholderTextColor={colors.faint}
        maxFontSizeMultiplier={layout.maxFontScale}
        style={styles.input}
        accessibilityLabel="Password"
      />
      <Text variant="caption" color="muted">
        Signed in with Google or Apple? Those accounts have no FIELD password, so use that button to
        sign in instead.
      </Text>
    </Sheet>
  );
}

const useStyles = makeStyles((c) => ({
  input: {
    ...typeScale.body,
    height: layout.inputHeight,
    paddingHorizontal: spacing.md,
    color: c.ink,
    borderWidth: borders.control,
    borderColor: c.borderStrong,
    borderRadius: radii.control,
    backgroundColor: c.card,
  },
}));
