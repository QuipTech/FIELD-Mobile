/** `/me/billing` and `/organisation/billing` answers shaped like the staging API's. */

export const DUE = {
  exempt: false,
  coveredByOrganisation: false,
  paymentRequired: true,
  monthlyCents: 2900,
  priceBookId: 'pb-1',
  currency: 'AUD',
  timezone: 'Australia/Perth',
  periodStart: '2026-10-01',
  periodEnd: '2026-11-01',
  invoiceId: null,
  invoiceStatus: null,
  gstCents: null,
  totalCents: null,
  hostedInvoiceUrl: null,
};

export const PAID = {
  ...DUE,
  paymentRequired: false,
  invoiceId: 'inv-1',
  invoiceStatus: 'paid',
  gstCents: 290,
  totalCents: 3190,
};

export const ORG_SUMMARY = {
  account: {
    id: 'ba-1',
    name: 'Mintek',
    billingEmail: 'accounts@mintek.com.au',
    suspendedAt: null,
    hasStripeCustomer: true,
  },
  plan: {
    id: 'sub-1',
    planCode: 'ASSET_PRO',
    planName: 'Asset Pro',
    term: 'monthly',
    status: 'active',
    committedQty: null,
    currentPeriodStart: '2026-10-01',
    currentPeriodEnd: '2026-11-01',
    cancelAt: null,
    exportUntil: null,
    nextTerm: null,
    nextCommittedQty: null,
    unitCents: 4900,
    bands: [],
  },
  thisMonth: {
    periodStart: '2026-10-01',
    invoicedOn: '2026-11-01',
    activeToday: 24,
    peakSoFar: 26,
    rateCents: 4900,
    estimateCents: 123400,
  },
  overdue: { count: 0, amountCents: 0, firstNoticeAt: null, suspensionFrom: null },
  allowance: [{ metric: 'ai_turns', allowance: 5000, used: 3820, thresholdState: 'ok' }],
};
