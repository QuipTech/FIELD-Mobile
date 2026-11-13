import { ChevronRight, Plus, Search } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text/Text';
import { AnimatedScanIcon } from '@/features/machines/AnimatedScanIcon';
import { brandControl, colors, fontFamily, spacing } from '@/theme';
import { styles as home } from './styles';

export type QuickActionsProps = {
  onSearch: () => void;
  onScan: () => void;
  onLogEntry: () => void;
  /** Rendered between the search bar and the shortcuts (the customer's headline tiles). */
  belowSearch?: ReactNode;
};

/**
 * Scan first and biggest (the most-used action in the field), then search and Log entry.
 * Ask AI lives in the tab bar's centre button, so it has no tile here.
 */
export function QuickActions(props: QuickActionsProps) {
  return (
    <>
      <Pressable
        onPress={props.onScan}
        accessibilityRole="button"
        accessibilityLabel="Scan machine"
        accessibilityHint="Opens the camera to read an asset tag or QR code"
        style={({ pressed }) => [styles.scan, pressed && styles.pressed]}
      >
        <View style={styles.scanIcon}>
          <AnimatedScanIcon size={28} color={colors.brand} />
        </View>
        <View style={styles.scanText}>
          <Text style={styles.scanTitle}>Scan machine</Text>
          <Text variant="caption" style={styles.scanCaption}>
            Point at an asset tag or QR code
          </Text>
        </View>
        <ChevronRight size={22} color={colors.onAccent} strokeWidth={2} />
      </Pressable>

      <Pressable
        onPress={props.onSearch}
        style={home.search}
        accessibilityRole="search"
        accessibilityLabel="Search machines or manuals"
      >
        <Search size={20} color={colors.inkSubtle} strokeWidth={2} />
        <Text color="inkSubtle">Search machines or manuals</Text>
      </Pressable>
      {props.belowSearch}

      <Pressable
        onPress={props.onLogEntry}
        accessibilityRole="button"
        accessibilityLabel="Log entry"
        accessibilityHint="Record a repair, service or note on a machine"
        style={({ pressed }) => [home.card, styles.log, pressed && styles.pressed]}
      >
        <View style={styles.tileIcon}>
          <Plus size={20} color={colors.brandDeep} strokeWidth={2} />
        </View>
        <View style={styles.tileText}>
          <Text style={home.itemTitle}>Log entry</Text>
          <Text variant="caption" color="inkMuted" numberOfLines={1}>
            Record a repair, service or note
          </Text>
        </View>
        <ChevronRight size={20} color={colors.inkSubtle} strokeWidth={2} />
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },
  scan: {
    minHeight: 84,
    borderRadius: 18,
    backgroundColor: colors.brand,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: colors.brandDeep,
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  scanIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanText: { flex: 1, gap: 2 },
  scanTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: 18,
    lineHeight: 23,
    color: colors.onAccent,
  },
  scanCaption: { color: colors.onBrandMuted },
  log: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  tileIcon: {
    width: 38,
    height: 38,
    borderRadius: brandControl.radius,
    backgroundColor: colors.brandTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileText: { flex: 1, gap: 1 },
});
