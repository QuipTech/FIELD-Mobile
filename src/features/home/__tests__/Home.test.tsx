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
  stats: {
    openCases: { total: 2, breachingSla: 1 },
    machinesDown: { total: 1, labels: ['DZ-07'] },
    entriesThisWeek: { total: 5, mine: 3 },
  },
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
  it('offers Scan and Log entry, leaving Ask AI to the tab bar', async () => {
    const props = await setup();
    await fireEvent.press(screen.getByRole('button', { name: 'Scan machine' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Log entry' }));
    expect(props.onScan).toHaveBeenCalledTimes(1);
    expect(props.onLogEntry).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'Ask AI' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Capture' })).toBeNull();
  });

  it('shows a customer their machines and open cases, no admin tiles', async () => {
    const onOpenCase = jest.fn();
    const openCase = SAMPLE_CASES.find((c) => c.status === 'open')!;
    await setup({ openCases: [openCase], onOpenCase });
    expect(screen.getByText('My machines')).toBeTruthy();
    expect(screen.getByText('My open cases')).toBeTruthy();
    expect(screen.queryByText('Team activity')).toBeNull();
    expect(screen.queryByText('Needs attention')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: new RegExp(`Case ${openCase.id}`) }));
    expect(onOpenCase).toHaveBeenCalledWith(openCase.id);
  });

  it('shows an admin fleet KPIs and team activity instead of their machines', async () => {
    const onOpenKpi = jest.fn();
    await setup({ isAdmin: true, admin: SAMPLE_ADMIN_HOME, onOpenKpi });
    expect(screen.getByText('Team activity')).toBeTruthy();
    expect(screen.getByText('J. Rossi logged a repair')).toBeTruthy();
    expect(screen.queryByText('My machines')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: '3 Machines down' }));
    expect(onOpenKpi).toHaveBeenCalledWith('machinesDown');
  });

  it('shows admins the platform overview instead of their site and machines', async () => {
    const onOpenAuditLog = jest.fn();
    await setup({
      isAdmin: true,
      admin: SAMPLE_ADMIN_HOME,
      onOpenAuditLog,
      overview: {
        scope: { isPlatform: true, organisationCount: 3, siteCount: 12 },
        users: { active: 42, invited: 2 },
        documents: { indexed: 1280, searchablePagePercent: 97 },
        assets: { total: 310, modelCount: 40 },
        ingestionQueue: [
          { id: 'q1', title: 'D10T Shop Manual', state: 'failed', errorMessage: 'No text layer' },
        ],
        latestActions: [
          {
            id: 'a1',
            actionLabel: 'Role changed',
            target: 'Sam Lee',
            occurredAt: new Date().toISOString(),
            actor: { name: 'Jo Okoye' },
          },
        ],
      },
    });
    expect(screen.getByText('All organisations · 3 organisations · 12 sites')).toBeTruthy();
    expect(screen.queryByText(/Pit 3/)).toBeNull();
    expect(screen.getByLabelText('42 Active users')).toBeTruthy();
    expect(screen.getByLabelText('1,280 Documents indexed')).toBeTruthy();
    expect(screen.getByLabelText('310 Assets in library')).toBeTruthy();
    expect(screen.getByText('D10T Shop Manual')).toBeTruthy();
    expect(screen.getByText('Failed')).toBeTruthy();
    expect(screen.getByText('Role changed · Sam Lee')).toBeTruthy();
    expect(screen.queryByText('Team activity')).toBeNull();
    await fireEvent.press(screen.getByRole('link', { name: 'Audit log' }));
    expect(onOpenAuditLog).toHaveBeenCalled();
  });

  it('shows a customer open cases, machines down and entries this week under the search', async () => {
    const props = await setup({ onSeeAllCases: jest.fn() });
    expect(screen.getByText('1 breaching SLA')).toBeTruthy();
    expect(screen.getByText('DZ-07')).toBeTruthy();
    expect(screen.getByText('3 logged by you')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: /^Open cases: 2/ }));
    expect(props.onSeeAllCases).toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('button', { name: /^Machines down: 1/ }));
    expect(props.onSeeAll).toHaveBeenCalled();
  });

  it('keeps the customer tiles off the admin home', async () => {
    await setup({ isAdmin: true, admin: SAMPLE_ADMIN_HOME });
    expect(screen.queryByText('3 logged by you')).toBeNull();
  });
});
