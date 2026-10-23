import { ArrowUpDown, ChevronRight, FolderOpen } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState/EmptyState';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { SkeletonList } from '@/components/Skeleton/SkeletonList';
import { Text } from '@/components/Text/Text';
import { layout, makeStyles, spacing, useTheme } from '@/theme';
import { DocFilterChips } from './DocFilterChips';
import { DocRow } from './DocRow';
import { RowCard } from './Parts';
import type { DocFilters, DocSort, KnowledgeDoc } from './types';

export type CategoryScreenProps = {
  brandName: string;
  categoryName: string;
  docs: KnowledgeDoc[] | undefined;
  loading: boolean;
  error?: unknown;
  onRetry: () => void;
  filters: DocFilters;
  onFilters: (f: DocFilters) => void;
  sort: DocSort;
  onSort: (s: DocSort) => void;
  models: string[];
  isAdmin: boolean;
  onOpenBrand: () => void;
  onOpenDoc: (id: string) => void;
};

/** K3 Category: breadcrumb, Type/Model(/Status) filters, sort and the documents (K7a/K7b). */
export function CategoryScreen(props: CategoryScreenProps) {
  const { docs, filters, isAdmin } = props;
  const styles = useStyles();
  const { colors } = useTheme();
  const filtered = !!(filters.type || filters.model || filters.status);
  return (
    <>
      <View style={styles.crumb} accessibilityRole="header">
        <Pressable onPress={props.onOpenBrand} accessibilityRole="link" hitSlop={12}>
          <Text variant="label" color="primary">
            {props.brandName}
          </Text>
        </Pressable>
        <ChevronRight size={15} color={colors.muted} strokeWidth={1.8} />
        <Text variant="label">{props.categoryName}</Text>
      </View>
      <DocFilterChips
        value={filters}
        onChange={props.onFilters}
        keys={isAdmin ? ['type', 'model', 'status'] : ['type', 'model']}
        models={props.models}
      />
      {props.loading ? (
        <SkeletonList rows={4} />
      ) : !docs ? (
        <ErrorState error={props.error} onRetry={props.onRetry} />
      ) : docs.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title={filtered ? 'No documents match' : 'No documents yet'}
          message={
            filtered
              ? 'Try another type or model.'
              : 'Nothing has been published in this category. Your admin can upload documents from the FIELD console.'
          }
          action={
            filtered
              ? { label: 'Clear filters', onPress: () => props.onFilters({}) }
              : { label: `Back to ${props.brandName}`, onPress: props.onOpenBrand }
          }
        />
      ) : (
        <>
          <View style={styles.bar}>
            <Text variant="caption" color="muted">
              {docs.length} document{docs.length === 1 ? '' : 's'}
            </Text>
            <Pressable
              onPress={() => props.onSort(props.sort === 'newest' ? 'az' : 'newest')}
              style={styles.sort}
              accessibilityRole="button"
              accessibilityLabel={`Sort: ${props.sort === 'newest' ? 'Newest' : 'A to Z'}. Tap to change`}
            >
              <ArrowUpDown size={15} color={colors.ink} strokeWidth={1.8} />
              <Text variant="label">{props.sort === 'newest' ? 'Newest' : 'A to Z'}</Text>
            </Pressable>
          </View>
          <RowCard>
            {docs.map((d, i) => (
              <DocRow
                key={d.id}
                doc={d}
                last={i === docs.length - 1}
                onPress={() => props.onOpenDoc(d.id)}
              />
            ))}
          </RowCard>
        </>
      )}
    </>
  );
}

const useStyles = makeStyles(() => ({
  crumb: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: -6 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: -8,
  },
  sort: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: layout.minTapTarget,
    paddingLeft: spacing.xs,
  },
}));
