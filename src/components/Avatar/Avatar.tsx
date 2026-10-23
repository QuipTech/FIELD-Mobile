import { Image, View } from 'react-native';

import { fontFamily, makeStyles } from '@/theme';
import { Text } from '../Text/Text';

export type AvatarProps = {
  /** Full name; the initials come from it. */
  name: string;
  imageUrl?: string | null;
  size?: number;
};

/** Initials from a full name: "Uneeb Malik" → "UM", "R. Mendes" → "RM". */
export function initialsOf(name: string) {
  const parts = name
    .replace(/[^\p{L}\s]/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const first = parts[0]?.[0] ?? '?';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

/** `.av`: round initials on the brand tint, or the user's photo. Decorative: hidden from readers. */
export function Avatar({ name, imageUrl, size = 36 }: AvatarProps) {
  const styles = useStyles();
  const box = { width: size, height: size, borderRadius: size / 2 };
  return (
    <View
      style={[styles.avatar, box]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={box} resizeMode="cover" />
      ) : (
        <Text
          variant={size >= 48 ? 'section' : 'caption'}
          color="primaryStrong"
          style={styles.initials}
        >
          {initialsOf(name)}
        </Text>
      )}
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  avatar: {
    backgroundColor: c.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: { fontFamily: fontFamily.semibold },
}));
