import { View } from 'react-native';

import { Button } from '@/components/Button/Button';
import { Card } from '@/components/Card/Card';
import { Text } from '@/components/Text/Text';
import type { OutboxItem } from '@/offline/outbox';

const describe = (item: OutboxItem) => {
  if (item.kind === 'historyEntry') return `History entry · ${item.preview.title}`;
  if (item.kind === 'entryPhoto') return 'Photo for a history entry';
  return `Reply on case #${item.caseId}`;
};

/** Writes the API refused (400/403/404): retry once the problem is fixed, or discard. */
export function FailedUploads({
  items,
  onRetry,
  onDiscard,
}: {
  items: OutboxItem[];
  onRetry: (id: string) => void;
  onDiscard: (item: OutboxItem) => void;
}) {
  if (items.length === 0) return null;
  return (
    <>
      <Text variant="label" accessibilityRole="header">
        Couldn’t upload
      </Text>
      {items.map((item) => (
        <Card key={item.id}>
          <Text variant="bodyStrong">{describe(item)}</Text>
          <Text variant="caption" color="danger">
            {item.error}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <Button
              label="Retry"
              size="small"
              variant="secondary"
              onPress={() => onRetry(item.id)}
            />
            <Button label="Discard" size="small" variant="danger" onPress={() => onDiscard(item)} />
          </View>
        </Card>
      ))}
    </>
  );
}
