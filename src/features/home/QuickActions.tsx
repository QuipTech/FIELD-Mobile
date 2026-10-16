import { Camera, Plus, ScanLine, Search, Sparkles, type LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/Text/Text';
import { colors } from '@/theme';
import { styles } from './styles';

export type QuickActionsProps = {
  onSearch: () => void;
  onAskAi: () => void;
  onScan: () => void;
  onLogEntry: () => void;
  onCapture: () => void;
};

/** Search field plus the four M2 action tiles. */
export function QuickActions(props: QuickActionsProps) {
  return (
    <>
      <Pressable
        onPress={props.onSearch}
        style={styles.search}
        accessibilityRole="search"
        accessibilityLabel="Search machines or manuals"
      >
        <Search size={20} color={colors.inkSubtle} strokeWidth={2} />
        <Text color="inkSubtle">Search machines or manuals</Text>
      </Pressable>
      <View style={styles.row}>
        <Tile icon={Sparkles} label="Ask AI" onPress={props.onAskAi} primary />
        <Tile icon={ScanLine} label="Scan asset" onPress={props.onScan} />
      </View>
      <View style={styles.row}>
        <Tile icon={Plus} label="Log entry" onPress={props.onLogEntry} compact />
        <Tile icon={Camera} label="Capture" onPress={props.onCapture} compact />
      </View>
    </>
  );
}

function Tile({
  icon: Icon,
  label,
  onPress,
  primary,
  compact,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  primary?: boolean;
  compact?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.tile,
        primary && styles.tilePrimary,
        compact && styles.tileCompact,
        pressed && styles.tilePressed,
      ]}
    >
      <Icon size={22} color={primary ? colors.onAccent : colors.inkMuted} strokeWidth={2} />
      <Text style={[styles.tileLabel, { color: primary ? colors.onAccent : colors.ink }]}>
        {label}
      </Text>
    </Pressable>
  );
}
