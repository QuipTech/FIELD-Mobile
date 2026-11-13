import { SlidersHorizontal, X } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Segmented } from '@/components/Segmented/Segmented';
import { Text } from '@/components/Text/Text';
import { fontFamily, makeStyles, useTheme } from '@/theme';
import type { LibrarySort } from './api';
import { Strip } from './Strips';

/** "Filters" with a count badge, and the Relevance / Newest toggle (only while searching). */
export function FilterRow(props: {
  count: number;
  onOpen: () => void;
  sort: LibrarySort;
  onSort: (sort: LibrarySort) => void;
  searching: boolean;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Pressable
        onPress={props.onOpen}
        style={({ pressed }) => [styles.filters, pressed && { opacity: 0.7 }]}
        accessibilityRole="button"
        accessibilityLabel={props.count ? `Filters, ${props.count} set` : 'Filters'}
      >
        <SlidersHorizontal size={18} color={colors.ink} strokeWidth={2} />
        <Text variant="caption" style={styles.label}>
          Filters
        </Text>
        {props.count > 0 && (
          <View style={styles.badge}>
            <Text variant="caption" color="onButton" style={styles.label}>
              {props.count}
            </Text>
          </View>
        )}
      </Pressable>
      <View
        style={[styles.sort, !props.searching && styles.disabled]}
        pointerEvents={props.searching ? 'auto' : 'none'}
        accessibilityState={{ disabled: !props.searching }}
      >
        <Segmented
          options={[
            { value: 'relevance', label: 'Relevance' },
            { value: 'newest', label: 'Newest' },
          ]}
          value={props.searching ? props.sort : 'newest'}
          onChange={props.onSort}
          accessibilityLabel="Sort"
        />
      </View>
    </View>
  );
}

export type ActivePill = { key: string; label: string; onRemove: () => void };

/** One pill per active filter, each removable, plus "Clear all". */
export function ActivePills({
  pills,
  onClearAll,
}: {
  pills: ActivePill[];
  onClearAll: () => void;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  if (pills.length === 0) return null;
  return (
    <Strip>
      {pills.map((p) => (
        <Pressable
          key={p.key}
          onPress={p.onRemove}
          style={styles.pill}
          accessibilityRole="button"
          accessibilityLabel={`Remove filter ${p.label}`}
        >
          <Text variant="caption" color="primaryStrong" style={styles.label} numberOfLines={1}>
            {p.label}
          </Text>
          <X size={14} color={colors.primaryStrong} strokeWidth={2.5} />
        </Pressable>
      ))}
      <Pressable onPress={onClearAll} style={styles.clear} accessibilityRole="button">
        <Text variant="caption" color="primary" style={styles.label}>
          Clear all
        </Text>
      </Pressable>
    </Strip>
  );
}

const useStyles = makeStyles((c) => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  filters: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.card,
  },
  label: { fontFamily: fontFamily.medium },
  badge: {
    minWidth: 20,
    paddingHorizontal: 6,
    borderRadius: 999,
    backgroundColor: c.primary,
    alignItems: 'center',
  },
  sort: { flex: 1 },
  disabled: { opacity: 0.45 },
  pill: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: c.primaryTint,
  },
  clear: { minHeight: 36, justifyContent: 'center', paddingHorizontal: 8 },
}));
