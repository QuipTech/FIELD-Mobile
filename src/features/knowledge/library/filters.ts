import { router } from 'expo-router';
import { create } from 'zustand';

import type { LibraryFilters, LibrarySort, LibraryType } from './api';

/**
 * The Knowledge list's filters. In memory only: they last for the session and reset when the
 * app restarts.
 */
type FilterState = LibraryFilters & {
  /** What's typed in the search box; `search` follows it after the debounce. */
  query: string;
  setQuery: (query: string) => void;
  set: (patch: Partial<LibraryFilters>) => void;
  clearFilters: () => void;
};

export const useLibraryFilters = create<FilterState>((set) => ({
  query: '',
  setQuery: (query) => set({ query }),
  set: (patch) => set(patch),
  // Clears everything except the search text.
  clearFilters: () =>
    set({
      type: undefined,
      brandId: undefined,
      categoryId: undefined,
      make: undefined,
      model: undefined,
    }),
}));

/** Selecting a brand always clears the folder (folders belong to a brand). */
export const selectBrand = (brandId?: string) =>
  useLibraryFilters.getState().set({ brandId, categoryId: undefined });

/** The filters the API sees, without the store's functions. */
export function pickFilters(s: FilterState): LibraryFilters {
  return {
    search: s.search,
    type: s.type,
    brandId: s.brandId,
    categoryId: s.categoryId,
    make: s.make,
    model: s.model,
    sort: s.sort,
  };
}

/** How many sheet filters are set (type, make, model): the Filters button's badge. */
export const sheetFilterCount = (f: LibraryFilters) =>
  [f.type, f.make, f.model].filter(Boolean).length;

export const hasAnyFilter = (f: LibraryFilters) =>
  !!(f.type || f.brandId || f.categoryId || f.make || f.model);

/** Opens the Knowledge tab showing one machine model's documents (machine detail › Manuals). */
export function openLibraryForModel(modelId: string) {
  useLibraryFilters.setState({
    model: modelId,
    type: undefined,
    brandId: undefined,
    categoryId: undefined,
    make: undefined,
    search: undefined,
    query: '',
  });
  router.navigate('/knowledge');
}

export type { LibrarySort, LibraryType };
