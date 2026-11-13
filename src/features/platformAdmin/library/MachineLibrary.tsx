import { router, Stack } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { IconButton } from '@/components/Button/IconButton';
import { Chip } from '@/components/Chip/Chip';
import { FormSheet } from '@/components/FormSheet/FormSheet';
import { SearchField } from '@/components/SearchField/SearchField';
import { Text } from '@/components/Text/Text';
import { usePullRefresh } from '@/lib/usePullRefresh';
import { useDebounced } from '@/lib/useDebounced';
import { Loaded, PlatformAdminScreen } from '../shared';
import { libraryKeys, useMachineModels, useModelActions } from './libraryApi';
import { ModelCard } from './ModelCard';

const ADD_FIELDS = [
  { key: 'manufacturerName', label: 'Manufacturer', required: true, placeholder: 'e.g. CAT' },
  { key: 'name', label: 'Model name', required: true, placeholder: 'e.g. 793F' },
  { key: 'category', label: 'Category', placeholder: 'e.g. Haul truck' },
];

function ManufacturerChips(props: {
  makes: string[];
  value?: string;
  onChange: (make?: string) => void;
}) {
  if (props.makes.length < 2) return null;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8 }}
    >
      <Chip label="All" selected={!props.value} onPress={() => props.onChange(undefined)} />
      {props.makes.map((m) => (
        <Chip
          key={m}
          label={m}
          selected={props.value === m}
          onPress={() => props.onChange(props.value === m ? undefined : m)}
        />
      ))}
    </ScrollView>
  );
}

/** The shared catalogue of models (portal: Admin › Machine library). */
export function MachineLibrary() {
  const [text, setText] = useState('');
  const search = useDebounced(text, 350);
  const models = useMachineModels(search);
  const actions = useModelActions();
  const pull = usePullRefresh(libraryKeys.all);
  const [make, setMake] = useState<string>();
  const [adding, setAdding] = useState(false);

  const all = useMemo(() => models.data ?? [], [models.data]);
  const makes = useMemo(
    () => [...new Set(all.map((m) => m.manufacturerName))].sort((a, b) => a.localeCompare(b)),
    [all],
  );
  const shown = make ? all.filter((m) => m.manufacturerName === make) : all;

  return (
    <PlatformAdminScreen
      {...pull}
      header={<SearchField value={text} onChange={setText} label="Search models" />}
    >
      <Stack.Screen
        options={{
          headerRight: () => (
            <IconButton
              icon={Plus}
              accessibilityLabel="Add model"
              onPress={() => setAdding(true)}
            />
          ),
        }}
      />
      <ManufacturerChips makes={makes} value={make} onChange={setMake} />
      <Loaded query={models}>
        {() =>
          shown.length === 0 ? (
            <Text color="muted" style={{ textAlign: 'center', padding: 24 }}>
              {search || make ? 'No models match.' : 'No models yet'}
            </Text>
          ) : (
            <View style={{ gap: 12 }}>
              {shown.map((m) => (
                <ModelCard
                  key={m.id}
                  model={m}
                  onOpen={() =>
                    router.push({ pathname: '/admin/machine-library/[id]', params: { id: m.id } })
                  }
                  onDelete={() => actions.remove.mutateAsync(m.id)}
                />
              ))}
            </View>
          )
        }
      </Loaded>
      <FormSheet
        visible={adding}
        title="Add model"
        fields={ADD_FIELDS}
        submitLabel="Add model"
        onClose={() => setAdding(false)}
        onSubmit={(v) =>
          actions.create.mutateAsync({
            manufacturerName: v.manufacturerName!,
            name: v.name!,
            ...(v.category && { category: v.category }),
          })
        }
      />
    </PlatformAdminScreen>
  );
}
