import { useState } from 'react';
import { TextInput, View } from 'react-native';

import { BrandButton } from '@/components/BrandButton/BrandButton';
import { Chip } from '@/components/Chip/Chip';
import { DetailScreen } from '@/components/DetailScreen/DetailScreen';
import { FilterSelect, type FilterOption } from '@/components/FilterChip/FilterChip';
import { Text } from '@/components/Text/Text';
import { colors, layout } from '@/theme';
import type { NewCase as NewCaseInput } from './api';
import type { CasePriority } from './data';
import { styles } from './styles';

const PRIORITIES: { value: CasePriority; label: string }[] = [
  { value: 'P1', label: 'P1 · Machine down' },
  { value: 'P2', label: 'P2 · Degraded' },
  { value: 'P3', label: 'P3 · Question' },
];
const NO_MACHINE = '';

export type NewCaseProps = {
  machines: FilterOption<string>[];
  categories: FilterOption<string>[];
  /** Pre-selects a machine, e.g. when raised from machine detail. */
  initialMachineId?: string;
  keyboardOffset?: number;
  submitting: boolean;
  onSubmit: (input: NewCaseInput) => void;
};

/** Raise a case with QuipTech support. */
export function NewCase({ machines, categories, initialMachineId, ...props }: NewCaseProps) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<CasePriority>('P2');
  const [category, setCategory] = useState(categories[0]?.value ?? 'other');
  const [machineId, setMachineId] = useState(initialMachineId ?? NO_MACHINE);
  const ready = subject.trim().length > 2 && description.trim().length > 0;

  const submit = () =>
    props.onSubmit({
      subject: subject.trim(),
      description: description.trim(),
      priority,
      category,
      ...(machineId !== NO_MACHINE && { machineId }),
    });

  return (
    <DetailScreen
      keyboardOffset={props.keyboardOffset}
      footer={
        <BrandButton
          label="Raise case"
          onPress={submit}
          disabled={!ready}
          loading={props.submitting}
        />
      }
    >
      <Text style={styles.sectionTitle}>What’s wrong?</Text>
      <TextInput
        value={subject}
        onChangeText={setSubject}
        placeholder="Short summary, e.g. Brake alarm won't clear"
        placeholderTextColor={colors.inkSubtle}
        maxFontSizeMultiplier={layout.maxFontScale}
        style={styles.replyInput}
        accessibilityLabel="Subject"
      />
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Details: fault codes, readings, what you've tried"
        placeholderTextColor={colors.inkSubtle}
        multiline
        maxFontSizeMultiplier={layout.maxFontScale}
        style={[styles.replyInput, { minHeight: 120, maxHeight: 240 }]}
        accessibilityLabel="Description"
      />
      <Text style={styles.sectionTitle}>Priority</Text>
      <View style={styles.filters}>
        {PRIORITIES.map((p) => (
          <Chip
            key={p.value}
            label={p.label}
            selected={priority === p.value}
            onPress={() => setPriority(p.value)}
          />
        ))}
      </View>
      <View style={styles.filters}>
        <FilterSelect
          title="Machine"
          value={machineId}
          options={[{ value: NO_MACHINE, label: 'No machine' }, ...machines]}
          onChange={setMachineId}
        />
        <FilterSelect
          title="Category"
          value={category}
          options={categories}
          onChange={setCategory}
        />
      </View>
    </DetailScreen>
  );
}
