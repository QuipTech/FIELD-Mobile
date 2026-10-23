import type { DocFilters, DocPage, DocSort, KnowledgeDoc, SearchHit } from './types';

export function sortDocs(docs: KnowledgeDoc[], sort: DocSort) {
  const copy = [...docs];
  return sort === 'az'
    ? copy.sort((a, b) => a.title.localeCompare(b.title))
    : copy.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

const words = (q: string) =>
  q
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 1);

function pageText(page: DocPage) {
  return page.sections
    .flatMap((s) => s.blocks)
    .map((b) =>
      b.type === 'specs'
        ? b.rows.map((r) => `${r.label} ${r.value}`).join(' ')
        : 'text' in b
          ? b.text
          : b.caption,
    )
    .join(' ');
}

/** About 90 characters around the first matching word. */
function snippetAround(text: string, terms: string[]) {
  const lower = text.toLowerCase();
  const at = Math.min(...terms.map((t) => lower.indexOf(t)).filter((i) => i >= 0));
  if (!Number.isFinite(at)) return text.slice(0, 90);
  const start = Math.max(0, at - 30);
  const end = Math.min(text.length, at + 70);
  return `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`;
}

/**
 * Client-side stand-in for GET /knowledge/search: every word must appear in the title or a
 * page. Title matches rank first. Online search uses `GET /knowledge/search`; this covers saved documents.
 */
export function searchDocs(
  docs: KnowledgeDoc[],
  pages: Record<string, DocPage[]>,
  q: string,
  filters: DocFilters,
): SearchHit[] {
  const terms = words(q);
  if (!terms.length) return [];
  const hits: (SearchHit & { rank: number })[] = [];
  for (const doc of docs) {
    if (filters.brandId && doc.brandId !== filters.brandId) continue;
    if (filters.categoryId && doc.categoryId !== filters.categoryId) continue;
    if (filters.type && doc.type !== filters.type) continue;
    if (filters.model && !doc.models.includes(filters.model)) continue;
    const page = pages[doc.id]?.find((p) =>
      terms.every((t) => pageText(p).toLowerCase().includes(t)),
    );
    const inTitle = terms.every((t) => doc.title.toLowerCase().includes(t));
    if (page)
      hits.push({
        doc,
        page: page.number,
        snippet: snippetAround(pageText(page), terms),
        rank: inTitle ? 0 : 1,
      });
    else if (inTitle) hits.push({ doc, snippet: doc.title, rank: 0 });
  }
  return hits.sort((a, b) => a.rank - b.rank).map(({ rank: _rank, ...hit }) => hit);
}

/** Splits text into plain and highlighted parts for `<mark>`-style rendering. */
export function highlightParts(text: string, q: string): { text: string; match: boolean }[] {
  const terms = words(q).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!terms.length) return [{ text, match: false }];
  const re = new RegExp(`(${terms.join('|')})`, 'gi');
  return text
    .split(re)
    .filter(Boolean)
    .map((part) => ({
      text: part,
      match: terms.some((t) => new RegExp(`^${t}$`, 'i').test(part)),
    }));
}
