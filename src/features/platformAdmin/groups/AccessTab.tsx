import { Share2, UserMinus } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { ActionSheet } from '@/components/ActionSheet/ActionSheet';
import { Button } from '@/components/Button/Button';
import { Card } from '@/components/Card/Card';
import { FormSheet } from '@/components/FormSheet/FormSheet';
import { Pill } from '@/components/Pill/Pill';
import { Segmented } from '@/components/Segmented/Segmented';
import { SwipeRow } from '@/components/SwipeRow/SwipeRow';
import { Text } from '@/components/Text/Text';
import { toast } from '@/components/Toast/store';
import { formatShortDate } from '@/lib/date';
import { errorMessage } from '@/lib/http';
import { fontFamily, makeStyles } from '@/theme';
import { Loaded } from '../shared';
import {
  useGroupAccess,
  useGroupMembers,
  type AccessLevel,
  type GroupAssignment,
} from './groupsApi';
import { ShareSheet } from './ShareSheet';

export const LEVELS = [
  { value: 'view' as const, label: 'View' },
  { value: 'contribute' as const, label: 'Contribute' },
];

function AccessRow(props: {
  a: GroupAssignment;
  last: boolean;
  onLevel: (level: AccessLevel) => void;
  onRevoke: () => void;
}) {
  const { a } = props;
  const styles = useStyles();
  const [menu, setMenu] = useState(false);
  const actions = [
    { label: 'Revoke', icon: UserMinus, destructive: true, onPress: props.onRevoke },
  ];
  return (
    <View style={!props.last && styles.divider}>
      <SwipeRow actions={actions}>
        <Pressable
          onLongPress={() => setMenu(true)}
          style={styles.row}
          accessibilityHint="Swipe left or long press to revoke"
        >
          <View style={styles.head}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fontFamily.medium }} numberOfLines={1}>
                {a.targetName}
              </Text>
              {!!a.targetEmail && (
                <Text variant="caption" color="muted" numberOfLines={1}>
                  {a.targetEmail}
                </Text>
              )}
            </View>
            <Pill label={a.targetType === 'user' ? 'Person' : 'Organisation'} tone="muted" />
          </View>
          {a.targetType === 'user' && !!a.organisation && (
            <Text variant="caption" color="muted">
              {a.organisation.name}
            </Text>
          )}
          <Segmented
            options={LEVELS}
            value={a.accessLevel}
            onChange={(v) => v !== a.accessLevel && props.onLevel(v)}
            accessibilityLabel={`Access for ${a.targetName}`}
          />
          <Text variant="caption" color="muted">
            Granted by {a.grantedByName ?? 'System'} · {formatShortDate(a.grantedAt)}
          </Text>
        </Pressable>
      </SwipeRow>
      <ActionSheet
        visible={menu}
        title={a.targetName}
        actions={actions}
        onClose={() => setMenu(false)}
      />
    </View>
  );
}

/** Who the group is shared with, at view or contribute access. */
export function AccessTab({ groupId }: { groupId: string }) {
  const access = useGroupAccess(groupId, true);
  const { assign, revoke } = useGroupMembers(groupId);
  const [revoking, setRevoking] = useState<GroupAssignment>();
  const [sharing, setSharing] = useState(false);
  const list = access.data ?? [];
  const existing = new Set(list.map((a) => `${a.targetType}:${a.targetId}`));

  const setLevel = (a: GroupAssignment, accessLevel: AccessLevel) =>
    assign.mutate(
      { targetType: a.targetType, targetId: a.targetId, accessLevel },
      {
        onSuccess: () =>
          toast.show(`${a.targetName} can now ${accessLevel === 'view' ? 'view' : 'contribute'}.`),
        onError: (e) => toast.show(errorMessage(e)),
      },
    );

  return (
    <>
      <Button
        label="Share group"
        icon={Share2}
        variant="secondary"
        onPress={() => setSharing(true)}
      />
      <Loaded query={access}>
        {() =>
          list.length === 0 ? (
            <Text color="muted" style={{ textAlign: 'center', padding: 16 }}>
              Not shared with anyone yet.
            </Text>
          ) : (
            <Card padded={false} style={{ overflow: 'hidden' }}>
              {list.map((a, i) => (
                <AccessRow
                  key={a.id}
                  a={a}
                  last={i === list.length - 1}
                  onLevel={(level) => setLevel(a, level)}
                  onRevoke={() => setRevoking(a)}
                />
              ))}
            </Card>
          )
        }
      </Loaded>
      <FormSheet
        visible={!!revoking}
        title={`Revoke ${revoking?.targetName ?? ''}?`}
        intro="They stop seeing this group's machines. The reason is kept in the activity log."
        fields={[{ key: 'reason', label: 'Reason', required: true, multiline: true }]}
        submitLabel="Revoke access"
        destructive
        onClose={() => setRevoking(undefined)}
        onSubmit={(v) => revoke.mutateAsync({ assignmentId: revoking!.id, reason: v.reason! })}
      />
      <ShareSheet
        visible={sharing}
        existing={existing}
        onClose={() => setSharing(false)}
        onShare={(body) => assign.mutateAsync(body)}
      />
    </>
  );
}

const useStyles = makeStyles((c) => ({
  divider: { borderBottomWidth: 1, borderBottomColor: c.border },
  row: { padding: 14, gap: 8, backgroundColor: c.card },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
}));
