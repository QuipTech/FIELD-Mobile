export type PlanStatus = 'active' | 'pastDue' | 'cancelled';

export type Plan = {
  name: string;
  status: PlanStatus;
  /** ISO date the current period renews. */
  renewsOn: string;
  cadence: 'monthly' | 'annual';
  /** Assets billed this period (plans are priced per asset). */
  assets: number;
};

export type MeData = {
  role: string;
  site: string;
  plan: Plan;
  offlineDocs: number;
  pendingSync: number;
  language: string;
};

export type InvoiceStatus = 'paid' | 'due' | 'failed';
export type Invoice = { id: string; issuedOn: string; status: InvoiceStatus };

export type BillingData = {
  plan: Plan;
  allowance: { used: number; limit: number };
  addOns: { id: string; label: string; count: number }[];
  payment: { brand: string; last4: string; processor: string };
  invoices: Invoice[];
};

/**
 * TODO(api): the API contracts have no profile, subscription or billing endpoints yet (role,
 * site, plan, allowance, add-ons, payment method, invoices), and offline/sync counts arrive
 * with the offline store. Until then this is the M9 / M9B design's sample data — replace
 * `useMeData` and `useBillingData` with react-query calls. Nothing else needs to change.
 */
const PLAN: Plan = {
  name: 'Standard plan',
  status: 'active',
  renewsOn: '2027-04-14T12:00:00Z',
  cadence: 'monthly',
  assets: 42,
};

export const SAMPLE_ME: MeData = {
  role: 'Technician',
  site: 'Pit 4',
  plan: PLAN,
  offlineDocs: 12,
  pendingSync: 2,
  language: 'English',
};

export const SAMPLE_BILLING: BillingData = {
  plan: PLAN,
  allowance: { used: 3140, limit: 4000 },
  addOns: [
    { id: 'wearable-seats', label: 'Wearable client seats', count: 6 },
    { id: 'remote-expert', label: 'Remote expert sessions', count: 2 },
  ],
  payment: { brand: 'Visa', last4: '4242', processor: 'Stripe' },
  invoices: [
    { id: 'inv-2027-03', issuedOn: '2027-03-01T12:00:00Z', status: 'paid' },
    { id: 'inv-2027-02', issuedOn: '2027-02-01T12:00:00Z', status: 'paid' },
    { id: 'inv-2027-01', issuedOn: '2027-01-01T12:00:00Z', status: 'paid' },
  ],
};

export function useMeData(): { data: MeData; isSample: true } {
  return { data: SAMPLE_ME, isSample: true };
}

export function useBillingData(): { data: BillingData; isSample: true } {
  return { data: SAMPLE_BILLING, isSample: true };
}

export type PlanOption = {
  id: string;
  name: string;
  /** How it's billed, e.g. "Per asset, monthly". */
  terms: string;
  features: string[];
  current?: boolean;
  recommended?: boolean;
};

/** TODO(api): M9C plans; read them (and the Stripe price ids) from the billing endpoint. */
export const PLAN_OPTIONS: PlanOption[] = [
  {
    id: 'standard',
    name: 'Standard',
    terms: 'Per asset, monthly',
    features: [
      'CMDB, config snapshots & diff',
      'AI assistant',
      'Knowledge base',
      'Standard support',
    ],
    current: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    terms: 'Annual, negotiated',
    features: ['White-label', 'SSO / SAML', 'Priority support', 'Named contact'],
    recommended: true,
  },
];

export function usePlanOptions(): PlanOption[] {
  return PLAN_OPTIONS;
}
