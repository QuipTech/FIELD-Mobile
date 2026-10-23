import {
  BookOpen,
  ThumbsDown,
  ThumbsUp,
  ClipboardPlus,
  ExternalLink,
  Info,
  LifeBuoy,
  Sparkles,
  Square,
  Volume2,
} from 'lucide-react-native';
import { Image, Pressable, View } from 'react-native';

import { FilterChip } from '@/components/FilterChip/FilterChip';
import { Pill } from '@/components/Pill/Pill';
import { Text } from '@/components/Text/Text';
import { colors } from '@/theme';
import type { ChatMessage, Citation, Feedback } from './data';
import { speakAnswer, stopSpeaking, useSpeaker } from './speaker';
import { styles } from './styles';

export type AnswerActions = {
  onOpenCitation: (citation: Citation) => void;
  /** "Wrong" sends the answer to the admin review queue. */
  onFeedback?: (messageId: string, rating: Feedback) => void;
  onLogEntry: () => void;
  onRaiseCase: () => void;
};

/** One message in the thread: your question, an answer with sources and actions, or a notice. */
export function ChatBubble({
  message,
  showReview = false,
  ...actions
}: {
  message: ChatMessage;
  /** Admins see how the answer was produced, when the API reports it. */
  showReview?: boolean;
} & AnswerActions) {
  if (message.role === 'user') return <UserBubble message={message} />;
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
          <Text style={styles.messageText}>{message.text || (message.streaming ? '…' : '')}</Text>
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
        {showReview && message.review && (
          <Text variant="caption" color="inkSubtle">
            {`Admin · Confidence ${message.review.confidence.toFixed(2)} · ${message.review.sections} section${message.review.sections === 1 ? '' : 's'} · logged`}
          </Text>
        )}
        <View style={styles.chips}>
          {!message.streaming && message.text.trim() !== '' && (
            <ListenChip id={message.id} text={message.text} />
          )}
          <FilterChip label="Log as entry" icon={ClipboardPlus} onPress={actions.onLogEntry} />
          <FilterChip label="Raise case" icon={LifeBuoy} onPress={actions.onRaiseCase} />
          {source && (
            <FilterChip
              label="Open source"
              icon={ExternalLink}
              onPress={() => actions.onOpenCitation(source)}
            />
          )}
          {message.messageId && actions.onFeedback && (
            <FeedbackChips
              value={message.feedback}
              onRate={(rating) => actions.onFeedback?.(message.messageId!, rating)}
            />
          )}
        </View>
      </View>
    </View>
  );
}

/** Reads the answer aloud; while it plays, the chip stops it. */
function ListenChip({ id, text }: { id: string; text: string }) {
  const speaking = useSpeaker((s) => s.speakingId === id);
  return (
    <FilterChip
      label={speaking ? 'Stop' : 'Listen'}
      icon={speaking ? Square : Volume2}
      selected={speaking}
      accessibilityLabel={speaking ? 'Stop reading the answer' : 'Read the answer aloud'}
      onPress={() => (speaking ? stopSpeaking() : speakAnswer(id, text))}
    />
  );
}

function FeedbackChips({ value, onRate }: { value?: Feedback; onRate: (r: Feedback) => void }) {
  if (value) {
    return (
      <Text variant="caption" color="inkSubtle">
        {value === 'wrong' ? 'Flagged for review' : 'Marked helpful'}
      </Text>
    );
  }
  return (
    <>
      <FilterChip label="Helpful" icon={ThumbsUp} onPress={() => onRate('helpful')} />
      <FilterChip label="Wrong" icon={ThumbsDown} onPress={() => onRate('wrong')} />
    </>
  );
}

function UserBubble({ message }: { message: Extract<ChatMessage, { role: 'user' }> }) {
  return (
    <View style={styles.userBubble} accessible accessibilityLabel={`You: ${message.text}`}>
      {message.imageUri && (
        <Image
          source={{ uri: message.imageUri }}
          style={styles.userImage}
          accessibilityLabel="Attached photo"
        />
      )}
      <Text style={styles.messageText}>{message.text}</Text>
    </View>
  );
}
