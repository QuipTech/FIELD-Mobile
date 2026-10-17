import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SAMPLE_MACHINES, type Machine } from '@/features/machines/data';
import { AskAi, type AskAiProps } from '../AskAi';
import { SAMPLE_THREAD, type ChatMessage } from '../data';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
const FLEET: Machine[] = Object.values(SAMPLE_MACHINES);

const setup = async (messages: ChatMessage[] = SAMPLE_THREAD, prompt?: string) => {
  const props: AskAiProps = {
    machines: FLEET,
    machineId: 'HT-2201',
    onMachineChange: jest.fn(),
    messages,
    prompt,
    onSend: jest.fn(),
    onNewChat: jest.fn(),
    onHistory: jest.fn(),
    onAttach: jest.fn(),
    onVoice: jest.fn(),
    onOpenCitation: jest.fn(),
    onLogEntry: jest.fn(),
    onRaiseCase: jest.fn(),
  };
  await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <AskAi {...props} />
    </SafeAreaProvider>,
  );
  return props;
};

describe('AskAi', () => {
  it('shows the thread with sources and answer actions', async () => {
    const props = await setup();
    expect(
      screen.getByLabelText('You: E-2204 on cold start, pre-charge 8.2 MPa. What first?'),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Ask about: HT-2201' })).toBeTruthy();

    await fireEvent.press(screen.getByRole('link', { name: 'Source 2 · Bulletin 88' }));
    expect(props.onOpenCitation).toHaveBeenCalledWith(
      expect.objectContaining({ articleId: 'bulletin-88' }),
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Open source' }));
    expect(props.onOpenCitation).toHaveBeenLastCalledWith(
      expect.objectContaining({ articleId: 'bulletin-88' }),
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Log as entry' }));
    expect(props.onLogEntry).toHaveBeenCalledTimes(1);
  });

  it('sends a typed question, or offers voice when empty', async () => {
    const props = await setup();
    await fireEvent.press(screen.getByRole('button', { name: 'Ask by voice' }));
    expect(props.onVoice).toHaveBeenCalledTimes(1);

    await fireEvent.changeText(
      screen.getByLabelText('Ask a question'),
      '  Torque for wheel nuts?  ',
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Send' }));
    expect(props.onSend).toHaveBeenCalledWith('Torque for wheel nuts?');
    expect(screen.getByLabelText('Ask a question')).toHaveDisplayValue('');
  });

  it('starts a new chat with suggestions and takes a prefilled prompt', async () => {
    await setup([], 'About “Rear suspension cylinder recharge”: ');
    expect(screen.getByLabelText('Ask a question')).toHaveDisplayValue(
      'About “Rear suspension cylinder recharge”: ',
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Drill rod change procedure' }));
    expect(screen.getByLabelText('Ask a question')).toHaveDisplayValue(
      'Drill rod change procedure',
    );
  });
});
