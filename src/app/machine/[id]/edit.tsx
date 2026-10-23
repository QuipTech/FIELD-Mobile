import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Chip, DetailScreen, Input, Text, toast } from '@/components';
import { MACHINE_STATUS, type Machine, type MachineStatus } from '@/features/machines/data';
import { useEditMachine } from '@/features/machines/edit';
import { MachineGate } from '@/features/machines/MachineGate';
import { errorMessage } from '@/lib/http';

export default function EditMachineRoute() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  return <MachineGate id={id}>{(machine) => <EditForm machine={machine} />}</MachineGate>;
}

function EditForm({ machine }: { machine: Machine }) {
  const edit = useEditMachine(machine.id);
  const [site, setSite] = useState(machine.site);
  const [hours, setHours] = useState(machine.hours?.toString() ?? '');
  const [status, setStatus] = useState<MachineStatus>(machine.status);
  const parsedHours = hours.trim() ? Number(hours.replace(/[^\d.]/g, '')) : undefined;
  const hoursInvalid = parsedHours !== undefined && !Number.isFinite(parsedHours);

  const save = () =>
    edit.mutate(
      {
        ...(site !== machine.site && { site }),
        ...(parsedHours !== undefined &&
          parsedHours !== machine.hours && { operatingHours: parsedHours }),
        ...(status !== machine.status && { status }),
      },
      {
        onSuccess: () => {
          toast.show('Machine updated.');
          router.back();
        },
        onError: (e) => toast.show(errorMessage(e)),
      },
    );

  return (
    <>
      <Stack.Screen options={{ title: `Edit · ${machine.label}` }} />
      <DetailScreen
        footer={
          <Button label="Save" onPress={save} loading={edit.isPending} disabled={hoursInvalid} />
        }
      >
        <Input label="Site" value={site} onChangeText={setSite} placeholder="e.g. Pit 4" />
        <Input
          label="Hour meter"
          value={hours}
          onChangeText={setHours}
          keyboardType="numeric"
          error={hoursInvalid ? 'Enter a number of hours' : undefined}
        />
        <Text variant="label">Status</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(Object.keys(MACHINE_STATUS) as MachineStatus[]).map((s) => (
            <Chip
              key={s}
              label={MACHINE_STATUS[s].label}
              selected={status === s}
              onPress={() => setStatus(s)}
            />
          ))}
        </View>
      </DetailScreen>
    </>
  );
}
