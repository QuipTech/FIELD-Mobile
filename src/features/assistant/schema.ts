import { z } from 'zod';

import type { ChatMessage, Citation } from './data';

/** Ask AI payloads (Backend API Reference §2). */

export const apiSource = z.object({
  index: z.number(),
  documentId: z.string().nullish(),
  title: z.string().nullish(),
  page: z.number().nullish(),
  heading: z.string().nullish(),
  sectionId: z.string().nullish(),
});
export type ApiSource = z.infer<typeof apiSource>;

export const startEvent = z.object({
  conversationId: z.string(),
  sources: z.array(apiSource).default([]),
});
export const deltaEvent = z.object({ text: z.string() });
export const doneEvent = z.object({
  userMessageId: z.string().nullish(),
  assistantMessageId: z.string().nullish(),
  citedIndexes: z.array(z.number()).nullish(),
  stopReason: z.string().nullish(),
});
export const errorEvent = z.object({ message: z.string() });

export function toCitation(s: ApiSource): Citation {
  const where = s.page ? ` p.${s.page}` : '';
  return {
    id: String(s.index),
    label: `${s.index} · ${s.title ?? 'Source'}${where}`,
    documentId: s.documentId ?? undefined,
    page: s.page ?? undefined,
    sectionId: s.sectionId ?? undefined,
  };
}

/** Only the sources the answer actually used, when the API says which. */
export const citedOnly = (sources: ApiSource[], cited?: number[] | null) =>
  (cited ? sources.filter((s) => cited.includes(s.index)) : sources).map(toCitation);

const apiMessage = z
  .object({
    id: z.string(),
    role: z.string(),
    content: z.string().nullish(),
    text: z.string().nullish(),
    sources: z.array(apiSource).nullish(),
    citedIndexes: z.array(z.number()).nullish(),
    feedback: z.object({ rating: z.string() }).nullish(),
  })
  .loose();

export const conversationDetail = z
  .object({
    id: z.string(),
    title: z.string().nullish(),
    machine: z.object({ id: z.string() }).loose().nullish(),
    messages: z.array(apiMessage).default([]),
  })
  .loose();

export function toChatMessages(messages: z.infer<typeof apiMessage>[]): ChatMessage[] {
  return messages.map((m): ChatMessage => {
    const text = m.content ?? m.text ?? '';
    if (m.role === 'user') return { id: m.id, role: 'user', text };
    const rating = m.feedback?.rating;
    return {
      id: m.id,
      role: 'assistant',
      text,
      messageId: m.id,
      citations: citedOnly(m.sources ?? [], m.citedIndexes),
      feedback: rating === 'helpful' || rating === 'wrong' ? rating : undefined,
    };
  });
}

const machineRef = z
  .object({
    id: z.string(),
    label: z.string().nullish(),
    fleetNumber: z.string().nullish(),
    serialNumber: z.string().nullish(),
  })
  .loose()
  .nullish();

export const conversationSummary = z.object({
  id: z.string(),
  title: z.string().nullish(),
  machine: machineRef,
  updatedAt: z.string(),
});

export const machineLabel = (m: z.infer<typeof machineRef>) =>
  m ? m.fleetNumber || m.label || m.serialNumber || undefined : undefined;
