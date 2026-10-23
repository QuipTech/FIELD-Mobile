import { router } from 'expo-router';
import { useState } from 'react';

import { useAccess } from '@/auth/access';
import { Button, DetailScreen, ErrorState, Input, SkeletonList, toast } from '@/components';
import { FilterSelect } from '@/components/FilterChip/FilterChip';
import { useAddMachine, useMachineCatalog } from '@/features/machines/edit';
import { errorMessage } from '@/lib/http';

/** Register a machine in the fleet (needs `machine.manage`). */
export default function AddMachineRoute() {
  const catalog = useMachineCatalog();
  const add = useAddMachine();
  const defaultSite = useAccess((s) => s.profile?.site) ?? '';
  const [modelId, setModelId] = useState('');
  const [serial, setSerial] = useState('');
  const [asset, setAsset] = useState('');
  const [site, setSite] = useState(defaultSite);
  const [hours, setHours] = useState('');
  const parsedHours = hours.trim() ? Number(hours.replace(/[^\d.]/g, '')) : undefined;
  const ready = !!modelId && serial.trim().length > 0 && !Number.isNaN(parsedHours ?? 0);

  if (!catalog.data) {
    return (
      <DetailScreen>
        {catalog.isPending ? (
          <SkeletonList rows={3} />
        ) : (
          <ErrorState error={catalog.error} onRetry={() => catalog.refetch()} />
        )}
      </DetailScreen>
    );
  }

  const save = () =>
    add.mutate(
      {
        modelId,
        serialNumber: serial.trim(),
        ...(asset.trim() && { assetNumber: asset.trim() }),
        ...(site.trim() && { site: site.trim() }),
        ...(parsedHours !== undefined && { operatingHours: parsedHours }),
      },
      {
        onSuccess: (id) => {
          toast.show('Machine added.');
          router.replace({ pathname: '/machine/[id]', params: { id } });
        },
        onError: (e) => toast.show(errorMessage(e)),
      },
    );

  return (
    <DetailScreen
      footer={
        <Button label="Add machine" onPress={save} disabled={!ready} loading={add.isPending} />
      }
    >
      <FilterSelect
        title="Model"
        value={modelId}
        options={[{ value: '', label: 'Choose a model' }, ...catalog.data]}
        onChange={setModelId}
      />
      <Input
        label="Serial number"
        value={serial}
        onChangeText={setSerial}
        autoCapitalize="characters"
      />
      <Input
        label="Fleet / asset number"
        value={asset}
        onChangeText={setAsset}
        autoCapitalize="characters"
      />
      <Input label="Site" value={site} onChangeText={setSite} />
      <Input label="Hour meter" value={hours} onChangeText={setHours} keyboardType="numeric" />
    </DetailScreen>
  );
}
