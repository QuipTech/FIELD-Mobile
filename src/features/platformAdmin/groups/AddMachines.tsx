import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { Button } from '@/components/Button/Button';
import { Card } from '@/components/Card/Card';
import { SearchField } from '@/components/SearchField/SearchField';
import { Text } from '@/components/Text/Text';
import { toast } from '@/components/Toast/store';
import { errorMessage } from '@/lib/http';
import { useDebounced } from '@/lib/useDebounced';
import { makeStyles, useTheme } from '@/theme';
import { PlatformAdminScreen } from '../shared';
import {
  useGroupMachines,
  useGroupMembers,
  usePlatformMachineSearch,
  type PlatformMachine,
} from './groupsApi';
import { MachineSummary } from './MachinesTab';

function Tick({ on, disabled }: { on: boolean; disabled: boolean }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={[styles.tick, on && styles.tickOn, disabled && styles.tickDisabled]}>
      {on && <Check size={14} color={colors.onButton} strokeWidth={3} />}
    </View>
  );
}

function ResultList({
  list,
  inGroup,
  picked,
  onToggle,
}: {
  list: PlatformMachine[];
  inGroup: Set<string>;
  picked: Set<string>;
  onToggle: (id: string) => void;
}) {
  const styles = useStyles();
  return (
    <Card padded={false} style={{ overflow: 'hidden' }}>
      {list.map((m, i) => {
        const already = inGroup.has(m.id);
        const on = already || picked.has(m.id);
        return (
          <Pressable
            key={m.id}
            onPress={() => onToggle(m.id)}
            disabled={already}
            style={[
              styles.row,
              i < list.length - 1 && styles.divider,
              already && { opacity: 0.55 },
            ]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: on, disabled: already }}
            accessibilityHint={already ? 'Already in this group' : undefined}
          >
            <Tick on={on} disabled={already} />
            <MachineSummary machine={m} />
          </Pressable>
        );
      })}
    </Card>
  );
}

/** Pick machines from any organisation; those already in the group show ticked and disabled. */
export function AddMachines({ groupId }: { groupId: string }) {
  const [text, setText] = useState('');
  const q = useDebounced(text, 350);
  const results = usePlatformMachineSearch(q);
  const members = useGroupMachines(groupId, true);
  const { addMachines } = useGroupMembers(groupId);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const inGroup = new Set((members.data ?? []).map((m) => m.id));
  const list = results.data ?? [];

  const toggle = (id: string) =>
    setPicked((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const add = () =>
    addMachines.mutate([...picked], {
      onSuccess: () => {
        toast.show(`${picked.size} machine${picked.size === 1 ? '' : 's'} added.`);
        router.back();
      },
      onError: (e) => toast.show(errorMessage(e)),
    });

  return (
    <PlatformAdminScreen
      header={
        <SearchField
          value={text}
          onChange={setText}
          label="Plant ID, fleet no., serial, VIN or organisation"
          autoFocus
        />
      }
      footer={
        <Button
          label={
            picked.size
              ? `Add ${picked.size} machine${picked.size === 1 ? '' : 's'}`
              : 'Select machines'
          }
          onPress={add}
          disabled={picked.size === 0}
          loading={addMachines.isPending}
        />
      }
    >
      {q.length < 2 ? (
        <Text color="muted" style={{ textAlign: 'center', padding: 24 }}>
          Type at least 2 characters to search every organisation’s machines.
        </Text>
      ) : results.isPending ? (
        <ActivityIndicator style={{ marginTop: 24 }} />
      ) : results.error ? (
        <Text color="danger">{errorMessage(results.error)}</Text>
      ) : list.length === 0 ? (
        <Text color="muted" style={{ textAlign: 'center', padding: 24 }}>
          No machines match.
        </Text>
      ) : (
        <ResultList list={list} inGroup={inGroup} picked={picked} onToggle={toggle} />
      )}
    </PlatformAdminScreen>
  );
}

const useStyles = makeStyles((c) => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, minHeight: 56 },
  divider: { borderBottomWidth: 1, borderBottomColor: c.border },
  tick: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: c.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickOn: { backgroundColor: c.primary, borderColor: c.primary },
  tickDisabled: { backgroundColor: c.muted, borderColor: c.muted },
}));
