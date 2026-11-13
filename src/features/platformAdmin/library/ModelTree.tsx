import { useQueryClient } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/Button/Button';
import { Card } from '@/components/Card/Card';
import { FormSheet } from '@/components/FormSheet/FormSheet';
import { Text } from '@/components/Text/Text';
import { usePullRefresh } from '@/lib/usePullRefresh';
import { Loaded, PlatformAdminScreen } from '../shared';
import {
  libraryKeys,
  useModelTree,
  useTreeChange,
  type MachineModelSummary,
  type TreeChange,
} from './libraryApi';
import { OwnerBadge } from './ModelCard';
import { SystemRow } from './TreeRows';

/** The model's summary from any loaded list (there's no single-model endpoint). */
function useSummary(modelId: string) {
  const client = useQueryClient();
  for (const [, data] of client.getQueriesData<MachineModelSummary[]>({
    queryKey: libraryKeys.all,
  })) {
    const found = Array.isArray(data) ? data.find((m) => m.id === modelId) : undefined;
    if (found) return found;
  }
  return undefined;
}

export type TreeForm = {
  title: string;
  submitLabel: string;
  label: string;
  initial?: string;
  run: (name: string) => Promise<unknown>;
};

const addSystemForm = (change: (c: TreeChange) => Promise<unknown>): TreeForm => ({
  title: 'Add system',
  submitLabel: 'Add system',
  label: 'System name',
  run: (name) => change({ kind: 'addSystem', name }),
});

function ExpandToggle({ allOpen, onPress }: { allOpen: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{ alignSelf: 'flex-end', minHeight: 44, justifyContent: 'center' }}
      accessibilityRole="button"
    >
      <Text variant="caption" color="primary">
        {allOpen ? 'Collapse all' : 'Expand all'}
      </Text>
    </Pressable>
  );
}

/** Expanded systems; until the user toggles one, only the first is open. */
function useAccordion(ids: string[]) {
  const [expanded, setExpanded] = useState<Set<string> | null>(null);
  const open = expanded ?? new Set(ids.slice(0, 1));
  const allOpen = ids.length > 0 && ids.every((id) => open.has(id));
  return {
    open,
    allOpen,
    toggle: (id: string) => {
      const next = new Set(open);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setExpanded(next);
    },
    toggleAll: () => setExpanded(allOpen ? new Set() : new Set(ids)),
  };
}

/** A model's systems and components, reused by every machine of that model. */
export function ModelTree({ modelId }: { modelId: string }) {
  const summary = useSummary(modelId);
  const editable = !!summary?.isEditable;
  const tree = useModelTree(modelId);
  const change = useTreeChange(modelId);
  const pull = usePullRefresh(libraryKeys.tree(modelId));
  const [form, setForm] = useState<TreeForm>();
  const systems = tree.data?.systems ?? [];
  const acc = useAccordion(systems.map((s) => s.id));

  return (
    <PlatformAdminScreen
      {...pull}
      footer={
        editable ? (
          <Button
            label="Add system"
            icon={Plus}
            variant="secondary"
            onPress={() => setForm(addSystemForm(change.mutateAsync))}
          />
        ) : undefined
      }
    >
      <Stack.Screen options={{ title: summary?.displayName ?? 'Machine model' }} />
      {summary && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <OwnerBadge model={summary} />
          <Text variant="caption" color="muted">
            {summary.assetsCount} assets
          </Text>
        </View>
      )}
      <Loaded query={tree}>
        {() =>
          systems.length === 0 ? (
            <Text color="muted" style={{ textAlign: 'center', padding: 24 }}>
              No systems yet.
            </Text>
          ) : (
            <>
              <ExpandToggle allOpen={acc.allOpen} onPress={acc.toggleAll} />
              <Card padded={false} style={{ overflow: 'hidden' }}>
                {systems.map((s, i) => (
                  <SystemRow
                    key={s.id}
                    system={s}
                    open={acc.open.has(s.id)}
                    last={i === systems.length - 1}
                    editable={editable}
                    onToggle={() => acc.toggle(s.id)}
                    change={change.mutateAsync}
                    onForm={setForm}
                  />
                ))}
              </Card>
            </>
          )
        }
      </Loaded>
      <Text variant="caption" color="muted">
        Reused by every asset instance of the model.
      </Text>
      <FormSheet
        visible={!!form}
        title={form?.title ?? ''}
        fields={[{ key: 'name', label: form?.label ?? 'Name', required: true }]}
        initial={form?.initial !== undefined ? { name: form.initial } : undefined}
        submitLabel={form?.submitLabel ?? 'Save'}
        onClose={() => setForm(undefined)}
        onSubmit={(v) => form!.run(v.name!)}
      />
    </PlatformAdminScreen>
  );
}
