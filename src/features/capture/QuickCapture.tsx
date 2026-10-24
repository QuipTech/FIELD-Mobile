import { CloudUpload } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { BrandButton } from '@/components/BrandButton/BrandButton';
import { FilterSelect } from '@/components/FilterChip/FilterChip';
import { Text } from '@/components/Text/Text';
import type { Machine } from '@/features/machines/data';
import type { TimelineEntry } from '@/features/machines/records';
import { formatShortDate } from '@/lib/date';
import { colors, layout, spacing } from '@/theme';
import { PhotosStep } from './PhotosStep';
import type { PhotoBatch } from './queue';
import { styles as captureStyles } from './styles';

export type QuickCaptureProps = {
  machines: Machine[];
  /** The machine the photos go to; the route loads its history. */
  machineId?: string;
  onMachineChange: (machineId: string) => void;
  /** That machine's synced history. Unsynced entries can't take photos yet. */
  entries: TimelineEntry[];
  entriesLoading?: boolean;
  /** Prefill, e.g. from a history entry's "Add photos". Defaults to the latest entry. */
  initialEntryId?: string;
  onSave: (batch: PhotoBatch) => void;
  onClose: () => void;
};

const photoCount = (n: number) => `${n} photo${n === 1 ? '' : 's'}`;

/** M7 Capture photo: camera first, then attach the shots to an existing history entry. */
export function QuickCapture({
  machines,
  machineId,
  onMachineChange,
  entries,
  entriesLoading,
  initialEntryId,
  onSave,
  onClose,
}: QuickCaptureProps) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [picked, setPicked] = useState(initialEntryId);
  // Newest first by date: the API's order isn't guaranteed. ISO dates sort as strings.
  const sorted = [...entries].sort((a, b) => b.at.localeCompare(a.at));
  const entryId = sorted.some((e) => e.id === picked) ? picked : sorted[0]?.id;

  const close = () => {
    if (photos.length === 0 && !note.trim()) return onClose();
    Alert.alert('Discard these photos?', 'They haven’t been saved yet.', [
      { text: 'Keep editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: onClose },
    ]);
  };

  // Android back asks before dropping unsaved photos (re-bound each render: cheap).
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      close();
      return true;
    });
    return () => sub.remove();
  });

  const save = () => {
    if (machineId && entryId && photos.length) onSave({ machineId, entryId, photos, note });
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <PhotosStep
        title="Capture"
        photos={photos}
        onChange={setPhotos}
        onClose={close}
        sheet={
          <AttachSheet
            machines={machines}
            machineId={machineId}
            onMachineChange={(id) => {
              setPicked(undefined);
              onMachineChange(id);
            }}
            entries={sorted}
            entryId={entryId}
            onEntryChange={setPicked}
            entriesLoading={entriesLoading}
            note={note}
            onNoteChange={setNote}
            count={photos.length}
            onSave={save}
          />
        }
      />
    </KeyboardAvoidingView>
  );
}

/** Under the camera: "Attach to" machine › entry, a note, and save. */
function AttachSheet(props: {
  machines: Machine[];
  machineId?: string;
  onMachineChange: (id: string) => void;
  entries: TimelineEntry[];
  entryId?: string;
  onEntryChange: (id: string) => void;
  entriesLoading?: boolean;
  note: string;
  onNoteChange: (note: string) => void;
  count: number;
  onSave: () => void;
}) {
  const { machineId, entryId, count } = props;
  return (
    <>
      <Text style={captureStyles.label}>Attach to</Text>
      <View style={captureStyles.chips}>
        {machineId && (
          <FilterSelect
            title="Machine"
            value={machineId}
            options={props.machines.map((m) => ({ value: m.id, label: m.label }))}
            onChange={props.onMachineChange}
          />
        )}
        {entryId && (
          <FilterSelect
            title="History entry"
            value={entryId}
            options={props.entries.map((e) => ({
              value: e.id,
              label: `${e.title} · ${formatShortDate(e.at)}`,
            }))}
            onChange={props.onEntryChange}
          />
        )}
      </View>
      {!entryId && (
        <Text variant="caption" color="inkMuted">
          {props.entriesLoading
            ? 'Loading this machine’s history…'
            : 'No synced entries on this machine yet. Log an entry first, then add photos to it.'}
        </Text>
      )}
      <TextInput
        value={props.note}
        onChangeText={props.onNoteChange}
        placeholder="Add a note…"
        placeholderTextColor={colors.inkSubtle}
        maxFontSizeMultiplier={layout.maxFontScale}
        style={captureStyles.input}
        accessibilityLabel="Note"
      />
      <View style={styles.footnote}>
        <CloudUpload size={14} color={colors.inkMuted} strokeWidth={2} />
        <Text variant="caption" color="inkMuted">
          Uploads when connected · compressed to 2000 px
        </Text>
      </View>
      <BrandButton
        label={count ? `Save ${photoCount(count)}` : 'Save photos'}
        onPress={props.onSave}
        disabled={!entryId || count === 0}
      />
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.camera },
  footnote: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs },
});
