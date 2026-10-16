export type MachineStatus = 'down' | 'due' | 'ok';

export type AssignedMachine = {
  id: string;
  /** e.g. "HT-2201 · CAT 793F" */
  title: string;
  detail: string;
  status: MachineStatus;
};

export type RecentEntry = { id: string; title: string; detail: string };

export type HomeData = {
  site: string;
  assignedCount: number;
  /** Weekly fleet uptime, oldest first, as percentages. */
  uptime: { percent: number; weeks: number; weekly: number[] };
  assigned: AssignedMachine[];
  recent: RecentEntry[];
};

/**
 * TODO(api): the API contracts have no home/summary endpoint yet (assignments, fleet uptime,
 * site). Until one exists this is the M2 design's sample data — replace `useHomeData` with a
 * react-query call to it. Nothing else on Home needs to change.
 */
const SAMPLE: HomeData = {
  site: 'Pit 4',
  assignedCount: 6,
  uptime: { percent: 91, weeks: 8, weekly: [88, 92, 85, 95, 90, 97, 87, 94, 91] },
  assigned: [
    {
      id: 'HT-2201',
      title: 'HT-2201 · CAT 793F',
      detail: 'Case #1042 needs your reply',
      status: 'down',
    },
    {
      id: 'LD-0904',
      title: 'LD-0904 · WA900',
      detail: '1,000 h service overdue by 210 h',
      status: 'due',
    },
  ],
  recent: [{ id: 'r1', title: 'Pump replaced · HT-2201', detail: 'Logged by you · 12 Mar' }],
};

export function useHomeData(): { data: HomeData; isSample: true } {
  return { data: SAMPLE, isSample: true };
}

export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
