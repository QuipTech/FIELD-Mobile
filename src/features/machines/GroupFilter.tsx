import { Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/Text/Text';
import { fontFamily, makeStyles, useTheme } from '@/theme';

export type GroupOption = { id: string; name: string; colour: string | null };

function Dot({ colour }: { colour: string | null }) {
  const { colors } = useTheme();
  return (
    <View
      style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colour ?? colors.primary }}
    />
  );
}

/** A small tag in the group's colour, on machine rows. */
export function GroupTag({ name, colour }: { name: string; colour: string | null }) {
  const styles = useStyles();
  return (
    <View style={styles.tag}>
      <Dot colour={colour} />
      <Text variant="caption" numberOfLines={1} style={styles.tagText}>
        {name}
      </Text>
    </View>
  );
}

/** "All" plus one chip per machine group shared with the user. Hidden when there are none. */
export function GroupFilter(props: {
  groups: GroupOption[];
  value?: string;
  onChange: (id?: string) => void;
}) {
  const styles = useStyles();
  if (props.groups.length === 0) return null;
  const chip = (id: string | undefined, label: string, colour?: string | null) => {
    const selected = props.value === id;
    return (
      <Pressable
        key={id ?? 'all'}
        onPress={() => props.onChange(id)}
        style={[styles.chip, selected && styles.selected]}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={id ? `Group ${label}` : 'All groups'}
      >
        {colour !== undefined && <Dot colour={colour} />}
        <Text variant="caption" color={selected ? 'primaryStrong' : 'ink'} style={styles.label}>
          {label}
        </Text>
      </Pressable>
    );
  };
  return (
    <View style={{ gap: 6 }}>
      <Text variant="label" color="muted">
        Group
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.content}
      >
        {chip(undefined, 'All')}
        {props.groups.map((g) => chip(g.id, g.name, g.colour))}
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  scroll: { marginHorizontal: -16, flexGrow: 0 },
  content: { paddingHorizontal: 16, gap: 8 },
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
  label: { fontFamily: fontFamily.medium },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: c.fill,
    maxWidth: 160,
  },
  tagText: { fontFamily: fontFamily.medium },
}));
