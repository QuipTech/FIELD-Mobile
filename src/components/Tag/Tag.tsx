import { View } from 'react-native';

import { colors } from '@/theme';
import { Text, type TextColor } from '../Text/Text';
import { styles } from './styles';

export type TagTone = 'neutral' | 'accent' | 'success' | 'warning' | 'info' | 'ink' | 'solidAccent';

const TEXT_COLOR: Record<TagTone, TextColor> = {
  neutral: 'ink',
  accent: 'accentText',
  success: 'success',
  warning: 'warning',
  info: 'info',
  ink: 'onInk',
  solidAccent: 'onAccent',
};

export type TagProps = {
  label: string;
  tone?: TagTone;
  /** Small square status marker before the label. */
  dot?: boolean;
};

/** Status chip — e.g. case status, machine status, "Pending sync". */
export function Tag({ label, tone = 'neutral', dot }: TagProps) {
  const color = TEXT_COLOR[tone];
  return (
    <View style={[styles.base, styles[tone]]} accessibilityRole="text" accessibilityLabel={label}>
      {dot && <View style={[styles.dot, { backgroundColor: colors[color] }]} />}
      <Text variant="overline" color={color}>
        {label}
      </Text>
    </View>
  );
}
