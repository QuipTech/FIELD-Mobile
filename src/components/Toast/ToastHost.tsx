import { X } from 'lucide-react-native';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing } from '@/theme';
import { IconButton } from '../Button/IconButton';
import { Text } from '../Text/Text';
import { useToastStore } from './store';
import { styles } from './styles';

const TAB_BAR_CLEARANCE = 64;

/** Render once at the app root. Shows the latest toast above the tab bar. */
export function ToastHost() {
  const current = useToastStore((s) => s.current);
  const dismiss = useToastStore((s) => s.dismiss);
  const insets = useSafeAreaInsets();
  if (!current) return null;

  return (
    <View
      key={current.id}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[
        styles.container,
        styles[current.tone],
        { bottom: insets.bottom + TAB_BAR_CLEARANCE + spacing.xs },
      ]}
    >
      <Text color="onInk" style={styles.message}>
        {current.message}
      </Text>
      <IconButton icon={X} color="onInk" accessibilityLabel="Dismiss" onPress={dismiss} />
    </View>
  );
}
