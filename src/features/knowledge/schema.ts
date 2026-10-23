import { z } from 'zod';

import type { Brand, Category, CategoryIcon, DocStatus, DocType, KnowledgeDoc } from './types';

/** Knowledge responses (Backend API Reference §1), turned into the shapes the screens use. */

const ref = z.object({ id: z.string(), name: z.string().nullish() }).loose().nullish();
const count = z.number().nullish();

export const apiBrand = z
  .object({
    id: z.string(),
    name: z.string(),
    documentCount: count,
    categoryCount: count,
    isRestricted: z.boolean().nullish(),
    admin: z.object({ inReviewCount: count, siteCount: count, activeUserCount: count }).nullish(),
  })
  .loose();

export const apiCategory = z
  .object({ id: z.string(), name: z.string(), documentCount: count, brand: ref })
  .loose();

export const apiDoc = z
  .object({
    id: z.string(),
    title: z.string(),
    type: z.string().nullish(),
    status: z.string().nullish(),
    brand: ref,
    category: ref,
    brandId: z.string().nullish(),
    categoryId: z.string().nullish(),
    models: z
      .array(z.union([z.string(), z.object({ name: z.string() }).transform((m) => m.name)]))
      .nullish(),
    version: z.union([z.string(), z.number()]).nullish(),
    versionLabel: z.string().nullish(),
    versionId: z.string().nullish(),
    updatedAt: z.string().nullish(),
    publishedAt: z.string().nullish(),
    pageCount: count,
    fileSizeBytes: count,
    sizeBytes: count,
    approvedBy: z
      .union([z.string(), z.object({ name: z.string().nullish() }).transform((p) => p.name ?? '')])
      .nullish(),
    indexedSectionCount: count,
    lastViewedPage: count,
  })
  .loose();
export type ApiDoc = z.infer<typeof apiDoc>;

const TYPES: Record<string, DocType> = {
  manual: 'manual',
  bulletin: 'bulletin',
  service_bulletin: 'bulletin',
  guide: 'guide',
  procedure: 'guide',
  known_issue: 'knownIssue',
  knownIssue: 'knownIssue',
};
export const API_TYPE: Record<DocType, string> = {
  manual: 'manual',
  bulletin: 'bulletin',
  guide: 'guide',
  knownIssue: 'known_issue',
};
const STATUSES: Record<string, DocStatus> = {
  live: 'live',
  published: 'live',
  review: 'review',
  in_review: 'review',
  needs_review: 'review',
  failed: 'failed',
  archived: 'archived',
};
export const API_STATUS: Record<DocStatus, string> = {
  live: 'live',
  review: 'in_review',
  failed: 'failed',
  archived: 'archived',
};

/** Logo-tile text until brand logos arrive: "CAT", or the first three letters. */
export const brandMark = (name: string) =>
  (name.match(/\b[A-Z]{2,4}\b/)?.[0] ?? name.replace(/[^A-Za-z]/g, '').slice(0, 3)).toUpperCase();

export function toBrand(b: z.infer<typeof apiBrand>): Brand {
  return {
    id: b.id,
    name: b.name,
    mark: brandMark(b.name),
    docCount: b.documentCount ?? 0,
    categoryCount: b.categoryCount ?? 0,
    visibility: b.admin
      ? {
          users: b.admin.activeUserCount ?? 0,
          sites: b.admin.siteCount ?? 0,
          inReview: b.admin.inReviewCount ?? 0,
        }
      : undefined,
  };
}

const ICONS: [RegExp, CategoryIcon][] = [
  [/control|guidance|gps/i, 'control'],
  [/engine|power/i, 'engine'],
  [/electric/i, 'electrical'],
  [/hydraul/i, 'hydraulics'],
  [/survey/i, 'survey'],
];

export function toCategory(c: z.infer<typeof apiCategory>, brandId: string): Category {
  return {
    id: c.id,
    brandId: c.brand?.id ?? brandId,
    name: c.name,
    icon: ICONS.find(([re]) => re.test(c.name))?.[1] ?? 'maintenance',
    docCount: c.documentCount ?? 0,
  };
}

export function toDoc(d: ApiDoc): KnowledgeDoc {
  const bytes = d.fileSizeBytes ?? d.sizeBytes ?? 0;
  return {
    id: d.id,
    brandId: d.brand?.id ?? d.brandId ?? '',
    brandName: d.brand?.name ?? '',
    categoryId: d.category?.id ?? d.categoryId ?? '',
    categoryName: d.category?.name ?? '',
    type: TYPES[d.type ?? ''] ?? 'manual',
    title: d.title,
    models: d.models ?? [],
    version: String(d.versionLabel ?? d.version ?? '1'),
    updatedAt: d.updatedAt ?? d.publishedAt ?? '',
    status: STATUSES[d.status ?? 'live'] ?? 'live',
    pageCount: Math.max(d.pageCount ?? 1, 1),
    sizeMb: Math.round((bytes / 1_048_576) * 10) / 10,
    approvedBy: d.approvedBy || undefined,
    indexedSections: d.indexedSectionCount ?? undefined,
    versionId: d.versionId ?? undefined,
  };
}

export const stripMarks = (snippet: string) => snippet.replace(/<\/?mark>/g, '');
