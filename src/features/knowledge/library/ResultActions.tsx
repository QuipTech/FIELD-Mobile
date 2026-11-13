import { BookOpen, Download, Share2, Trash2 } from 'lucide-react-native';

import type { KnowledgeResult } from './api';
import { ActionSheet, type SheetAction } from '@/components/ActionSheet/ActionSheet';
import { useDocumentActions } from './useDocumentActions';

/** Long press on a result: Open, Download, Share and (when allowed) Delete. */
export function ResultActions({
  item,
  onClose,
  onOpen,
}: {
  item?: KnowledgeResult;
  onClose: () => void;
  onOpen: (item: KnowledgeResult) => void;
}) {
  const docs = useDocumentActions();
  const actions: SheetAction[] = item
    ? [
        { label: 'Open', icon: BookOpen, onPress: () => onOpen(item) },
        // Both end in the share sheet, where iOS also offers "Save to Files".
        {
          label: 'Download',
          icon: Download,
          onPress: () => void docs.download(item.id, item.title),
        },
        { label: 'Share', icon: Share2, onPress: () => void docs.download(item.id, item.title) },
        ...(docs.canDelete(item.source)
          ? [
              {
                label: 'Delete',
                icon: Trash2,
                destructive: true,
                onPress: () => void docs.confirmDelete(item.id, item.title),
              },
            ]
          : []),
      ]
    : [];
  return (
    <ActionSheet visible={!!item} title={item?.title ?? ''} actions={actions} onClose={onClose} />
  );
}
