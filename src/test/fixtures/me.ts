import type { BillingData, MeData, Plan, TeamSummary } from '@/features/me/data';

/** The M9 / M9B design's profile and billing, for tests and previews. */
const PLAN: Plan = {
  name: 'Standard plan',
  status: 'active',
  renewsOn: '2027-04-14T12:00:00Z',
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

export const SAMPLE_BILLING: BillingData = {
  plan: PLAN,
  allowance: { used: 3140, limit: 4000 },
  personalAllowance: { used: 142, limit: 500 },
  addOns: [
    { id: 'wearable-seats', label: 'Wearable client seats', count: 6 },
    { id: 'remote-expert', label: 'Remote expert sessions', count: 2 },
  ],
  payment: { brand: 'Visa', last4: '4242', processor: 'Stripe' },
  invoices: [
    { id: 'inv-2027-03', issuedOn: '2027-03-01T12:00:00Z', status: 'paid', hasPdf: true },
    { id: 'inv-2027-02', issuedOn: '2027-02-01T12:00:00Z', status: 'paid', hasPdf: true },
    { id: 'inv-2027-01', issuedOn: '2027-01-01T12:00:00Z', status: 'paid', hasPdf: true },
  ],
};

export const SAMPLE_TEAM: TeamSummary = { users: 42, sites: 3 };
