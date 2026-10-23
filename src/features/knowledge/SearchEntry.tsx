import { Search } from 'lucide-react-native';

import { PressableScale } from '@/components/PressableScale/PressableScale';
import { Text } from '@/components/Text/Text';
import { borders, layout, makeStyles, radii, spacing, useTheme } from '@/theme';

/** Looks like the search field (`.srch`) but opens the search screen (K1, K2). */
export function SearchEntry({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="search"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={[styles.field, disabled && styles.disabled]}
    >
      <Search size={layout.iconSize} color={colors.faint} strokeWidth={1.8} />
      <Text color="faint" numberOfLines={1} style={styles.label}>
        {label}
      </Text>
    </PressableScale>
  );
}

const useStyles = makeStyles((c) => ({
  field: {
    height: layout.inputHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.tight,
    paddingHorizontal: spacing.md,
    borderWidth: borders.control,
    borderColor: c.borderStrong,
    borderRadius: radii.card,
    backgroundColor: c.card,
  },
  disabled: { opacity: 0.6 },
  label: { flex: 1 },
}));
