import { View } from 'react-native';

import { Text } from '@/components/Text/Text';
import { formatRelative } from '@/lib/date';
import { fontFamily, makeStyles } from '@/theme';
import { Loaded } from '../shared';
import { humanise, useGroupActivity, type GroupActivity } from './groupsApi';

/** Names mentioned in an entry's metadata (machine label, target, organisation…). */
export function metadataNames(meta: GroupActivity['metadata']): string[] {
  if (!meta) return [];
  const names: string[] = [];
  for (const [key, value] of Object.entries(meta)) {
    if (typeof value === 'string' && /name|label|title|reason|level/i.test(key) && value.trim()) {
      names.push(value.trim());
    }
    if (Array.isArray(value)) {
      for (const v of value)
        if (v && typeof v === 'object' && 'label' in v) names.push(String(v.label));
    }
  }
  return names.slice(0, 4);
}

/** What changed in the group, newest first. */
export function ActivityTab({ groupId }: { groupId: string }) {
  const styles = useStyles();
  const activity = useGroupActivity(groupId, true);
  const list = [...(activity.data ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <Loaded query={activity}>
      {() =>
        list.length === 0 ? (
          <Text color="muted" style={{ textAlign: 'center', padding: 16 }}>
            No activity yet.
          </Text>
        ) : (
          <View>
            {list.map((e, i) => {
              const names = metadataNames(e.metadata);
              return (
                <View key={e.id} style={styles.item}>
                  <View style={styles.rail}>
                    <View style={styles.dot} />
                    {i < list.length - 1 && <View style={styles.line} />}
                  </View>
                  <View style={styles.body}>
                    <Text style={{ fontFamily: fontFamily.medium }}>{humanise(e.action)}</Text>
                    {names.length > 0 && (
                      <Text variant="caption" numberOfLines={2}>
                        {names.join(' · ')}
                      </Text>
                    )}
                    <Text variant="caption" color="muted">
                      {e.actorName ?? 'System'} · {formatRelative(e.createdAt)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )
      }
    </Loaded>
  );
}

const useStyles = makeStyles((c) => ({
  item: { flexDirection: 'row', gap: 12 },
  rail: { width: 12, alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 5, backgroundColor: c.primary },
  line: { flex: 1, width: 2, backgroundColor: c.border, marginTop: 2 },
  body: { flex: 1, gap: 2, paddingBottom: 16 },
}));
