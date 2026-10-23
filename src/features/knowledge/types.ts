import type { BadgeTone } from '@/components/Badge/Badge';

export type DocType = 'manual' | 'bulletin' | 'guide' | 'knownIssue';

export const DOC_TYPE: Record<DocType, { label: string; tone: BadgeTone }> = {
  manual: { label: 'Manual', tone: 'neutral' },
  bulletin: { label: 'Bulletin', tone: 'warning' },
  guide: { label: 'Guide', tone: 'primary' },
  knownIssue: { label: 'Known issue', tone: 'danger' },
};

/** Technicians only ever receive `live` documents; admins also see the others. */
export type DocStatus = 'live' | 'review' | 'failed' | 'archived';

export type Brand = {
  id: string;
  name: string;
  /** Short mark shown in the logo tile until brand logos arrive, e.g. "CAT". */
  mark: string;
  docCount: number;
  categoryCount: number;
  /** Admin only. */
  visibility?: { users: number; sites: number; inReview: number };
};

export type CategoryIcon =
  'maintenance' | 'control' | 'engine' | 'electrical' | 'hydraulics' | 'survey';

export type Category = {
  id: string;
  brandId: string;
  name: string;
  icon: CategoryIcon;
  docCount: number;
};

export type KnowledgeDoc = {
  id: string;
  brandId: string;
  brandName: string;
  categoryId: string;
  categoryName: string;
  type: DocType;
  title: string;
  /** Machine models the document applies to, e.g. ["D10T"]. */
  models: string[];
  version: string;
  /** ISO date of the last approved change. */
  updatedAt: string;
  status: DocStatus;
  pageCount: number;
  sizeMb: number;
  approvedBy?: string;
  /** Admin only: indexing result. */
  indexedSections?: number;
  /** In-app article (Procedure) instead of pages; opened with ArticleView. */
  articleId?: string;
  /** Changes when a new version is published; offline copies are keyed by it. */
  versionId?: string;
};

/** One block of a page, as returned by the page-text endpoint. */
export type PageBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'specs'; rows: { label: string; value: string }[] }
  | { type: 'figure'; caption: string };

/** A numbered section on a page; AI citations point at one (`?section=4.3`). */
export type PageSection = { id: string; blocks: PageBlock[] };

export type DocPage = {
  number: number;
  /** Running header, e.g. "SENR9876-04 · Power train". */
  header: string;
  sections: PageSection[];
  /** Rendered page image (null from the API for now). */
  imageUrl?: string;
  /** The PDF, opening at this page. */
  pdfUrl?: string;
};

/** Search result: the document plus where the match was. */
export type SearchHit = {
  doc: KnowledgeDoc;
  page?: number;
  /** Section on that page, e.g. "4.3". */
  sectionId?: string;
  /** Text around the match; `terms` are highlighted in it. */
  snippet: string;
};

export type DocFilters = {
  brandId?: string;
  categoryId?: string;
  type?: DocType;
  model?: string;
  /** Admin only. */
  status?: DocStatus;
};

export type DocSort = 'newest' | 'az';
