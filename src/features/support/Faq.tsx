import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { DetailScreen } from '@/components/DetailScreen/DetailScreen';
import { Text } from '@/components/Text/Text';
import { makeStyles, useTheme } from '@/theme';

const FAQS = [
  {
    question: 'How do I change my name?',
    answer:
      'Open Me, then choose Edit profile under Account. Update your first and last name and tap Save changes.',
  },
  {
    question: 'Where can I see my machines?',
    answer:
      'Open the Machines tab to browse your machines. You can also scan a machine tag from Home.',
  },
  {
    question: 'How do I check changes waiting to upload?',
    answer:
      'Open Me, then Sync under Offline & preferences. Keep FIELD connected to the internet so pending changes can upload. Avoid signing out while changes are pending.',
  },
  {
    question: 'How do I get help with a machine?',
    answer:
      'Use Ask AI for a question, or open Support cases from the menu or Me tab to review your cases and contact support. Check AI answers against approved documentation before carrying out work.',
  },
  {
    question: 'Where are billing and notification settings?',
    answer:
      'Open Me for Plan & usage or Billing & plan, depending on your account permissions. The Notifications switch is under Offline & preferences.',
  },
];

export function Faq() {
  return (
    <DetailScreen>
      <Text color="muted">Quick answers to common questions about FIELD.</Text>
      {FAQS.map((faq) => (
        <FaqItem key={faq.question} {...faq} />
      ))}
    </DetailScreen>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [expanded, setExpanded] = useState(false);
  const styles = useStyles();
  const { colors } = useTheme();
  const Icon = expanded ? ChevronUp : ChevronDown;
  return (
    <View style={styles.card}>
      <Pressable
        onPress={() => setExpanded(!expanded)}
        style={styles.question}
        accessibilityRole="button"
        accessibilityLabel={question}
        accessibilityState={{ expanded }}
      >
        <Text variant="bodyStrong" style={styles.title}>
          {question}
        </Text>
        <Icon size={20} color={colors.muted} />
      </Pressable>
      {expanded && (
        <Text color="muted" style={styles.answer}>
          {answer}
        </Text>
      )}
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  card: { borderWidth: 1, borderColor: c.border, borderRadius: 14, backgroundColor: c.card },
  question: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, minHeight: 56 },
  title: { flex: 1 },
  answer: { paddingHorizontal: 16, paddingBottom: 16 },
}));
