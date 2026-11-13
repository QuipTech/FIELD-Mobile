import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import type { DrawerContentComponentProps } from 'expo-router/drawer';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { confirmSignOut } from '@/auth/confirmSignOut';
import { rateApp } from '@/features/support/links';
import { AppDrawerContent } from '../AppDrawerContent';
import { DrawerMenuButton, DrawerMenuContext } from '../DrawerMenu';

jest.mock('expo-router', () => ({ router: { navigate: jest.fn() }, usePathname: () => '/' }));
jest.mock('expo-router/drawer', () => ({
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  DrawerContentScrollView: require('react-native').ScrollView,
}));
jest.mock('@/auth/useCurrentUser', () => ({
  useCurrentUser: () => ({ data: { firstName: 'Jo', lastName: 'Okoye', email: 'jo@example.com' } }),
}));
let mockPlatformAdmin = false;
jest.mock('@/auth/useRole', () => ({
  useRole: () => ({ capabilities: { isPlatformAdmin: mockPlatformAdmin } }),
}));
jest.mock('@/auth/confirmSignOut', () => ({ confirmSignOut: jest.fn() }));
jest.mock('@/features/support/links', () => ({ rateApp: jest.fn() }));

const closeDrawer = jest.fn();
const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
const setup = () =>
  render(
    <SafeAreaProvider initialMetrics={metrics}>
      <AppDrawerContent
        {...({ navigation: { closeDrawer } } as unknown as DrawerContentComponentProps)}
      />
    </SafeAreaProvider>,
  );
beforeEach(() => jest.clearAllMocks());

it.each([
  ['Home', '/'],
  ['Profile & settings', '/me'],
  ['FAQs', '/faq'],
  ['Support cases', '/cases'],
  ['Privacy policy', '/privacy-policy'],
  ['Terms of service', '/terms'],
])('closes the drawer before opening %s', async (label, path) => {
  await setup();
  await fireEvent.press(screen.getByRole('button', { name: label }));
  expect(closeDrawer).toHaveBeenCalledTimes(1);
  expect(router.navigate).toHaveBeenCalledWith(path);
  expect(closeDrawer.mock.invocationCallOrder[0]).toBeLessThan(
    jest.mocked(router.navigate).mock.invocationCallOrder[0]!,
  );
});

it('closes before starting a rating, and supports an explicit close button', async () => {
  await setup();
  await fireEvent.press(screen.getByRole('button', { name: 'Rate this app' }));
  expect(closeDrawer).toHaveBeenCalledTimes(1);
  expect(rateApp).toHaveBeenCalledTimes(1);
  await fireEvent.press(screen.getByRole('button', { name: 'Close menu' }));
  expect(closeDrawer).toHaveBeenCalledTimes(2);
});

it('opens the shared drawer from a labelled menu button', async () => {
  const open = jest.fn();
  await render(
    <DrawerMenuContext.Provider value={open}>
      <DrawerMenuButton />
    </DrawerMenuContext.Provider>,
  );
  await fireEvent.press(screen.getByRole('button', { name: 'Open menu' }));
  expect(open).toHaveBeenCalledTimes(1);
});

it('closes the drawer before showing the shared sign-out confirmation', async () => {
  await setup();
  await fireEvent.press(screen.getByRole('button', { name: 'Log out' }));
  expect(closeDrawer).toHaveBeenCalledTimes(1);
  expect(confirmSignOut).toHaveBeenCalledTimes(1);
  expect(closeDrawer.mock.invocationCallOrder[0]).toBeLessThan(
    jest.mocked(confirmSignOut).mock.invocationCallOrder[0]!,
  );
});

describe('Administration', () => {
  afterEach(() => {
    mockPlatformAdmin = false;
  });

  it('is hidden from everyone but platform admins', async () => {
    await setup();
    expect(screen.queryByText('Administration')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Audit log' })).toBeNull();
  });

  it.each([
    ['Users', '/admin/users'],
    ['Roles & permissions', '/admin/roles'],
    ['Audit log', '/admin/audit-log'],
    ['Billing', '/admin/billing'],
    ['Demo requests', '/admin/demo-requests'],
    ['AI configuration', '/admin/ai-configuration'],
  ])('opens %s for platform admins', async (label, path) => {
    mockPlatformAdmin = true;
    await setup();
    await fireEvent.press(screen.getByRole('button', { name: label }));
    expect(router.navigate).toHaveBeenCalledWith(path);
  });
});
