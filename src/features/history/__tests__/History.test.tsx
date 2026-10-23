import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AiHistory } from '../AiHistory';
import { SAMPLE_CONVERSATIONS, SAMPLE_REVIEW_QUEUE } from '@/test/fixtures/history';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
const renderScreen = (ui: ReactElement) =>
  render(<SafeAreaProvider initialMetrics={metrics}>{ui}</SafeAreaProvider>);

describe('AiHistory', () => {
  it('lists past questions and offers to clear them', async () => {
    const props = { onOpen: jest.fn(), onClear: jest.fn() };
    await renderScreen(<AiHistory conversations={SAMPLE_CONVERSATIONS} {...props} />);
    expect(screen.getByText("What's the torque spec for the final drive bolts?")).toBeTruthy();
    expect(screen.getByText('Yesterday')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: /^DR-4412, 4 days ago/ }));
    expect(props.onOpen).toHaveBeenCalledWith(SAMPLE_CONVERSATIONS[2]);
    await fireEvent.press(screen.getByRole('button', { name: 'Clear AI history' }));
    expect(props.onClear).toHaveBeenCalledTimes(1);
  });

  it('shows an empty state without the clear button', async () => {
    await renderScreen(<AiHistory conversations={[]} onOpen={jest.fn()} onClear={jest.fn()} />);
    expect(screen.getByText('No AI conversations yet')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Clear AI history' })).toBeNull();
  });

  it('keeps the review queue from customers', async () => {
    await renderScreen(
      <AiHistory
        conversations={SAMPLE_CONVERSATIONS}
        onOpen={jest.fn()}
        onClear={jest.fn()}
        reviewQueue={SAMPLE_REVIEW_QUEUE}
      />,
    );
    expect(screen.queryByText(/^Review queue/)).toBeNull();
  });

  it('lets admins switch to the review queue and filter it', async () => {
    const onOpenReview = jest.fn();
    await renderScreen(
      <AiHistory
        conversations={SAMPLE_CONVERSATIONS}
        onOpen={jest.fn()}
        onClear={jest.fn()}
        isAdmin
        reviewQueue={SAMPLE_REVIEW_QUEUE}
        onOpenReview={onOpenReview}
      />,
    );
    await fireEvent.press(screen.getByText('Review queue · 3'));
    expect(screen.getByText('Safety refusal')).toBeTruthy();
    expect(screen.getByText('Track sag measurement')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Clear AI history' })).toBeNull();

    await fireEvent.press(screen.getByText('Unreviewed 2'));
    expect(screen.queryByText('Track sag measurement')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: /^Bypass park brake interlock/ }));
    expect(onOpenReview).toHaveBeenCalledWith(SAMPLE_REVIEW_QUEUE[0]);
  });
});
