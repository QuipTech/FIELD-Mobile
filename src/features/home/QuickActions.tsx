import { Plus, ScanLine, Search, Sparkles, type LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/Text/Text';
import { colors } from '@/theme';
import { styles } from './styles';

export type QuickActionsProps = {
  onSearch: () => void;
  onAskAi: () => void;
  onScan: () => void;
  onLogEntry: () => void;
};

/** Search field plus the three H1 action tiles. */
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
        <Tile icon={ScanLine} label="Scan machine" onPress={props.onScan} />
        <Tile icon={Plus} label="Log entry" onPress={props.onLogEntry} />
        <Tile icon={Sparkles} label="Ask AI" onPress={props.onAskAi} />
      </View>
    </>
  );
}

function Tile({
  icon: Icon,
  label,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
    >
      <Icon size={22} color={colors.inkMuted} strokeWidth={2} />
      <Text style={styles.tileLabel}>{label}</Text>
    </Pressable>
  );
}
