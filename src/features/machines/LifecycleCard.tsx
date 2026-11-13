import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/Button/Button';
import { Card } from '@/components/Card/Card';
import { Pill, type PillTone } from '@/components/Pill/Pill';
import { Text } from '@/components/Text/Text';
import { formatDateTime } from '@/lib/date';
import { fontFamily, makeStyles } from '@/theme';
import type { LifecycleAction, LifecycleEvent, MachineLifecycleInfo } from './lifecycleApi';

const STATE: Record<string, { label: string; tone: PillTone; note: string }> = {
  registered: {
    label: 'Not activated',
    tone: 'amber',
    note: 'Not billed. Activate it for full history, configuration, photos and AI.',
  },
  active: { label: 'Active', tone: 'success', note: 'Billed with your active fleet.' },
  archived: { label: 'Archived', tone: 'muted', note: 'Not billed. Records are kept.' },
  sold: { label: 'Sold', tone: 'muted', note: 'Sold: records are read-only.' },
};

const ACTION_LABEL: Record<LifecycleAction, string> = {
  activate: 'Activate',
  deactivate: 'Deactivate',
  archive: 'Archive',
  reactivate: 'Reactivate',
  sell: 'Sell or transfer',
};

const stateLabel = (s?: string | null) => (s ? (STATE[s]?.label ?? s) : 'Added');
const PREVIEW = 3;

function EventRow({ e }: { e: LifecycleEvent }) {
  const styles = useStyles();
  return (
    <View style={styles.event}>
      <View style={styles.dot} />
      <View style={{ flex: 1 }}>
        <Text variant="caption" style={styles.eventTitle}>
          {stateLabel(e.fromState)} → {stateLabel(e.toState)}
        </Text>
        <Text variant="caption" color="muted">
          {[formatDateTime(e.occurredAt), e.actorName ?? 'System'].join(' · ')}
        </Text>
        {!!e.reason && (
          <Text variant="caption" color="muted">
            “{e.reason}”
          </Text>
        )}
      </View>
    </View>
  );
}

/** Portal: Lifecycle and billing. Only the actions the API lists are offered. */
export function LifecycleCard({
  info,
  busy,
  onAction,
  onDelete,
}: {
  info: MachineLifecycleInfo;
  busy?: boolean;
  onAction: (action: LifecycleAction) => void;
  /** Set for users with `machine.lifecycle`. */
  onDelete?: () => void;
}) {
  const styles = useStyles();
  const [all, setAll] = useState(false);
  const state = STATE[info.lifecycleState];
  const events = [...info.events].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const shown = all ? events : events.slice(0, PREVIEW);

  return (
    <Card style={{ gap: 12 }}>
      <View style={styles.head}>
        <Text style={styles.title}>Lifecycle and billing</Text>
        <Pill label={state?.label ?? info.lifecycleState} tone={state?.tone ?? 'neutral'} />
      </View>
      {state && (
        <Text variant="caption" color="muted">
          {state.note}
        </Text>
      )}
      {info.availableActions.length > 0 && (
        <View style={styles.actions}>
          {info.availableActions.map((a) => (
            <Button
              key={a}
              label={ACTION_LABEL[a]}
              size="small"
              variant={a === 'activate' ? 'primary' : 'secondary'}
              onPress={() => onAction(a)}
              disabled={busy}
            />
          ))}
        </View>
      )}
      {shown.map((e) => (
        <EventRow key={e.id} e={e} />
      ))}
      {events.length > PREVIEW && (
        <Pressable onPress={() => setAll(!all)} accessibilityRole="button" hitSlop={8}>
          <Text variant="caption" color="brand">
            {all ? 'Show less' : `Show all ${events.length} changes`}
          </Text>
        </Pressable>
      )}
      {onDelete && (
        <View style={styles.delete}>
          <Button label="Delete machine" variant="danger" size="small" onPress={onDelete} />
        </View>
      )}
    </Card>
  );
}

const useStyles = makeStyles((c) => ({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { fontFamily: fontFamily.medium, fontSize: 16 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  event: { flexDirection: 'row', gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6, backgroundColor: c.border },
  eventTitle: { fontFamily: fontFamily.medium },
  delete: { borderTopWidth: 1, borderTopColor: c.border, paddingTop: 12, alignItems: 'flex-start' },
}));
