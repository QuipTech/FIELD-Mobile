import type { KnowledgeArticle } from '@/features/knowledge/data';

/** The M7 design's article, plus a stub for Bulletin 88, for tests and previews. */
export const SAMPLE_ARTICLES: KnowledgeArticle[] = [
  {
    id: 'rear-suspension-recharge',
    kind: 'Procedure',
    title: 'Rear suspension cylinder recharge',
    model: 'CAT 793F',
    revision: 'Rev 4',
    offline: true,
    blocks: [
      {
        type: 'paragraph',
        text: "Charge the rear suspension cylinders to the pressure specified for the machine's loaded weight class. Two technicians required.",
      },
      { type: 'figure', caption: 'Figure 4 — charging group' },
      { type: 'heading', text: 'Prerequisites' },
      {
        type: 'paragraph',
        text: 'Machine on level ground, body down, park brake applied and wheels chocked. Allow 30 minutes before a cold reading.',
      },
      {
        type: 'warning',
        text: 'Bulletin 88 revises the charge pressure for cylinders built after 2023.',
      },
    ],
  },
  {
    id: 'bulletin-88',
    kind: 'Bulletin',
    title: 'Bulletin 88 — charge pressure revision',
    model: 'CAT 793F',
    revision: 'Issued 28 Feb',
    offline: false,
    blocks: [
      {
        type: 'paragraph',
        text: 'Revises the charge pressure for suspension cylinders built after 2023.',
      },
      {
        type: 'warning',
        text: 'Sample bulletin — the full text arrives with the knowledge-base API.',
      },
    ],
  },
];

export function sampleArticle(id: string): KnowledgeArticle | undefined {
  return SAMPLE_ARTICLES.find((a) => a.id === id);
}
