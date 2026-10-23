import { ArrowRight } from 'lucide-react-native';
import { useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { BrandButton } from '@/components/BrandButton/BrandButton';
import { BrandCard } from '@/components/BrandCard/BrandCard';
import { FilterChip } from '@/components/FilterChip/FilterChip';
import { Pill } from '@/components/Pill/Pill';
import { Text } from '@/components/Text/Text';
import type { Machine } from '@/features/machines/data';
import { ENTRY_TYPE, type EntryType } from '@/features/machines/records';
import { formatHours } from '@/lib/format';
import { colors, layout } from '@/theme';
import { StepShell } from './StepShell';
import type { CaptureDraft } from './store';
import { styles } from './styles';

type StepProps = {
  draft: CaptureDraft;
  update: (patch: Partial<CaptureDraft>) => void;
  machines: Machine[];
  onClose: () => void;
};

function Field(props: TextInputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      placeholderTextColor={colors.inkSubtle}
      maxFontSizeMultiplier={layout.maxFontScale}
      {...props}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[styles.input, focused && styles.inputFocused, props.style]}
    />
  );
}

/** Step 1: which machine, what kind of entry, and a one-line title. */
export function DetailsStep({
  draft,
  update,
  machines,
  onClose,
  onNext,
}: StepProps & { onNext: () => void }) {
  const ready = !!draft.machineId && draft.title.trim().length > 0;
  return (
    <StepShell
      step={1}
      onClose={onClose}
      footer={
        <BrandButton
          label="Next — photos"
          icon={<ArrowRight size={18} color={colors.onAccent} strokeWidth={2} />}
          onPress={onNext}
          disabled={!ready}
        />
      }
    >
      <Text style={styles.label}>Machine</Text>
      <View style={styles.chips}>
        {machines.map((m) => (
          <FilterChip
            key={m.id}
            label={m.label}
            selected={draft.machineId === m.id}
            onPress={() => update({ machineId: m.id })}
          />
        ))}
      </View>
      <Text style={styles.label}>Entry type</Text>
      <View style={styles.chips}>
        {(Object.keys(ENTRY_TYPE) as EntryType[]).map((t) => (
          <FilterChip
            key={t}
            label={ENTRY_TYPE[t].label}
            icon={ENTRY_TYPE[t].icon}
            selected={draft.type === t}
            onPress={() => update({ type: t })}
          />
        ))}
      </View>
      <Text style={styles.label}>What was done</Text>
      <Field
        value={draft.title}
        onChangeText={(title) => update({ title })}
        placeholder="e.g. Main hydraulic pump replaced"
        returnKeyType="next"
        onSubmitEditing={() => ready && onNext()}
        accessibilityLabel="What was done"
      />
    </StepShell>
  );
}

/** Step 3: hour meter and notes, a summary, then save. */
export function NotesStep({
  draft,
  update,
  machines,
  onClose,
  onBack,
  onSave,
}: StepProps & { onBack: () => void; onSave: () => void }) {
  const machine = machines.find((m) => m.id === draft.machineId);
  const type = ENTRY_TYPE[draft.type];
  const photos = draft.photos.length;
  return (
    <StepShell
      step={3}
      onBack={onBack}
      onClose={onClose}
      footer={<BrandButton label="Save entry" onPress={onSave} />}
    >
      <BrandCard>
        <View style={styles.summary}>
          <Pill label={type.label} tone={type.tone} icon={type.icon} />
          <Text variant="caption" color="inkMuted">
            {photos === 0 ? 'No photos' : `${photos} photo${photos === 1 ? '' : 's'}`}
          </Text>
        </View>
        <Text style={styles.summaryTitle}>{draft.title}</Text>
        {machine && (
          <Text variant="caption" color="inkMuted">
            {machine.label} · {machine.model}
          </Text>
        )}
      </BrandCard>
      <Text style={styles.label}>Hour meter</Text>
      <Field
        value={draft.hours}
        onChangeText={(hours) => update({ hours })}
        placeholder={
          machine?.hours !== undefined ? `Last ${formatHours(machine.hours)}` : 'e.g. 14,230'
        }
        keyboardType="numeric"
        accessibilityLabel="Hour meter reading"
      />
      <Text style={styles.label}>Notes</Text>
      <Field
        value={draft.notes}
        onChangeText={(notes) => update({ notes })}
        placeholder="What did you find, and what did you do?"
        multiline
        style={styles.notes}
        accessibilityLabel="Notes"
      />
    </StepShell>
  );
}
