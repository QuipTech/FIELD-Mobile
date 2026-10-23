import { Pressable, ScrollView } from 'react-native';

import { borders, makeStyles, spacing } from '@/theme';
import { Text } from '../Text/Text';

export type TabOption<T extends string> = { value: T; label: string };

export type TabsProps<T extends string> = {
  options: readonly TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
};

/** Underlined section tabs (machine Overview · History · Config · Manuals). Scrolls if it must. */
export function Tabs<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: TabsProps<T>) {
  const styles = useStyles();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.bar}
      contentContainerStyle={styles.content}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            style={[styles.tab, selected && styles.selected]}
          >
            <Text
              variant={selected ? 'row' : 'body'}
              color={selected ? 'primaryStrong' : 'muted'}
              style={styles.label}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const useStyles = makeStyles((c) => ({
  bar: {
    flexGrow: 0,
    backgroundColor: c.card,
    borderBottomWidth: borders.hairline,
    borderBottomColor: c.border,
  },
  content: { paddingHorizontal: spacing.md, gap: 22 },
  tab: {
    height: 52,
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  selected: { borderBottomColor: c.primary },
  label: { fontSize: 15 },
}));
