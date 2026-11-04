import type { ImageSourcePropType } from 'react-native';

export type Slide = {
  key: string;
  title: string;
  body: string;
  image: ImageSourcePropType;
};

const scan = require('../../../assets/onboarding/scan.jpg');
const fieldWork = require('../../../assets/onboarding/field-work.jpg');
const warehouseWork = require('../../../assets/onboarding/warehouse-work.jpg');

export const SLIDES: Slide[] = [
  {
    key: 'scan',
    title: 'Every machine, one scan away',
    body: "Pull up service history, manuals and open cases the moment you're standing at the asset.",
    image: scan,
  },
  {
    key: 'assist',
    title: 'Field support at your fingertips',
    body: 'Access manuals, check service history and get answers about equipment, right where the work happens.',
    image: fieldWork,
  },
  {
    key: 'expert',
    title: 'Keep every job moving',
    body: 'Find parts, follow procedures and record the fix from the warehouse floor, so your team is ready for the next job.',
    image: warehouseWork,
  },
];
