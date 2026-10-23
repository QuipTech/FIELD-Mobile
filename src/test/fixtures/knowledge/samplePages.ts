import type { DocPage } from '@/features/knowledge/types';

/** Searchable page text, keyed by document id. Page 142 is the design's cited page. */
export const SAMPLE_PAGES: Record<string, DocPage[]> = {
  'd10t-service-manual': [
    {
      number: 142,
      header: 'SENR9876-04 · Power train',
      sections: [
        { id: '4.2', blocks: [{ type: 'heading', text: '4.2 Final drive — removal' }] },
        {
          id: '4.3',
          blocks: [
            { type: 'heading', text: '4.3 Final drive — installation' },
            {
              type: 'paragraph',
              text: 'Clean seal faces. Apply 4C-9500 to bolt threads and tighten in a cross pattern.',
            },
            {
              type: 'specs',
              rows: [
                { label: 'Mounting bolts (1)', value: '2,700 ± 300 N·m' },
                { label: 'Sprocket bolts (2)', value: '1,800 ± 200 N·m' },
                { label: 'Cover bolts (3)', value: '270 ± 40 N·m' },
              ],
            },
          ],
        },
        {
          id: 'fig-4-7',
          blocks: [{ type: 'figure', caption: 'Figure 4-7 · Bolt tightening sequence' }],
        },
      ],
    },
  ],
  'bulletin-2026-114': [
    {
      number: 1,
      header: 'Bulletin 2026-114',
      sections: [
        {
          id: '1',
          blocks: [
            { type: 'heading', text: 'Final drive seal inspection — revised interval' },
            {
              type: 'paragraph',
              text: 'Inspect the final drive seal for weeping every 250 h; replace the Duo-Cone seal if weeping persists.',
            },
          ],
        },
      ],
    },
  ],
};
