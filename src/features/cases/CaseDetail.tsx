import { ChevronRight, Image as ImageIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { DetailScreen } from '@/components/DetailScreen/DetailScreen';
import { Text } from '@/components/Text/Text';
import { formatRelative } from '@/lib/date';
import { MachineIcon } from '@/features/machines/MachineParts';
import { colors } from '@/theme';
import { ActivityList } from './CaseActivity';
import { visibleActivity, type SupportCase } from './data';
import { ReplyBox } from './ReplyBox';
import { styles } from './styles';

export type CaseDetailProps = {
  supportCase: SupportCase;
  /** Signed-in user's initials, for activity they wrote. */
  myInitials: string;
  /** Header height, so the reply box rides above the keyboard. */
  keyboardOffset?: number;
  /** Admins see internal notes and can write them; customers never see them. */
  isAdmin?: boolean;
  onReply: (text: string) => Promise<void> | void;
  /** Admin only: writes a staff-only note instead of a reply. */
  onInternalNote?: (text: string) => Promise<void> | void;
  onOpenAttachment: (id: string) => void;
  onOpenMachine: (id: string) => void;
};

/** M11.5 Case detail: the report, its photos, the activity log and a reply box. */
export function CaseDetail({
  supportCase: c,
  myInitials,
  keyboardOffset,
  isAdmin = false,
  ...props
}: CaseDetailProps) {
  const activity = visibleActivity(c.activity, isAdmin);
  const m = c.machine;
  return (
    <DetailScreen
      keyboardOffset={keyboardOffset}
      footer={
        <ReplyBox
          onSend={props.onReply}
          onNote={isAdmin ? props.onInternalNote : undefined}
          canNote={isAdmin}
        />
      }
    >
      {m ? (
        <Pressable
          onPress={() => props.onOpenMachine(m.id)}
          style={({ pressed }) => [styles.machineRow, pressed && styles.pressed]}
          accessibilityRole="link"
          accessibilityLabel={`${m.label} · ${m.model}. View machine`}
        >
          <MachineIcon status={m.status} />
          <View style={styles.machineText}>
            <Text style={styles.machineName}>
              {m.label} · {m.model}
            </Text>
            <Text variant="caption" color="inkMuted">
              Opened {formatRelative(c.openedAt)} by {c.openedBy}
            </Text>
          </View>
          <ChevronRight size={18} color={colors.inkSubtle} strokeWidth={2} />
        </Pressable>
      ) : (
        <Text variant="caption" color="inkMuted">
          Opened {formatRelative(c.openedAt)} by {c.openedBy}
        </Text>
      )}

      <Text style={styles.caseTitle} accessibilityRole="header">
        {c.title}
      </Text>
      <Text color="inkMuted" style={styles.paragraph}>
        {c.description}
      </Text>

      {c.attachments.length > 0 && (
        <View style={styles.attachments}>
          {c.attachments.map((a) => (
            <Pressable
              key={a.id}
              onPress={() => props.onOpenAttachment(a.id)}
              style={({ pressed }) => [styles.attachment, pressed && styles.pressed]}
              accessibilityRole="imagebutton"
              accessibilityLabel={`Photo: ${a.name}`}
            >
              <ImageIcon size={18} color={colors.inkMuted} strokeWidth={2} />
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.hairline} />
      <ActivityList activity={activity} myInitials={myInitials} />
    </DetailScreen>
  );
}
