import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CategoryScreen, type CategoryScreenProps } from '../CategoryScreen';
import { DocRow } from '../DocRow';
import { SAMPLE_DOCS, SAMPLE_PAGES } from '@/test/fixtures/knowledge/sample';
import { highlightParts, searchDocs, sortDocs } from '../search';
import { SearchScreen, type SearchScreenProps } from '../SearchScreen';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
const wrap = (ui: React.ReactElement) =>
  render(<SafeAreaProvider initialMetrics={metrics}>{ui}</SafeAreaProvider>);
const live = SAMPLE_DOCS.filter((d) => d.status === 'live');

describe('knowledge search', () => {
  it('needs every word, ranks title matches first and points at the page', () => {
    const hits = searchDocs(live, SAMPLE_PAGES, 'final drive seal', {});
    expect(hits[0]?.doc.id).toBe('bulletin-2026-114');
    const manual = hits.find((h) => h.doc.id === 'd10t-service-manual');
    expect(manual?.page).toBe(142);
    expect(searchDocs(live, SAMPLE_PAGES, 'final drive seal', { brandId: 'kmt' })).toEqual([]);
  });

  it('highlights each matching word, ignoring case', () => {
    expect(highlightParts('Final drive seal', 'SEAL final')).toEqual([
      { text: 'Final', match: true },
      { text: ' drive ', match: false },
      { text: 'seal', match: true },
    ]);
  });

  it('sorts newest first or A to Z', () => {
    expect(sortDocs(live, 'newest')[0]?.updatedAt).toBe(
      [...live]
        .map((d) => d.updatedAt)
        .sort()
        .reverse()[0],
    );
    expect(sortDocs(live, 'az')[0]?.title).toBe('Coolant loss at high idle after rebuild');
  });
});

describe('DocRow', () => {
  it('flags documents waiting for review (admins only ever receive these)', async () => {
    const doc = SAMPLE_DOCS.find((d) => d.status === 'review')!;
    await wrap(<DocRow doc={doc} onPress={jest.fn()} />);
    expect(screen.getByText('Needs review')).toBeTruthy();
  });
});

describe('SearchScreen', () => {
  const props = (over: Partial<SearchScreenProps> = {}): SearchScreenProps => ({
    query: 'blade tilt cylinder',
    onQuery: jest.fn(),
    filters: { brandId: 'kmt', type: 'knownIssue' },
    onFilters: jest.fn(),
    hits: [],
    loading: false,
    onRetry: jest.fn(),
    brands: [{ id: 'kmt', name: 'Komatsu' }],
    categories: [],
    models: [],
    onCancel: jest.fn(),
    onOpenHit: jest.fn(),
    ...over,
  });

  it('K4b: no results offers to clear the filters', async () => {
    const p = props();
    await wrap(<SearchScreen {...p} />);
    expect(screen.getByText('No results')).toBeTruthy();
    await fireEvent.press(screen.getByText('Clear 2 filters'));
    expect(p.onFilters).toHaveBeenCalledWith({});
  });

  it('counts results across brands and opens a hit', async () => {
    const hits = searchDocs(live, SAMPLE_PAGES, 'final drive seal', {});
    const p = props({ query: 'final drive seal', filters: {}, hits });
    await wrap(<SearchScreen {...p} />);
    expect(screen.getByText(`${hits.length} results across 1 brand`)).toBeTruthy();
    await fireEvent.press(screen.getByLabelText(/^D10T Service Manual/));
    expect(p.onOpenHit).toHaveBeenCalledWith(expect.objectContaining({ page: 142 }));
  });
});

describe('CategoryScreen', () => {
  const props = (over: Partial<CategoryScreenProps> = {}): CategoryScreenProps => ({
    brandName: 'Caterpillar',
    categoryName: 'Survey',
    docs: [],
    loading: false,
    onRetry: jest.fn(),
    filters: {},
    onFilters: jest.fn(),
    sort: 'newest',
    onSort: jest.fn(),
    models: [],
    isAdmin: false,
    onOpenBrand: jest.fn(),
    onOpenDoc: jest.fn(),
    ...over,
  });

  it('K7b: an empty category leads back to the brand', async () => {
    const p = props();
    await wrap(<CategoryScreen {...p} />);
    expect(screen.getByText('No documents yet')).toBeTruthy();
    await fireEvent.press(screen.getByText('Back to Caterpillar'));
    expect(p.onOpenBrand).toHaveBeenCalled();
  });

  it('toggles the sort and hides the Status filter from technicians', async () => {
    const p = props({ docs: live.filter((d) => d.categoryId === 'cat-maint') });
    await wrap(<CategoryScreen {...p} />);
    expect(screen.queryByTestId('filter-status')).toBeNull();
    await fireEvent.press(screen.getByLabelText(/^Sort: Newest/));
    expect(p.onSort).toHaveBeenCalledWith('az');
  });
});
