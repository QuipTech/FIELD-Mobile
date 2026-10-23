import * as Speech from 'expo-speech';
import { create } from 'zustand';

/**
 * Reads AI answers aloud, one at a time. `speakingId` is the message being read, so its
 * "Listen" chip can turn into "Stop".
 */
export const useSpeaker = create<{ speakingId: string | null }>(() => ({ speakingId: null }));

/** Markdown and citation markers read badly aloud ("asterisk", "bracket one"). */
export function toSpeech(text: string) {
  return text
    .replace(/\s*\[\d+\]/g, '') // [1] citation markers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [label](url) → label
    .replace(/[*_`#>~]+/g, '') // emphasis, code, headings, quotes
    .replace(/^\s*[-•]\s+/gm, '') // bullet markers (the line break already pauses)
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/** Splits text into chunks the engine accepts (Android caps one utterance at ~4000 chars). */
function chunks(text: string): string[] {
  const max = Math.min(Speech.maxSpeechInputLength, 3900);
  if (text.length <= max) return [text];
  const out: string[] = [];
  let rest = text;
  while (rest.length > max) {
    const cut = Math.max(rest.lastIndexOf('. ', max), rest.lastIndexOf('\n', max));
    const at = cut > max / 2 ? cut + 1 : max;
    out.push(rest.slice(0, at));
    rest = rest.slice(at).trimStart();
  }
  return rest ? [...out, rest] : out;
}

const finish = (id: string) => () => {
  if (useSpeaker.getState().speakingId === id) useSpeaker.setState({ speakingId: null });
};

/** Reads one answer, replacing whatever is playing. */
export async function speakAnswer(id: string, text: string) {
  await Speech.stop();
  const parts = chunks(toSpeech(text));
  if (!parts.length || !parts[0]) return;
  useSpeaker.setState({ speakingId: id });
  parts.forEach((part, i) => {
    const last = i === parts.length - 1;
    // Its own audio session: plays over the silent switch's "ambient" mode and ducks music.
    Speech.speak(part, {
      useApplicationAudioSession: false,
      onDone: last ? finish(id) : undefined,
      onStopped: finish(id),
      onError: finish(id),
    });
  });
}

export function stopSpeaking() {
  useSpeaker.setState({ speakingId: null });
  return Speech.stop();
}
