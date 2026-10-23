import { View } from 'react-native';

import { Button } from '@/components/Button/Button';
import { Card } from '@/components/Card/Card';
import { ListRow } from '@/components/ListRow/ListRow';
import { Text } from '@/components/Text/Text';
import { formatNumber } from '@/lib/format';
import { makeStyles, spacing } from '@/theme';
import { BrandMark, CATEGORY_ICON, RowCard, SectionHeader, docCount } from './Parts';
import { SearchEntry } from './SearchEntry';
import type { Brand, Category } from './types';

export type BrandScreenProps = {
  brand: Brand;
  categories: Category[];
  isAdmin: boolean;
  onSearch: () => void;
  onOpenCategory: (id: string) => void;
  onManage?: () => void;
};

/** K2 Brand: logo, counts, brand-scoped search and the categories. */
export function BrandScreen({
  brand,
  categories,
  isAdmin,
  onSearch,
  onOpenCategory,
  onManage,
}: BrandScreenProps) {
  const styles = useStyles();
  const v = brand.visibility;
  return (
    <>
      <View style={styles.hero}>
        <BrandMark mark={brand.mark} size={64} />
        <View style={styles.heroText}>
          <Text variant="title" accessibilityRole="header">
            {brand.name}
          </Text>
          <Text variant="caption" color="muted">
            {formatNumber(brand.docCount)} documents · {brand.categoryCount} categories
          </Text>
        </View>
      </View>
      {isAdmin && v && (
        <Card style={styles.admin}>
          <View style={styles.adminText}>
            <Text variant="row">
              Visible to {v.users} users · {v.sites} sites
            </Text>
            <Text variant="caption" color="muted">
              {v.inReview} document{v.inReview === 1 ? '' : 's'} in review
            </Text>
          </View>
          {onManage && (
            <Button label="Manage" size="small" variant="secondary" onPress={onManage} />
          )}
        </Card>
      )}
      <SearchEntry label={`Search in ${brand.name}`} onPress={onSearch} />
      <View style={styles.section}>
        <SectionHeader title="Categories" />
        <RowCard>
          {categories.map((c, i) => (
            <ListRow
              key={c.id}
              icon={CATEGORY_ICON[c.icon]}
              iconTone={c.docCount === 0 ? 'neutral' : 'primary'}
              title={c.name}
              subtitle={docCount(c.docCount)}
              last={i === categories.length - 1}
              onPress={() => onOpenCategory(c.id)}
            />
          ))}
        </RowCard>
      </View>
    </>
  );
}

const useStyles = makeStyles(() => ({
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.snug },
  heroText: { flex: 1, gap: 2 },
  admin: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: -6 },
  adminText: { flex: 1, gap: 1 },
  section: { gap: spacing.tight },
}));
