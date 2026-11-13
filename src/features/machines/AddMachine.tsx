import { Stack } from 'expo-router';
import { View } from 'react-native';

import {
  Button,
  DetailScreen,
  ErrorState,
  Input,
  Segmented,
  SelectField,
  Text,
} from '@/components';
import type { MachineStatus } from './data';
import { useMachineCatalog, type CatalogMake } from './edit';
import { useAddMachineForm } from './useAddMachineForm';

const STATUSES: { value: MachineStatus; label: string }[] = [
  { value: 'ok', label: 'Running' },
  { value: 'down', label: 'Down' },
  { value: 'due', label: 'Service due' },
];

const row = { flexDirection: 'row', gap: 10 } as const;

/** Register a machine in the fleet (`machine.create`); same fields and rules as the web portal. */
export function AddMachine() {
  const catalog = useMachineCatalog();
  const form = useAddMachineForm();

  if (catalog.error && !catalog.data) {
    return (
      <DetailScreen>
        <ErrorState
          error={catalog.error}
          title="Couldn't load the Machine library."
          onRetry={() => catalog.refetch()}
          retrying={catalog.isRefetching}
        />
      </DetailScreen>
    );
  }

  const makes = catalog.data ?? [];
  const loading = catalog.isPending;
  const empty = !loading && makes.length === 0;
  const locked = empty || form.saving;

  return (
    <DetailScreen
      footer={
        <Button
          label="Add machine"
          onPress={form.save}
          disabled={!form.ready || empty}
          loading={form.saving}
        />
      }
    >
      {/* No swipe or header back while saving. */}
      <Stack.Screen options={{ gestureEnabled: !form.saving, headerBackVisible: !form.saving }} />
      {empty && (
        <Text variant="caption" color="warning">
          The Machine library has no models yet. Ask your QuipTech admin to add yours, then register
          the machine here.
        </Text>
      )}
      <MakeModel makes={makes} loading={loading} locked={locked} form={form} />
      <Input
        label="Serial number"
        value={form.serial}
        onChangeText={form.setSerial}
        error={form.serialError}
        autoCapitalize="characters"
        maxLength={100}
        editable={!locked}
      />
      <Input
        label="Plant ID / Asset number"
        value={form.asset}
        onChangeText={form.setAsset}
        placeholder="e.g. HT-2201"
        autoCapitalize="characters"
        maxLength={100}
        editable={!locked}
      />
      <SiteHoursStatus form={form} locked={locked} />
    </DetailScreen>
  );
}

type Form = ReturnType<typeof useAddMachineForm>;

/** Make first, then that make's models (there's no separate models endpoint). */
function MakeModel({
  makes,
  loading,
  locked,
  form,
}: {
  makes: CatalogMake[];
  loading: boolean;
  locked: boolean;
  form: Form;
}) {
  const models = makes.find((m) => m.id === form.makeId)?.models ?? [];
  return (
    <View style={row}>
      <View style={{ flex: 1 }}>
        <SelectField
          label="Make"
          placeholder={loading ? 'Loading…' : 'Choose a make'}
          value={form.makeId}
          options={makes.map((m) => ({ value: m.id, label: m.name }))}
          onChange={form.setMakeId}
          disabled={loading || locked}
        />
      </View>
      <View style={{ flex: 1 }}>
        <SelectField
          label="Model"
          placeholder={loading ? 'Loading…' : 'Choose a model'}
          value={form.modelId}
          options={models}
          onChange={form.setModelId}
          disabled={!form.makeId || locked}
        />
      </View>
    </View>
  );
}

function SiteHoursStatus({ form, locked }: { form: Form; locked: boolean }) {
  return (
    <>
      <View style={row}>
        <View style={{ flex: 1.4 }}>
          <Input
            label="Site"
            value={form.site}
            onChangeText={form.setSite}
            placeholder="e.g. Pit 4"
            maxLength={100}
            editable={!locked}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Input
            label="Hours"
            value={form.hours}
            onChangeText={form.setHours}
            placeholder="0"
            keyboardType="number-pad"
            error={form.hoursError}
            editable={!locked}
          />
        </View>
      </View>
      <View style={{ gap: 6 }} pointerEvents={locked ? 'none' : 'auto'}>
        <Text variant="label" color="muted">
          Status
        </Text>
        <Segmented
          options={STATUSES}
          value={form.status}
          onChange={form.setStatus}
          accessibilityLabel="Status"
        />
      </View>
    </>
  );
}
