import {
  BookOpen,
  ClipboardPlus,
  ExternalLink,
  Info,
  LifeBuoy,
  Sparkles,
} from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { FilterChip } from '@/components/FilterChip/FilterChip';
import { Pill } from '@/components/Pill/Pill';
import { Text } from '@/components/Text/Text';
import { colors } from '@/theme';
import type { ChatMessage, Citation } from './data';
import { styles } from './styles';

export type AnswerActions = {
  onOpenCitation: (citation: Citation) => void;
  onLogEntry: () => void;
  onRaiseCase: () => void;
};

/** One message in the thread: your question, an answer with sources and actions, or a notice. */
export function ChatBubble({ message, ...actions }: { message: ChatMessage } & AnswerActions) {
  if (message.role === 'user') {
    return (
      <View style={styles.userBubble} accessible accessibilityLabel={`You: ${message.text}`}>
        <Text style={styles.messageText}>{message.text}</Text>
      </View>
    );
  }
  if (message.role === 'notice') {
    return (
      <View style={styles.notice} accessibilityRole="text">
        <Info size={14} color={colors.inkMuted} strokeWidth={2} />
        <Text variant="caption" color="inkMuted" style={styles.noticeText}>
          {message.text}
        </Text>
      </View>
    );
  }

  const source = message.citations.find((c) => c.articleId) ?? message.citations[0];
  return (
    <View style={styles.assistantRow}>
      <View style={styles.avatar} accessibilityElementsHidden importantForAccessibility="no">
        <Sparkles size={14} color={colors.brand} strokeWidth={2} />
      </View>
      <View style={styles.assistantBody}>
        <View
          style={styles.assistantBubble}
          accessible
          accessibilityLabel={`Ask AI: ${message.text}`}
        >
          <Text style={styles.messageText}>{message.text}</Text>
        </View>
        {message.citations.length > 0 && (
          <View style={styles.chips}>
            {message.citations.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => actions.onOpenCitation(c)}
                style={({ pressed }) => pressed && styles.pressed}
                accessibilityRole="link"
                accessibilityLabel={`Source ${c.label}`}
              >
                <Pill label={c.label} tone="brand" icon={BookOpen} />
              </Pressable>
            ))}
          </View>
        )}
        <View style={styles.chips}>
          <FilterChip label="Log as entry" icon={ClipboardPlus} onPress={actions.onLogEntry} />
          <FilterChip label="Raise case" icon={LifeBuoy} onPress={actions.onRaiseCase} />
          {source && (
            <FilterChip
              label="Open source"
              icon={ExternalLink}
              onPress={() => actions.onOpenCitation(source)}
            />
          )}
        </View>
      </View>
    </View>
  );
}
