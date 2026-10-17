import { ChevronRight, Image as ImageIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { BrandButton } from '@/components/BrandButton/BrandButton';
import { DetailScreen } from '@/components/DetailScreen/DetailScreen';
import { Text } from '@/components/Text/Text';
import { formatRelative } from '@/lib/date';
import { MachineIcon } from '@/features/machines/MachineParts';
import { colors, layout } from '@/theme';
import type { CaseActivity, SupportCase } from './data';
import { styles } from './styles';

export type CaseDetailProps = {
  supportCase: SupportCase;
  /** Signed-in user's initials, for activity they wrote. */
  myInitials: string;
  /** Header height, so the reply box rides above the keyboard. */
  keyboardOffset?: number;
  onReply: (text: string) => Promise<void> | void;
  onOpenAttachment: (id: string) => void;
  onOpenMachine: (id: string) => void;
};

/** M11.5 Case detail: the report, its photos, the activity log and a reply box. */
export function CaseDetail({
  supportCase: c,
  myInitials,
  keyboardOffset,
  ...props
}: CaseDetailProps) {
  return (
    <DetailScreen keyboardOffset={keyboardOffset} footer={<ReplyBox onSend={props.onReply} />}>
      <Pressable
        onPress={() => props.onOpenMachine(c.machine.id)}
        style={({ pressed }) => [styles.machineRow, pressed && styles.pressed]}
        accessibilityRole="link"
        accessibilityLabel={`${c.machine.id} · ${c.machine.model}. View machine`}
      >
        <MachineIcon status={c.machine.status} />
        <View style={styles.machineText}>
          <Text style={styles.machineName}>
            {c.machine.id} · {c.machine.model}
          </Text>
          <Text variant="caption" color="inkMuted">
            Opened {formatRelative(c.openedAt)} by {c.openedBy}
          </Text>
        </View>
        <ChevronRight size={18} color={colors.inkSubtle} strokeWidth={2} />
      </Pressable>

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
      <Text style={styles.sectionTitle} accessibilityRole="header">
        Activity
      </Text>
      {c.activity.length === 0 && (
        <Text variant="caption" color="inkMuted">
          No replies yet.
        </Text>
      )}
      {c.activity.map((item, i) => (
        <ActivityItem key={item.id} item={item} myInitials={myInitials} divider={i > 0} />
      ))}
    </DetailScreen>
  );
}

function ActivityItem({
  item,
  myInitials,
  divider,
}: {
  item: CaseActivity;
  myInitials: string;
  divider: boolean;
}) {
  const when = formatRelative(item.at);
  return (
    <View
      style={[styles.activity, divider && styles.activityDivider]}
      accessible
      accessibilityLabel={`${item.author}, ${when}: ${item.body}`}
    >
      <View style={styles.activityHead}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.mine ? myInitials : item.initials}</Text>
        </View>
        <Text style={styles.author}>{item.author}</Text>
        <Text variant="caption" color="inkSubtle">
          {when}
        </Text>
      </View>
      <Text variant="caption" color="inkMuted">
        {item.body}
      </Text>
    </View>
  );
}

function ReplyBox({ onSend }: { onSend: (text: string) => Promise<void> | void }) {
  const [draft, setDraft] = useState('');
  const [focused, setFocused] = useState(false);
  const [sending, setSending] = useState(false);
  const text = draft.trim();

  const send = async () => {
    if (!text) return;
    setSending(true);
    try {
      await onSend(text);
      setDraft('');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <TextInput
        value={draft}
        onChangeText={setDraft}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Add a reply…"
        placeholderTextColor={colors.inkSubtle}
        multiline
        maxFontSizeMultiplier={layout.maxFontScale}
        style={[styles.replyInput, focused && styles.replyFocused]}
        accessibilityLabel="Reply"
      />
      <BrandButton label="Send reply" onPress={send} disabled={!text} loading={sending} />
    </>
  );
}
