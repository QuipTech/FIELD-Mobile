import type { AdminHomeData } from '@/features/home/adminData';

/** The H1 design's admin home, for tests and previews. */
export const SAMPLE_ADMIN_HOME: AdminHomeData = {
  kpis: [
    { key: 'machinesDown', label: 'Machines down', value: 3 },
    { key: 'casesNearBreach', label: 'Cases near SLA breach', value: 2 },
    { key: 'aiToReview', label: 'AI answers to review', value: 5 },
    { key: 'bulletinsToApprove', label: 'Bulletins to approve', value: 3 },
  ],
  team: [
    {
      id: 't1',
      initials: 'JR',
      title: 'J. Rossi logged a repair',
      detail: 'HT-12 · Hydraulics · 40 min ago',
    },
    {
      id: 't2',
      initials: 'AK',
      title: 'A. Kaur opened case #1043',
      detail: 'EX-03 · Urgent · 1 h ago',
    },
    {
      id: 't3',
      initials: 'UM',
      title: 'U. Malik replaced final drive',
      detail: 'DZ-07 · Config v7 · 2 h ago',
    },
  ],
};
