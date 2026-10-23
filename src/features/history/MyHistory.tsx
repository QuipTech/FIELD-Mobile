import { ChevronRight, Sparkles, Trash2, Truck } from 'lucide-react-native';
import { Fragment, useMemo, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { DetailScreen } from '@/components/DetailScreen/DetailScreen';
import { EmptyPanel } from '@/components/EmptyPanel/EmptyPanel';
import { SearchField } from '@/components/SearchField/SearchField';
import { Text } from '@/components/Text/Text';
import { formatDayRelative, formatShortDate, formatTime } from '@/lib/date';
import { useTheme } from '@/theme';
import type { AiConversation } from './data';
import { groupByDay, matchesSearch } from './groups';
import { useStyles } from './styles';

export type MyHistoryProps = {
  conversations: AiConversation[];
  onOpen: (conversation: AiConversation) => void;
  onClear: () => void;
  /** Admin view switch, shown above everything. */
  header?: ReactNode;
};

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** The user's past Ask AI conversations: summary, search, then day groups. */
export function MyHistory({ conversations, onOpen, onClear, header }: MyHistoryProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const groups = useMemo(
    () => groupByDay(conversations.filter((c) => matchesSearch(c, query))),
    [conversations, query],
  );

  if (conversations.length === 0) {
    return (
      <DetailScreen>
        {header}
        <EmptyPanel
          icon={Sparkles}
          title="No AI conversations yet"
          message="Questions you ask Ask AI appear here so you can pick them up later."
        />
      </DetailScreen>
    );
  }

  return (
    <DetailScreen>
      {header}
      <Summary conversations={conversations} />
      <SearchField value={query} onChange={setQuery} label="Search your questions" />
      {groups.length === 0 && (
        <Text color="muted" style={styles.noMatch}>
          No questions match “{query.trim()}”.
        </Text>
      )}
      {groups.map((group) => (
        <View key={group.title} style={styles.group}>
          <Text style={styles.groupTitle} accessibilityRole="header">
            {group.title}
          </Text>
          <View style={styles.card}>
            {group.items.map((c, i) => (
              <Fragment key={c.id}>
                {i > 0 && <View style={styles.divider} />}
                <ConversationRow conversation={c} today={group.title === 'Today'} onOpen={onOpen} />
              </Fragment>
            ))}
          </View>
        </View>
      ))}
      <Pressable
        onPress={onClear}
        style={({ pressed }) => [styles.clear, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Clear AI history"
      >
        <Trash2 size={16} color={colors.danger} strokeWidth={2} />
        <Text variant="label" color="danger">
          Clear AI history
        </Text>
      </Pressable>
    </DetailScreen>
  );
}

/** Gradient card: how many conversations, across how many machines. */
function Summary({ conversations }: { conversations: AiConversation[] }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const machines = new Set(conversations.flatMap((c) => (c.machine ? [c.machine] : []))).size;
  return (
    <View style={styles.summary}>
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="historySummary" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.primary} />
            <Stop offset="1" stopColor={colors.brandNight} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#historySummary)" />
      </Svg>
      <View style={styles.summaryBadge}>
        <View style={styles.summaryBadgeFill} />
        <Sparkles size={22} color={colors.onButton} strokeWidth={2} />
      </View>
      <View style={styles.summaryText}>
        <Text variant="section" color="onButton">
          {plural(conversations.length, 'conversation')}
        </Text>
        <Text variant="caption" color="onBrandMuted">
          {machines
            ? `About ${plural(machines, 'machine')} · tap one to continue`
            : 'Tap one to continue'}
        </Text>
      </View>
    </View>
  );
}

function ConversationRow({
  conversation: c,
  today,
  onOpen,
}: {
  conversation: AiConversation;
  today: boolean;
  onOpen: (c: AiConversation) => void;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  const Icon = c.machine ? Truck : Sparkles;
  const time = today ? formatTime(c.at) : formatShortDate(c.at);
  return (
    <Pressable
      onPress={() => onOpen(c)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${c.machine ? `${c.machine}, ` : ''}${formatDayRelative(c.at)}: ${c.question}`}
    >
      <View style={[styles.iconTile, !c.machine && styles.iconTileAi]}>
        <Icon size={18} color={colors.primary} strokeWidth={2} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.question} numberOfLines={2}>
          {c.question}
        </Text>
        <Text variant="caption" color="faint" numberOfLines={1}>
          {[c.machine ?? 'General question', time].join(' · ')}
        </Text>
      </View>
      <ChevronRight size={18} color={colors.faint} strokeWidth={2} />
    </Pressable>
  );
}
