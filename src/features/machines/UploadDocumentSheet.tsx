import { Camera, FolderOpen, Image as ImageIcon } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button/Button';
import { Chip } from '@/components/Chip/Chip';
import { Meter } from '@/components/Meter/Meter';
import { ModalSheet } from '@/components/ModalSheet/ModalSheet';
import { Text } from '@/components/Text/Text';
import { toast } from '@/components/Toast/store';
import { errorMessage } from '@/lib/http';
import {
  DOCUMENT_TYPE_LABEL,
  DOCUMENT_TYPES,
  fileProblem,
  useUploadDocument,
  type DocumentType,
} from './documentsApi';
import { pickDocumentFile, type DocumentSource } from './pickDocument';

const SOURCES: { value: DocumentSource; label: string; icon: typeof Camera }[] = [
  { value: 'files', label: 'Files', icon: FolderOpen },
  { value: 'camera', label: 'Camera', icon: Camera },
  { value: 'photos', label: 'Photos', icon: ImageIcon },
];

/** Upload: choose the type (required), then a file from Files, the camera or Photos. */
export function UploadDocumentSheet({
  machineId,
  visible,
  onClose,
}: {
  machineId: string;
  visible: boolean;
  onClose: () => void;
}) {
  const [type, setType] = useState<DocumentType>();
  const [fileName, setFileName] = useState<string>();
  const [problem, setProblem] = useState<string>();
  const upload = useUploadDocument(machineId);
  const busy = upload.isPending;

  const close = () => {
    setType(undefined);
    setFileName(undefined);
    setProblem(undefined);
    onClose();
  };

  const pick = async (source: DocumentSource) => {
    if (!type) return;
    setProblem(undefined);
    try {
      const file = await pickDocumentFile(source);
      if (!file) return;
      const why = fileProblem(file);
      if (why) return setProblem(why);
      setFileName(file.name);
      upload.mutate(
        { file, documentType: type },
        {
          onSuccess: () => {
            toast.show(`${file.name} uploaded.`);
            close();
          },
          onError: (e) => setProblem(errorMessage(e)),
        },
      );
    } catch (e) {
      setProblem(errorMessage(e));
    }
  };

  return (
    <ModalSheet visible={visible} title="Upload a document" onClose={close} busy={busy}>
      <Text variant="label" color="muted">
        Type
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {DOCUMENT_TYPES.map((t) => (
          <Chip
            key={t}
            label={DOCUMENT_TYPE_LABEL[t]}
            selected={type === t}
            onPress={() => !busy && setType(t)}
          />
        ))}
      </View>
      {busy ? (
        <Meter
          value={Math.round(upload.progress * 100)}
          max={100}
          label={fileName ?? 'Uploading'}
          caption={`${Math.round(upload.progress * 100)}%`}
        />
      ) : (
        <SourceButtons disabled={!type} onPick={(src) => void pick(src)} />
      )}
      {!!problem && <Text color="danger">{problem}</Text>}
    </ModalSheet>
  );
}

function SourceButtons({
  disabled,
  onPick,
}: {
  disabled: boolean;
  onPick: (source: DocumentSource) => void;
}) {
  return (
    <>
      <Text variant="caption" color="muted">
        PDF, Word, JPG, PNG or HEIC, up to 20 MB.
      </Text>
      {SOURCES.map((s) => (
        <Button
          key={s.value}
          label={s.label}
          variant="secondary"
          icon={s.icon}
          onPress={() => onPick(s.value)}
          disabled={disabled}
        />
      ))}
    </>
  );
}
