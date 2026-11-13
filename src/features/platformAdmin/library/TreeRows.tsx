import { ChevronDown, ChevronRight, Layers, Pencil, Plus, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { ActionSheet, type SheetAction } from '@/components/ActionSheet/ActionSheet';
import { SwipeRow } from '@/components/SwipeRow/SwipeRow';
import { Text } from '@/components/Text/Text';
import { toast } from '@/components/Toast/store';
import { errorMessage } from '@/lib/http';
import { fontFamily, makeStyles, useTheme } from '@/theme';
import type { ModelSystem, TreeChange } from './libraryApi';
import type { TreeForm } from './ModelTree';

type Change = (c: TreeChange) => Promise<unknown>;

const confirm = (title: string, body: string, run: () => Promise<unknown>) =>
  Alert.alert(title, body, [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Delete',
      style: 'destructive',
      onPress: () => void run().catch((e) => toast.show(errorMessage(e))),
    },
  ]);

/** Rename, add component and delete for a system (none when the model isn't editable). */
function systemActions(
  s: ModelSystem,
  n: number,
  editable: boolean,
  change: Change,
  onForm: (f: TreeForm) => void,
): SheetAction[] {
  const props = { editable };
  return props.editable
    ? [
        {
          label: 'Rename',
          icon: Pencil,
          onPress: () =>
            onForm({
              title: 'Rename system',
              submitLabel: 'Save',
              label: 'System name',
              initial: s.name,
              run: (name) => change({ kind: 'renameSystem', systemId: s.id, name }),
            }),
        },
        {
          label: 'Add component',
          icon: Plus,
          onPress: () =>
            onForm({
              title: `Add component to ${s.name}`,
              submitLabel: 'Add component',
              label: 'Component name',
              run: (name) => change({ kind: 'addComponent', systemId: s.id, name }),
            }),
        },
        {
          label: 'Delete',
          icon: Trash2,
          destructive: true,
          onPress: () =>
            confirm(
              `Delete ${s.name}?`,
              `Also removes its ${n} component${n === 1 ? '' : 's'}.`,
              () => change({ kind: 'deleteSystem', systemId: s.id }),
            ),
        },
      ]
    : [];
}

/** A system: tap to expand; swipe or long press for its actions (when editable). */
export function SystemRow(props: {
  system: ModelSystem;
  open: boolean;
  last: boolean;
  editable: boolean;
  onToggle: () => void;
  change: Change;
  onForm: (f: TreeForm) => void;
}) {
  const { system: s, change, onForm } = props;
  const styles = useStyles();
  const { colors } = useTheme();
  const [menu, setMenu] = useState(false);
  const n = s.components.length || s.componentCount;
  const actions = systemActions(s, n, props.editable, change, onForm);
  const Chevron = props.open ? ChevronDown : ChevronRight;

  return (
    <View style={!props.last && styles.divider}>
      <SwipeRow actions={actions}>
        <Pressable
          onPress={props.onToggle}
          onLongPress={actions.length ? () => setMenu(true) : undefined}
          style={styles.system}
          accessibilityRole="button"
          accessibilityState={{ expanded: props.open }}
          accessibilityLabel={`${s.name}, ${n} components`}
          accessibilityHint={actions.length ? 'Long press for actions' : undefined}
        >
          <Chevron size={18} color={colors.muted} strokeWidth={2} />
          <Text style={styles.systemName} numberOfLines={2}>
            {s.name}
          </Text>
          <View style={styles.count}>
            <Text variant="caption" color="muted">
              {n}
            </Text>
          </View>
        </Pressable>
      </SwipeRow>
      {props.open &&
        s.components.map((c) => (
          <ComponentRow
            key={c.id}
            component={c}
            editable={props.editable}
            change={change}
            onForm={onForm}
          />
        ))}
      <ActionSheet visible={menu} title={s.name} actions={actions} onClose={() => setMenu(false)} />
    </View>
  );
}

function ComponentRow(props: {
  component: { id: string; name: string };
  editable: boolean;
  change: Change;
  onForm: (f: TreeForm) => void;
}) {
  const { component: c, change } = props;
  const styles = useStyles();
  const { colors } = useTheme();
  const [menu, setMenu] = useState(false);
  const actions: SheetAction[] = props.editable
    ? [
        {
          label: 'Rename',
          icon: Pencil,
          onPress: () =>
            props.onForm({
              title: 'Rename component',
              submitLabel: 'Save',
              label: 'Component name',
              initial: c.name,
              run: (name) => change({ kind: 'renameComponent', componentId: c.id, name }),
            }),
        },
        {
          label: 'Delete',
          icon: Trash2,
          destructive: true,
          onPress: () =>
            confirm(`Delete ${c.name}?`, 'It goes from every machine of this model.', () =>
              change({ kind: 'deleteComponent', componentId: c.id }),
            ),
        },
      ]
    : [];
  return (
    <>
      <SwipeRow actions={actions}>
        <Pressable
          onLongPress={actions.length ? () => setMenu(true) : undefined}
          style={styles.component}
          accessibilityLabel={c.name}
          accessibilityHint={actions.length ? 'Long press for actions' : undefined}
        >
          <Layers size={16} color={colors.muted} strokeWidth={1.8} />
          <Text style={{ flex: 1 }} numberOfLines={2}>
            {c.name}
          </Text>
        </Pressable>
      </SwipeRow>
      <ActionSheet visible={menu} title={c.name} actions={actions} onClose={() => setMenu(false)} />
    </>
  );
}

const useStyles = makeStyles((c) => ({
  divider: { borderBottomWidth: 1, borderBottomColor: c.border },
  system: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    backgroundColor: c.card,
  },
  systemName: { flex: 1, fontFamily: fontFamily.medium },
  count: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: c.fill },
  component: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 42,
    paddingRight: 14,
    backgroundColor: c.card,
  },
}));
