import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AdminBilling } from '../AdminBilling';
import { AdminRoles } from '../AdminRoles';
import { AdminUsers } from '../AdminUsers';
import { AiConfiguration } from '../AiConfiguration';
import { AuditLog } from '../AuditLog';
import { DemoRequests } from '../DemoRequests';

/** Answers shaped like the staging API's, as the web portal reads them. */
const mockRoutes: Record<string, unknown> = {
  '/admin/users': {
    total: 2,
    users: [
      {
        id: 'u1',
        firstName: 'Jo',
        lastName: 'Okoye',
        email: 'jo@acme.test',
        roles: ['Owner'],
        organisation: { id: 'o1', name: 'Acme' },
        status: 'active',
        lastActiveAt: new Date().toISOString(),
      },
      {
        id: 'u2',
        firstName: 'Sam',
        lastName: 'Lee',
        email: 'sam@beta.test',
        roles: [],
        organisation: { id: 'o2', name: 'Beta' },
        status: 'invited',
        createdAt: new Date().toISOString(),
      },
    ],
  },
  '/admin/roles': [
    { id: 'r1', name: 'Owner', isBuiltIn: true, userCount: 3, permissionCodes: ['a.x', 'b.y'] },
  ],
  '/admin/permissions': [{ code: 'a.x' }, { code: 'b.y' }, { code: 'c.z' }],
  '/admin/auditLog': {
    total: 1,
    items: [
      {
        id: 'e1',
        occurredAt: new Date().toISOString(),
        actor: { name: 'Jo Okoye' },
        actionLabel: 'Role changed',
        target: 'Sam Lee',
        source: 'web',
      },
    ],
  },
  '/admin/billing/organisations': [
    {
      organisation: { id: 'o1', name: 'Acme' },
      plan: { planCode: 'ASSET_PRO', term: 'monthly' },
      billingAccount: { stripeCustomerId: 'cus_1' },
      overdueInvoiceCount: 2,
    },
  ],
  '/admin/billing/overview/invoices': {
    summary: {
      paid: { count: 10, paidCents: 42674, totalCents: 42674 },
      unpaid: { count: 0, paidCents: 0, totalCents: 0 },
      failed: { count: 0, paidCents: 0, totalCents: 0 },
      pending: { count: 1, paidCents: 0, totalCents: 0 },
      refunded: { count: 0, paidCents: 0, totalCents: 0 },
      void: { count: 0, paidCents: 0, totalCents: 0 },
    },
    total: 1,
    items: [
      {
        id: 'in1',
        kind: 'organisation',
        category: 'paid',
        organisationName: 'TRT',
        periodStart: '2026-10-01',
        totalCents: 1498,
        totalExGstCents: 1362,
        amountPaidCents: 1498,
        amountRefundedCents: 0,
        amountCreditedCents: 0,
        hostedInvoiceUrl: 'https://invoice.stripe.com/i/test',
      },
    ],
  },
  '/admin/demo-requests': {
    total: 1,
    items: [
      {
        id: 'd1',
        firstName: 'Ana',
        lastName: 'Diaz',
        email: 'ana@gamma.test',
        company: 'Gamma',
        status: 'contacted',
        createdAt: new Date().toISOString(),
      },
    ],
  },
  '/admin/ai/platform': {
    provider: 'Amazon Bedrock',
    region: 'ap-southeast-2',
    models: [{ role: 'answer', label: 'Claude', purpose: 'Answers' }],
  },
  '/admin/ai/usage': { totalQueries: 1200, activeUsers: 9, totalUsers: 20, changePercent: 12 },
  '/admin/ai/prompts': [
    { id: 'p1', versionNumber: 1, createdAt: '2026-01-01T00:00:00Z' },
    { id: 'p2', versionNumber: 2, isLive: true, createdAt: '2026-02-01T00:00:00Z' },
  ],
};

jest.mock('@/lib/http', () => ({
  http: { get: jest.fn((path: string) => Promise.resolve(mockRoutes[path])) },
  errorMessage: (e: Error) => e.message,
}));
jest.mock('@/auth/useRole', () => ({
  useRole: () => ({ loaded: true, capabilities: { isPlatformAdmin: true } }),
}));
jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  Stack: {
    Screen: ({ options }: { options?: { headerRight?: () => unknown } }) =>
      options?.headerRight?.() ?? null,
  },
}));

const setup = (ui: ReactElement) =>
  render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 },
      }}
    >
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      >
        {ui}
      </QueryClientProvider>
    </SafeAreaProvider>,
  );

it('lists users across organisations and searches them', async () => {
  await setup(<AdminUsers />);
  expect(await screen.findByText('Jo Okoye')).toBeTruthy();
  expect(screen.getByText('Invited')).toBeTruthy();
  await fireEvent.changeText(screen.getByLabelText('Search users'), 'beta');
  expect(screen.queryByText('Jo Okoye')).toBeNull();
  expect(screen.getByText('Sam Lee')).toBeTruthy();
});

it('summarises each role against every permission', async () => {
  await setup(<AdminRoles />);
  expect(await screen.findByText('3 users · 2 of 3 permissions')).toBeTruthy();
  expect(screen.getByText('Default')).toBeTruthy();
});

it('shows audit events', async () => {
  await setup(<AuditLog />);
  expect(await screen.findByText('Role changed')).toBeTruthy();
  expect(screen.getByText('1 event')).toBeTruthy();
});

it('shows billing totals, invoices with their Stripe link, and organisations', async () => {
  await setup(<AdminBilling />);
  expect(await screen.findByText('TRT')).toBeTruthy();
  expect(screen.getByLabelText(/^Collected: A\$426\.74/)).toBeTruthy();
  expect(screen.getByLabelText(/^Pending: 1/)).toBeTruthy();
  expect(screen.getByRole('link', { name: "Open TRT's invoice in Stripe" })).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: /^TRT, Oct 2026/ }));
  expect(screen.getByText('Open in Stripe')).toBeTruthy();
  await fireEvent.press(screen.getByText('Organisations'));
  expect(await screen.findByText('Acme')).toBeTruthy();
  expect(screen.getByText('2 overdue')).toBeTruthy();
});

it('lists demo requests with their status', async () => {
  await setup(<DemoRequests />);
  expect(await screen.findByText('Ana Diaz')).toBeTruthy();
  expect(screen.getByText('Contacted')).toBeTruthy();
});

it('shows AI usage, models and the live prompt', async () => {
  await setup(<AiConfiguration />);
  expect(await screen.findByText('1,200')).toBeTruthy();
  expect(screen.getByText('Amazon Bedrock')).toBeTruthy();
  expect(screen.getByText('Live')).toBeTruthy();
});

it('searches the audit log from the header icon', async () => {
  await setup(<AuditLog />);
  expect(await screen.findByText('Role changed')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Search audit log' }));
  await fireEvent.changeText(screen.getByLabelText('Search people, actions or targets'), 'nobody');
  expect(screen.queryByText('Role changed')).toBeNull();
  expect(screen.getByText('No events match your search.')).toBeTruthy();
  await fireEvent.changeText(screen.getByLabelText('Search people, actions or targets'), 'sam');
  expect(screen.getByText('Role changed')).toBeTruthy();
  expect(screen.getByText('1 match')).toBeTruthy();
});
