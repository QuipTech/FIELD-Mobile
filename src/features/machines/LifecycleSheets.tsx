import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Button } from '@/components/Button/Button';
import { Input } from '@/components/Input/Input';
import { ModalSheet } from '@/components/ModalSheet/ModalSheet';
import { Text } from '@/components/Text/Text';
import { toast } from '@/components/Toast/store';
import { formatBillingDay, formatCents } from '@/features/billing/format';
import { ApiError, errorMessage } from '@/lib/http';
import {
  useActivationQuote,
  useLifecycleAction,
  type ActivationQuote,
  type LifecycleAction,
} from './lifecycleApi';

const COPY: Record<
  Exclude<LifecycleAction, 'activate'>,
  { title: string; body: string; confirm: string; done: string; danger?: boolean }
> = {
  deactivate: {
    title: 'Deactivate this machine?',
    body: "Billing stops; history stays but full features are hidden until it's activated again.",
    confirm: 'Deactivate',
    done: 'Machine deactivated.',
    danger: true,
  },
  archive: {
    title: 'Archive this machine?',
    body: 'It leaves your active fleet and is no longer billed. Its records are kept.',
    confirm: 'Archive',
    done: 'Machine archived.',
    danger: true,
  },
  reactivate: {
    title: 'Reactivate this machine?',
    body: 'It comes back to your fleet. Activate it again for full features.',
    confirm: 'Reactivate',
    done: 'Machine reactivated.',
  },
  sell: {
    title: 'Mark as sold?',
    body: 'It leaves your fleet and is no longer billed. Its records stay read-only.',
    confirm: 'Mark as sold',
    done: 'Machine marked as sold.',
    danger: true,
  },
};

function QuoteText({ quote }: { quote: ActivationQuote }) {
  if (quote.pricing === 'contract') {
    return <Text>Covered by your contract; invoiced {formatBillingDay(quote.invoicedOn)}.</Text>;
  }
  return (
    <View style={{ gap: 6 }}>
      <Text>
        Active machines: {quote.activeToday} → {quote.machinesAfter}
      </Text>
      <Text>
        Monthly estimate: {formatCents(quote.monthlyBeforeCents)} →{' '}
        {formatCents(quote.monthlyAfterCents)}
      </Text>
      <Text color="muted">Invoiced on {formatBillingDay(quote.invoicedOn)}. Amounts ex GST.</Text>
    </View>
  );
}

function ActivateSheet(props: {
  visible: boolean;
  busy: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const quote = useActivationQuote(props.visible);
  return (
    <ModalSheet
      visible={props.visible}
      title="Activate this machine?"
      onClose={props.onClose}
      busy={props.busy}
      footer={
        <Button
          label="Activate"
          onPress={props.onConfirm}
          loading={props.busy}
          disabled={!quote.data}
        />
      }
    >
      <Text color="muted">
        Active machines are billed and get full history, configuration, photos and AI. Nothing is
        charged now.
      </Text>
      {quote.data ? (
        <QuoteText quote={quote.data} />
      ) : quote.error ? (
        <Text color="danger">{errorMessage(quote.error)}</Text>
      ) : (
        <ActivityIndicator />
      )}
    </ModalSheet>
  );
}

/**
 * Lifecycle buttons' confirmations: Activate shows the price impact first, the others ask for an
 * optional reason. `run(action)` opens the right sheet; render `sheets` once in the screen.
 */
export function useLifecycleActions(machineId: string) {
  const [open, setOpen] = useState<LifecycleAction | null>(null);
  const [reason, setReason] = useState('');
  const change = useLifecycleAction(machineId);
  const close = () => setOpen(null);

  const submit = (action: LifecycleAction, done: string) =>
    change.mutate(
      { action, ...(action !== 'activate' && { reason }) },
      {
        onSuccess: (res) => {
          close();
          setReason('');
          toast.show(
            res?.enterpriseReviewRaised ? `${done} Our team will review your contract.` : done,
          );
        },
        onError: (e) => {
          // 409: the state changed elsewhere; the lifecycle reloads either way.
          if (e instanceof ApiError && e.status === 409) close();
          toast.show(errorMessage(e));
        },
      },
    );

  const copy = open && open !== 'activate' ? COPY[open] : undefined;
  const busy = change.isPending;

  const sheets = (
    <>
      <ActivateSheet
        visible={open === 'activate'}
        busy={busy}
        onClose={close}
        onConfirm={() => submit('activate', 'Machine activated.')}
      />
      <ModalSheet
        visible={!!copy}
        title={copy?.title ?? ''}
        onClose={close}
        busy={busy}
        footer={
          copy && (
            <Button
              label={copy.confirm}
              variant={copy.danger ? 'danger' : 'primary'}
              onPress={() => submit(open!, copy.done)}
              loading={busy}
            />
          )
        }
      >
        <Text color="muted">{copy?.body}</Text>
        <Input
          label="Reason (optional)"
          value={reason}
          onChangeText={setReason}
          maxLength={500}
          multiline
          editable={!busy}
        />
      </ModalSheet>
    </>
  );

  return { run: setOpen, sheets, busy };
}
