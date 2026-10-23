import type { AiConversation, ReviewItem } from '@/features/history/data';

const daysAgo = (days: number, hours = 0) =>
  new Date(Date.now() - (days * 24 + hours) * 3_600_000).toISOString();

export const SAMPLE_CONVERSATIONS: AiConversation[] = [
  {
    id: 'c-3',
    machine: 'HT-2201',
    question: 'E-2204 on cold start, pre-charge 8.2 MPa. What first?',
    at: daysAgo(0, 0.5),
  },
  {
    id: 'c-2',
    machine: 'LD-0904',
    question: "What's the torque spec for the final drive bolts?",
    at: daysAgo(1),
  },
  {
    id: 'c-1',
    machine: 'DR-4412',
    question: 'Show me the drill rod change procedure',
    at: daysAgo(4),
  },
];

/** The AI4 design's review queue. */
export const SAMPLE_REVIEW_QUEUE: ReviewItem[] = [
  {
    id: 'r-4',
    title: 'Bypass park brake interlock',
    reason: 'safety',
    author: 'A. Kaur',
    machineId: 'DZ-11',
    status: 'unreviewed',
  },
  {
    id: 'r-3',
    title: 'Coolant spec Hemisphere receiver',
    reason: 'noSource',
    author: 'U. Malik',
    machineId: '',
    status: 'unreviewed',
  },
  {
    id: 'r-2',
    title: 'Bucket pin clearance',
    reason: 'markedWrong',
    author: 'J. Rossi',
    machineId: 'EX-03',
    status: 'inReview',
    reviewer: 'RM',
  },
  {
    id: 'r-1',
    title: 'Track sag measurement',
    reason: 'lowConfidence',
    author: 'A. Kaur',
    machineId: 'DZ-07',
    status: 'resolved',
  },
];
