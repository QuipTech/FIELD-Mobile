import { fireEvent, render, screen } from '@testing-library/react-native';

import { flattenFolders, libraryQuery, type KnowledgeResult } from '../library/api';
import { paragraphs } from '../library/ArticleBody';
import { highlightParts, ResultCard } from '../library/ResultCard';

const RESULT: KnowledgeResult = {
  id: 'doc-1',
  title: 'VR1000 Install Guide',
  type: 'manual',
  snippet: 'Mount the Antenna on the cab roof, then route the antenna cable.',
  highlights: ['antenna'],
  page: 12,
  heading: 'Mounting',
  sectionId: 's-12',
  models: ['Hitachi 3600'],
  source: 'shared',
  sourceOem: null,
  versionNumber: 3,
  updatedAt: new Date().toISOString(),
};

describe('libraryQuery', () => {
  it('omits empty filters and sorts by newest without a search', () => {
    expect(libraryQuery({ search: '  ', brandId: undefined }, 1)).toEqual({
      sort: 'newest',
      page: 1,
      pageSize: 20,
    });
  });

  it('sends the search with relevance by default, and the chosen sort', () => {
    expect(libraryQuery({ search: 'pump', type: 'manual' }, 2)).toMatchObject({
      search: 'pump',
      sort: 'relevance',
      type: 'manual',
      page: 2,
    });
    expect(libraryQuery({ search: 'pump', sort: 'newest' }, 1).sort).toBe('newest');
  });
});

describe('flattenFolders', () => {
  it('orders nested folders depth-first as "Parent › Child"', () => {
    const folder = (id: string, name: string, parentId: string | null, sortOrder: number) => ({
      id,
      brandId: 'b',
      parentId,
      name,
      slug: id,
      sortOrder,
    });
    expect(
      flattenFolders([
        folder('c', 'Engine', null, 2),
        folder('a', 'Maintenance', null, 1),
        folder('a2', 'Daily', 'a', 1),
      ]).map((f) => f.label),
    ).toEqual(['Maintenance', 'Maintenance › Daily', 'Engine']);
  });
});

describe('highlightParts', () => {
  it('bolds every highlight, ignoring case', () => {
    const bold = highlightParts(RESULT.snippet!, RESULT.highlights)
      .filter((p) => p.bold)
      .map((p) => p.text);
    expect(bold).toEqual(['Antenna', 'antenna']);
  });

  it('treats <mark> tags as highlights', () => {
    expect(highlightParts('a <mark>pump</mark> b')).toEqual([
      { text: 'a ', bold: false },
      { text: 'pump', bold: true },
      { text: ' b', bold: false },
    ]);
  });
});

describe('ResultCard', () => {
  it('shows type, source, model and meta, and opens on tap', async () => {
    const onOpen = jest.fn();
    const onLongPress = jest.fn();
    await render(<ResultCard item={RESULT} onOpen={onOpen} onLongPress={onLongPress} />);
    expect(screen.getByText('QuipTech library')).toBeTruthy();
    expect(screen.getByText('MOUNTING')).toBeTruthy();
    expect(screen.getByText(/^p\. 12 · Rev 3 · /)).toBeTruthy();
    const card = screen.getByRole('button', { name: 'Manual, VR1000 Install Guide, Hitachi 3600' });
    await fireEvent.press(card);
    expect(onOpen).toHaveBeenCalledWith(RESULT);
    await fireEvent(card, 'longPress');
    expect(onLongPress).toHaveBeenCalledWith(RESULT);
  });
});

describe('paragraphs', () => {
  it('splits on blank lines', () => {
    expect(paragraphs('One.\n\nTwo.\n   \nThree.')).toEqual(['One.', 'Two.', 'Three.']);
  });
});
