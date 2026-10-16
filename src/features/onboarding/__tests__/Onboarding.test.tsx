import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Onboarding } from '../Onboarding';
import { SLIDES } from '../slides';

const renderOnboarding = (onDone = jest.fn()) =>
  render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 },
      }}
    >
      <Onboarding onDone={onDone} />
    </SafeAreaProvider>,
  );

describe('Onboarding', () => {
  it('advances with Next and finishes on the last slide', async () => {
    const onDone = jest.fn();
    await renderOnboarding(onDone);
    expect(screen.getByLabelText(`Slide 1 of ${SLIDES.length}`)).toBeTruthy();

    for (let i = 1; i < SLIDES.length; i++) {
      await fireEvent.press(screen.getByRole('button', { name: 'Next' }));
    }
    expect(onDone).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByRole('button', { name: 'Get started' }));
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('skips straight to done', async () => {
    const onDone = jest.fn();
    await renderOnboarding(onDone);
    await fireEvent.press(screen.getByRole('button', { name: 'Skip introduction' }));
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
