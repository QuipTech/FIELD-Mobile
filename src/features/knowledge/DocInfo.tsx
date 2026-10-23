import { router } from 'expo-router';
import { Alert } from 'react-native';

import { useRole } from '@/auth/useRole';
import { toast } from '@/components/Toast/store';
import { errorMessage } from '@/lib/http';
import { useDocAdminAction } from './admin';
import { DocInfoSheet } from './DocInfoSheet';
import { useIsSavedOffline, useOfflineLibrary } from './offlineStore';
import type { KnowledgeDoc } from './types';

/** The document info sheet, wired to the offline library and the Knowledge admin actions. */
export function DocInfo({
  doc,
  visible,
  onClose,
}: {
  doc: KnowledgeDoc;
  visible: boolean;
  onClose: () => void;
}) {
  const { capabilities } = useRole();
  const saved = useIsSavedOffline(doc.id);
  const toggle = useOfflineLibrary((s) => s.toggle);
  const admin = useDocAdminAction(doc.id);
  const run = (action: 'approve' | 'archive' | 'delete', done: string) => () =>
    admin.mutate(action, {
      onSuccess: () => {
        toast.show(done);
        onClose();
        if (action === 'delete') router.back();
      },
      onError: (e) => toast.show(errorMessage(e)),
    });

  return (
    <DocInfoSheet
      visible={visible}
      onClose={onClose}
      doc={doc}
      isAdmin={capabilities.isKnowledgeAdmin}
      savedOffline={saved}
      onToggleOffline={() => {
        toggle(doc);
        toast.show(saved ? 'Removed from this device.' : 'Saved for offline use.');
      }}
      onApprove={
        capabilities.isPlatformAdmin && doc.status === 'review'
          ? run('approve', 'Approved. Technicians can see it now.')
          : undefined
      }
      onNewVersion={() => toast.show('Upload new versions from the FIELD console.')}
      onArchive={doc.status === 'live' ? run('archive', 'Archived.') : undefined}
      onDelete={() =>
        Alert.alert('Delete document?', 'Technicians lose access straight away.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: run('delete', 'Deleted.') },
        ])
      }
    />
  );
}
