import * as Speech from 'expo-speech';

import { speakAnswer, stopSpeaking, toSpeech, useSpeaker } from '../speaker';

const speak = jest.mocked(Speech.speak);

beforeEach(() => {
  jest.clearAllMocks();
  useSpeaker.setState({ speakingId: null });
});

describe('speaker', () => {
  it('drops markdown and citation markers before reading', () => {
    expect(toSpeech('**Check** the `pump` first [1].\n- Bleed the line')).toBe(
      'Check the pump first.\nBleed the line',
    );
  });

  it('reads one answer at a time and clears when it finishes', async () => {
    await speakAnswer('a1', 'Torque to 450 Nm.');
    expect(Speech.stop).toHaveBeenCalled(); // anything already playing stops first
    expect(useSpeaker.getState().speakingId).toBe('a1');
    expect(speak).toHaveBeenCalledWith(
      'Torque to 450 Nm.',
      expect.objectContaining({ useApplicationAudioSession: false }),
    );
    speak.mock.calls[0]?.[1]?.onDone?.();
    expect(useSpeaker.getState().speakingId).toBeNull();
  });

  it('splits long answers into chunks the engine accepts', async () => {
    const long = Array.from({ length: 200 }, () => 'Check the hydraulic line.').join(' ');
    await speakAnswer('a2', long);
    expect(speak.mock.calls.length).toBeGreaterThan(1);
    expect(speak.mock.calls.every(([part]) => part.length <= 3900)).toBe(true);
  });

  it('stops on request', async () => {
    await speakAnswer('a3', 'Hello');
    await stopSpeaking();
    expect(useSpeaker.getState().speakingId).toBeNull();
  });
});
