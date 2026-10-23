import { Compass, Droplet, Gauge, Wrench, Zap, Cog, type LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Card } from '@/components/Card/Card';
import { Text } from '@/components/Text/Text';
import { formatNumber } from '@/lib/format';
import { borders, makeStyles, radii, spacing } from '@/theme';
import type { Brand, CategoryIcon } from './types';

export const CATEGORY_ICON: Record<CategoryIcon, LucideIcon> = {
  maintenance: Wrench,
  control: Gauge,
  engine: Cog,
  electrical: Zap,
  hydraulics: Droplet,
  survey: Compass,
};

export const docCount = (n: number) =>
  n === 0 ? 'No documents yet' : `${formatNumber(n)} documents`;

/** Section heading with an optional right-hand caption or link (`.sh`). */
export function SectionHeader({ title, right }: { title: string; right?: ReactNode }) {
  const styles = useStyles();
  return (
    <View style={styles.sectionHeader}>
      <Text variant="section" accessibilityRole="header">
        {title}
      </Text>
      {typeof right === 'string' ? (
        <Text variant="caption" color="muted">
          {right}
        </Text>
      ) : (
        right
      )}
    </View>
  );
}

/** Placeholder logo tile (dashed) until the API serves brand logos. */
export function BrandMark({ mark, size = 44 }: { mark: string; size?: number }) {
  const styles = useStyles();
  return (
    <View style={[styles.mark, { width: size, height: size }]} accessible={false}>
      <Text variant="badge" color="muted">
        {mark}
      </Text>
    </View>
  );
}

/** K1 brand tile (grid layout). */
export function BrandTile({ brand, onPress }: { brand: Brand; onPress: () => void }) {
  const styles = useStyles();
  return (
    <Card
      onPress={onPress}
      accessibilityLabel={`${brand.name}, ${docCount(brand.docCount)}`}
      style={styles.tile}
    >
      <View style={styles.tileRow}>
        <BrandMark mark={brand.mark} />
        <View style={styles.tileText}>
          <Text variant="bodyStrong" numberOfLines={1}>
            {brand.name}
          </Text>
          <Text variant="caption" color="muted" numberOfLines={1}>
            {docCount(brand.docCount)}
          </Text>
        </View>
      </View>
    </Card>
  );
}

/** Card holding full-bleed rows. */
export function RowCard({ children }: { children: ReactNode }) {
  return (
    <Card padded={false} style={{ overflow: 'hidden' }}>
      {children}
    </Card>
  );
}

const useStyles = makeStyles((c) => ({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  mark: {
    borderWidth: borders.control,
    borderStyle: 'dashed',
    borderColor: c.borderStrong,
    borderRadius: radii.control,
    backgroundColor: c.fill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tile: { flexBasis: '47%', flexGrow: 1, minHeight: 72, justifyContent: 'center' },
  tileRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  tileText: { flex: 1, gap: 2 },
}));
