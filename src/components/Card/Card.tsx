import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { borders, elevation, makeStyles, radii, spacing } from '@/theme';
import { PressableScale } from '../PressableScale/PressableScale';

export type CardProps = {
  children: ReactNode;
  onPress?: () => void;
  /** Required when `onPress` is set. */
  accessibilityLabel?: string;
  /** False for cards that hold full-bleed rows (ListRow draws its own padding). */
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/** `.card`: radius 14, hairline border, soft lift in light mode. Pressable when `onPress` is set. */
export function Card({
  children,
  onPress,
  accessibilityLabel,
  padded = true,
  style,
  testID,
}: CardProps) {
  const styles = useStyles();
  const base = [styles.card, padded && styles.padded, style];
  if (!onPress) {
    return (
      <View style={base} testID={testID}>
        {children}
      </View>
    );
  }
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={({ pressed }) => [base, pressed && styles.pressed]}
    >
      {children}
    </PressableScale>
  );
}

const useStyles = makeStyles((c) => ({
  card: {
    backgroundColor: c.card,
    borderWidth: borders.hairline,
    borderColor: c.border,
    borderRadius: radii.card,
    shadowColor: c.shadow,
    ...elevation.card,
  },
  padded: { padding: spacing.snug, gap: spacing.xs },
  pressed: { backgroundColor: c.fill },
}));
