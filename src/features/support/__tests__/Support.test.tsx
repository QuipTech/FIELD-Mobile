import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { FAQS } from '../data';
import { FaqArticleView } from '../FaqArticleView';
import { Help } from '../Help';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
const renderScreen = (ui: ReactElement) =>
  render(<SafeAreaProvider initialMetrics={metrics}>{ui}</SafeAreaProvider>);

describe('Help', () => {
  const setup = async () => {
    const props = {
      onAskAi: jest.fn(),
      onContactSupport: jest.fn(),
      onOpenFaq: jest.fn(),
      onLiveChat: jest.fn(),
      onCallCoordinator: jest.fn(),
    };
    await renderScreen(<Help faqs={FAQS} {...props} />);
    return props;
  };

  it('lists FAQs and routes to help', async () => {
    const props = await setup();
    await fireEvent.press(screen.getByRole('button', { name: 'How does scan-to-open work?' }));
    expect(props.onOpenFaq).toHaveBeenCalledWith('scan-to-open');
    await fireEvent.press(screen.getByRole('button', { name: 'Ask AI' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Contact support' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Live chat with support' }));
    expect(props.onAskAi).toHaveBeenCalledTimes(1);
    expect(props.onContactSupport).toHaveBeenCalledTimes(1);
    expect(props.onLiveChat).toHaveBeenCalledTimes(1);
  });

  it('searches questions and answers', async () => {
    await setup();
    await fireEvent.changeText(screen.getByLabelText('Search help'), 'SIGNAL');
    expect(screen.getByText('How do I work offline in the pit?')).toBeTruthy();
    expect(screen.getByText('Why is my entry stuck "pending sync"?')).toBeTruthy();
    expect(screen.queryByText('How does scan-to-open work?')).toBeNull();

    await fireEvent.changeText(screen.getByLabelText('Search help'), 'warranty');
    expect(screen.getByText('No answers match “warranty”. Try Ask AI.')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Clear search' }));
    expect(screen.getByText('How does scan-to-open work?')).toBeTruthy();
  });
});

describe('FaqArticleView', () => {
  it('shows the answer and takes one vote', async () => {
    const props = { onContactSupport: jest.fn(), onFeedback: jest.fn() };
    await renderScreen(<FaqArticleView article={FAQS[0]!} {...props} />);

    expect(screen.getByText(/Download my site/)).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Yes' }));
    await fireEvent.press(screen.getByRole('button', { name: 'No' }));
    expect(props.onFeedback).toHaveBeenCalledTimes(1);
    expect(props.onFeedback).toHaveBeenCalledWith(true);
    expect(screen.getByText('Thanks for letting us know.')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Still need help? Contact support' }));
    expect(props.onContactSupport).toHaveBeenCalledTimes(1);
  });
});
