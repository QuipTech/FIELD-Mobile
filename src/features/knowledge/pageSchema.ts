import { z } from 'zod';

import type { DocPage, PageBlock } from './types';

/** `GET /knowledge/documents/{id}/pages/{n}`: page text, its sections and the PDF link. */

const count = z.number().nullish();

export const apiPage = z
  .object({
    page: count,
    number: count,
    text: z.string().default(''),
    sections: z
      .array(
        z
          .object({
            sectionId: z.string(),
            heading: z.string().nullish(),
            text: z.string().nullish(),
          })
          .loose(),
      )
      .default([]),
    imageUrl: z.string().nullish(),
    pdfUrl: z.string().nullish(),
  })
  .loose();

const paragraphs = (text: string): PageBlock[] =>
  text
    .split(/\n\s*\n/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => ({ type: 'paragraph', text: t }));

/**
 * Page text as sections. When the API gives each section its own text they render separately
 * (so a cited section can be outlined); otherwise headings come first, then the page text.
 */
export function toPage(raw: unknown, number: number, header: string): DocPage {
  const p = apiPage.parse(raw);
  const withText = p.sections.some((s) => s.text);
  const sections = withText
    ? p.sections.map((s) => ({
        id: s.sectionId,
        blocks: [
          ...(s.heading ? [{ type: 'heading' as const, text: s.heading }] : []),
          ...paragraphs(s.text ?? ''),
        ],
      }))
    : [
        ...p.sections.map((s) => ({
          id: s.sectionId,
          blocks: s.heading ? [{ type: 'heading' as const, text: s.heading }] : [],
        })),
        { id: 'page-text', blocks: paragraphs(p.text) },
      ];
  return {
    number: p.page ?? p.number ?? number,
    header,
    sections,
    imageUrl: p.imageUrl ?? undefined,
    pdfUrl: p.pdfUrl ?? undefined,
  };
}
