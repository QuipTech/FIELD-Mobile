import { History, Plus, Sparkles, Truck } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

import { FilterChip, FilterSelect } from '@/components/FilterChip/FilterChip';
import { APP_MESH, MeshBackground } from '@/components/MeshBackground/MeshBackground';
import { TabHeader } from '@/components/TabHeader/TabHeader';
import { Text } from '@/components/Text/Text';
import type { Machine } from '@/features/machines/data';
import { colors } from '@/theme';
import { ChatBubble, type AnswerActions } from './ChatMessages';
import { Composer } from './Composer';
import { SUGGESTIONS, type ChatMessage } from './data';
import { styles } from './styles';

export const NO_MACHINE = 'none';

export type AskAiProps = AnswerActions & {
  machines: Machine[];
  /** Machine the questions are about, or NO_MACHINE. */
  machineId: string;
  onMachineChange: (id: string) => void;
  messages: ChatMessage[];
  /** Prefills the question box when it changes, e.g. from "Ask AI about this". */
  prompt?: string;
  onSend: (text: string) => void;
  onNewChat: () => void;
  onHistory: () => void;
  onAttach: () => void;
  onVoice: () => void;
};

/** M8 AI assistant (the Ask AI tab). */
export function AskAi({ machines, machineId, messages, prompt, ...props }: AskAiProps) {
  const [draft, setDraft] = useState(prompt ?? '');
  const scroll = useRef<ScrollView>(null);
  // A new prompt (e.g. "Ask AI about this" again) replaces the draft.
  const [lastPrompt, setLastPrompt] = useState(prompt);
  if (prompt !== lastPrompt) {
    setLastPrompt(prompt);
    if (prompt) setDraft(prompt);
  }

  const send = (text: string) => {
    props.onSend(text);
    setDraft('');
  };
  const machineOptions = [
    { value: NO_MACHINE, label: 'Any machine' },
    ...machines.map((m) => ({ value: m.id, label: m.id })),
  ];

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <MeshBackground spots={APP_MESH} />
      <TabHeader
        title="Ask AI"
        right={
          <View style={styles.headerRight}>
            <FilterSelect
              title="Ask about"
              value={machineId}
              options={machineOptions}
              onChange={props.onMachineChange}
              allValue={NO_MACHINE}
              placeholder="Machine"
              icon={Truck}
            />
            <SquareButton icon={History} label="AI history" onPress={props.onHistory} />
            <SquareButton icon={Plus} label="New chat" onPress={props.onNewChat} />
          </View>
        }
      />
      <ScrollView
        ref={scroll}
        contentContainerStyle={styles.thread}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 ? (
          <Welcome onPick={setDraft} />
        ) : (
          messages.map((m) => <ChatBubble key={m.id} message={m} {...props} />)
        )}
      </ScrollView>
      <Composer
        value={draft}
        onChange={setDraft}
        onSend={send}
        onAttach={props.onAttach}
        onVoice={props.onVoice}
      />
    </KeyboardAvoidingView>
  );
}

function SquareButton({
  icon: Icon,
  label,
  onPress,
}: {
  icon: typeof History;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [styles.squareButton, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Icon size={18} color={colors.ink} strokeWidth={2} />
    </Pressable>
  );
}

function Welcome({ onPick }: { onPick: (text: string) => void }) {
  return (
    <View style={styles.welcome}>
      <View style={styles.welcomeIcon}>
        <Sparkles size={22} color={colors.brand} strokeWidth={2} />
      </View>
      <Text style={styles.title} accessibilityRole="header">
        Ask about a fault, part or procedure
      </Text>
      <Text variant="caption" color="inkMuted" style={styles.centerText}>
        Answers cite your manuals and bulletins.
      </Text>
      <View style={styles.suggestions}>
        {SUGGESTIONS.map((s) => (
          <FilterChip key={s} label={s} onPress={() => onPick(s)} />
        ))}
      </View>
    </View>
  );
}
