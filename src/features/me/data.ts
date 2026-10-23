export type PlanStatus = 'active' | 'pastDue' | 'cancelled';

export type Plan = {
  name: string;
  status: PlanStatus;
  /** ISO date the current period renews (or ends); empty when unknown. */
  renewsOn: string;
  cadence: 'monthly' | 'annual';
  /** Assets billed this period (plans are priced per asset). */
  assets: number;
};

export type MeData = {
  site: string;
  /** Undefined while the subscription loads (or when it can't be read). */
  plan?: Plan;
  offlineDocs: number;
  pendingSync: number;
  language: string;
};

export type InvoiceStatus = 'paid' | 'due' | 'failed';
export type Invoice = {
  id: string;
  issuedOn: string;
  status: InvoiceStatus;
  /** Integer cents, when the API sends a total. */
  totalCents?: number;
  /** Stripe-hosted invoice page. */
  url?: string;
  hasPdf: boolean;
};

export type BillingData = {
  plan?: Plan;
  /** The organisation's allowance (admins). */
  allowance: { used: number; limit: number };
  /** The signed-in user's own queries this period (everyone). */
  personalAllowance: { used: number; limit: number };
  addOns: { id: string; label: string; count: number }[];
  /** Card details live in Stripe; the API only links to its portal. */
  payment: { brand?: string; last4?: string; processor: string };
  invoices: Invoice[];
};

/** Admin-only: who is on the account. */
export type TeamSummary = { users: number; sites?: number };

export type PlanOption = {
  id: string;
  name: string;
  /** How it's billed, e.g. "Per asset, monthly". */
  terms: string;
  features: string[];
  current?: boolean;
  recommended?: boolean;
};
