import { router } from 'expo-router';
import { useState } from 'react';

import { toast } from '@/components/Toast/store';
import { ApiError, errorMessage } from '@/lib/http';
import type { Machine, MachineStatus } from './data';
import { useEditMachine, type MachineEdit } from './edit';
import { MAX_HOURS } from './useAddMachineForm';

const DUPLICATE_SERIAL =
  'A machine with this serial number is already registered in your organisation.';

/** State, validation and saving for Edit machine; mirrors the portal's rules. */
export function useEditMachineForm(machine: Machine) {
  const edit = useEditMachine(machine.id);
  const [plantId, setPlantId] = useState(machine.plantId ?? '');
  const [serial, setSerialRaw] = useState(machine.serial);
  const [serialError, setSerialError] = useState<string>();
  const [reason, setReason] = useState('');
  const [site, setSite] = useState(machine.site);
  const [hours, setHours] = useState(machine.hours?.toString() ?? '');
  const [status, setStatus] = useState<MachineStatus>(machine.status);

  const h = hours.trim();
  const hoursError =
    h === ''
      ? undefined
      : !/^\d+$/.test(h)
        ? 'Whole number'
        : Number(h) > MAX_HOURS
          ? 'Max 1,000,000'
          : undefined;
  const plantChanged = plantId.trim() !== (machine.plantId ?? '');
  const serialChanged = serial.trim() !== machine.serial;
  const serialEmpty = serial.trim() === '';
  const needsReason = plantChanged || serialChanged;
  const reasonOk = !needsReason || reason.trim().length >= 3;

  const changes: MachineEdit = {
    ...(plantChanged && { plantId }),
    ...(serialChanged && { serialNumber: serial }),
    ...(needsReason && { reason: reason.trim() }),
    ...(site.trim() !== machine.site && { site }),
    ...(h && Number(h) !== machine.hours && { operatingHours: Number(h) }),
    ...(status !== machine.status && { status }),
  };
  const dirty = Object.keys(changes).length > 0;

  const save = () =>
    edit.mutate(changes, {
      onSuccess: () => {
        toast.show('Machine updated.');
        router.back();
      },
      onError: (e) => {
        if (e instanceof ApiError && e.status === 409) return setSerialError(DUPLICATE_SERIAL);
        toast.show(errorMessage(e) || "Couldn't save the machine. Please try again.");
      },
    });

  return {
    plantId,
    setPlantId,
    serial,
    setSerial: (v: string) => {
      setSerialRaw(v);
      setSerialError(undefined);
    },
    serialError: serialError ?? (serialEmpty ? 'Serial number is required' : undefined),
    reason,
    setReason,
    needsReason,
    site,
    setSite,
    hours,
    setHours,
    hoursError,
    status,
    setStatus,
    canSave: dirty && !hoursError && !serialEmpty && reasonOk,
    saving: edit.isPending,
    save,
  };
}
