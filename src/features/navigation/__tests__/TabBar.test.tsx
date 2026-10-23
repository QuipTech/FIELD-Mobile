import { fireEvent, render, screen } from '@testing-library/react-native';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { TabBar } from '../TabBar';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
const NAMES = ['index', 'machines', 'knowledge', 'ask-ai', 'cases'];

describe('TabBar', () => {
  it('shows every tab, marks the current one and navigates', async () => {
    const navigation = { emit: jest.fn(() => ({ defaultPrevented: false })), navigate: jest.fn() };
    const props = {
      state: { index: 0, routes: NAMES.map((name) => ({ key: `${name}-key`, name })) },
      navigation,
    } as unknown as BottomTabBarProps;
    await render(
      <SafeAreaProvider initialMetrics={metrics}>
        <TabBar {...props} />
      </SafeAreaProvider>,
    );

    expect(screen.getByRole('tab', { name: 'Home' })).toBeSelected();
    expect(screen.getByRole('tab', { name: 'AI Assistant' })).not.toBeSelected();

    await fireEvent.press(screen.getByRole('tab', { name: 'AI Assistant' }));
    expect(navigation.navigate).toHaveBeenCalledWith('ask-ai');
    await fireEvent.press(screen.getByRole('tab', { name: 'Home' }));
    expect(navigation.navigate).toHaveBeenCalledTimes(1); // already on Home
  });
});
