import type { ReactNode } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/Text/Text';
import { fontFamily, makeStyles } from '@/theme';
import type { FolderOption, LibraryBrand } from './api';
import { initials } from './meta';

/** A horizontally scrolling chip; selected = filled primary tint. Never wraps. */
export function StripChip({
  label,
  selected,
  onPress,
  leading,
  count,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  leading?: ReactNode;
  count?: number;
}) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={count !== undefined ? `${label}, ${count} documents` : label}
      hitSlop={{ top: 4, bottom: 4 }}
    >
      {leading}
      <Text
        variant="caption"
        color={selected ? 'primaryStrong' : 'ink'}
        style={styles.label}
        numberOfLines={1}
      >
        {label}
      </Text>
      {count !== undefined && (
        <View style={[styles.badge, selected && styles.badgeSelected]}>
          <Text variant="caption" color={selected ? 'primaryStrong' : 'muted'}>
            {count}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export function Strip({ children }: { children: ReactNode }) {
  const styles = useStyles();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.strip}
      contentContainerStyle={styles.stripContent}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

function BrandLogo({ brand }: { brand: LibraryBrand }) {
  const styles = useStyles();
  if (brand.logoUrl) {
    return <Image source={{ uri: brand.logoUrl }} style={styles.logo} resizeMode="contain" />;
  }
  return (
    <View style={[styles.logo, styles.logoFallback]}>
      <Text style={styles.logoText}>{initials(brand.name)}</Text>
    </View>
  );
}

export function BrandStrip(props: {
  brands: LibraryBrand[];
  selected?: string;
  onSelect: (id?: string) => void;
}) {
  return (
    <Strip>
      <StripChip label="All brands" selected={!props.selected} onPress={() => props.onSelect()} />
      {props.brands.map((b) => (
        <StripChip
          key={b.id}
          label={b.name}
          count={b.documentCount}
          leading={<BrandLogo brand={b} />}
          selected={props.selected === b.id}
          onPress={() => props.onSelect(b.id)}
        />
      ))}
    </Strip>
  );
}

export function FolderStrip(props: {
  folders: FolderOption[];
  selected?: string;
  onSelect: (id?: string) => void;
}) {
  if (props.folders.length === 0) return null;
  return (
    <Strip>
      <StripChip label="All folders" selected={!props.selected} onPress={() => props.onSelect()} />
      {props.folders.map((f) => (
        <StripChip
          key={f.id}
          label={f.label}
          selected={props.selected === f.id}
          onPress={() => props.onSelect(f.id)}
        />
      ))}
    </Strip>
  );
}

const useStyles = makeStyles((c) => ({
  strip: { marginHorizontal: -16, flexGrow: 0 },
  stripContent: { paddingHorizontal: 16, gap: 8 },
  chip: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.card,
  },
  selected: { backgroundColor: c.primaryTint, borderColor: c.primaryTintStrong },
  pressed: { opacity: 0.7 },
  label: { fontFamily: fontFamily.medium, maxWidth: 220 },
  badge: { paddingHorizontal: 6, borderRadius: 999, backgroundColor: c.fill },
  badgeSelected: { backgroundColor: c.card },
  logo: { width: 20, height: 20, borderRadius: 5 },
  logoFallback: { backgroundColor: c.fill, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontFamily: fontFamily.semibold, fontSize: 9, color: c.muted },
}));
