import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
  type ExpoSpeechRecognitionErrorCode,
} from 'expo-speech-recognition';
import { useEffect, useRef, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';

import { toast } from '@/components/Toast/store';
import { haptics } from '@/lib/haptics';
import { stopSpeaking } from './speaker';
import { recognitionLocale } from './voiceLocale';

/** Field words the recogniser should prefer over sound-alikes. */
const FIELD_TERMS = ['FIELD', 'QuipTech', 'hydraulic', 'accumulator', 'torque', 'CAT', 'Komatsu'];

/** Errors worth telling the user about; the rest (cancelled, silence) end quietly. */
const ERRORS: Partial<Record<ExpoSpeechRecognitionErrorCode, string>> = {
  network: 'Voice typing needs a connection right now. Type your question instead.',
  'audio-capture': 'Couldn’t use the microphone. Try again.',
  busy: 'The microphone is busy in another app.',
  interrupted: 'Voice typing stopped because of a call or Siri.',
  'language-not-supported': 'Voice typing doesn’t support your phone’s language yet.',
  'service-not-allowed':
    Platform.OS === 'ios'
      ? 'Turn on Siri & Dictation in Settings to ask by voice.'
      : 'Install or enable Google voice typing to ask by voice.',
};

function askForSettings() {
  Alert.alert(
    'Allow voice questions',
    'FIELD needs the microphone and speech recognition to type what you say.',
    [
      { text: 'Not now', style: 'cancel' },
      { text: 'Open Settings', onPress: () => Linking.openSettings() },
    ],
  );
}

/**
 * Voice-to-text for a text box. What's said is appended to the text already there and shown
 * live as it's recognised; `stop` keeps it, `cancel` drops any late results (e.g. on send).
 */
export function useVoiceInput(value: string, onChange: (text: string) => void) {
  const [listening, setListening] = useState(false);
  /** Text before dictation started; null when not dictating (late results are ignored). */
  const base = useRef<string | null>(null);

  useSpeechRecognitionEvent('start', () => setListening(true));
  useSpeechRecognitionEvent('end', () => {
    setListening(false);
    base.current = null;
  });
  useSpeechRecognitionEvent('result', (event) => {
    const spoken = event.results[0]?.transcript.trim();
    if (base.current === null || !spoken) return;
    onChange(base.current ? `${base.current} ${spoken}` : spoken);
  });
  useSpeechRecognitionEvent('error', (event) => {
    if (event.error === 'not-allowed') return askForSettings();
    const message = ERRORS[event.error];
    if (message) toast.error(message);
  });

  // Leaving the screen stops the microphone.
  useEffect(() => () => ExpoSpeechRecognitionModule.abort(), []);

  const start = async () => {
    if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
      toast.error(ERRORS['service-not-allowed'] ?? 'Voice typing isn’t available on this phone.');
      return;
    }
    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) return askForSettings();
    haptics.light();
    stopSpeaking(); // the mic would hear the answer being read
    base.current = value.trim();
    setListening(true);
    ExpoSpeechRecognitionModule.start({
      lang: await recognitionLocale(),
      interimResults: true,
      continuous: true,
      addsPunctuation: true,
      iosTaskHint: 'dictation',
      contextualStrings: FIELD_TERMS,
    });
  };

  /** Finishes dictation, keeping what was said. */
  const stop = () => ExpoSpeechRecognitionModule.stop();

  /** Stops at once and ignores anything still being recognised. */
  const cancel = () => {
    base.current = null;
    ExpoSpeechRecognitionModule.abort();
  };

  return { listening, start, stop, cancel };
}
