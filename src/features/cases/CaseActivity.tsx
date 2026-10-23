import { Lock } from 'lucide-react-native';
import { View } from 'react-native';

import { Text } from '@/components/Text/Text';
import { formatRelative } from '@/lib/date';
import { colors } from '@/theme';
import type { CaseActivity } from './data';
import { styles } from './styles';

/** The case's activity log. Pass it already filtered with `visibleActivity`. */
export function ActivityList({
  activity,
  myInitials,
}: {
  activity: CaseActivity[];
  myInitials: string;
}) {
  return (
    <>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        Activity
      </Text>
      {activity.length === 0 && (
        <Text variant="caption" color="inkMuted">
          No replies yet.
        </Text>
      )}
      {activity.map((item, i) =>
        item.internal ? (
          <InternalNote key={item.id} item={item} />
        ) : (
          <ActivityItem key={item.id} item={item} myInitials={myInitials} divider={i > 0} />
        ),
      )}
    </>
  );
}

function ActivityItem({
  item,
  myInitials,
  divider,
}: {
  item: CaseActivity;
  myInitials: string;
  divider: boolean;
}) {
  const when = formatRelative(item.at);
  return (
    <View
      style={[styles.activity, divider && styles.activityDivider]}
      accessible
      accessibilityLabel={`${item.author}, ${when}: ${item.body}`}
    >
      <View style={styles.activityHead}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.mine ? myInitials : item.initials}</Text>
        </View>
        <Text style={styles.author}>{item.author}</Text>
        <Text variant="caption" color="inkSubtle">
          {when}
        </Text>
      </View>
      <Text variant="caption" color="inkMuted">
        {item.body}
      </Text>
    </View>
  );
}

function InternalNote({ item }: { item: CaseActivity }) {
  const when = formatRelative(item.at);
  return (
    <View
      style={styles.note}
      accessible
      accessibilityLabel={`Internal note, staff only. ${item.author}, ${when}: ${item.body}`}
    >
      <View style={styles.noteHead}>
        <Lock size={14} color={colors.amber} strokeWidth={2} />
        <Text variant="caption" style={styles.noteLabel}>
          Internal note · staff only
        </Text>
      </View>
      <Text variant="caption" color="inkMuted">
        {item.author} · {when}
      </Text>
      <Text variant="caption">{item.body}</Text>
    </View>
  );
}
