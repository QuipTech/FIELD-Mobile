import { useEffect, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';

import {
  useBrandFolders,
  useKnowledgeModels,
  useLibrary,
  useLibraryBrands,
  type LibraryFilters,
} from './api';
import type { ActivePill } from './FilterBar';
import {
  hasAnyFilter,
  pickFilters,
  selectBrand,
  sheetFilterCount,
  useLibraryFilters,
} from './filters';
import { typeMeta } from './meta';

const DEBOUNCE_MS = 350;

/** Everything the Knowledge list shows: filters, search text, results and the filter names. */
export function useLibraryScreen() {
  const store = useLibraryFilters();
  const filters = useLibraryFilters(useShallow(pickFilters));
  const text = store.query;
  const { set } = store;

  // 350 ms after the last keystroke the search runs; the Search key runs it at once.
  useEffect(() => {
    if (text.trim() === (filters.search ?? '')) return;
    const timer = setTimeout(() => set({ search: text.trim() || undefined }), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text, filters.search, set]);
  const submit = () => set({ search: text.trim() || undefined });

  const library = useLibrary(filters);
  const brands = useLibraryBrands();
  const folders = useBrandFolders(filters.brandId);
  const models = useKnowledgeModels();

  const loaded = library.data?.pages;
  const pages = loaded ?? [];
  const items = useMemo(() => (loaded ?? []).flatMap((p) => p.items), [loaded]);
  const last = pages[pages.length - 1];
  const makes = pages[0]?.makes ?? [];
  const searching = !!filters.search?.trim();

  const pills = buildPills(filters, {
    set: store.set,
    brand: brands.data?.find((b) => b.id === filters.brandId)?.name,
    folder: folders.data?.find((f) => f.id === filters.categoryId)?.label,
    make: makes.find((m) => m.id === filters.make)?.name,
    model: models.data?.find((m) => m.id === filters.model)?.displayName ?? last?.activeModel?.name,
  });

  return {
    filters,
    set: store.set,
    clearFilters: store.clearFilters,
    selectBrand,
    text,
    setText: store.setQuery,
    submit,
    searching,
    library,
    items,
    total: last?.total,
    searchMode: last?.searchMode,
    makes,
    brands: brands.data ?? [],
    folders: folders.data ?? [],
    models: models.data ?? [],
    pills,
    filterCount: sheetFilterCount(filters),
    filtered: hasAnyFilter(filters) || searching,
  };
}

/** One removable pill per active filter, named from the loaded lists. */
function buildPills(
  f: LibraryFilters,
  names: {
    set: (patch: Partial<LibraryFilters>) => void;
    brand?: string;
    folder?: string;
    make?: string;
    model?: string;
  },
): ActivePill[] {
  const { set } = names;
  const pills: ActivePill[] = [];
  if (f.brandId)
    pills.push({
      key: 'brand',
      label: names.brand ?? 'Brand',
      onRemove: () => selectBrand(undefined),
    });
  if (f.categoryId) {
    pills.push({
      key: 'folder',
      label: names.folder ?? 'Folder',
      onRemove: () => set({ categoryId: undefined }),
    });
  }
  if (f.type)
    pills.push({
      key: 'type',
      label: typeMeta(f.type).label,
      onRemove: () => set({ type: undefined }),
    });
  if (f.make)
    pills.push({
      key: 'make',
      label: names.make ?? 'Make',
      onRemove: () => set({ make: undefined }),
    });
  if (f.model)
    pills.push({
      key: 'model',
      label: names.model ?? 'Model',
      onRemove: () => set({ model: undefined }),
    });
  return pills;
}
