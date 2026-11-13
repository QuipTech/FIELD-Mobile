import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert } from 'react-native';

import { useRole } from '@/auth/useRole';
import { toast } from '@/components/Toast/store';
import { downloadAndShare } from '@/lib/files';
import { errorMessage } from '@/lib/http';
import { libraryKeys, type LibraryPage } from './api';
import { fetchDownloadUrl, useDeleteDocument } from './readerApi';

/** Shared = QuipTech library (portal: "shared" / "quiptech_library"). */
export type DocSource = 'shared' | 'organisation' | 'tenant' | 'quiptech_library';
const isShared = (s: DocSource) => s === 'shared' || s === 'quiptech_library';

/**
 * Download / share (fresh signed URL each time, with progress) and delete for one document.
 * Delete: QuipTech library documents need `platform.manage`; the organisation's own need
 * `knowledge.submit`.
 */
export function useDocumentActions() {
  const { can } = useRole();
  const client = useQueryClient();
  const remove = useDeleteDocument();
  const [progress, setProgress] = useState<number | null>(null);

  const canDelete = (source: DocSource) =>
    isShared(source) ? can('platform.manage') : can('knowledge.submit');

  const download = async (id: string, title: string) => {
    if (progress !== null) return;
    setProgress(0);
    try {
      // Signed URLs last 15 minutes: always ask for a new one right before use.
      const url = await fetchDownloadUrl(id);
      await downloadAndShare(url, { fileName: fileNameFor(title, url), onProgress: setProgress });
    } catch (e) {
      toast.show(errorMessage(e) || "Couldn't download the document.");
    } finally {
      setProgress(null);
    }
  };

  /** Asks first; resolves true once deleted (and removed from the loaded lists). */
  const confirmDelete = (id: string, title: string) =>
    new Promise<boolean>((resolve) =>
      Alert.alert(
        'Delete this document?',
        `${title} and all its versions will be permanently deleted. It will no longer appear in Knowledge or be used by the AI assistant.`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () =>
              remove.mutate(id, {
                onSuccess: () => {
                  dropFromLists(client, id);
                  toast.show('Document deleted.');
                  resolve(true);
                },
                onError: (e) => {
                  toast.show(errorMessage(e));
                  resolve(false);
                },
              }),
          },
        ],
        { cancelable: true, onDismiss: () => resolve(false) },
      ),
    );

  return { download, progress, canDelete, confirmDelete, deleting: remove.isPending };
}

/** Removes the item from every loaded list page and decrements the totals. */
function dropFromLists(client: ReturnType<typeof useQueryClient>, id: string) {
  client.setQueriesData<InfiniteData<LibraryPage>>({ queryKey: libraryKeys.all }, (data) => {
    if (!data?.pages) return data;
    const had = data.pages.some((p) => p.items.some((i) => i.id === id));
    if (!had) return data;
    return {
      ...data,
      pages: data.pages.map((p) => ({
        ...p,
        items: p.items.filter((i) => i.id !== id),
        total: Math.max(0, p.total - 1),
      })),
    };
  });
  client.removeQueries({ queryKey: libraryKeys.article(id) });
}

/** "D10T Service Manual.pdf": the title, with the URL's extension when it has one. */
function fileNameFor(title: string, url: string) {
  const ext = /\.([a-z0-9]{2,5})(?:[?#]|$)/i.exec(url.split('?')[0] ?? '')?.[1] ?? 'pdf';
  return `${title}.${ext.toLowerCase()}`;
}
