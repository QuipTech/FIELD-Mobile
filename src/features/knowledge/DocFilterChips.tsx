import { useState } from 'react';
import { ScrollView } from 'react-native';

import { Chip } from '@/components/Chip/Chip';
import { OptionSheet, type PickerOption } from '@/components/OptionSheet/OptionSheet';
import { spacing } from '@/theme';
import { DOC_TYPE, type DocFilters, type DocStatus, type DocType } from './types';

type Key = 'brandId' | 'categoryId' | 'type' | 'model' | 'status';

const TYPES: PickerOption<DocType>[] = [
  { value: undefined, label: 'All types' },
  ...(Object.keys(DOC_TYPE) as DocType[]).map((t) => ({ value: t, label: DOC_TYPE[t].label })),
];
const STATUSES: PickerOption<DocStatus>[] = [
  { value: undefined, label: 'Any status' },
  { value: 'live', label: 'Live' },
  { value: 'review', label: 'Needs review' },
  { value: 'failed', label: 'Index failed' },
];

export type DocFilterChipsProps = {
  value: DocFilters;
  onChange: (value: DocFilters) => void;
  /** Which chips to show, in order. */
  keys: Key[];
  brands?: { id: string; name: string }[];
  categories?: { id: string; name: string }[];
  models: string[];
};

/** K3/K4 filter chips. A chip with a value shows it selected; its picker has a clear option. */
export function DocFilterChips({
  value,
  onChange,
  keys,
  brands = [],
  categories = [],
  models,
}: DocFilterChipsProps) {
  const [open, setOpen] = useState<Key>();
  const options: Record<Key, { title: string; all: string; list: PickerOption<string>[] }> = {
    brandId: {
      title: 'Brand',
      all: 'All brands',
      list: brands.map((b) => ({ value: b.id, label: b.name })),
    },
    categoryId: {
      title: 'Category',
      all: 'Category',
      list: categories.map((c) => ({ value: c.id, label: c.name })),
    },
    type: { title: 'Type', all: 'Type', list: TYPES.slice(1) },
    model: { title: 'Model', all: 'Model', list: models.map((m) => ({ value: m, label: m })) },
    status: { title: 'Status', all: 'Status', list: STATUSES.slice(1) },
  };
  const labelOf = (key: Key) => {
    const v = value[key];
    return (v && options[key].list.find((o) => o.value === v)?.label) || options[key].all;
  };
  const current = open && options[open];

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.xs }}
        style={{ flexGrow: 0 }}
      >
        {keys.map((key) => (
          <Chip
            key={key}
            label={labelOf(key)}
            selected={!!value[key]}
            dropdown
            onPress={() => setOpen(key)}
            testID={`filter-${key}`}
          />
        ))}
      </ScrollView>
      <OptionSheet
        title={current?.title}
        options={
          current
            ? [{ value: undefined, label: `Any ${current.title.toLowerCase()}` }, ...current.list]
            : []
        }
        value={open ? (value[open] as string | undefined) : undefined}
        onChange={(v) => open && onChange({ ...value, [open]: v })}
        onClose={() => setOpen(undefined)}
      />
    </>
  );
}

/** Count of filters set among `keys` (for "Clear 2 filters"). */
export const activeFilters = (value: DocFilters, keys: Key[]) =>
  keys.filter((k) => !!value[k]).length;
