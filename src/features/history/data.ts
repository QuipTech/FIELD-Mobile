import { useMemo } from 'react';

import { useEntryLog } from '@/features/capture/store';
import type { EntryType } from '@/features/machines/records';

export type HistoryEntry = {
  id: string;
  type: EntryType;
  title: string;
  machineId: string;
  /** "you", or a colleague's name. */
  loggedBy: string;
  /** ISO date. */
  at: string;
};

export type AiConversation = {
  id: string;
  machineId: string;
  /** The opening question. */
  question: string;
  /** ISO time of the last message. */
  at: string;
};

const daysAgo = (days: number, hours = 0) =>
  new Date(Date.now() - (days * 24 + hours) * 3_600_000).toISOString();

/** TODO(api): the M16 / M17 designs' sample data until the history endpoints exist. */
export const SAMPLE_ENTRIES: HistoryEntry[] = [
  {
    id: 'e-301',
    type: 'repair',
    title: 'Main hydraulic pump replaced',
    machineId: 'HT-2201',
    loggedBy: 'you',
    at: daysAgo(6),
  },
  {
    id: 'e-288',
    type: 'inspection',
    title: '250 h walkaround',
    machineId: 'HT-2188',
    loggedBy: 'you',
    at: daysAgo(14),
  },
  {
    id: 'e-270',
    type: 'service',
    title: '1,000 h service · engine & filters',
    machineId: 'HT-2201',
    loggedBy: 'you',
    at: daysAgo(27),
  },
];

export const SAMPLE_CONVERSATIONS: AiConversation[] = [
  {
    id: 'c-3',
    machineId: 'HT-2201',
    question: 'E-2204 on cold start, pre-charge 8.2 MPa. What first?',
    at: daysAgo(0, 0.5),
  },
  {
    id: 'c-2',
    machineId: 'LD-0904',
    question: "What's the torque spec for the final drive bolts?",
    at: daysAgo(1),
  },
  {
    id: 'c-1',
    machineId: 'DR-4412',
    question: 'Show me the drill rod change procedure',
    at: daysAgo(4),
  },
];

/** Everything you've logged: entries captured on this device first, then the sample history. */
export function useMachineHistory(): HistoryEntry[] {
  const logged = useEntryLog((s) => s.entries);
  return useMemo(
    () => [...logged.map((e) => ({ ...e, loggedBy: 'you' })), ...SAMPLE_ENTRIES],
    [logged],
  );
}

export function useAiHistory(): AiConversation[] {
  return SAMPLE_CONVERSATIONS;
}
