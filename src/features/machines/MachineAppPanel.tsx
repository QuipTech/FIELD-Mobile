import { useIsFocused } from 'expo-router';
import { CheckCircle2, Tablet } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';

import { Button } from '@/components/Button/Button';
import { Card } from '@/components/Card/Card';
import { Skeleton } from '@/components/Skeleton/Skeleton';
import { Text } from '@/components/Text/Text';
import { toast } from '@/components/Toast/store';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { formatDateTime } from '@/lib/date';
import { errorMessage } from '@/lib/http';
import { colors, fontFamily } from '@/theme';
import {
  formatCountdown,
  formatPairingCode,
  useAppConnection,
  useDisconnectApp,
  useGeneratePairingCode,
  type AppConnection,
} from './appConnectionApi';

/** Re-renders every second for the countdown. */
function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [active]);
  return now;
}

type Code = { code: string; expiresAt: number };

/** Machine app tab: the paired tablet, or a pairing code for a new one (`machine.manage`). */
export function MachineAppPanel({
  machineId,
  canManage,
}: {
  machineId: string;
  canManage: boolean;
}) {
  const focused = useIsFocused();
  const [code, setCode] = useState<Code>();
  const now = useNow(!!code);
  const live = !!code && code.expiresAt > now;
  // Poll only while a live code is on screen and this screen is in front.
  const connection = useAppConnection(machineId, live && focused);
  const disconnect = useDisconnectApp(machineId);
  const connected = connection.data?.connected;
  // A code was showing and the tablet used it.
  useEffect(() => {
    if (connected && code) toast.show('Tablet connected.');
  }, [connected, code]);

  const confirmDisconnect = () =>
    Alert.alert(
      'Disconnect the tablet?',
      'It stops syncing with this machine until paired again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () =>
            disconnect.mutate(undefined, {
              onSuccess: () => {
                setCode(undefined);
                toast.show('Tablet disconnected.');
              },
              onError: (e) => toast.show(errorMessage(e)),
            }),
        },
      ],
    );

  if (connection.isPending) return <Skeleton height={120} />;
  if (connection.error && !connection.data) {
    return (
      <ErrorState
        error={connection.error}
        onRetry={() => void connection.refetch()}
        retrying={connection.isRefetching}
      />
    );
  }
  if (connected) {
    return (
      <Connected
        info={connection.data!}
        onDisconnect={canManage ? confirmDisconnect : undefined}
        busy={disconnect.isPending}
      />
    );
  }
  return (
    <PairingCard
      machineId={machineId}
      canManage={canManage}
      code={code}
      onCode={setCode}
      now={now}
    />
  );
}

function PairingCard(props: {
  machineId: string;
  canManage: boolean;
  code?: Code;
  onCode: (code?: Code) => void;
  now: number;
}) {
  const { code, now } = props;
  const generate = useGeneratePairingCode(props.machineId);
  const live = !!code && code.expiresAt > now;
  const newCode = () =>
    generate.mutate(undefined, {
      onSuccess: (res) => {
        // connected: a tablet is already paired; the connection reloads.
        if (res.connected || !res.code || !res.expiresAt) return props.onCode(undefined);
        props.onCode({ code: res.code, expiresAt: Date.parse(res.expiresAt) });
      },
      onError: (e) => toast.show(errorMessage(e)),
    });
  return (
    <Card style={{ gap: 12, alignItems: 'center' }}>
      <Tablet size={28} color={colors.brand} strokeWidth={1.8} />
      <Text style={{ fontFamily: fontFamily.medium }}>No tablet connected</Text>
      <Text variant="caption" color="muted" style={{ textAlign: 'center' }}>
        Open the FIELD machine app on the tablet and enter the pairing code.
      </Text>
      {code && (
        <>
          <Text
            style={{ fontFamily: fontFamily.semibold, fontSize: 40, letterSpacing: 4 }}
            accessibilityLabel={`Pairing code ${code.code.split('').join(' ')}`}
            selectable
          >
            {formatPairingCode(code.code)}
          </Text>
          <Text variant="caption" color={live ? 'muted' : 'danger'}>
            {live
              ? `Expires in ${formatCountdown(code.expiresAt - now)}`
              : 'This code has expired.'}
          </Text>
        </>
      )}
      {props.canManage && !live && (
        <Button
          label={code ? 'New code' : 'Generate pairing code'}
          onPress={newCode}
          loading={generate.isPending}
        />
      )}
    </Card>
  );
}

function Connected(props: { info: AppConnection; onDisconnect?: () => void; busy: boolean }) {
  const d = props.info.device;
  const rows = [
    ['Serial', d?.serialNumber],
    ['Platform', d?.platform],
    ['App version', d?.appVersion],
    ['Paired', d?.pairedAt ? formatDateTime(d.pairedAt) : null],
  ] as const;
  return (
    <Card style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <CheckCircle2 size={20} color={colors.success} strokeWidth={2} />
        <Text style={{ fontFamily: fontFamily.medium }}>Tablet connected</Text>
      </View>
      {rows.map(([label, value]) => (
        <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text color="muted">{label}</Text>
          <Text>{value || '—'}</Text>
        </View>
      ))}
      {props.onDisconnect && (
        <Button
          label="Disconnect"
          variant="danger"
          size="small"
          onPress={props.onDisconnect}
          loading={props.busy}
        />
      )}
    </Card>
  );
}
