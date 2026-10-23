import { Plus, X } from 'lucide-react-native';
import { useState } from 'react';
import { Image, Pressable, TextInput, View } from 'react-native';

import { colors, layout } from '@/theme';
import { styles } from './styles';
import { useVoiceInput } from './useVoiceInput';
import { VoiceButton } from './VoiceButton';

export type ComposerProps = {
  value: string;
  onChange: (text: string) => void;
  onSend: (text: string) => void;
  onAttach: () => void;
  /** Photo waiting to go with the next question. */
  image?: { uri: string };
  onRemoveImage?: () => void;
};

/** "+" attach, the question box, then send — or voice typing while the box is empty. */
export function Composer({ value, onChange, onSend, onAttach, ...props }: ComposerProps) {
  const [focused, setFocused] = useState(false);
  const voice = useVoiceInput(value, onChange);
  const text = value.trim();
  const send = () => {
    voice.cancel(); // a late result mustn't refill the box after sending
    onSend(text);
  };
  return (
    <View>
      {props.image && (
        <View style={styles.attachment}>
          <Image
            source={{ uri: props.image.uri }}
            style={styles.attachmentImage}
            accessibilityLabel="Photo to send"
          />
          <Pressable
            onPress={props.onRemoveImage}
            style={styles.attachmentRemove}
            accessibilityRole="button"
            accessibilityLabel="Remove photo"
            hitSlop={8}
          >
            <X size={14} color={colors.onAccent} strokeWidth={2.5} />
          </Pressable>
        </View>
      )}
      <View style={styles.composer}>
        <Pressable
          onPress={onAttach}
          style={({ pressed }) => [
            styles.squareButton,
            styles.composerButton,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Attach a photo"
        >
          <Plus size={20} color={colors.ink} strokeWidth={2} />
        </Pressable>
        <TextInput
          value={value}
          onChangeText={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={voice.listening ? 'Listening… speak now' : 'Ask…'}
          placeholderTextColor={colors.inkSubtle}
          multiline
          maxFontSizeMultiplier={layout.maxFontScale}
          style={[styles.input, (focused || voice.listening) && styles.inputFocused]}
          accessibilityLabel="Ask a question"
        />
        {voice.listening ? (
          <VoiceButton mode="stop" onPress={voice.stop} />
        ) : (
          <VoiceButton mode={text ? 'send' : 'voice'} onPress={text ? send : voice.start} />
        )}
      </View>
    </View>
  );
}
