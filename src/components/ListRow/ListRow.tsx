import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { borders, layout, makeStyles, radii, spacing, useTheme } from '@/theme';
import { PressableScale } from '../PressableScale/PressableScale';
import { Text } from '../Text/Text';

export type ListRowProps = {
  title: string;
  subtitle?: string;
  /** Right-aligned short text, e.g. "12,480 h" or a date. */
  meta?: string;
  /** Icon in a 44 px tinted tile (`.ict`). */
  icon?: LucideIcon;
  /** Neutral grey tile instead of the brand tint. */
  iconTone?: 'primary' | 'neutral';
  /** Custom leading element (Avatar, checkbox…) instead of `icon`. */
  leading?: ReactNode;
  /** Extra right-side content, e.g. a Badge. */
  trailing?: ReactNode;
  /** Hide the bottom divider (last row in a card). */
  last?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  testID?: string;
};

/** `.li`: 64 px row, 15 px title. Shows a chevron when tappable. */
export function ListRow(props: ListRowProps) {
  const { title, subtitle, meta, icon: Icon, iconTone = 'primary', onPress } = props;
  const styles = useStyles();
  const { colors } = useTheme();
  const neutral = iconTone === 'neutral';
  const content = (
    <>
      {props.leading ??
        (Icon && (
          <View style={[styles.tile, neutral && styles.tileNeutral]}>
            <Icon
              size={layout.iconSize}
              color={colors[neutral ? 'muted' : 'primaryStrong']}
              strokeWidth={1.8}
            />
          </View>
        ))}
      <View style={styles.body}>
        <Text variant="row" numberOfLines={2}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="caption" color="muted" numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>
      <View style={styles.trailing}>
        {props.trailing}
        {meta && (
          <Text variant="caption" color="muted">
            {meta}
          </Text>
        )}
        {onPress && <ChevronRight size={layout.iconSize} color={colors.faint} strokeWidth={1.8} />}
      </View>
    </>
  );

  const rowStyle = [styles.row, props.last && styles.last];
  if (!onPress) {
    return (
      <View style={rowStyle} testID={props.testID}>
        {content}
      </View>
    );
  }
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        props.accessibilityLabel ?? [title, subtitle, meta].filter(Boolean).join(', ')
      }
      testID={props.testID}
      style={({ pressed }) => [rowStyle, pressed && styles.pressed]}
    >
      {content}
    </PressableScale>
  );
}

const useStyles = makeStyles((c) => ({
  row: {
    minHeight: layout.rowHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.snug,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.snug,
    borderBottomWidth: borders.hairline,
    borderBottomColor: c.border,
  },
  last: { borderBottomWidth: 0 },
  pressed: { backgroundColor: c.fill },
  tile: {
    width: 44,
    height: 44,
    borderRadius: radii.control,
    backgroundColor: c.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileNeutral: { backgroundColor: c.fill },
  body: { flex: 1, gap: 2 },
  trailing: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
}));
