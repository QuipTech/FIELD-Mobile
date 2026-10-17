import type { PillTone } from '@/components/Pill/Pill';
import { SAMPLE_MACHINES, type MachineRef } from '@/features/machines/data';

export type CasePriority = 'P1' | 'P2' | 'P3';
export type CaseStatus = 'open' | 'resolved';

export type CaseActivity = {
  id: string;
  author: string;
  initials: string;
  /** Written by the signed-in user: shown as "You" with their initials. */
  mine?: boolean;
  /** ISO time. */
  at: string;
  body: string;
};

export type SupportCase = {
  /** Case number, e.g. "1042". */
  id: string;
  priority: CasePriority;
  status: CaseStatus;
  title: string;
  machine: MachineRef;
  /** One-line state for the list, e.g. "awaiting your reply". */
  summary: string;
  openedAt: string;
  openedBy: string;
  updatedAt: string;
  description: string;
  attachments: { id: string; name: string }[];
  /** Newest first. */
  activity: CaseActivity[];
};

export const PRIORITY_TONE: Record<CasePriority, PillTone> = {
  P1: 'danger',
  P2: 'amber',
  P3: 'muted',
};

export const STATUS_LABEL: Record<CaseStatus, string> = { open: 'Open', resolved: 'Resolved' };

const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();
const HOUR = 60;
const DAY = 24 * HOUR;

/**
 * TODO(api): the M11 design's sample cases until the support-cases endpoints exist. Replace
 * `useCases` / `useCase` with react-query calls; the screens only read these shapes.
 */
export const SAMPLE_CASES: SupportCase[] = [
  {
    id: '1042',
    priority: 'P1',
    status: 'open',
    title: "Brake pressure alarm won't clear",
    machine: SAMPLE_MACHINES['HT-2201'],
    summary: 'awaiting your reply',
    openedAt: ago(2 * HOUR),
    openedBy: 'you',
    updatedAt: ago(1 * HOUR),
    description:
      'E-2204 on every cold start since the pump swap. Pre-charge reads 8.2 MPa against a 9.5 MPa minimum. Machine parked at Bench 3 pending parts.',
    attachments: [
      { id: 'a1', name: 'Pressure gauge' },
      { id: 'a2', name: 'Alarm screen' },
    ],
    activity: [
      {
        id: 'act-2',
        author: 'T. Meyer',
        initials: 'TM',
        at: ago(1 * HOUR),
        body: 'Assigned to QuipTech support, checking pump firmware version.',
      },
      {
        id: 'act-1',
        author: 'You',
        initials: '',
        mine: true,
        at: ago(2 * HOUR),
        body: 'Raised from AI assistant conversation.',
      },
    ],
  },
  {
    id: '1038',
    priority: 'P2',
    status: 'open',
    title: 'Hydraulic whine on lift',
    machine: SAMPLE_MACHINES['LD-0904'],
    summary: 'with QuipTech support',
    openedAt: ago(2 * DAY),
    openedBy: 'you',
    updatedAt: ago(1 * DAY),
    description: 'High-pitched whine from the lift circuit under load, worse when the oil is cold.',
    attachments: [],
    activity: [
      {
        id: 'act-1',
        author: 'QuipTech support',
        initials: 'QT',
        at: ago(1 * DAY),
        body: 'Thanks — can you record a short video of the noise at full lift?',
      },
    ],
  },
  {
    id: '1029',
    priority: 'P3',
    status: 'open',
    title: 'Request: torque spec sheet',
    machine: SAMPLE_MACHINES['DR-4412'],
    summary: 'resolved, pending close',
    openedAt: ago(6 * DAY),
    openedBy: 'you',
    updatedAt: ago(4 * DAY),
    description: 'Need the torque spec sheet for the rotation head mounting bolts.',
    attachments: [],
    activity: [],
  },
  {
    id: '1017',
    priority: 'P3',
    status: 'resolved',
    title: 'Cab A/C not cooling',
    machine: SAMPLE_MACHINES['HT-2188'],
    summary: 'closed by support',
    openedAt: ago(15 * DAY),
    openedBy: 'you',
    updatedAt: ago(12 * DAY),
    description: 'Cab A/C blowing warm air after a filter change.',
    attachments: [],
    activity: [],
  },
];

export function useCases(): { data: SupportCase[]; isSample: true } {
  return { data: SAMPLE_CASES, isSample: true };
}

export function useCase(id: string | undefined): SupportCase | undefined {
  return SAMPLE_CASES.find((c) => c.id === id);
}
