/**
 * Jest stand-in for expo-speech-recognition (native only). Tests drive it with `emitSpeech`,
 * e.g. emitSpeech('result', { isFinal: false, results: [{ transcript: 'hi' }] }).
 */
type Listener = (event: never) => void;
const listeners = new Map<string, Set<Listener>>();

export const ExpoSpeechRecognitionModule = {
  isRecognitionAvailable: jest.fn(() => true),
  requestPermissionsAsync: jest.fn(async () => ({ granted: true, status: 'granted' })),
  start: jest.fn(),
  stop: jest.fn(),
  abort: jest.fn(),
  getSupportedLocales: jest.fn(async () => ({ locales: ['en-US', 'en-AU'], installedLocales: [] })),
};

export function useSpeechRecognitionEvent(name: string, listener: Listener) {
  // Latest listener per hook call; fine for tests, which render one composer at a time.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useEffect } = require('react') as typeof import('react');
  useEffect(() => {
    const set = listeners.get(name) ?? new Set();
    listeners.set(name, set);
    set.add(listener);
    return () => void set.delete(listener);
  }, [name, listener]);
}

export function emitSpeech(name: string, event: unknown = {}) {
  listeners.get(name)?.forEach((listener) => listener(event as never));
}
