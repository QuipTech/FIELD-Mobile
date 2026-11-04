import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Faq } from '../Faq';

it('expands and collapses FAQ answers with accessible state', async () => {
  await render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 },
      }}
    >
      <Faq />
    </SafeAreaProvider>,
  );
  const question = screen.getByRole('button', { name: 'How do I change my name?' });
  expect(question).toHaveProp('accessibilityState', { expanded: false });
  await fireEvent.press(question);
  expect(question).toHaveProp('accessibilityState', { expanded: true });
  expect(screen.getByText(/Update your first and last name/)).toBeTruthy();
  await fireEvent.press(question);
  expect(screen.queryByText(/Update your first and last name/)).toBeNull();
});
