import { ChevronDown, type LucideIcon } from 'lucide-react-native';

import { borders, layout, makeStyles, radii, spacing, useTheme } from '@/theme';
import { PressableScale } from '../PressableScale/PressableScale';
import { Text } from '../Text/Text';

export type ChipProps = {
  label: string;
  onPress: () => void;
  selected?: boolean;
  /** Shown after the label, e.g. "Down 3". */
  count?: number;
  icon?: LucideIcon;
  /** Adds a chevron: the chip opens a picker (Type, Site, Model…). */
  dropdown?: boolean;
  testID?: string;
};

/** 44 px pill filter (`.chip`). Selected chips use the brand tint. */
export function Chip({ label, onPress, selected, count, icon: Icon, dropdown, testID }: ChipProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const tone = selected ? 'primaryStrong' : 'ink';
  const a11yLabel = count === undefined ? label : `${label}, ${count}`;
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole={dropdown ? 'button' : 'togglebutton'}
      accessibilityLabel={a11yLabel}
      accessibilityState={dropdown ? undefined : { checked: !!selected }}
      testID={testID}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.selected,
        pressed && (selected ? styles.selectedPressed : styles.pressed),
      ]}
    >
      {Icon && <Icon size={16} color={colors[tone]} strokeWidth={1.8} />}
      <Text variant="row" color={tone} numberOfLines={1}>
        {label}
      </Text>
      {count !== undefined && (
        <Text variant="row" color={selected ? 'primaryStrong' : 'muted'}>
          {count}
        </Text>
      )}
      {dropdown && <ChevronDown size={16} color={colors[tone]} strokeWidth={1.8} />}
    </PressableScale>
  );
}

const useStyles = makeStyles((c) => ({
  chip: {
    height: layout.chipHeight,
    paddingHorizontal: spacing.snug,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radii.chip,
    borderWidth: borders.control,
    borderColor: c.borderStrong,
    backgroundColor: c.card,
  },
  pressed: { backgroundColor: c.fill },
  selected: { backgroundColor: c.primaryTint, borderColor: c.primary },
  selectedPressed: { backgroundColor: c.primaryTintStrong },
}));
