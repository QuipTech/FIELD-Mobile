export type Citation = {
  id: string;
  /** e.g. "1 · Manual p.214". */
  label: string;
  /** In-app article this cites, when there is one. */
  articleId?: string;
};

export type ChatMessage =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'assistant'; text: string; citations: Citation[] }
  | { id: string; role: 'notice'; text: string };

/** TODO(api): the M8 design's sample exchange, shown until Ask AI is connected. */
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
  },
];

export const SUGGESTIONS = [
  'Why won’t E-2204 clear?',
  'Torque spec for the final drive bolts',
  'Drill rod change procedure',
];

export const NOT_CONNECTED =
  'Ask AI isn’t connected yet — answers from your manuals and bulletins arrive with the API.';
