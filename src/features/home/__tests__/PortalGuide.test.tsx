import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GUIDE_STEPS } from '../guideSteps';
import { resetPortalGuide, usePortalGuide } from '../guideStorage';
import { PortalGuide } from '../PortalGuide';

// Run focus effects like a plain effect: these tests have no navigator.
jest.mock('expo-router', () => ({
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  useFocusEffect: (fn: () => void | (() => void)) => require('react').useEffect(fn, [fn]),
}));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

beforeEach(() => AsyncStorage.clear());

describe('PortalGuide', () => {
  const setup = async () => {
    const onDone = jest.fn();
    await render(
      <SafeAreaProvider initialMetrics={metrics}>
        <PortalGuide visible onDone={onDone} />
      </SafeAreaProvider>,
    );
    return onDone;
  };

  it('walks through every step, then finishes', async () => {
    const onDone = await setup();
    expect(screen.getByText('Welcome to QuipTech FIELD')).toBeTruthy();
    for (let i = 1; i < GUIDE_STEPS.length; i++) {
      await fireEvent.press(screen.getByRole('button', { name: 'Next' }));
      expect(screen.getByText(GUIDE_STEPS[i]!.title)).toBeTruthy();
    }
    expect(onDone).not.toHaveBeenCalled();
    // Get started closes the guide on the last step, so Skip is no longer offered.
    expect(screen.queryByRole('button', { name: 'Skip guide' })).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Get started' }));
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('can be skipped', async () => {
    const onDone = await setup();
    await fireEvent.press(screen.getByRole('button', { name: 'Skip guide' }));
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});

describe('usePortalGuide', () => {
  it('shows on first sign-in only, per user', async () => {
    const first = await renderHook(() => usePortalGuide('user-a'));
    await waitFor(() => expect(first.result.current.visible).toBe(true));
    await act(() => first.result.current.dismiss());
    expect(first.result.current.visible).toBe(false);

    // Same user next launch: stays hidden.
    const again = await renderHook(() => usePortalGuide('user-a'));
    await waitFor(() => expect(AsyncStorage.getItem).toHaveBeenCalledTimes(2));
    expect(again.result.current.visible).toBe(false);

    // A different user on the same device still gets it.
    const other = await renderHook(() => usePortalGuide('user-b'));
    await waitFor(() => expect(other.result.current.visible).toBe(true));
  });

  it('shows again after a reset from Me', async () => {
    await AsyncStorage.setItem('portalGuideSeen:user-a', '2026-10-16');
    await resetPortalGuide('user-a');
    const hook = await renderHook(() => usePortalGuide('user-a'));
    await waitFor(() => expect(hook.result.current.visible).toBe(true));
  });

  it('waits for the user before deciding', async () => {
    const hook = await renderHook(() => usePortalGuide(undefined));
    expect(hook.result.current.visible).toBe(false);
  });
});
