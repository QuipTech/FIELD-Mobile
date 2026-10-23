import { CloudCheck, CloudOff, RefreshCw, Trash2 } from 'lucide-react-native';
import { View } from 'react-native';

import { Button } from '@/components/Button/Button';
import { Card } from '@/components/Card/Card';
import { Meter } from '@/components/Meter/Meter';
import { Text } from '@/components/Text/Text';
import { DocRow } from '@/features/knowledge/DocRow';
import { totalSizeMb } from '@/features/knowledge/offlineStore';
import { RowCard, SectionHeader } from '@/features/knowledge/Parts';
import type { KnowledgeDoc } from '@/features/knowledge/types';
import { formatRelative } from '@/lib/date';
import { makeStyles, spacing, useTheme } from '@/theme';

/** Space set aside for offline documents on the device. */
export const STORAGE_LIMIT_MB = 4096;

export type OfflineSyncProps = {
  offline: boolean;
  savedDocs: KnowledgeDoc[];
  /** Writes waiting to upload (history entries, photos, case replies). */
  pending: number;
  lastSyncedAt?: number;
  syncing: boolean;
  onSync: () => void;
  onClear: () => void;
  onOpenDoc: (id: string) => void;
};

/** P3 Offline & sync: readiness, queued uploads, saved documents and storage. */
export function OfflineSync(props: OfflineSyncProps) {
  const { offline, savedDocs, pending } = props;
  const styles = useStyles();
  const { colors } = useTheme();
  const used = totalSizeMb(savedDocs);
  const tone = offline ? 'warning' : 'success';
  const Icon = offline ? CloudOff : CloudCheck;
  return (
    <>
      <Card>
        <View style={styles.status}>
          <Icon size={20} color={colors[tone]} strokeWidth={1.8} />
          <Text variant="bodyStrong" color={tone}>
            {offline
              ? 'You’re offline'
              : pending
                ? `${pending} waiting to upload`
                : 'Ready to work offline'}
          </Text>
        </View>
        <Text variant="caption" color="muted">
          {offline
            ? 'Changes are saved on this device and upload when you reconnect.'
            : `Machines, history and ${savedDocs.length} saved document${savedDocs.length === 1 ? '' : 's'} are on this device.`}
          {props.lastSyncedAt ? ` Last synced ${formatRelative(props.lastSyncedAt)}.` : ''}
        </Text>
      </Card>

      <View style={styles.section}>
        <SectionHeader title="Saved documents" right={`${used} MB`} />
        {savedDocs.length === 0 ? (
          <Text color="muted">
            Open a document and turn on “Available offline” to keep it here.
          </Text>
        ) : (
          <RowCard>
            {savedDocs.map((d, i) => (
              <DocRow
                key={d.id}
                doc={d}
                offline
                last={i === savedDocs.length - 1}
                onPress={() => props.onOpenDoc(d.id)}
              />
            ))}
          </RowCard>
        )}
      </View>

      <Card>
        <Meter
          value={used}
          max={STORAGE_LIMIT_MB}
          label="Storage"
          caption={`${(used / 1024).toFixed(1)} of ${STORAGE_LIMIT_MB / 1024} GB`}
        />
      </Card>

      <Button
        label={props.syncing ? 'Syncing…' : 'Sync now'}
        icon={RefreshCw}
        loading={props.syncing}
        disabled={offline}
        onPress={props.onSync}
      />
      <Button
        label="Clear saved data"
        icon={Trash2}
        variant="secondary"
        disabled={!savedDocs.length}
        onPress={props.onClear}
      />
    </>
  );
}

const useStyles = makeStyles(() => ({
  status: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  section: { gap: spacing.tight },
}));
