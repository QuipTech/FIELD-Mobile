import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { KnowledgeDoc } from './types';

type OfflineLibrary = {
  /** Documents saved on this device, newest first. Keeps the metadata so lists work offline. */
  docs: KnowledgeDoc[];
  toggle: (doc: KnowledgeDoc) => void;
  clear: () => void;
};

/**
 * Documents the user saved for offline use (K5b "Available offline"). Persists across launches.
 * TODO(api): also download the page images/PDF from the signed URL in GET /documents/{id}/file.
 */
export const useOfflineLibrary = create<OfflineLibrary>()(
  persist(
    (set) => ({
      docs: [],
      toggle: (doc) =>
        set((s) =>
          s.docs.some((d) => d.id === doc.id)
            ? { docs: s.docs.filter((d) => d.id !== doc.id) }
            : { docs: [doc, ...s.docs] },
        ),
      clear: () => set({ docs: [] }),
    }),
    { name: 'field.knowledge.offline', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

export const useIsSavedOffline = (id: string) =>
  useOfflineLibrary((s) => s.docs.some((d) => d.id === id));

export const totalSizeMb = (docs: KnowledgeDoc[]) =>
  Math.round(docs.reduce((n, d) => n + d.sizeMb, 0));
