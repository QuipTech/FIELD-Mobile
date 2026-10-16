import { Pressable, View } from 'react-native';

import { Text } from '../Text/Text';
import { styles } from './styles';

export type SegOption<T extends string> = { value: T; label: string };

export type SegProps<T extends string> = {
  options: readonly SegOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
};

/** Segmented control — equal-width cells, selected cell inverted to ink. */
export function Seg<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegProps<T>) {
  return (
    <View style={styles.row} accessibilityRole="tablist" accessibilityLabel={accessibilityLabel}>
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            style={({ pressed }) => [
              styles.item,
              index > 0 && styles.divider,
              pressed && !selected && styles.pressed,
              selected && styles.selected,
            ]}
          >
            <Text variant="label" color={selected ? 'onInk' : 'ink'} numberOfLines={1}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
