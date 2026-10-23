import { act, fireEvent, render, screen } from '@testing-library/react-native';
import * as Speech from 'expo-speech';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { type Machine } from '@/features/machines/data';
import { SAMPLE_MACHINES } from '@/test/fixtures/machines/fleet';
import { AskAi, type AskAiProps } from '../AskAi';
import { SAMPLE_THREAD, SAMPLE_USAGE } from '@/test/fixtures/assistant';
import { emitSpeech } from '@/test/mocks/speechRecognition';
import type { ChatMessage } from '../data';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
const FLEET: Machine[] = Object.values(SAMPLE_MACHINES);

const setup = async (messages: ChatMessage[] = SAMPLE_THREAD, prompt?: string, isAdmin = false) => {
  const props: AskAiProps = {
    machines: FLEET,
    machineId: 'HT-2201',
    onMachineChange: jest.fn(),
    messages,
    isAdmin,
    usage: SAMPLE_USAGE[isAdmin ? 'org' : 'mine'],
    prompt,
    onSend: jest.fn(),
    onNewChat: jest.fn(),
    onHistory: jest.fn(),
    onAttach: jest.fn(),
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

  it('reads an answer aloud, and stops it', async () => {
    await setup();
    const [listen] = screen.getAllByRole('button', { name: 'Read the answer aloud' });
    await fireEvent.press(listen!);
    expect(Speech.speak).toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('button', { name: 'Stop reading the answer' }));
    expect(Speech.stop).toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Stop reading the answer' })).toBeNull();
  });

  it('types what is said, live, and stops on request', async () => {
    await setup();
    await fireEvent.press(screen.getByRole('button', { name: 'Ask by voice' }));
    expect(ExpoSpeechRecognitionModule.start).toHaveBeenCalledWith(
      expect.objectContaining({ interimResults: true }),
    );
    await act(() => emitSpeech('start'));
    expect(screen.getByPlaceholderText('Listening… speak now')).toBeTruthy();
    await act(() =>
      emitSpeech('result', { isFinal: false, results: [{ transcript: 'torque for wheel nuts' }] }),
    );
    expect(screen.getByLabelText('Ask a question').props.value).toBe('torque for wheel nuts');
    await fireEvent.press(screen.getByRole('button', { name: 'Stop voice typing' }));
    expect(ExpoSpeechRecognitionModule.stop).toHaveBeenCalled();
    await act(() => emitSpeech('end'));
    expect(screen.getByRole('button', { name: 'Send' })).toBeTruthy();
  });

  it('sends a typed question, or offers voice when empty', async () => {
    const props = await setup();
    expect(screen.getByRole('button', { name: 'Ask by voice' })).toBeTruthy();

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

  it('shows customers their own usage and hides answer diagnostics', async () => {
    await setup();
    expect(screen.getByText('142 of 500 queries this month')).toBeTruthy();
    expect(screen.queryByText(/^Admin · Confidence/)).toBeNull();
  });

  it('shows admins org usage, overage and answer diagnostics', async () => {
    await setup(SAMPLE_THREAD, undefined, true);
    expect(screen.getByText('Org: 3,820 of 5,000 queries')).toBeTruthy();
    expect(screen.getByText(/^Overage \$0\.04 each/)).toBeTruthy();
    expect(screen.getByText('Admin · Confidence 0.91 · 4 sections · logged')).toBeTruthy();
  });
});
