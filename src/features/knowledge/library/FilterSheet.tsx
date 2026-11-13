import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/Button/Button';
import { ModalSheet } from '@/components/ModalSheet/ModalSheet';
import { SearchField } from '@/components/SearchField/SearchField';
import { Text } from '@/components/Text/Text';
import { makeStyles, useTheme } from '@/theme';
import type { KnowledgeModel, LibraryFilters, LibraryType } from './api';
import { TYPE_META, TYPE_ORDER } from './meta';

const MODEL_LIMIT = 40;

function OptionRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.option, pressed && styles.pressed]}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
    >
      <Text color={selected ? 'primaryStrong' : 'ink'} style={{ flex: 1 }} numberOfLines={1}>
        {label}
      </Text>
      {selected && <Check size={18} color={colors.primary} strokeWidth={2.5} />}
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 2 }}>
      <Text variant="label" color="muted">
        {title}
      </Text>
      {children}
    </View>
  );
}

/**
 * Document type, machine make and model. Changes apply at once (the list behind updates), so
 * "Show N results" shows the live total.
 */
export function FilterSheet(props: {
  visible: boolean;
  onClose: () => void;
  filters: LibraryFilters;
  onChange: (patch: Partial<LibraryFilters>) => void;
  onClearAll: () => void;
  makes: { id: string; name: string }[];
  models: KnowledgeModel[];
  total?: number;
}) {
  const { filters, onChange } = props;
  const typeOptions: { value?: LibraryType; label: string }[] = [
    { label: 'All' },
    ...TYPE_ORDER.map((t) => ({ value: t, label: TYPE_META[t].plural })),
  ];

  return (
    <ModalSheet
      visible={props.visible}
      title="Filters"
      onClose={props.onClose}
      footer={
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Button label="Clear all" variant="secondary" onPress={props.onClearAll} />
          </View>
          <View style={{ flex: 1.4 }}>
            <Button
              label={props.total === undefined ? 'Show results' : `Show ${props.total} results`}
              onPress={props.onClose}
            />
          </View>
        </View>
      }
    >
      <Section title="Document type">
        {typeOptions.map((o) => (
          <OptionRow
            key={o.label}
            label={o.label}
            selected={filters.type === o.value}
            onPress={() => onChange({ type: o.value })}
          />
        ))}
      </Section>
      {props.makes.length > 0 && (
        <Section title="Machine make">
          <OptionRow
            label="All makes"
            selected={!filters.make}
            onPress={() => onChange({ make: undefined })}
          />
          {props.makes.map((m) => (
            <OptionRow
              key={m.id}
              label={m.name}
              selected={filters.make === m.id}
              onPress={() => onChange({ make: m.id })}
            />
          ))}
        </Section>
      )}
      <ModelSection
        models={props.models}
        selected={filters.model}
        onSelect={(model) => onChange({ model })}
      />
    </ModalSheet>
  );
}

const useStyles = makeStyles((c) => ({
  option: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  pressed: { opacity: 0.6 },
}));

/** Searchable model list; the chosen model stays visible while the search hides others. */
function ModelSection(props: {
  models: KnowledgeModel[];
  selected?: string;
  onSelect: (id?: string) => void;
}) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const matching = props.models.filter((m) => !q || m.displayName.toLowerCase().includes(q));
  const top = matching.slice(0, MODEL_LIMIT);
  const chosen = props.models.find((m) => m.id === props.selected);
  const shown = chosen && !top.includes(chosen) ? [chosen, ...top] : top;
  return (
    <Section title="Machine model">
      <SearchField value={query} onChange={setQuery} label="Search models" />
      <OptionRow
        label="All models"
        selected={!props.selected}
        onPress={() => props.onSelect(undefined)}
      />
      {shown.map((m) => (
        <OptionRow
          key={m.id}
          label={m.displayName}
          selected={props.selected === m.id}
          onPress={() => props.onSelect(m.id)}
        />
      ))}
      {matching.length > MODEL_LIMIT && (
        <Text variant="caption" color="muted">
          Showing {MODEL_LIMIT} of {matching.length}. Type to narrow the list.
        </Text>
      )}
    </Section>
  );
}
