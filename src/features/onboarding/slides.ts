import type { ImageSourcePropType } from 'react-native';

export type Slide = {
  key: string;
  title: string;
  body: string;
  image: ImageSourcePropType;
};

const scan = require('../../../assets/onboarding/scan.jpg');

// Slide 1 is from the M0.5 design. TODO(confirm): copy and illustrations for slides 2–3
// aren't in the design yet — they reuse slide 1's image until provided.
export const SLIDES: Slide[] = [
  {
    key: 'scan',
    title: 'Every machine, one scan away',
    body: "Pull up service history, manuals and open cases the moment you're standing at the asset.",
    image: scan,
  },
  {
    key: 'assist',
    title: 'Answers on the spot',
    body: 'Ask the AI assistant about faults, parts and procedures — grounded in your manuals and history.',
    image: scan,
  },
  {
    key: 'expert',
    title: 'Never stuck on your own',
    body: 'Bring in a remote expert when you need one, and capture the fix so the next tech starts ahead.',
    image: scan,
  },
];
