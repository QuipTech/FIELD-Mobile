import { Check, RotateCcw, Settings2, Star } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { IconButton } from '@/components/Button/IconButton';
import { Pill } from '@/components/Pill/Pill';
import { Text } from '@/components/Text/Text';
import { formatDateTime } from '@/lib/date';
import { colors, fontFamily } from '@/theme';
import { TRIGGER_LABEL, type Snapshot } from './snapshots';
import { styles } from './styles';

/** One snapshot: tap to select for compare; known good and restore for `machine.manage`. */
export function SnapshotRow(props: {
  snapshot: Snapshot;
  selected: boolean;
  onToggle: () => void;
  onKnownGood?: () => void;
  onRestore?: () => void;
}) {
  const { snapshot: s, selected } = props;
  return (
    <View style={[styles.row, styles.docRow, selected && { borderColor: colors.brand }]}>
      <Pressable
        onPress={props.onToggle}
        style={[styles.row, { flex: 1 }]}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected }}
        accessibilityLabel={`${TRIGGER_LABEL[s.trigger]}, ${formatDateTime(s.takenAt)}`}
      >
        <View style={[styles.iconBox, selected && { backgroundColor: colors.brand }]}>
          {selected ? (
            <Check size={18} color={colors.onAccent} strokeWidth={2.5} />
          ) : (
            <Settings2 size={18} color={colors.ink} strokeWidth={2} />
          )}
        </View>
        <View style={styles.rowText}>
          <Text style={{ fontFamily: fontFamily.medium }}>{formatDateTime(s.takenAt)}</Text>
          <Text variant="caption" color="inkMuted" numberOfLines={1}>
            {TRIGGER_LABEL[s.trigger]} · {s.takenBy?.name ?? 'System'}
          </Text>
          {s.isKnownGood && (
            <View style={{ flexDirection: 'row' }}>
              <Pill label="Known good" tone="success" />
            </View>
          )}
        </View>
      </Pressable>
      {props.onKnownGood && (
        <IconButton
          icon={Star}
          size={18}
          color={s.isKnownGood ? 'warning' : 'muted'}
          accessibilityLabel={s.isKnownGood ? 'Unmark known good' : 'Mark known good'}
          onPress={props.onKnownGood}
        />
      )}
      {props.onRestore && (
        <IconButton
          icon={RotateCcw}
          size={18}
          color="muted"
          accessibilityLabel="Restore this snapshot"
          onPress={props.onRestore}
        />
      )}
    </View>
  );
}
