import { History, Plus, Sparkles, Truck } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

import { FilterChip, FilterSelect } from '@/components/FilterChip/FilterChip';
import { Meter } from '@/components/Meter/Meter';
import { Decorations } from '@/features/auth/Decorations';
import { APP_MESH, MeshBackground } from '@/components/MeshBackground/MeshBackground';
import { TabHeader } from '@/components/TabHeader/TabHeader';
import { Text } from '@/components/Text/Text';
import type { Machine } from '@/features/machines/data';
import { formatShortDate } from '@/lib/date';
import { formatUsage } from '@/lib/format';
import { colors } from '@/theme';
import { ChatBubble, type AnswerActions } from './ChatMessages';
import { Composer } from './Composer';
import { SUGGESTIONS, type AiUsage, type ChatMessage } from './data';
import { styles } from './styles';

export const NO_MACHINE = 'none';

export type AskAiProps = AnswerActions & {
  machines: Machine[];
  /** Machine the questions are about, or NO_MACHINE. */
  machineId: string;
  onMachineChange: (id: string) => void;
  messages: ChatMessage[];
  /** Admins see org-wide usage and how each answer was produced. */
  isAdmin: boolean;
  /** Undefined while loading; the meter is hidden until then. */
  usage?: AiUsage;
  /** An answer is streaming in; sending waits for it. */
  busy?: boolean;
  /** Prefills the question box when it changes, e.g. from "Ask AI about this". */
  prompt?: string;
  onSend: (text: string) => void;
  onNewChat: () => void;
  onHistory: () => void;
  onAttach: () => void;
  /** Photo waiting to go with the next question. */
  image?: { uri: string };
  onRemoveImage?: () => void;
};

/** M8 AI assistant (the Ask AI tab). */
export function AskAi({
  machines,
  machineId,
  messages,
  prompt,
  isAdmin,
  usage,
  busy = false,
  ...props
}: AskAiProps) {
  const [draft, setDraft] = useState(prompt ?? '');
  const scroll = useRef<ScrollView>(null);
  // A new prompt (e.g. "Ask AI about this" again) replaces the draft.
  const [lastPrompt, setLastPrompt] = useState(prompt);
  if (prompt !== lastPrompt) {
    setLastPrompt(prompt);
    if (prompt) setDraft(prompt);
  }

  const send = (text: string) => {
    if (busy) return;
    props.onSend(text);
    setDraft('');
  };
  const machineOptions = [
    { value: NO_MACHINE, label: 'Any machine' },
    ...machines.map((m) => ({ value: m.id, label: m.label })),
  ];

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <MeshBackground spots={APP_MESH} />
      <Decorations placement="aiChat" />
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
        {usage && <UsageMeter usage={usage} />}
        {messages.length === 0 ? (
          <Welcome onPick={setDraft} />
        ) : (
          messages.map((m) => <ChatBubble key={m.id} message={m} showReview={isAdmin} {...props} />)
        )}
      </ScrollView>
      <Composer
        value={draft}
        onChange={setDraft}
        onSend={send}
        onAttach={props.onAttach}
        image={props.image}
        onRemoveImage={props.onRemoveImage}
      />
    </KeyboardAvoidingView>
  );
}

/** AI1 allowance: your own queries, or the whole org's for admins. Overage never blocks. */
function UsageMeter({ usage }: { usage: AiUsage }) {
  const count = formatUsage(usage.used, usage.limit);
  const label = usage.scope === 'org' ? `Org: ${count} queries` : `${count} queries this month`;
  const caption =
    usage.scope === 'org' && usage.overage
      ? `Overage ${usage.overage} each · resets ${formatShortDate(usage.resetsOn)}`
      : `Resets ${formatShortDate(usage.resetsOn)}`;
  return (
    <View style={styles.usage}>
      <Meter
        value={usage.used}
        max={usage.limit}
        label={label}
        caption={caption}
        tone={usage.used > usage.limit ? 'warning' : 'primary'}
      />
    </View>
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
