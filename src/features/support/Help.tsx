import { LifeBuoy, Sparkles, User, type LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { DetailScreen } from '@/components/DetailScreen/DetailScreen';
import { GroupedList, GroupedRow } from '@/components/GroupedList/GroupedList';
import { SearchField } from '@/components/SearchField/SearchField';
import { Text } from '@/components/Text/Text';
import { colors } from '@/theme';
import { searchFaqs, type FaqArticle } from './data';
import { styles } from './styles';

export type HelpProps = {
  faqs: FaqArticle[];
  onAskAi: () => void;
  onContactSupport: () => void;
  onOpenFaq: (id: string) => void;
  onLiveChat: () => void;
  onCallCoordinator: () => void;
};

/** M14 Help & support: search, quick routes to Ask AI / support, FAQs and contacts. */
export function Help({ faqs, onOpenFaq, ...props }: HelpProps) {
  const [query, setQuery] = useState('');
  const matches = searchFaqs(faqs, query);

  return (
    <DetailScreen>
      <SearchField value={query} onChange={setQuery} label="Search help" />
      <View style={styles.tiles}>
        <Tile icon={Sparkles} label="Ask AI" onPress={props.onAskAi} primary />
        <Tile icon={LifeBuoy} label="Contact support" onPress={props.onContactSupport} />
      </View>

      <Text style={styles.sectionTitle} accessibilityRole="header">
        FAQs
      </Text>
      <GroupedList>
        {matches.length === 0 && (
          <GroupedRow label={`No answers match “${query.trim()}”. Try Ask AI.`} muted />
        )}
        {matches.map((f) => (
          <GroupedRow key={f.id} label={f.question} onPress={() => onOpenFaq(f.id)} />
        ))}
      </GroupedList>

      <Text style={styles.sectionTitle} accessibilityRole="header">
        Contact
      </Text>
      <GroupedList>
        <GroupedRow icon={LifeBuoy} label="Live chat with support" onPress={props.onLiveChat} />
        <GroupedRow icon={User} label="Call site coordinator" onPress={props.onCallCoordinator} />
      </GroupedList>
    </DetailScreen>
  );
}

function Tile({
  icon: Icon,
  label,
  onPress,
  primary,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        primary && styles.tilePrimary,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Icon size={22} color={primary ? colors.onAccent : colors.ink} strokeWidth={2} />
      <Text color={primary ? 'onAccent' : 'ink'} style={styles.tileLabel}>
        {label}
      </Text>
    </Pressable>
  );
}
