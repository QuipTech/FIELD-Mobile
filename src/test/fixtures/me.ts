import type { MeData, Plan, TeamSummary } from '@/features/me/data';

/** The M9 design's profile, for tests and previews. */
const PLAN: Plan = {
  name: 'Standard plan',
  status: 'active',
  renewsOn: '2027-04-14T12:00:00Z',
  renewsAutomatically: true,
  cadence: 'monthly',
  assets: 42,
};

export const SAMPLE_ME: MeData = {
  site: 'Pit 4',
  plan: PLAN,
  offlineDocs: 12,
  pendingSync: 2,
  language: 'English',
};

export const SAMPLE_TEAM: TeamSummary = { users: 42, sites: 3 };
