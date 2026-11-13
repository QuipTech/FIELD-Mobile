import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { BackHandler } from 'react-native';

import { useAccess } from '@/auth/access';
import { toast } from '@/components';
import { ApiError, errorMessage } from '@/lib/http';
import type { MachineStatus } from './data';
import { useAddMachine } from './edit';

export const MAX_HOURS = 1_000_000;
const DUPLICATE_SERIAL =
  'A machine with this serial number is already registered in your organisation.';
/** Same code as billing/planErrors (not imported: that module pulls in the auth stack). */
const FEATURE_NOT_IN_PLAN = 'feature_not_in_plan';
const SAVE_FAILED = "Couldn't add the machine. Please try again.";

/**
 * State, validation and saving for Add machine (`POST /machines`). Whatever the user typed is
 * kept when saving fails; the screen can't be dismissed while the request is in flight.
 */
export function useAddMachineForm() {
  const add = useAddMachine();
  const defaultSite = useAccess((s) => s.profile?.site) ?? '';
  const [makeId, setMakeIdRaw] = useState('');
  const [modelId, setModelId] = useState('');
  const [serial, setSerialRaw] = useState('');
  const [serialError, setSerialError] = useState<string>();
  const [asset, setAsset] = useState('');
  const [site, setSite] = useState(defaultSite);
  const [hours, setHours] = useState('');
  const [status, setStatus] = useState<MachineStatus>('ok');

  const h = hours.trim();
  const hoursError =
    h === ''
      ? undefined
      : !/^\d+$/.test(h)
        ? 'Whole number'
        : Number(h) > MAX_HOURS
          ? 'Max 1,000,000'
          : undefined;
  const ready = !!modelId && serial.trim().length > 0 && !hoursError;
  const saving = add.isPending;

  // Android back while saving would drop the request's result on the floor.
  useEffect(() => {
    if (!saving) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, [saving]);

  const onError = (e: unknown) => {
    if (e instanceof ApiError && e.status === 409) return setSerialError(DUPLICATE_SERIAL);
    // The plan prompt (startPlanErrorPrompts) already shows the server's message.
    if (e instanceof ApiError && e.code === FEATURE_NOT_IN_PLAN) return;
    toast.show(
      (e instanceof ApiError && e.status === 400 && e.message) || errorMessage(e) || SAVE_FAILED,
    );
  };

  const save = () =>
    add.mutate(
      {
        modelId,
        serialNumber: serial.trim(),
        ...(asset.trim() && { assetNumber: asset.trim() }),
        ...(site.trim() && { site: site.trim() }),
        ...(h && { operatingHours: Number(h) }),
        status,
      },
      {
        onSuccess: () => {
          toast.show('Machine added.');
          router.back();
        },
        onError,
      },
    );

  return {
    makeId,
    setMakeId: (id: string) => {
      setMakeIdRaw(id);
      setModelId('');
    },
    modelId,
    setModelId,
    serial,
    setSerial: (v: string) => {
      setSerialRaw(v);
      setSerialError(undefined);
    },
    serialError,
    asset,
    setAsset,
    site,
    setSite,
    hours,
    setHours,
    hoursError,
    status,
    setStatus,
    ready,
    saving,
    save,
  };
}
