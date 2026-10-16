import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { APP_MESH, MeshBackground } from '@/components/MeshBackground/MeshBackground';
import { Text } from '@/components/Text/Text';
import { colors, spacing } from '@/theme';

/** Shell for tabs whose screens aren't built yet. */
export function TabPlaceholder({
  title,
  message,
  children,
}: {
  title: string;
  message: string;
  children?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.canvas,
        paddingTop: insets.top + spacing.lg,
        paddingHorizontal: spacing.md,
        gap: spacing.xs,
      }}
    >
      <MeshBackground spots={APP_MESH} />
      <Text variant="title" accessibilityRole="header">
        {title}
      </Text>
      <Text color="inkMuted">{message}</Text>
      {children}
    </View>
  );
}
