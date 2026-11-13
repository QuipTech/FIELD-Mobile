import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

import { makeStyles, useTheme } from '@/theme';
import type { SheetAction } from '../ActionSheet/ActionSheet';
import { Text } from '../Text/Text';

/**
 * A row that swipes left to reveal its actions. The same actions should also be reachable by
 * long press (an ActionSheet), so swiping is never the only way.
 */
export function SwipeRow({ actions, children }: { actions: SheetAction[]; children: ReactNode }) {
  const styles = useStyles();
  const { colors } = useTheme();
  if (actions.length === 0) return <>{children}</>;
  return (
    <Swipeable
      friction={2}
      rightThreshold={40}
      overshootRight={false}
      renderRightActions={(_progress, _translation, methods) => (
        <View style={styles.actions}>
          {actions.map((a) => {
            const Icon = a.icon;
            return (
              <Pressable
                key={a.label}
                onPress={() => {
                  methods.close();
                  a.onPress();
                }}
                style={[styles.action, a.destructive ? styles.danger : styles.neutral]}
                accessibilityRole="button"
                accessibilityLabel={a.label}
              >
                <Icon
                  size={18}
                  color={a.destructive ? colors.onButton : colors.ink}
                  strokeWidth={2}
                />
                <Text
                  variant="caption"
                  color={a.destructive ? 'onButton' : 'ink'}
                  numberOfLines={1}
                >
                  {a.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    >
      {children}
    </Swipeable>
  );
}

const useStyles = makeStyles((c) => ({
  actions: { flexDirection: 'row' },
  action: {
    width: 84,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 4,
  },
  neutral: { backgroundColor: c.fill },
  danger: { backgroundColor: c.danger },
}));
