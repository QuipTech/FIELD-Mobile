import { router } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/Button/Button';
import { DetailScreen } from '@/components/DetailScreen/DetailScreen';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { Input } from '@/components/Input/Input';
import { Skeleton } from '@/components/Skeleton/Skeleton';
import { Text } from '@/components/Text/Text';
import { toast } from '@/components/Toast/store';
import { ApiError, errorMessage } from '@/lib/http';
import { DeletionBlocked } from './DeletionBlocked';
import { useDeleteMachine, useDeletionCheck } from './lifecycleApi';
import { useLifecycleActions } from './LifecycleSheets';

/** Delete machine: runs the deletion check, then the step it allows (Portal: Delete machine). */
export function DeleteMachine({ machineId, label }: { machineId: string; label: string }) {
  const check = useDeletionCheck(machineId);
  const lifecycle = useLifecycleActions(machineId);
  const recheck = () => void check.refetch();
  const recheckFor = async () => (await check.refetch()).data;

  if (check.isPending) {
    return (
      <DetailScreen>
        <Skeleton height={120} />
      </DetailScreen>
    );
  }
  if (check.error && !check.data) {
    return (
      <DetailScreen>
        <ErrorState error={check.error} onRetry={recheck} retrying={check.isRefetching} />
      </DetailScreen>
    );
  }
  const data = check.data!;
  return (
    <>
      {data.canDelete ? (
        <ConfirmDelete machineId={machineId} label={label} onChanged={recheck} />
      ) : (
        <DetailScreen
          footer={
            <Button
              label="Check again"
              variant="secondary"
              onPress={recheck}
              loading={check.isRefetching}
            />
          }
        >
          <DeletionBlocked
            machineId={machineId}
            check={data}
            onRecheck={recheckFor}
            onDeactivate={() => lifecycle.run('deactivate')}
          />
        </DetailScreen>
      )}
      {lifecycle.sheets}
    </>
  );
}

function ConfirmDelete({
  machineId,
  label,
  onChanged,
}: {
  machineId: string;
  label: string;
  onChanged: () => void;
}) {
  const remove = useDeleteMachine(machineId);
  const [reason, setReason] = useState('');
  const trimmed = reason.trim();
  const valid = trimmed.length >= 3 && trimmed.length <= 500;

  const submit = () =>
    remove.mutate(trimmed, {
      onSuccess: () => {
        toast.show(`${label} deleted.`);
        router.dismissTo('/machines');
      },
      onError: (e) => {
        toast.show(errorMessage(e));
        // Something changed since the check (a case opened, an invoice…): check again.
        if (e instanceof ApiError && e.status === 409) onChanged();
      },
    });

  return (
    <DetailScreen
      footer={
        <Button
          label="Delete machine"
          variant="danger"
          onPress={submit}
          disabled={!valid}
          loading={remove.isPending}
        />
      }
    >
      <Text variant="section">Delete {label}?</Text>
      <Text color="muted">
        It’s removed from your fleet and Machines list. Billing is settled, so nothing more is
        charged for it.
      </Text>
      <Input
        label="Reason"
        value={reason}
        onChangeText={setReason}
        placeholder="e.g. Scrapped after rollover"
        hint="Required (3–500 characters). Saved to the audit log."
        maxLength={500}
        multiline
        editable={!remove.isPending}
      />
    </DetailScreen>
  );
}
