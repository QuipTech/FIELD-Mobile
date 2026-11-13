import { useFocusEffect } from 'expo-router';
import { FileText, Upload } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

import { Button } from '@/components/Button/Button';
import { Chip } from '@/components/Chip/Chip';
import { Skeleton } from '@/components/Skeleton/Skeleton';
import { toast } from '@/components/Toast/store';
import { EmptyPanel } from '@/components/EmptyPanel/EmptyPanel';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { downloadAndShare, openInAppBrowser } from '@/lib/files';
import { errorMessage } from '@/lib/http';
import {
  DOCUMENT_TYPE_LABEL,
  DOCUMENT_TYPES,
  linksExpired,
  useDeleteDocument,
  useMachineDocuments,
  type DocumentType,
  type MachineDocument,
} from './documentsApi';
import { DocumentRow } from './DocumentRow';
import { styles } from './styles';
import { UploadDocumentSheet } from './UploadDocumentSheet';

/** Documents tab. `canUpload`: `history.create` and not sold (sold machines are read-only). */
export function DocumentsPanel({
  machineId,
  canUpload,
}: {
  machineId: string;
  canUpload: boolean;
}) {
  const docs = useMachineDocuments(machineId);
  const [filter, setFilter] = useState<DocumentType | 'all'>('all');
  const [uploading, setUploading] = useState(false);
  const { refetch } = docs;

  // Signed URLs last 15 minutes: fetch fresh ones whenever the screen comes back.
  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const { open, share, confirmDelete } = useDocumentActions(machineId, docs.dataUpdatedAt, refetch);

  const all = docs.data ?? [];
  const shown = filter === 'all' ? all : all.filter((d) => d.documentType === filter);

  return (
    <View style={styles.panel}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        <Chip label="All" selected={filter === 'all'} onPress={() => setFilter('all')} />
        {DOCUMENT_TYPES.map((t) => (
          <Chip
            key={t}
            label={DOCUMENT_TYPE_LABEL[t]}
            selected={filter === t}
            onPress={() => setFilter(t)}
          />
        ))}
      </ScrollView>
      {canUpload && (
        <Button
          label="Upload"
          icon={Upload}
          variant="secondary"
          onPress={() => setUploading(true)}
        />
      )}
      {docs.isPending ? (
        <Skeleton height={64} />
      ) : docs.error && !docs.data ? (
        <ErrorState
          error={docs.error}
          onRetry={() => void refetch()}
          retrying={docs.isRefetching}
        />
      ) : shown.length === 0 ? (
        <EmptyPanel
          icon={FileText}
          title={all.length ? 'No documents of this type' : 'No documents yet'}
        />
      ) : (
        shown.map((d) => (
          <DocumentRow
            key={d.id}
            doc={d}
            onOpen={() => open(d)}
            onShare={() => share(d)}
            onDelete={d.canDelete ? () => confirmDelete(d) : undefined}
          />
        ))
      )}
      <UploadDocumentSheet
        machineId={machineId}
        visible={uploading}
        onClose={() => setUploading(false)}
      />
    </View>
  );
}

/** Open, share and delete a row; links older than ~15 minutes are re-fetched first. */
function useDocumentActions(
  machineId: string,
  fetchedAt: number,
  refetch: () => Promise<{ data?: MachineDocument[] }>,
) {
  const remove = useDeleteDocument(machineId);
  /** The row with links fresh enough to use, re-fetching the list when they may have expired. */
  const fresh = async (doc: MachineDocument) => {
    if (!linksExpired(fetchedAt)) return doc;
    const res = await refetch();
    const next = res.data?.find((d) => d.id === doc.id);
    if (!next) throw new Error('This document was removed.');
    return next;
  };
  const run = (task: () => Promise<unknown>) =>
    void task().catch((e) => toast.show(errorMessage(e)));
  const open = (doc: MachineDocument) =>
    run(async () => openInAppBrowser((await fresh(doc)).signedUrl));
  const share = (doc: MachineDocument) =>
    run(async () => {
      const d = await fresh(doc);
      await downloadAndShare(d.downloadUrl, { fileName: d.fileName, mimeType: d.contentType });
    });
  const confirmDelete = (doc: MachineDocument) =>
    Alert.alert('Delete this document?', doc.fileName, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          remove.mutate(doc.id, {
            onSuccess: () => toast.show('Document deleted.'),
            onError: (e) => toast.show(errorMessage(e)),
          }),
      },
    ]);

  return { open, share, confirmDelete };
}
