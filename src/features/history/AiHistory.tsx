import { Sparkles, Truck, X } from 'lucide-react-native';
import { View } from 'react-native';

import { BrandButton } from '@/components/BrandButton/BrandButton';
import { BrandCard } from '@/components/BrandCard/BrandCard';
import { DetailScreen } from '@/components/DetailScreen/DetailScreen';
import { EmptyPanel } from '@/components/EmptyPanel/EmptyPanel';
import { Pill } from '@/components/Pill/Pill';
import { Text } from '@/components/Text/Text';
import { formatDayRelative } from '@/lib/date';
import { colors } from '@/theme';
import type { AiConversation } from './data';
import { styles } from './styles';

export type AiHistoryProps = {
  conversations: AiConversation[];
  onOpen: (conversation: AiConversation) => void;
  /** Ask before clearing; the route confirms. */
  onClear: () => void;
};

/** M17 AI history: past Ask AI questions, newest first. */
export function AiHistory({ conversations, onOpen, onClear }: AiHistoryProps) {
  if (conversations.length === 0) {
    return (
      <DetailScreen>
        <EmptyPanel
          icon={Sparkles}
          title="No AI conversations yet"
          message="Questions you ask Ask AI appear here so you can pick them up later."
        />
      </DetailScreen>
    );
  }

  return (
    <DetailScreen
      footer={
        <BrandButton
          variant="outline"
          label="Clear AI history"
          icon={<X size={18} color={colors.ink} strokeWidth={2} />}
          onPress={onClear}
        />
      }
    >
      {conversations.map((c) => {
        const when = formatDayRelative(c.at);
        return (
          <BrandCard
            key={c.id}
            onPress={() => onOpen(c)}
            accessibilityLabel={`${c.machineId}, ${when}: ${c.question}`}
          >
            <View style={styles.splitRow}>
              <Pill label={c.machineId} tone="brand" icon={Truck} />
              <Text variant="caption" color="inkSubtle">
                {when}
              </Text>
            </View>
            <Text style={styles.question}>{c.question}</Text>
          </BrandCard>
        );
      })}
    </DetailScreen>
  );
}
