import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { formatCountdown, formatPairingCode } from '../appConnectionApi';
import { DeletionBlocked } from '../DeletionBlocked';
import { fileProblem, MAX_UPLOAD_BYTES } from '../documentsApi';
import { LifecycleCard } from '../LifecycleCard';
import type { DeletionCheck, MachineLifecycleInfo } from '../lifecycleApi';
import { orderPair, type Snapshot } from '../snapshots';

jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(() => Promise.resolve({ type: 'dismiss' })),
  WebBrowserPresentationStyle: { PAGE_SHEET: 'pageSheet' },
}));
jest.mock('expo-file-system', () => ({}));
jest.mock('expo-sharing', () => ({}));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
const renderUi = (ui: ReactElement) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <SafeAreaProvider initialMetrics={metrics}>{ui}</SafeAreaProvider>
    </QueryClientProvider>,
  );

const INFO: MachineLifecycleInfo = {
  machineId: 'm1',
  lifecycleState: 'active',
  availableActions: ['deactivate', 'archive'],
  canRequestTransfer: false,
  events: [
    {
      id: 'e1',
      fromState: 'registered',
      toState: 'active',
      reason: null,
      occurredAt: '2026-11-06T01:00:00Z',
      actorName: 'Mark Ronalds',
      transferId: null,
    },
  ],
};

describe('LifecycleCard', () => {
  it('offers only the actions the API lists, and delete when allowed', async () => {
    const onAction = jest.fn();
    const onDelete = jest.fn();
    await renderUi(<LifecycleCard info={INFO} onAction={onAction} onDelete={onDelete} />);
    expect(screen.getByText('Active')).toBeTruthy();
    expect(screen.getByText('Not activated → Active')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Activate' })).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Deactivate' }));
    expect(onAction).toHaveBeenCalledWith('deactivate');
    await fireEvent.press(screen.getByRole('button', { name: 'Delete machine' }));
    expect(onDelete).toHaveBeenCalled();
  });

  it('shows no actions or delete without machine.lifecycle', async () => {
    await renderUi(<LifecycleCard info={{ ...INFO, availableActions: [] }} onAction={jest.fn()} />);
    expect(screen.queryByRole('button', { name: 'Deactivate' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Delete machine' })).toBeNull();
  });
});

const BLOCKED: DeletionCheck = {
  canDelete: false,
  blocker: 'final_charge_due',
  message: null,
  finalInvoiceFrom: null,
  unpaidInvoices: [],
  finalCharge: {
    amountCents: 1550,
    months: [
      {
        periodStart: '2026-11-01',
        lastUsedOn: '2026-11-10',
        daysUsed: 10,
        daysInMonth: 30,
        monthlyRateCents: 4650,
        amountCents: 1550,
      },
    ],
  },
};

describe('DeletionBlocked', () => {
  it('breaks down the final charge and offers to pay it', async () => {
    await renderUi(
      <DeletionBlocked
        machineId="m1"
        check={BLOCKED}
        onRecheck={jest.fn(async () => undefined)}
        onDeactivate={jest.fn()}
      />,
    );
    expect(screen.getByText('November 2026')).toBeTruthy();
    expect(screen.getAllByText('A$15.50')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Pay final charge' })).toBeTruthy();
  });

  it('offers Deactivate when the machine is still active', async () => {
    const onDeactivate = jest.fn();
    await renderUi(
      <DeletionBlocked
        machineId="m1"
        check={{
          ...BLOCKED,
          blocker: 'needs_deactivation',
          finalCharge: null,
          message: 'Deactivate first.',
        }}
        onRecheck={jest.fn(async () => undefined)}
        onDeactivate={onDeactivate}
      />,
    );
    expect(screen.getByText('Deactivate first.')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Deactivate machine' }));
    expect(onDeactivate).toHaveBeenCalled();
  });
});

describe('helpers', () => {
  it('formats pairing codes and countdowns', () => {
    expect(formatPairingCode('123456')).toBe('123 456');
    expect(formatCountdown(125_000)).toBe('2:05');
    expect(formatCountdown(-5)).toBe('0:00');
  });

  it('checks document type and size on the device', () => {
    expect(
      fileProblem({ uri: 'f', name: 'report.pdf', type: 'application/pdf', size: 10 }),
    ).toBeUndefined();
    expect(fileProblem({ uri: 'f', name: 'clip.mov', type: 'video/quicktime' })).toMatch(/PDF/);
    expect(
      fileProblem({
        uri: 'f',
        name: 'big.pdf',
        type: 'application/pdf',
        size: MAX_UPLOAD_BYTES + 1,
      }),
    ).toMatch(/20 MB/);
  });

  it('compares the older snapshot to the newer one', () => {
    const s = (id: string, takenAt: string): Snapshot => ({
      id,
      takenAt,
      takenBy: null,
      trigger: 'manual',
      isKnownGood: false,
    });
    const list = [s('new', '2026-11-02T00:00:00Z'), s('old', '2026-11-01T00:00:00Z')];
    expect(orderPair(list, 'new', 'old')).toEqual(['old', 'new']);
  });
});
