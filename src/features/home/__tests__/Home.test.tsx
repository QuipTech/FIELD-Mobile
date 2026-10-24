import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SAMPLE_CASES } from '@/test/fixtures/cases';
import { SAMPLE_ADMIN_HOME } from '@/test/fixtures/home';
import type { HomeData } from '../data';
import { Home, type HomeProps } from '../Home';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const DATA: HomeData = {
  site: 'Pit 3',
  machineCount: 1,
  uptime: null,
  machines: [{ id: 'm1', title: 'DZ-07 · CAT D10T', detail: 'Pit 3 · 12,480 h', status: 'due' }],
  recent: [],
};

const setup = async (overrides: Partial<HomeProps> = {}) => {
  const props: HomeProps = {
    title: 'Good morning, Uneeb',
    initials: 'UM',
    data: DATA,
    bottomInset: 0,
    onRetry: jest.fn(),
    onNotifications: jest.fn(),
    onProfile: jest.fn(),
    onSeeAll: jest.fn(),
    onOpenMachine: jest.fn(),
    onSearch: jest.fn(),
    onAskAi: jest.fn(),
    onScan: jest.fn(),
    onLogEntry: jest.fn(),
    ...overrides,
  };
  await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <Home {...props} />
    </SafeAreaProvider>,
  );
  return props;
};

describe('Home', () => {
  it('offers the three H1 quick actions and no separate Capture tile', async () => {
    const props = await setup();
    await fireEvent.press(screen.getByRole('button', { name: 'Scan machine' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Log entry' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Ask AI' }));
    expect(props.onScan).toHaveBeenCalledTimes(1);
    expect(props.onLogEntry).toHaveBeenCalledTimes(1);
    expect(props.onAskAi).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'Capture' })).toBeNull();
  });

  it('shows a customer their machines and open cases, no admin tiles', async () => {
    const onOpenCase = jest.fn();
    const openCase = SAMPLE_CASES.find((c) => c.status === 'open')!;
    await setup({ plan: 'Standard', openCases: [openCase], onOpenCase });
    expect(screen.getByText('Standard')).toBeTruthy();
    expect(screen.getByText('My machines')).toBeTruthy();
    expect(screen.getByText('My open cases')).toBeTruthy();
    expect(screen.queryByText('Team activity')).toBeNull();
    expect(screen.queryByText('Machines down')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: new RegExp(`Case ${openCase.id}`) }));
    expect(onOpenCase).toHaveBeenCalledWith(openCase.id);
  });

  it('shows an admin fleet KPIs and team activity instead of their machines', async () => {
    const onOpenKpi = jest.fn();
    await setup({ plan: 'Enterprise', isAdmin: true, admin: SAMPLE_ADMIN_HOME, onOpenKpi });
    expect(screen.getByText('Enterprise')).toBeTruthy();
    expect(screen.getByText('Team activity')).toBeTruthy();
    expect(screen.getByText('J. Rossi logged a repair')).toBeTruthy();
    expect(screen.queryByText('My machines')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: '3 Machines down' }));
    expect(onOpenKpi).toHaveBeenCalledWith('machinesDown');
  });
});
