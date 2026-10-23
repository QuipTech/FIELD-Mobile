import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SAMPLE_NOTIFICATIONS } from '@/test/fixtures/notifications';
import { toNotification } from '../api';
import { ADMIN_KINDS } from '../data';
import { NotificationDetail, NotificationsList } from '../Notifications';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
const renderScreen = (ui: ReactElement) =>
  render(<SafeAreaProvider initialMetrics={metrics}>{ui}</SafeAreaProvider>);

const techFeed = SAMPLE_NOTIFICATIONS.filter((n) => !ADMIN_KINDS.includes(n.kind));

describe('NotificationsList', () => {
  it('marks unread items and opens them', async () => {
    const onOpen = jest.fn();
    await renderScreen(<NotificationsList items={techFeed} onOpen={onOpen} />);

    await fireEvent.press(screen.getByRole('button', { name: /^Unread\. HT-2201 flagged Down/ }));
    expect(onOpen).toHaveBeenCalledWith('n-2204');
    expect(screen.getByRole('button', { name: /^Manual update available/ })).toBeTruthy();
  });

  it('shows an empty state', async () => {
    await renderScreen(<NotificationsList items={[]} onOpen={jest.fn()} />);
    expect(screen.getByText("You're all caught up")).toBeTruthy();
  });
});

describe('API mapping', () => {
  it('maps kinds, read state and the case or machine it links to', () => {
    const n = toNotification({
      id: 'n1',
      kind: 'case_message',
      title: 'Case #1042 was updated',
      body: 'QuipTech support replied',
      createdAt: '2026-10-22T03:15:00.000Z',
      isRead: false,
      data: { caseNumber: 1042 },
    });
    expect(n).toMatchObject({ kind: 'caseUpdate', unread: true, caseId: '1042' });
    expect(n.summary).toBe('QuipTech support replied');

    const m = toNotification({
      id: 'n2',
      type: 'machine_status',
      message: 'HT-2201 flagged Down',
      createdAt: '2026-10-22T03:15:00.000Z',
      readAt: '2026-10-22T04:00:00.000Z',
      machineId: 'm-1',
    });
    expect(m).toMatchObject({ kind: 'machineDown', unread: false, machineId: 'm-1' });
    expect(m.title).toBe('HT-2201 flagged Down');
  });
});

describe('NotificationDetail', () => {
  it('links to the case and the machine', async () => {
    const props = { onOpenCase: jest.fn(), onViewMachine: jest.fn() };
    await renderScreen(<NotificationDetail item={techFeed[0]!} {...props} />);

    expect(screen.getByText(/did not clear on restart/)).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Open case #1042' }));
    expect(props.onOpenCase).toHaveBeenCalledWith('1042');
    await fireEvent.press(
      screen.getByRole('button', { name: 'HT-2201 · CAT 793F, Down. View machine' }),
    );
    await fireEvent.press(screen.getByRole('button', { name: 'View machine' }));
    expect(props.onViewMachine).toHaveBeenNthCalledWith(2, 'HT-2201');
  });

  it('hides the actions when there is nothing to open', async () => {
    await renderScreen(
      <NotificationDetail item={techFeed[3]!} onOpenCase={jest.fn()} onViewMachine={jest.fn()} />,
    );
    expect(screen.queryByRole('button', { name: /Open case/ })).toBeNull();
    expect(screen.queryByRole('button', { name: 'View machine' })).toBeNull();
  });
});
