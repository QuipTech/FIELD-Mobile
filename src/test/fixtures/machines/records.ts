import type { MachineRecords } from '@/features/machines/records';

const day = (iso: string) => `${iso}T12:00:00`;

/** The M4–M5.6 designs' records for HT-2201, for tests and previews. */
export const HT_2201_RECORDS: MachineRecords = {
  components: [
    { id: 'powertrain', name: 'Powertrain', count: 14, issue: { label: '1 worn', tone: 'amber' } },
    { id: 'hydraulics', name: 'Hydraulics', count: 12 },
    { id: 'brakes', name: 'Brakes', count: 6, issue: { label: 'Fault E-2204', tone: 'danger' } },
    { id: 'electrical', name: 'Electrical', count: 9 },
  ],
  history: [
    {
      id: 'h4',
      type: 'repair',
      title: 'Main hydraulic pump replaced',
      detail: 'Pump A seized on cold start; fitted Pump B (4T-9455). 3.5 h downtime.',
      at: day('2026-03-12'),
      by: 'J. Okoye',
      photos: 2,
    },
    {
      id: 'h3',
      type: 'inspection',
      title: '250 h walkaround',
      detail: 'Left final drive seal weeping — replaced.',
      at: day('2026-03-04'),
      by: 'A. Silva',
    },
    {
      id: 'h2',
      type: 'fault',
      title: 'E-2204 · accumulator pre-charge low',
      at: day('2026-02-28'),
      by: 'System',
    },
    {
      id: 'h1',
      type: 'service',
      title: '1,000 h service — engine & filters',
      at: day('2026-02-19'),
      by: 'J. Okoye',
    },
  ],
  configuration: [
    {
      id: 'c4',
      kind: 'partSwap',
      title: 'Hydraulic pump: 4T-9410 → 4T-9455',
      detail: 'Fitted during repair · logged by J. Okoye',
      at: day('2026-03-12'),
    },
    {
      id: 'c3',
      kind: 'firmware',
      title: 'Controller updated to v4.2.1',
      detail: 'Pushed by QuipTech support',
      at: day('2026-03-02'),
    },
    {
      id: 'c2',
      kind: 'bulletin',
      title: 'Bulletin 88 charge-pressure revision',
      detail: 'Applied to accumulator settings',
      at: day('2026-02-28'),
    },
    {
      id: 'c1',
      kind: 'partSwap',
      title: 'Final drive seal replaced, left side',
      detail: 'Logged by A. Silva',
      at: day('2026-01-14'),
    },
  ],
  manuals: [
    {
      id: 'm1',
      kind: 'manual',
      title: 'Operator & maintenance manual',
      meta: 'Rev 12 · 340 pages',
      offline: true,
    },
    {
      id: 'm2',
      kind: 'procedure',
      title: 'Rear suspension cylinder recharge',
      meta: 'Procedure · Rev 4',
      offline: true,
      articleId: 'rear-suspension-recharge',
    },
    {
      id: 'm3',
      kind: 'bulletin',
      title: 'Bulletin 88 — charge pressure revision',
      meta: 'Issued 28 Feb',
      offline: false,
      articleId: 'bulletin-88',
    },
    {
      id: 'm4',
      kind: 'diagram',
      title: 'Wiring diagram — electrical',
      meta: 'Rev 3 · 18 pages',
      offline: false,
    },
  ],
};

const GENERIC: MachineRecords = {
  components: HT_2201_RECORDS.components.map(({ issue: _issue, ...group }) => group),
  history: [],
  configuration: [],
  manuals: [HT_2201_RECORDS.manuals[0]!],
};

export function sampleRecords(id: string | undefined): MachineRecords {
  return id === 'HT-2201' ? HT_2201_RECORDS : GENERIC;
}
