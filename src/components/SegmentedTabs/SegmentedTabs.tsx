import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { colors, elevation, fontFamily, spacing } from '@/theme';
import { Text } from '../Text/Text';

export type SegmentOption<T extends string> = { value: T; label: string; count?: number };

export type SegmentedTabsProps<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** Segmented tab control on a soft track; the active tab lifts to white. Scrolls if it overflows. */
export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
}: SegmentedTabsProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.track}
      accessibilityRole="tablist"
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={({ pressed }) => [
              styles.segment,
              on && styles.segmentOn,
              pressed && !on && styles.pressed,
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={o.count ? `${o.label} (${o.count})` : o.label}
          >
            <Text color={on ? 'brand' : 'inkMuted'} style={styles.label}>
              {o.label}
            </Text>
            {!!o.count && (
              <View style={[styles.badge, on && styles.badgeOn]}>
                <Text color={on ? 'onAccent' : 'inkMuted'} style={styles.badgeText}>
                  {o.count}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0 },
  track: {
    flexDirection: 'row',
    gap: spacing.xxs,
    padding: spacing.xxs,
    borderRadius: 12,
    backgroundColor: colors.fill,
  },
  segment: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  segmentOn: { backgroundColor: colors.surface, ...elevation.card, shadowOpacity: 0.1 },
  pressed: { opacity: 0.6 },
  label: { fontFamily: fontFamily.medium, fontSize: 14, lineHeight: 18 },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeOn: { backgroundColor: colors.brand },
  badgeText: { fontFamily: fontFamily.medium, fontSize: 11, lineHeight: 14 },
});
