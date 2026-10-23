import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SAMPLE_ME, SAMPLE_TEAM } from '@/test/fixtures/me';
import type { MeData } from '../data';
import { Me, type MeProps } from '../Me';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const setup = async (data: Partial<MeData> = {}, isAdmin = false, extra: Partial<MeProps> = {}) => {
  const props: MeProps = {
    isAdmin,
    team: isAdmin ? SAMPLE_TEAM : undefined,
    name: 'Jonah Okoye',
    email: 'jonah@quiptech.com.au',
    initials: 'JO',
    data: { ...SAMPLE_ME, ...data },
    version: '1.0.0',
    notificationsOn: true,
    onToggleNotifications: jest.fn(),
    onNavigate: jest.fn(),
    ...extra,
  };
  await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <Me {...props} />
    </SafeAreaProvider>,
  );
  return props;
};

describe('Me', () => {
  it('toggles Face ID sign-in under Security when the device supports it', async () => {
    const onToggle = jest.fn();
    await setup({}, false, {
      biometric: { support: { kind: 'face', label: 'Face ID' }, on: false, onToggle },
    });
    expect(screen.getByText('Security')).toBeTruthy();
    await fireEvent(screen.getByLabelText('Sign in with Face ID'), 'valueChange', true);
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('opens support cases from Activity', async () => {
    const props = await setup();
    await fireEvent.press(screen.getByRole('button', { name: 'Support cases' }));
    expect(props.onNavigate).toHaveBeenCalledWith('cases');
  });

  it('hides Security without biometrics', async () => {
    await setup();
    expect(screen.queryByText('Security')).toBeNull();
  });

  it('shows the profile, role and plan', async () => {
    await setup();
    expect(screen.getByText('Jonah Okoye')).toBeTruthy();
    expect(screen.getByText('jonah@quiptech.com.au')).toBeTruthy();
    expect(screen.getByText('Technician · Pit 4')).toBeTruthy();
    expect(screen.getByLabelText('Standard plan, Active. Renews 14 Apr 2027')).toBeTruthy();
    expect(screen.getByText(/Version 1\.0\.0/)).toBeTruthy();
  });

  it('shows a technician their plan, managed by the admin', async () => {
    await setup();
    expect(screen.queryByRole('button', { name: /^Team & roles/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /^Billing & plan/ })).toBeNull();
  });

  it('gives admins team and billing management', async () => {
    const props = await setup({}, true);
    expect(screen.getByText('Admin · Pit 4')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /^Plan & usage/ })).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Team & roles, 42 users · 3 sites' }));
    await fireEvent.press(
      screen.getByRole('button', { name: 'Billing & plan, Standard · 42 assets' }),
    );
    expect(jest.mocked(props.onNavigate).mock.calls.map(([to]) => to)).toEqual(['team', 'billing']);
  });

  it('opens billing and the settings rows', async () => {
    const props = await setup();
    await fireEvent.press(
      screen.getByRole('button', { name: 'Plan & usage, Standard · managed by your admin' }),
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Offline downloads, 12 docs' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Language, English' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Replay welcome guide' }));
    expect(jest.mocked(props.onNavigate).mock.calls.map(([to]) => to)).toEqual([
      'billing',
      'downloads',
      'language',
      'replayGuide',
    ]);
  });

  it('shows pending sync, or up to date when there is none', async () => {
    await setup();
    expect(screen.getByRole('button', { name: 'Sync, 2 pending' })).toBeTruthy();
    await setup({ pendingSync: 0 });
    expect(screen.getByRole('button', { name: 'Sync, Up to date' })).toBeTruthy();
  });

  it('toggles notifications', async () => {
    const props = await setup();
    await fireEvent(screen.getByRole('switch', { name: 'Notifications' }), 'valueChange', false);
    expect(props.onToggleNotifications).toHaveBeenCalledWith(false);
  });

  it('asks the route to sign out', async () => {
    const props = await setup();
    await fireEvent.press(screen.getByRole('button', { name: 'Sign out' }));
    expect(props.onNavigate).toHaveBeenCalledWith('signOut');
  });
});
