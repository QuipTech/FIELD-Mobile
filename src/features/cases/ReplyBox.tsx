import { useState } from 'react';
import { TextInput } from 'react-native';

import { BrandButton } from '@/components/BrandButton/BrandButton';
import { Segmented } from '@/components/Segmented/Segmented';
import { colors, layout } from '@/theme';
import { styles } from './styles';

type ComposeMode = 'reply' | 'note';
const MODES = [
  { value: 'reply', label: 'Reply' },
  { value: 'note', label: 'Internal note' },
] as const;

/** Reply composer. Admins (`canNote`) can switch it to a staff-only note. */
export function ReplyBox({
  onSend,
  onNote,
  canNote,
}: {
  onSend: (text: string) => Promise<void> | void;
  onNote?: (text: string) => Promise<void> | void;
  canNote: boolean;
}) {
  const [mode, setMode] = useState<ComposeMode>('reply');
  const note = canNote && mode === 'note';
  const [draft, setDraft] = useState('');
  const [focused, setFocused] = useState(false);
  const [sending, setSending] = useState(false);
  const text = draft.trim();

  const send = async () => {
    if (!text) return;
    setSending(true);
    try {
      await (note ? onNote?.(text) : onSend(text));
      setDraft('');
    } catch {
      // The caller reported the error; keep the draft so it can be sent again.
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {canNote && (
        <Segmented
          options={MODES}
          value={mode}
          onChange={setMode}
          accessibilityLabel="Reply or internal note"
        />
      )}
      <TextInput
        value={draft}
        onChangeText={setDraft}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={note ? 'Add an internal note…' : 'Add a reply…'}
        placeholderTextColor={colors.inkSubtle}
        multiline
        maxFontSizeMultiplier={layout.maxFontScale}
        style={[styles.replyInput, focused && styles.replyFocused]}
        accessibilityLabel={note ? 'Note text' : 'Reply'}
      />
      <BrandButton
        label={note ? 'Add internal note' : 'Send reply'}
        onPress={send}
        disabled={!text}
        loading={sending}
      />
    </>
  );
}
