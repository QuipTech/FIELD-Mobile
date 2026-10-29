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
