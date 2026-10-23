import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';

const FALLBACK = 'en-US';
const norm = (locale: string) => locale.replace('_', '-').toLowerCase();
const language = (locale: string) => norm(locale).split('-')[0];

/**
 * The best recogniser language for a phone locale: the exact one if supported ("en-AU"), else
 * the same language from another region (an "en-PK" phone gets "en-US", the most complete
 * English model), else US English. With no list to check (Android 12 and below) the phone's
 * locale is used as is.
 */
export function pickLocale(wanted: string, supported: string[]): string {
  if (!supported.length) return wanted;
  const exact = supported.find((l) => norm(l) === norm(wanted));
  if (exact) return exact;
  const sameLanguage = supported.filter((l) => language(l) === language(wanted));
  return (
    sameLanguage.find((l) => norm(l) === norm(FALLBACK)) ??
    sameLanguage[0] ??
    supported.find((l) => norm(l) === norm(FALLBACK)) ??
    FALLBACK
  );
}

/** The phone's locale without Unicode extensions ("en-US-u-hc-h12" → "en-US"). */
const deviceLocale = () =>
  (Intl.DateTimeFormat().resolvedOptions().locale || FALLBACK).split('-u-')[0] ?? FALLBACK;

let cached: Promise<string> | null = null;

/** The language to recognise in, worked out once per launch. */
export function recognitionLocale(): Promise<string> {
  cached ??= ExpoSpeechRecognitionModule.getSupportedLocales({})
    .then(({ locales }) => pickLocale(deviceLocale(), locales))
    .catch(() => pickLocale(deviceLocale(), []));
  return cached;
}
