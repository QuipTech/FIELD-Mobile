import { View } from 'react-native';

import { FilterChip, FilterSelect } from '@/components/FilterChip/FilterChip';
import { Text } from '@/components/Text/Text';
import type { MachineComponent } from '@/features/machines/records';
import type { CaptureDraft } from './store';
import { styles } from './styles';

export const componentLabel = (c: MachineComponent) => `${c.systemName} › ${c.name}`;

/** "Component affected", plus "replaced" on a repair; a hint when there's nothing to pick. */
export function ComponentPicker({
  draft,
  update,
  components,
  componentsHint,
}: {
  draft: CaptureDraft;
  update: (patch: Partial<CaptureDraft>) => void;
  components: MachineComponent[];
  componentsHint?: string;
}) {
  if (components.length === 0) {
    if (!componentsHint) return null;
    return (
      <>
        <Text style={styles.label}>Component affected</Text>
        <Text variant="caption" color="inkMuted">
          {componentsHint}
        </Text>
      </>
    );
  }
  const options = [
    { value: '', label: 'None' },
    // Sorted by system so the list reads in groups (Hydraulics › …, Powertrain › …).
    ...[...components]
      .sort((a, b) => a.systemName.localeCompare(b.systemName))
      .map((c) => ({ value: c.id, label: componentLabel(c) })),
  ];
  return (
    <>
      <Text style={styles.label}>Component affected</Text>
      <View style={styles.chips}>
        <FilterSelect
          title="Component affected"
          value={draft.componentId ?? ''}
          options={options}
          onChange={(id) => update({ componentId: id || undefined })}
          allValue=""
          placeholder="None"
        />
        {draft.type === 'repair' && draft.componentId && (
          <FilterChip
            label="Component replaced"
            selected={!!draft.componentReplaced}
            onPress={() => update({ componentReplaced: !draft.componentReplaced })}
          />
        )}
      </View>
    </>
  );
}
