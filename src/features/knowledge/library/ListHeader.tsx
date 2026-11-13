import { useState } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/Text/Text';
import { ActivePills, FilterRow } from './FilterBar';
import { FilterSheet } from './FilterSheet';
import { BrandStrip, FolderStrip } from './Strips';
import type { useLibraryScreen } from './useLibraryScreen';

const MODE: Record<string, string | undefined> = {
  semantic: 'AI search',
  keyword: 'Keyword search',
};

/** Brand and folder strips, the filter row, active pills and the result count. */
export function ListHeader({ screen }: { screen: ReturnType<typeof useLibraryScreen> }) {
  const [sheet, setSheet] = useState(false);
  const { filters, total } = screen;
  const mode = screen.searching && screen.searchMode ? MODE[screen.searchMode] : undefined;

  return (
    <View style={{ gap: 8, paddingBottom: 8 }}>
      <BrandStrip brands={screen.brands} selected={filters.brandId} onSelect={screen.selectBrand} />
      {!!filters.brandId && (
        <FolderStrip
          folders={screen.folders}
          selected={filters.categoryId}
          onSelect={(categoryId) => screen.set({ categoryId })}
        />
      )}
      <FilterRow
        count={screen.filterCount}
        onOpen={() => setSheet(true)}
        sort={filters.sort ?? 'relevance'}
        onSort={(sort) => screen.set({ sort })}
        searching={screen.searching}
      />
      <ActivePills pills={screen.pills} onClearAll={screen.clearFilters} />
      {total !== undefined && (
        <View style={{ alignItems: 'flex-end' }}>
          <Text variant="caption" color="muted">
            {total.toLocaleString('en-AU')} {total === 1 ? 'result' : 'results'}
          </Text>
          {mode && (
            <Text variant="caption" color="muted">
              {mode}
            </Text>
          )}
        </View>
      )}
      <FilterSheet
        visible={sheet}
        onClose={() => setSheet(false)}
        filters={filters}
        onChange={screen.set}
        onClearAll={screen.clearFilters}
        makes={screen.makes}
        models={screen.models}
        total={total}
      />
    </View>
  );
}
