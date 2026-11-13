import { ChevronRight, X, type LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Avatar } from '@/components/Avatar/Avatar';
import { IconButton } from '@/components/Button/IconButton';
import { Text } from '@/components/Text/Text';
import { useTheme } from '@/theme';
import { useDrawerStyles } from './drawerStyles';
import { useHeroMotion } from './useHeroMotion';

export function DrawerHero({
  name,
  email,
  avatarUrl,
  onClose,
}: {
  name: string;
  email?: string;
  avatarUrl?: string | null;
  onClose: () => void;
}) {
  const styles = useDrawerStyles();
  const motion = useHeroMotion();
  return (
    <View style={styles.hero}>
      <Animated.View style={[styles.orb, motion.orbStyle]} pointerEvents="none" />
      <Animated.View style={[styles.ring, motion.ringStyle]} pointerEvents="none" />
      <View style={styles.heading}>
        <View style={styles.brand}>
          <Text variant="caption" color="onBrandMuted">
            QuipTech
          </Text>
          <Text style={styles.wordmark} color="onCamera">
            FIELD
          </Text>
        </View>
        <IconButton
          icon={X}
          color="onCamera"
          style={styles.close}
          accessibilityLabel="Close menu"
          onPress={onClose}
        />
      </View>
      <View style={styles.profile}>
        <View style={styles.avatarFrame}>
          <Avatar name={name} imageUrl={avatarUrl} size={48} />
        </View>
        <View style={styles.identity}>
          <Text variant="bodyStrong" color="onCamera" numberOfLines={2}>
            {name}
          </Text>
          <Text variant="caption" color="onBrandMuted" numberOfLines={1}>
            {email ?? ''}
          </Text>
        </View>
      </View>
    </View>
  );
}

export function DrawerSection({ title, children }: { title: string; children: ReactNode }) {
  const styles = useDrawerStyles();
  return (
    <View style={styles.section}>
      <Text variant="label" color="muted" style={styles.sectionLabel}>
        {title}
      </Text>
      <View style={styles.group}>{children}</View>
    </View>
  );
}

export function DrawerRow({
  icon: Icon,
  label,
  tone = 'primary',
  selected = false,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  tone?: 'primary' | 'success' | 'warning' | 'danger';
  selected?: boolean;
  onPress: () => void;
}) {
  const styles = useDrawerStyles();
  const { colors } = useTheme();
  const foreground = tone === 'primary' ? colors.primaryStrong : colors[tone];
  const background = colors[`${tone}Tint`];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.row, selected && styles.selected, pressed && styles.pressed]}
    >
      <View style={[styles.icon, { backgroundColor: background }]}>
        <Icon size={20} strokeWidth={1.8} color={foreground} />
      </View>
      <Text
        variant="label"
        color={tone === 'danger' ? 'danger' : selected ? 'primaryStrong' : 'ink'}
        style={styles.label}
        numberOfLines={2}
      >
        {label}
      </Text>
      {selected ? (
        <View style={styles.activeDot} />
      ) : (
        tone !== 'danger' && <ChevronRight size={16} color={colors.faint} />
      )}
    </Pressable>
  );
}
