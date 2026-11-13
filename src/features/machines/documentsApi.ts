import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { z } from 'zod';

import { http } from '@/lib/http';

/** A machine's documents: service reports, inspections, certificates (Portal: Documents tab). */

const enc = encodeURIComponent;

export const DOCUMENT_TYPES = ['service_report', 'inspection', 'certificate', 'other'] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];
export const DOCUMENT_TYPE_LABEL: Record<DocumentType, string> = {
  service_report: 'Service report',
  inspection: 'Inspection',
  certificate: 'Certificate',
  other: 'Other',
};

const machineDocumentFile = z.object({
  id: z.string(),
  historyEntryId: z.string().nullable().default(null),
  documentType: z.enum(DOCUMENT_TYPES).catch('other'),
  fileName: z.string(),
  contentType: z.string(),
  sizeBytes: z.number(),
  uploadedAt: z.string(),
  /** View link; valid 15 minutes. */
  signedUrl: z.string(),
  /** Save / share link; valid 15 minutes. */
  downloadUrl: z.string(),
});
export type MachineDocumentFile = z.infer<typeof machineDocumentFile>;

const machineDocument = machineDocumentFile.extend({
  uploadedByName: z.string().nullable().default(null),
  canDelete: z.boolean().default(false),
});
export type MachineDocument = z.infer<typeof machineDocument>;

/** How long the signed URLs last; rows older than this are re-fetched before opening. */
export const SIGNED_URL_TTL_MS = 15 * 60_000;
/** Refetch a little early so a link never expires mid-tap. */
export const STALE_AFTER_MS = SIGNED_URL_TTL_MS - 60_000;

/** Whether links fetched at `fetchedAt` (ms) may have expired. */
export const linksExpired = (fetchedAt: number) => Date.now() - fetchedAt >= STALE_AFTER_MS;

export const documentKeys = { list: (id: string) => ['machines', id, 'documents'] as const };

/** Newest first. Never cached for long: the signed URLs expire. */
export function useMachineDocuments(id: string | undefined) {
  return useQuery({
    queryKey: documentKeys.list(id ?? ''),
    enabled: !!id,
    staleTime: 0,
    gcTime: SIGNED_URL_TTL_MS - 60_000,
    queryFn: async () =>
      z
        .array(machineDocument)
        .parse(await http.get(`/machines/${enc(id!)}/documents`))
        .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)),
  });
}

export const ALLOWED_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  heic: 'image/heic',
};
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

export type PickedFile = { uri: string; name: string; type: string; size?: number };

/** Why the file can't be uploaded, checked on the device before sending; undefined when fine. */
export function fileProblem(file: PickedFile): string | undefined {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const allowed = Object.values(ALLOWED_TYPES);
  if (!ALLOWED_TYPES[ext] && !allowed.includes(file.type)) {
    return 'Choose a PDF, Word document or JPG, PNG or HEIC image.';
  }
  if (file.size !== undefined && file.size > MAX_UPLOAD_BYTES) return 'Files can be up to 20 MB.';
  return undefined;
}

/** Uploads one document with progress (0–1), then reloads the list. */
export function useUploadDocument(id: string) {
  const client = useQueryClient();
  const [progress, setProgress] = useState(0);
  const mutation = useMutation({
    mutationFn: async ({
      file,
      documentType,
    }: {
      file: PickedFile;
      documentType: DocumentType;
    }) => {
      setProgress(0);
      const form = new FormData();
      // React Native's file part: { uri, name, type }.
      form.append('file', { uri: file.uri, name: file.name, type: file.type } as unknown as Blob);
      form.append('documentType', documentType);
      return machineDocumentFile.parse(
        await http.post(`/machines/${enc(id)}/documents`, form, {
          retry: false,
          timeoutMs: 5 * 60_000,
          onUploadProgress: setProgress,
        }),
      );
    },
    onSuccess: () => client.invalidateQueries({ queryKey: documentKeys.list(id) }),
  });
  return { ...mutation, progress };
}

export function useDeleteDocument(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) =>
      http.delete(`/machines/${enc(id)}/documents/${enc(documentId)}`, { retry: false }),
    onSettled: () => client.invalidateQueries({ queryKey: documentKeys.list(id) }),
  });
}
