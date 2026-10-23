import type { Brand, Category } from '@/features/knowledge/types';

export { SAMPLE_DOCS } from './sampleDocs';
export { SAMPLE_PAGES } from './samplePages';

/**
 * The K1–K8 design's sample library, for tests and previews. Only text shown in the designs is used —
 * specs and procedures must come from the knowledge base, never be invented in the app.
 */
export const SAMPLE_BRANDS: Brand[] = [
  {
    id: 'cat',
    name: 'Caterpillar',
    mark: 'CAT',
    docCount: 1248,
    categoryCount: 6,
    visibility: { users: 42, sites: 3, inReview: 2 },
  },
  {
    id: 'kmt',
    name: 'Komatsu',
    mark: 'KMT',
    docCount: 642,
    categoryCount: 5,
    visibility: { users: 42, sites: 3, inReview: 1 },
  },
  {
    id: 'hms',
    name: 'Hemisphere',
    mark: 'HMS',
    docCount: 96,
    categoryCount: 2,
    visibility: { users: 18, sites: 2, inReview: 0 },
  },
  {
    id: 'stx',
    name: 'Stonex',
    mark: 'STX',
    docCount: 54,
    categoryCount: 1,
    visibility: { users: 9, sites: 1, inReview: 0 },
  },
];

export const SAMPLE_CATEGORIES: Category[] = [
  {
    id: 'cat-maint',
    brandId: 'cat',
    name: 'Machine maintenance',
    icon: 'maintenance',
    docCount: 412,
  },
  { id: 'cat-control', brandId: 'cat', name: 'Machine control', icon: 'control', docCount: 186 },
  { id: 'cat-engine', brandId: 'cat', name: 'Engine', icon: 'engine', docCount: 301 },
  {
    id: 'cat-elec',
    brandId: 'cat',
    name: 'Electrical & electronics',
    icon: 'electrical',
    docCount: 233,
  },
  { id: 'cat-hyd', brandId: 'cat', name: 'Hydraulics', icon: 'hydraulics', docCount: 116 },
  { id: 'cat-survey', brandId: 'cat', name: 'Survey', icon: 'survey', docCount: 0 },
  {
    id: 'kmt-maint',
    brandId: 'kmt',
    name: 'Machine maintenance',
    icon: 'maintenance',
    docCount: 288,
  },
  { id: 'hms-control', brandId: 'hms', name: 'Machine control', icon: 'control', docCount: 96 },
  { id: 'stx-survey', brandId: 'stx', name: 'Survey', icon: 'survey', docCount: 54 },
];

/** Recently viewed (newest first) and the user's machine models, until the API returns them. */
export const SAMPLE_RECENT = [
  { docId: 'd10t-service-manual', page: 142, viewedAt: '2026-10-21T07:00:00Z' },
  { docId: 'pc2000-swing-grease', viewedAt: '2026-10-20T08:00:00Z' },
];
export const SAMPLE_MY_MODELS = ['D10T'];
