import { Check } from 'lucide-react-native';
import { View } from 'react-native';

import { borders, layout, makeStyles, spacing, useTheme } from '@/theme';
import { PressableScale } from '../PressableScale/PressableScale';
import { Text } from '../Text/Text';

export type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Second line, e.g. "You won't be asked for a code on this device." */
  description?: string;
  disabled?: boolean;
  testID?: string;
};

/** `.cbx` with its label. The whole row is the target (48 px), not just the 26 px box. */
export function Checkbox({
  label,
  checked,
  onChange,
  description,
  disabled,
  testID,
}: CheckboxProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <PressableScale
      onPress={() => onChange(!checked)}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityHint={description}
      accessibilityState={{ checked, disabled: !!disabled }}
      testID={testID}
      style={styles.row}
    >
      <View style={[styles.box, checked && styles.checked]}>
        {checked && <Check size={18} color={colors.onButton} strokeWidth={2.5} />}
      </View>
      <View style={styles.text}>
        <Text variant="row" color={disabled ? 'faint' : 'ink'}>
          {label}
        </Text>
        {description && (
          <Text variant="caption" color="muted">
            {description}
          </Text>
        )}
      </View>
    </PressableScale>
  );
}

const useStyles = makeStyles((c) => ({
  row: {
    minHeight: layout.minTapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  box: {
    width: 26,
    height: 26,
    borderRadius: 7,
    borderWidth: borders.control,
    borderColor: c.borderStrong,
    backgroundColor: c.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: { backgroundColor: c.button, borderColor: c.button },
  text: { flex: 1, gap: 2 },
}));
