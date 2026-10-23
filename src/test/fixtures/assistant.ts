import type { AiUsage, ChatMessage } from '@/features/assistant/data';

/** The AI1 design's usage figures, for tests and previews. */
export const SAMPLE_USAGE: Record<AiUsage['scope'], AiUsage> = {
  mine: { used: 142, limit: 500, scope: 'mine', resetsOn: '2026-11-01T00:00:00Z' },
  org: {
    used: 3820,
    limit: 5000,
    scope: 'org',
    resetsOn: '2026-11-01T00:00:00Z',
    overage: '$0.04',
  },
};

/** The M8 design's sample exchange. */
export const SAMPLE_THREAD: ChatMessage[] = [
  { id: 'u1', role: 'user', text: 'E-2204 on cold start, pre-charge 8.2 MPa. What first?' },
  {
    id: 'a1',
    role: 'assistant',
    text: '8.2 MPa is below the 9.5–10.5 MPa cold window, so the alarm is genuine. Recharge the accumulator and hold 15 min; if it bleeds down, replace the bladder.',
    citations: [
      { id: 'c1', label: '1 · Manual p.214' },
      { id: 'c2', label: '2 · Bulletin 88', articleId: 'bulletin-88' },
    ],
    review: { confidence: 0.91, sections: 4 },
  },
];
