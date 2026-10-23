import { ArrowUp, Mic, Plus, X } from 'lucide-react-native';
import { useState } from 'react';
import { Image, Pressable, TextInput, View } from 'react-native';

import { colors, layout } from '@/theme';
import { styles } from './styles';

export type ComposerProps = {
  value: string;
  onChange: (text: string) => void;
  onSend: (text: string) => void;
  onAttach: () => void;
  onVoice: () => void;
  /** Photo waiting to go with the next question. */
  image?: { uri: string };
  onRemoveImage?: () => void;
};

/** "+" attach, the question box, then send (or voice while empty). */
export function Composer({ value, onChange, onSend, onAttach, onVoice, ...props }: ComposerProps) {
  const [focused, setFocused] = useState(false);
  const text = value.trim();
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
          placeholder="Ask…"
          placeholderTextColor={colors.inkSubtle}
          multiline
          maxFontSizeMultiplier={layout.maxFontScale}
          style={[styles.input, focused && styles.inputFocused]}
          accessibilityLabel="Ask a question"
        />
        <Pressable
          onPress={() => (text ? onSend(text) : onVoice())}
          style={({ pressed }) => [styles.send, pressed && styles.sendPressed]}
          accessibilityRole="button"
          accessibilityLabel={text ? 'Send' : 'Ask by voice'}
        >
          {text ? (
            <ArrowUp size={20} color={colors.onAccent} strokeWidth={2.5} />
          ) : (
            <Mic size={20} color={colors.onAccent} strokeWidth={2} />
          )}
        </Pressable>
      </View>
    </View>
  );
}
