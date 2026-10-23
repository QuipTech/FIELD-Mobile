import { SearchX } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState/EmptyState';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { SkeletonList } from '@/components/Skeleton/SkeletonList';
import { Text } from '@/components/Text/Text';
import { borders, makeStyles, spacing } from '@/theme';
import { activeFilters, DocFilterChips } from './DocFilterChips';
import { DocRow } from './DocRow';
import { RowCard } from './Parts';
import { SearchBar } from './SearchBar';
import type { DocFilters, SearchHit } from './types';

const KEYS = ['brandId', 'categoryId', 'type', 'model'] as const;

export type SearchScreenProps = {
  query: string;
  onQuery: (q: string) => void;
  filters: DocFilters;
  onFilters: (f: DocFilters) => void;
  hits: SearchHit[] | undefined;
  loading: boolean;
  error?: unknown;
  onRetry: () => void;
  brands: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  models: string[];
  onCancel: () => void;
  onOpenHit: (hit: SearchHit) => void;
};

/** K4 Search results across every accessible brand, and K4b no results. */
export function SearchScreen(props: SearchScreenProps) {
  const { query, hits, filters } = props;
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const active = activeFilters(filters, [...KEYS]);
  const brandCount = new Set(hits?.map((h) => h.doc.brandId)).size;

  return (
    <View style={styles.root}>
      <View style={[styles.top, { paddingTop: insets.top + 6 }]}>
        <SearchBar query={query} onQuery={props.onQuery} onCancel={props.onCancel} />
        <DocFilterChips
          value={filters}
          onChange={props.onFilters}
          keys={[...KEYS]}
          brands={props.brands}
          categories={props.categories}
          models={props.models}
        />
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {query.trim().length < 2 ? (
          <Text color="muted">
            Search across manuals, bulletins, guides and known issues for all your brands.
          </Text>
        ) : props.loading ? (
          <SkeletonList rows={3} />
        ) : !hits ? (
          <ErrorState error={props.error} onRetry={props.onRetry} />
        ) : hits.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No results"
            message="Try a different term or remove filters."
            action={
              active
                ? {
                    label: `Clear ${active} filter${active === 1 ? '' : 's'}`,
                    onPress: () => props.onFilters({}),
                  }
                : undefined
            }
          />
        ) : (
          <>
            <Text variant="caption" color="muted" accessibilityLiveRegion="polite">
              {hits.length} result{hits.length === 1 ? '' : 's'} across {brandCount} brand
              {brandCount === 1 ? '' : 's'}
            </Text>
            <RowCard>
              {hits.map((h, i) => (
                <DocRow
                  key={h.doc.id}
                  doc={h.doc}
                  hit={{ snippet: h.snippet, page: h.page, query }}
                  last={i === hits.length - 1}
                  onPress={() => props.onOpenHit(h)}
                />
              ))}
            </RowCard>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.bg },
  top: {
    backgroundColor: c.card,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: borders.hairline,
    borderBottomColor: c.border,
  },
  content: { padding: spacing.md, gap: spacing.sm },
}));
