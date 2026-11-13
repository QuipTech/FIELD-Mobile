import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';

import { SearchField } from '@/components/SearchField/SearchField';
import { useTabBarSpace } from '@/features/navigation/tabBarSpace';
import { makeStyles } from '@/theme';
import type { KnowledgeResult } from './api';
import { ListHeader } from './ListHeader';
import { EmptyResults, ErrorBanner, SkeletonCards } from './ListStates';
import { ResultCard } from './ResultCard';
import { ResultActions } from './ResultActions';
import { useLibraryScreen } from './useLibraryScreen';

export type KnowledgeLibraryProps = {
  onOpen: (item: KnowledgeResult) => void;
};

/** The Knowledge tab: search, brand and folder strips, filters, and the document list. */
export function KnowledgeLibrary({ onOpen }: KnowledgeLibraryProps) {
  const styles = useStyles();
  const screen = useLibraryScreen();
  const { library, items } = screen;
  const bottom = useTabBarSpace();
  const [refreshing, setRefreshing] = useState(false);
  const [actionsFor, setActionsFor] = useState<KnowledgeResult>();

  const onLongPress = useCallback((item: KnowledgeResult) => setActionsFor(item), []);
  const renderItem = useCallback(
    ({ item }: { item: KnowledgeResult }) => (
      <ResultCard item={item} onOpen={onOpen} onLongPress={onLongPress} />
    ),
    [onOpen, onLongPress],
  );
  const refresh = async () => {
    setRefreshing(true);
    try {
      await library.refetch();
    } finally {
      setRefreshing(false);
    }
  };
  const loadMore = () => {
    if (library.hasNextPage && !library.isFetchingNextPage && !library.isError) {
      void library.fetchNextPage();
    }
  };
  const firstLoad = library.isPending && items.length === 0;

  return (
    <View style={styles.root}>
      <View style={styles.search}>
        <SearchField
          value={screen.text}
          onChange={screen.setText}
          onSubmit={screen.submit}
          label="Search manuals, bulletins, parts…"
          style={styles.searchField}
        />
      </View>
      <FlatList
        data={firstLoad ? [] : items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={
          <>
            <ListHeader screen={screen} />
            {library.isError && items.length > 0 && (
              <ErrorBanner error={library.error} onRetry={() => void library.refetch()} />
            )}
          </>
        }
        ListEmptyComponent={
          firstLoad ? (
            <SkeletonCards />
          ) : library.isError ? (
            <ErrorBanner error={library.error} onRetry={() => void library.refetch()} />
          ) : (
            <EmptyResults filtered={screen.filtered} onClear={screen.clearFilters} />
          )
        }
        ListFooterComponent={
          library.isFetchingNextPage ? <ActivityIndicator style={styles.more} /> : null
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.6}
        refreshing={refreshing}
        onRefresh={() => void refresh()}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: bottom + 16 }]}
        initialNumToRender={8}
        windowSize={9}
      />
      <ResultActions item={actionsFor} onClose={() => setActionsFor(undefined)} onOpen={onOpen} />
    </View>
  );
}

function Separator() {
  return <View style={{ height: 12 }} />;
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.bg },
  search: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: c.card,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  searchField: { minHeight: 48, borderRadius: 16, paddingLeft: 14, paddingRight: 4 },
  content: { paddingHorizontal: 16, paddingTop: 10 },
  more: { marginVertical: 16 },
}));
