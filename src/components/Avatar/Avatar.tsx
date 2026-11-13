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

/** Light background + matching deep ink; picked from the name so a person keeps their colour. */
const PALETTE = [
  { bg: '#E0E7FF', ink: '#3730A3' }, // indigo
  { bg: '#DBEAFE', ink: '#1E40AF' }, // blue
  { bg: '#CFFAFE', ink: '#155E75' }, // cyan
  { bg: '#D1FAE5', ink: '#065F46' }, // emerald
  { bg: '#ECFCCB', ink: '#3F6212' }, // lime
  { bg: '#FEF3C7', ink: '#92400E' }, // amber
  { bg: '#FFEDD5', ink: '#9A3412' }, // orange
  { bg: '#FFE4E6', ink: '#9F1239' }, // rose
  { bg: '#FCE7F3', ink: '#9D174D' }, // pink
  { bg: '#F3E8FF', ink: '#6B21A8' }, // purple
] as const;

export function avatarColors(name: string) {
  let hash = 0;
  for (const ch of name.trim().toLowerCase()) hash = (hash * 31 + ch.codePointAt(0)!) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length]!;
}

/** `.av`: round initials on a light colour, or the user's photo. Decorative: hidden from readers. */
export function Avatar({ name, imageUrl, size = 36 }: AvatarProps) {
  const styles = useStyles();
  const box = { width: size, height: size, borderRadius: size / 2 };
  const tone = avatarColors(name);
  return (
    <View
      style={[styles.avatar, box, !imageUrl && { backgroundColor: tone.bg }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={box} resizeMode="cover" />
      ) : (
        <Text
          variant={size >= 48 ? 'section' : 'caption'}
          style={[styles.initials, { color: tone.ink }]}
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
