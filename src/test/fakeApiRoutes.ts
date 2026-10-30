/**
 * Fake API answers for cases, notifications, Ask AI, billing and `/auth/me`, shaped like the
 * Backend API Reference (2026-10-22). Used by `installFakeApi`.
 */

type Route = (url: URL, init?: RequestInit) => unknown;

const at = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

export const API_ME = {
  id: 'u1',
  email: 'jo@quiptech.com',
  firstName: 'Jo',
  lastName: 'Okoye',
  avatarUrl: null,
  status: 'active',
  phoneNumber: null,
  site: 'Pit 4',
  language: 'en-AU',
  roles: ['Field Technician'],
  permissions: ['ai.use', 'machine.view', 'history.create'],
  capabilities: { canUseAi: true },
  tenant: { id: 't1', name: 'Acme Mining', slug: 'acme-mining' },
};

export const API_CASE = {
  caseNumber: 1042,
  subject: "Brake pressure alarm won't clear",
  description: 'E-2204 on every cold start since the pump swap.',
  status: 'waiting_on_customer',
  priority: 'P1',
  createdAt: at(2),
  updatedAt: at(1),
  machine: { id: 'HT-2201', fleetNumber: 'HT-2201', manufacturer: 'CAT', model: '793F' },
  sla: { state: 'on_track', dueAt: at(-2), minutesRemaining: 120 },
};

const API_MESSAGES = [
  {
    id: 'm1',
    body: 'Raised from AI assistant conversation.',
    createdAt: at(2),
    author: { id: 'u1' },
  },
  {
    id: 'm2',
    body: 'Checking pump firmware version.',
    createdAt: at(1),
    author: { id: 's1', name: 'T. Meyer' },
  },
];

const API_NOTIFICATIONS = [
  {
    id: 'n1',
    kind: 'machine_status',
    title: 'HT-2201 flagged Down',
    body: 'Brake pressure alarm',
    createdAt: at(1),
    isRead: false,
    data: { machineId: 'HT-2201' },
  },
  {
    id: 'n2',
    kind: 'knowledge_document',
    title: 'Manual update available',
    body: 'Bulletin 88 revises charge pressure',
    createdAt: at(26),
    isRead: true,
  },
];

const page = (items: unknown[]) => ({ items, total: items.length, page: 1, pageSize: 25 });

const EXACT: Record<string, unknown> = {
  '/machines/HT-2201/snapshots': [
    { id: 's2', createdAt: at(200), label: 'Hydraulic pump: 4T-9410 → 4T-9455' },
    { id: 's1', createdAt: at(400), label: 'Controller updated to v4.2.1', isKnownGood: true },
  ],
  '/machines/HT-2201/snapshots/compare': [
    {
      kind: 'changed',
      systemName: 'Hydraulics',
      componentName: 'Main pump',
      fields: [{ field: 'serialNumber', before: '4T-9410', after: '4T-9455' }],
    },
  ],
  '/machines/HT-2201/manuals': {
    items: [
      {
        id: 'rear-suspension-recharge',
        title: 'Rear suspension cylinder recharge',
        type: 'guide',
        version: '4',
        pageCount: 6,
      },
    ],
    total: 1,
  },
  '/auth/me': API_ME,
  '/cases': { ...page([API_CASE]), statusCounts: { open: 1 } },
  '/cases/1042': API_CASE,
  '/cases/1042/messages': API_MESSAGES,
  '/cases/unread-count': { count: 0 },
  '/cases/options': { machines: [{ id: 'HT-2201', fleetNumber: 'HT-2201', model: '793F' }] },
  '/notifications': page(API_NOTIFICATIONS),
  '/notifications/unread-count': { count: 1 },
  '/me/notification-preferences': { pushEnabled: true, emailEnabled: true, mutedKinds: [] },
  '/ai/usage': {
    personal: { used: 142, allowance: 500, remaining: 358 },
    organisation: { used: 3820, allowance: 5000, remaining: 1180, isEnabled: true },
    warningThreshold: 0.8,
    periodStart: '2026-10-01T00:00:00.000Z',
    periodEnd: '2026-11-01T00:00:00.000Z',
  },
  '/ai/conversations': [
    { id: 'c1', title: 'Show me the drill rod change procedure', machine: null, updatedAt: at(96) },
  ],
  '/organisation/subscription': {
    plan: 'ASSET_PRO',
    status: 'active',
    currentPeriodEnd: '2027-04-14T00:00:00.000Z',
    assetCount: 42,
  },
  '/me/billing': {
    exempt: false,
    coveredByOrganisation: true,
    paymentRequired: false,
    monthlyCents: 2900,
    currency: 'AUD',
    timezone: 'Australia/Sydney',
    periodStart: '2026-10-01',
    periodEnd: '2026-11-01',
    invoiceId: null,
    invoiceStatus: null,
    gstCents: null,
    totalCents: null,
    hostedInvoiceUrl: null,
  },
  '/me/billing/invoices': [],
  '/users/me/deletion-eligibility': { canDelete: true, blockedReason: null },
  '/organisation/entitlements': ['fleet.register', 'ai.assistant', 'asset.history'].map((f) => ({
    featureCode: f,
    isActive: true,
    limit: null,
    validUntil: null,
  })),
  '/dashboard/admin': {
    machinesDown: 1,
    casesNearSlaBreach: { total: 0, breached: 0, cases: [] },
    aiAnswersToReview: { total: 0 },
    bulletinsToApprove: { total: 0, documents: [] },
  },
};

export const EXTRA_ROUTES: Route[] = [
  (u, init) => (init?.method === 'POST' ? undefined : EXACT[u.pathname]),
];
