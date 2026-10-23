import { View } from 'react-native';

import { elevation, makeStyles, radii } from '@/theme';
import { PressableScale } from '../PressableScale/PressableScale';
import { Text } from '../Text/Text';

export type SegmentedOption<T extends string> = { value: T; label: string };

export type SegmentedProps<T extends string> = {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
};

/** `.seg`: grey track, the selected cell lifts to a card. E.g. Reply / Internal note, SMS / Email. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedProps<T>) {
  const styles = useStyles();
  return (
    <View style={styles.track} accessibilityRole="tablist" accessibilityLabel={accessibilityLabel}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <PressableScale
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            containerStyle={styles.cellArea}
            style={[styles.cell, selected && styles.selected]}
          >
            <Text variant="label" color={selected ? 'ink' : 'muted'} numberOfLines={1}>
              {option.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  track: {
    flexDirection: 'row',
    gap: 3,
    padding: 3,
    borderRadius: radii.control,
    backgroundColor: c.fill,
  },
  cellArea: { flex: 1 },
  // The design's cell is 40 px; 42 + 3 px track padding each side makes the 48 px target.
  cell: {
    height: 42,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    backgroundColor: c.card,
    shadowColor: c.shadow,
    ...elevation.card,
  },
}));
