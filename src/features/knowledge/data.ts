export type ArticleBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'figure'; caption: string }
  | { type: 'warning'; text: string };

export type KnowledgeArticle = {
  id: string;
  kind: 'Procedure' | 'Bulletin';
  title: string;
  model: string;
  /** e.g. "Rev 4" or "Issued 28 Feb". */
  revision: string;
  offline: boolean;
  blocks: ArticleBlock[];
};

/**
 * TODO(api): the M7 design's article, plus a stub for Bulletin 88. Only the text from the
 * designs is included — procedure steps must come from the knowledge base, never be invented.
 */
const ARTICLES: KnowledgeArticle[] = [
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

export function useArticle(id: string | undefined): KnowledgeArticle | undefined {
  return ARTICLES.find((a) => a.id === id);
}
