/** Fake Knowledge API: the K1–K8 sample library served in the Backend API Reference's shapes. */
import { API_STATUS, API_TYPE } from '@/features/knowledge/schema';
import type { DocPage, KnowledgeDoc } from '@/features/knowledge/types';
import {
  SAMPLE_BRANDS,
  SAMPLE_CATEGORIES,
  SAMPLE_DOCS,
  SAMPLE_PAGES,
  SAMPLE_RECENT,
} from './fixtures/knowledge/sample';

export const status = (code: number, message: string) => ({
  __status: code,
  body: { statusCode: code, message },
});

const live = SAMPLE_DOCS.filter((d) => d.status === 'live');

const toApiDoc = (d: KnowledgeDoc) => ({
  id: d.id,
  title: d.title,
  type: API_TYPE[d.type],
  status: d.status === 'live' ? 'live' : API_STATUS[d.status],
  brand: { id: d.brandId, name: d.brandName },
  category: { id: d.categoryId, name: d.categoryName },
  models: d.models,
  version: d.version,
  updatedAt: d.updatedAt,
  pageCount: d.pageCount,
  fileSizeBytes: Math.round(d.sizeMb * 1_048_576),
  approvedBy: d.approvedBy ?? null,
});

const sectionText = (s: DocPage['sections'][number]) =>
  s.blocks
    .filter((b) => b.type !== 'heading')
    .map((b) =>
      b.type === 'specs'
        ? b.rows.map((r) => `${r.label}: ${r.value}`).join('\n')
        : 'text' in b
          ? b.text
          : b.caption,
    )
    .join('\n\n');

const toApiPage = (p: DocPage) => ({
  page: p.number,
  text: p.sections.map(sectionText).join('\n\n'),
  sections: p.sections.map((s) => ({
    sectionId: s.id,
    heading: s.blocks.flatMap((b) => (b.type === 'heading' ? [b.text] : []))[0] ?? null,
    text: sectionText(s),
  })),
  imageUrl: null,
  pdfUrl: null,
});

const brand = (id: string) => SAMPLE_BRANDS.find((b) => b.id === id);
const apiBrand = (b: (typeof SAMPLE_BRANDS)[number]) => ({
  id: b.id,
  name: b.name,
  documentCount: b.docCount,
  categoryCount: b.categoryCount,
});
const apiCategory = (c: (typeof SAMPLE_CATEGORIES)[number]) => ({
  id: c.id,
  name: c.name,
  documentCount: c.docCount,
  brand: { id: c.brandId, name: brand(c.brandId)?.name ?? '' },
});

function documents(u: URL) {
  const q = (k: string) => u.searchParams.get(k);
  return live.filter(
    (d) =>
      (!q('brandId') || d.brandId === q('brandId')) &&
      (!q('categoryId') || d.categoryId === q('categoryId')) &&
      (!q('model') || d.models.includes(q('model')!)),
  );
}

export function knowledgeRoute(u: URL): unknown {
  const path = u.pathname;
  if (path === '/knowledge/brands') return SAMPLE_BRANDS.map(apiBrand);
  if (path === '/knowledge/documents') return { items: documents(u).map(toApiDoc), total: 0 };
  if (path === '/knowledge/facets')
    return {
      brands: SAMPLE_BRANDS.map(apiBrand),
      categories: SAMPLE_CATEGORIES.map(apiCategory),
      models: [...new Set(documents(u).flatMap((d) => d.models))],
    };
  if (path === '/knowledge/search') return [];
  if (path === '/me/knowledge/recent')
    return SAMPLE_RECENT.flatMap((r) => {
      const d = live.find((x) => x.id === r.docId);
      return d
        ? [{ document: toApiDoc(d), lastViewedPage: r.page ?? null, viewedAt: r.viewedAt }]
        : [];
    });
  if (path === '/me/knowledge/for-my-machines') return { items: [], total: 0 };
  let m = path.match(/^\/knowledge\/brands\/([^/]+)$/);
  if (m) {
    const b = brand(m[1]!);
    if (!b) return status(403, 'Forbidden');
    return {
      ...apiBrand(b),
      categories: SAMPLE_CATEGORIES.filter((c) => c.brandId === b.id).map(apiCategory),
    };
  }
  m = path.match(/^\/knowledge\/categories\/([^/]+)$/);
  if (m) {
    const c = SAMPLE_CATEGORIES.find((x) => x.id === m![1]);
    return c ? { ...apiCategory(c), models: [] } : status(403, 'Forbidden');
  }
  m = path.match(/^\/knowledge\/documents\/([^/]+)(?:\/pages\/(\d+))?$/);
  if (m) {
    const d = live.find((x) => x.id === m![1]);
    if (!d) return status(404, 'Not found');
    if (!m[2]) return toApiDoc(d);
    const p = SAMPLE_PAGES[d.id]?.find((x) => x.number === Number(m![2]));
    return p
      ? toApiPage(p)
      : { page: Number(m[2]), text: '', sections: [], imageUrl: null, pdfUrl: null };
  }
  return undefined;
}
