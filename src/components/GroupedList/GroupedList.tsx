import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { Children, Fragment, type ReactNode } from 'react';
import { Pressable, Switch, View } from 'react-native';

import { colors } from '@/theme';
import { Pill, type PillTone } from '../Pill/Pill';
import { Text } from '../Text/Text';
import { styles } from './styles';

/** White rounded card that stacks rows with inset hairlines between them. */
export function GroupedList({ children }: { children: ReactNode }) {
  const rows = Children.toArray(children);
  return (
    <View style={styles.group}>
      <View style={styles.clip}>
        {rows.map((row, i) => (
          <Fragment key={i}>
            {i > 0 && <View style={styles.divider} />}
            {row}
          </Fragment>
        ))}
      </View>
    </View>
  );
}

const ICON_TONES = {
  default: { fg: colors.ink, bg: colors.fill, label: 'ink' },
  amber: { fg: colors.amber, bg: colors.amberTint, label: 'ink' },
  danger: { fg: colors.danger, bg: colors.dangerTint, label: 'danger' },
} as const;

export type GroupedRowProps = {
  label: string;
  icon?: LucideIcon;
  iconTone?: keyof typeof ICON_TONES;
  /** Muted text before the chevron, e.g. "English". */
  value?: string;
  badge?: { label: string; tone: PillTone };
  /** Shows a switch instead of a chevron; the row itself is then not pressable. */
  toggle?: { value: boolean; onChange: (on: boolean) => void };
  /** Custom right-hand content (replaces the chevron). */
  trailing?: ReactNode;
  /** Pressable rows show a chevron unless this is false (e.g. Sign out). */
  chevron?: boolean;
  /** Muted label for placeholder rows, e.g. "No invoices yet". */
  muted?: boolean;
  onPress?: () => void;
};

/** One list row: icon tile, label, then a value, badge, switch or chevron. */
export function GroupedRow({
  label,
  icon: Icon,
  iconTone = 'default',
  value,
  badge,
  toggle,
  trailing,
  chevron = true,
  muted,
  onPress,
}: GroupedRowProps) {
  const tone = ICON_TONES[iconTone];
  const content = (
    <>
      {Icon && (
        <View style={[styles.iconBox, { backgroundColor: tone.bg }]}>
          <Icon size={18} color={tone.fg} strokeWidth={2} />
        </View>
      )}
      <Text color={muted ? 'inkMuted' : tone.label} style={styles.label} numberOfLines={2}>
        {label}
      </Text>
      {value !== undefined && (
        <Text variant="caption" color="inkMuted">
          {value}
        </Text>
      )}
      {badge && <Pill label={badge.label} tone={badge.tone} />}
      {toggle && (
        <Switch
          value={toggle.value}
          onValueChange={toggle.onChange}
          trackColor={{ false: colors.control, true: colors.brand }}
          thumbColor={colors.surface}
          ios_backgroundColor={colors.control}
          accessibilityLabel={label}
        />
      )}
      {trailing}
      {onPress && chevron && !toggle && !trailing && (
        <ChevronRight size={18} color={colors.inkSubtle} strokeWidth={2} />
      )}
    </>
  );

  if (!onPress || toggle) return <View style={styles.row}>{content}</View>;
  const extra = [value, badge?.label].filter(Boolean).join(', ');
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      accessibilityRole="button"
      accessibilityLabel={extra ? `${label}, ${extra}` : label}
    >
      {content}
    </Pressable>
  );
}
