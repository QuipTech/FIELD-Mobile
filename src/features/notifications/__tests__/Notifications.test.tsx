import { act, fireEvent, render, renderHook, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useNotifications, useReadState } from '../data';
import { NotificationDetail, NotificationsList } from '../Notifications';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
const renderScreen = (ui: ReactElement) =>
  render(<SafeAreaProvider initialMetrics={metrics}>{ui}</SafeAreaProvider>);

beforeEach(() => useReadState.setState({ read: {} }));

describe('NotificationsList', () => {
  it('marks unread items and opens them', async () => {
    const { result } = await renderHook(() => useNotifications());
    const onOpen = jest.fn();
    await renderScreen(<NotificationsList items={result.current} onOpen={onOpen} />);

    await fireEvent.press(screen.getByRole('button', { name: /^Unread\. HT-2201 flagged Down/ }));
    expect(onOpen).toHaveBeenCalledWith('n-2204');
    expect(screen.getByRole('button', { name: /^Manual update available/ })).toBeTruthy();
  });

  it('shows an empty state', async () => {
    await renderScreen(<NotificationsList items={[]} onOpen={jest.fn()} />);
    expect(screen.getByText("You're all caught up")).toBeTruthy();
  });
});

describe('read state', () => {
  it('marks one or all notifications read', async () => {
    const { result } = await renderHook(() => useNotifications());
    expect(result.current.filter((n) => n.unread).map((n) => n.id)).toEqual(['n-2204', 'n-1038']);

    await act(() => useReadState.getState().markRead('n-2204'));
    expect(result.current.filter((n) => n.unread).map((n) => n.id)).toEqual(['n-1038']);

    await act(() => useReadState.getState().markAllRead(['n-1038']));
    expect(result.current.some((n) => n.unread)).toBe(false);
  });
});

describe('NotificationDetail', () => {
  it('links to the case and the machine', async () => {
    const { result } = await renderHook(() => useNotifications());
    const props = { onOpenCase: jest.fn(), onViewMachine: jest.fn() };
    await renderScreen(<NotificationDetail item={result.current[0]!} {...props} />);

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
    const { result } = await renderHook(() => useNotifications());
    await renderScreen(
      <NotificationDetail
        item={result.current[3]!}
        onOpenCase={jest.fn()}
        onViewMachine={jest.fn()}
      />,
    );
    expect(screen.queryByRole('button', { name: /Open case/ })).toBeNull();
    expect(screen.queryByRole('button', { name: 'View machine' })).toBeNull();
  });
});
