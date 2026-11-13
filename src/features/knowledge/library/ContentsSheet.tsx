import { Pressable } from 'react-native';

import { ModalSheet } from '@/components/ModalSheet/ModalSheet';
import { Text } from '@/components/Text/Text';
import { fontFamily, makeStyles } from '@/theme';
import type { ArticleSection } from './readerApi';

/** Section headings with page numbers; the one in view is highlighted. */
export function ContentsSheet(props: {
  visible: boolean;
  sections: ArticleSection[];
  current?: string;
  onPick: (id: string) => void;
  onClose: () => void;
}) {
  const styles = useStyles();
  return (
    <ModalSheet visible={props.visible} title="Contents" onClose={props.onClose}>
      {props.sections.map((s, i) => {
        const active = s.id === props.current;
        return (
          <Pressable
            key={s.id}
            onPress={() => {
              props.onClose();
              props.onPick(s.id);
            }}
            style={({ pressed }) => [
              styles.row,
              active && styles.active,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text
              color={active ? 'primaryStrong' : 'ink'}
              style={[{ flex: 1 }, active && styles.bold]}
              numberOfLines={2}
            >
              {s.heading || `Section ${i + 1}`}
            </Text>
            {s.page !== null && (
              <Text variant="caption" color="muted">
                p. {s.page}
              </Text>
            )}
          </Pressable>
        );
      })}
    </ModalSheet>
  );
}

const useStyles = makeStyles((c) => ({
  row: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  active: { backgroundColor: c.primaryTint },
  pressed: { opacity: 0.6 },
  bold: { fontFamily: fontFamily.medium },
}));
