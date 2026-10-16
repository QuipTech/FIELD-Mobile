import type { LucideIcon } from 'lucide-react-native';
import { ChevronRight } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { colors } from '@/theme';
import { Text } from '../Text/Text';
import { styles } from './styles';

export type ListRowProps = {
  title: string;
  subtitle?: string;
  /** Right-aligned short text, e.g. "12,480 h" or a date. */
  meta?: string;
  icon?: LucideIcon;
  /** Extra right-side content, e.g. a Tag. */
  trailing?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  testID?: string;
};

export function ListRow({
  title,
  subtitle,
  meta,
  icon: Icon,
  trailing,
  onPress,
  ...a11y
}: ListRowProps) {
  const content = (
    <>
      {Icon && <Icon size={22} color={colors.ink} strokeWidth={2} />}
      <View style={styles.body}>
        <Text variant="bodyStrong" numberOfLines={2}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="caption" color="inkMuted" numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>
      <View style={styles.trailing}>
        {trailing}
        {meta && (
          <Text variant="caption" color="inkMuted">
            {meta}
          </Text>
        )}
        {onPress && <ChevronRight size={20} color={colors.inkMuted} />}
      </View>
    </>
  );

  if (!onPress) {
    return (
      <View style={styles.row} testID={a11y.testID}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        a11y.accessibilityLabel ?? [title, subtitle, meta].filter(Boolean).join(', ')
      }
      testID={a11y.testID}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}
