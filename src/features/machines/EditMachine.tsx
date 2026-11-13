import { Stack } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, DetailScreen, IconButton, Input, Segmented, Text } from '@/components';
import type { Machine, MachineStatus } from './data';
import { useEditMachineForm } from './useEditMachineForm';

const STATUSES: { value: MachineStatus; label: string }[] = [
  { value: 'ok', label: 'Running' },
  { value: 'down', label: 'Down' },
  { value: 'due', label: 'Service due' },
];

const row = { flexDirection: 'row', gap: 10 } as const;

/** Edit Plant ID, serial, site, hours and status. */
export function EditMachine({ machine }: { machine: Machine }) {
  const form = useEditMachineForm(machine);
  const locked = form.saving;
  // Hidden like on the detail card.
  const [serialHidden, setSerialHidden] = useState(true);

  return (
    <>
      <Stack.Screen
        options={{
          title: `Edit · ${machine.label}`,
          gestureEnabled: !locked,
          headerBackVisible: !locked,
        }}
      />
      <DetailScreen
        footer={
          <Button label="Save" onPress={form.save} loading={form.saving} disabled={!form.canSave} />
        }
      >
        <Input
          label="Plant ID / Asset number"
          value={form.plantId}
          onChangeText={form.setPlantId}
          placeholder="e.g. HT-2201"
          autoCapitalize="characters"
          maxLength={100}
          editable={!locked}
        />
        <Input
          label="Serial number"
          value={form.serial}
          onChangeText={form.setSerial}
          error={form.serialError}
          autoCapitalize="characters"
          maxLength={100}
          editable={!locked}
          secureTextEntry={serialHidden}
          autoCorrect={false}
          accessory={
            <IconButton
              icon={serialHidden ? Eye : EyeOff}
              size={20}
              color="muted"
              accessibilityLabel={serialHidden ? 'Show serial number' : 'Hide serial number'}
              onPress={() => setSerialHidden(!serialHidden)}
            />
          }
        />
        {form.needsReason && (
          <Input
            label="Reason for change"
            value={form.reason}
            onChangeText={form.setReason}
            placeholder="e.g. Typo when the machine was registered"
            hint="Required (3+ characters). Saved to the audit log."
            maxLength={500}
            editable={!locked}
          />
        )}
        <SiteHoursStatus form={form} />
      </DetailScreen>
    </>
  );
}

type Form = ReturnType<typeof useEditMachineForm>;

function SiteHoursStatus({ form }: { form: Form }) {
  const locked = form.saving;
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
