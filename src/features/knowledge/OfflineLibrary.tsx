import { Download } from 'lucide-react-native';
import { View } from 'react-native';

import { EmptyState } from '@/components/EmptyState/EmptyState';
import { OfflineNotice } from '@/components/ErrorState/OfflineNotice';
import { Screen } from '@/components/Screen/Screen';
import { Text } from '@/components/Text/Text';
import { spacing } from '@/theme';
import { DocRow } from './DocRow';
import { totalSizeMb } from './offlineStore';
import { RowCard, SectionHeader } from './Parts';
import type { KnowledgeDoc } from './types';

const plural = (n: number) => `${n} document${n === 1 ? '' : 's'}`;

/** K7c: no connection, so Knowledge lists only the documents saved on this device. */
export function OfflineLibrary({
  docs,
  onRetry,
  onOpenDoc,
}: {
  docs: KnowledgeDoc[];
  onRetry: () => void;
  onOpenDoc: (id: string) => void;
}) {
  return (
    <Screen>
      <OfflineNotice message="Showing documents saved on this device" onRetry={onRetry} />
      {docs.length === 0 ? (
        <EmptyState
          icon={Download}
          title="Nothing saved offline"
          message="Open a document and turn on “Available offline” to read it without signal."
        />
      ) : (
        <View style={{ gap: spacing.tight }}>
          <SectionHeader
            title="Saved offline"
            right={`${plural(docs.length)} · ${totalSizeMb(docs)} MB`}
          />
          <RowCard>
            {docs.map((d, i) => (
              <DocRow
                key={d.id}
                doc={d}
                offline
                last={i === docs.length - 1}
                onPress={() => onOpenDoc(d.id)}
              />
            ))}
          </RowCard>
        </View>
      )}
      <Text variant="caption" color="muted">
        Ask AI and full search come back when you reconnect.
      </Text>
    </Screen>
  );
}
