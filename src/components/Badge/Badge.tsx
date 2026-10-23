import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { makeStyles, radii, useTheme, type ThemeColors } from '@/theme';
import { Text } from '../Text/Text';

export type BadgeTone = 'neutral' | 'primary' | 'warning' | 'danger' | 'success';

export type BadgeProps = {
  label: string;
  tone?: BadgeTone;
  icon?: LucideIcon;
  testID?: string;
};

const TONES: Record<BadgeTone, { bg: keyof ThemeColors; fg: keyof ThemeColors }> = {
  neutral: { bg: 'fill', fg: 'muted' },
  primary: { bg: 'primaryTint', fg: 'primaryStrong' },
  warning: { bg: 'warningTint', fg: 'warning' },
  danger: { bg: 'dangerTint', fg: 'danger' },
  success: { bg: 'successTint', fg: 'success' },
};

/** Small status label (`.bdg`): document type, machine status, case state. Not tappable. */
export function Badge({ label, tone = 'neutral', icon: Icon, testID }: BadgeProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { bg, fg } = TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: colors[bg] }]} testID={testID}>
      {Icon && <Icon size={13} color={colors[fg]} strokeWidth={2} />}
      <Text variant="badge" color={fg} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const useStyles = makeStyles(() => ({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radii.badge,
  },
}));
