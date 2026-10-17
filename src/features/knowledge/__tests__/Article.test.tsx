import { fireEvent, render, renderHook, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ArticleView } from '../ArticleView';
import { useArticle } from '../data';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

describe('ArticleView', () => {
  it('renders the procedure and hands off to Ask AI', async () => {
    const { result } = await renderHook(() => useArticle('rear-suspension-recharge'));
    const onAskAi = jest.fn();
    await render(
      <SafeAreaProvider initialMetrics={metrics}>
        <ArticleView article={result.current!} largeText={false} onAskAi={onAskAi} />
      </SafeAreaProvider>,
    );

    expect(screen.getByRole('header', { name: 'Rear suspension cylinder recharge' })).toBeTruthy();
    expect(screen.getByText('Saved offline')).toBeTruthy();
    expect(screen.getByLabelText('Figure 4 — charging group')).toBeTruthy();
    expect(screen.getByRole('header', { name: 'Prerequisites' })).toBeTruthy();
    expect(screen.getByRole('alert')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Ask AI about this' }));
    expect(onAskAi).toHaveBeenCalledTimes(1);
  });
});
