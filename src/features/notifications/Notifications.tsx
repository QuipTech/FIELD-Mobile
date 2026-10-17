import { BellOff } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { BrandButton } from '@/components/BrandButton/BrandButton';
import { DetailScreen } from '@/components/DetailScreen/DetailScreen';
import { EmptyPanel } from '@/components/EmptyPanel/EmptyPanel';
import { Text } from '@/components/Text/Text';
import { formatRelative } from '@/lib/date';
import { MachineCard } from '@/features/machines/MachineParts';
import { KIND_STYLE, type AppNotification } from './data';
import { styles } from './styles';

function KindIcon({ kind }: { kind: AppNotification['kind'] }) {
  const { icon: Icon, fg, bg } = KIND_STYLE[kind];
  return (
    <View style={[styles.icon, { backgroundColor: bg }]}>
      <Icon size={18} color={fg} strokeWidth={2} />
    </View>
  );
}

export type NotificationsListProps = {
  items: AppNotification[];
  onOpen: (id: string) => void;
};

/** M12 Notifications: newest first, unread marked with a violet dot. */
export function NotificationsList({ items, onOpen }: NotificationsListProps) {
  if (items.length === 0) {
    return (
      <DetailScreen>
        <EmptyPanel
          icon={BellOff}
          title="You're all caught up"
          message="Machine alerts, case replies and manual updates will show up here."
        />
      </DetailScreen>
    );
  }
  return (
    <DetailScreen>
      <View style={styles.list}>
        {items.map((n, i) => {
          const when = formatRelative(n.at);
          return (
            <Pressable
              key={n.id}
              onPress={() => onOpen(n.id)}
              style={({ pressed }) => [
                styles.row,
                i > 0 && styles.rowDivider,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${n.unread ? 'Unread. ' : ''}${n.title}. ${n.summary}, ${when}`}
            >
              <KindIcon kind={n.kind} />
              <View style={styles.rowText}>
                <Text style={styles.title}>{n.title}</Text>
                <Text variant="caption" color="inkMuted">
                  {n.summary} · {when}
                </Text>
              </View>
              {n.unread && <View style={styles.unreadDot} />}
            </Pressable>
          );
        })}
      </View>
    </DetailScreen>
  );
}

export type NotificationDetailProps = {
  item: AppNotification;
  onOpenCase: (caseId: string) => void;
  onViewMachine: (machineId: string) => void;
};

/** M13 Notification detail, with shortcuts to the case and machine it's about. */
export function NotificationDetail({ item, onOpenCase, onViewMachine }: NotificationDetailProps) {
  const { caseId, machine } = item;
  const footer =
    caseId || machine ? (
      <View style={styles.actions}>
        {caseId && (
          <BrandButton
            label={`Open case #${caseId}`}
            onPress={() => onOpenCase(caseId)}
            style={styles.action}
          />
        )}
        {machine && (
          <BrandButton
            variant="outline"
            label="View machine"
            onPress={() => onViewMachine(machine.id)}
            style={styles.action}
          />
        )}
      </View>
    ) : undefined;

  return (
    <DetailScreen footer={footer}>
      <View style={styles.head}>
        <KindIcon kind={item.kind} />
        <View style={styles.headText}>
          <Text style={styles.detailTitle} accessibilityRole="header">
            {item.title}
          </Text>
          <Text variant="caption" color="inkMuted">
            {formatRelative(item.at)}
          </Text>
        </View>
      </View>
      <Text color="inkMuted" style={styles.body}>
        {item.body}
      </Text>
      {machine && <MachineCard machine={machine} onPress={() => onViewMachine(machine.id)} />}
    </DetailScreen>
  );
}
