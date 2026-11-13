import { MoreHorizontal, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { ActionSheet } from '@/components/ActionSheet/ActionSheet';
import { IconButton } from '@/components/Button/IconButton';
import { Pill } from '@/components/Pill/Pill';
import { Text } from '@/components/Text/Text';
import { toast } from '@/components/Toast/store';
import { errorMessage } from '@/lib/http';
import { fontFamily, makeStyles } from '@/theme';
import type { MachineModelSummary } from './libraryApi';

/** "Shared" (every organisation) or the owning organisation. */
export function OwnerBadge({ model }: { model: MachineModelSummary }) {
  return model.organisation ? (
    <Pill label={model.organisation.name} tone="neutral" />
  ) : (
    <Pill label="Shared" tone="brand" />
  );
}

export function ModelCard({
  model: m,
  onOpen,
  onDelete,
}: {
  model: MachineModelSummary;
  onOpen: () => void;
  onDelete: () => Promise<unknown>;
}) {
  const styles = useStyles();
  const [menu, setMenu] = useState(false);
  const confirmDelete = () =>
    Alert.alert(`Delete ${m.displayName}?`, 'Its systems and components go with it.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          void onDelete().then(
            () => toast.show(`${m.displayName} deleted.`),
            // 409: machines still use this model.
            (e) => toast.show(errorMessage(e)),
          ),
      },
    ]);

  return (
    <Pressable
      onPress={onOpen}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.75 }]}
      accessibilityRole="button"
      accessibilityLabel={`${m.displayName}, ${m.systemsCount} systems, ${m.assetsCount} assets`}
    >
      <View style={styles.row}>
        <Text style={styles.title} numberOfLines={1}>
          {m.displayName}
        </Text>
        <Pill label={`${m.systemsCount} systems`} tone="muted" />
        {m.isEditable && (
          <IconButton
            icon={MoreHorizontal}
            size={20}
            color="muted"
            accessibilityLabel={`More actions for ${m.displayName}`}
            onPress={() => setMenu(true)}
          />
        )}
      </View>
      <Text variant="caption" color="muted">
        {[`${m.assetsCount} assets`, m.category].filter(Boolean).join(' · ')}
      </Text>
      <View style={{ flexDirection: 'row' }}>
        <OwnerBadge model={m} />
      </View>
      <ActionSheet
        visible={menu}
        title={m.displayName}
        onClose={() => setMenu(false)}
        actions={[{ label: 'Delete', icon: Trash2, destructive: true, onPress: confirmDelete }]}
      />
    </Pressable>
  );
}

const useStyles = makeStyles((c) => ({
  card: {
    backgroundColor: c.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.border,
    paddingLeft: 14,
    paddingRight: 4,
    paddingVertical: 10,
    gap: 6,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44 },
  title: { flex: 1, fontFamily: fontFamily.semibold, fontSize: 16 },
}));
