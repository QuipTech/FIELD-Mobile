import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError, errorMessage, http, NetworkError } from '@/lib/http';
import { postEventStream, type SseEvent } from '@/lib/http/sse';
import { aiKeys } from './api';
import type { AskImage } from './attachImage';
import type { ChatMessage, Feedback } from './data';
import {
  citedOnly,
  conversationDetail,
  deltaEvent,
  doneEvent,
  errorEvent,
  startEvent,
  toChatMessages,
  type ApiSource,
} from './schema';
import { aiUsageKey } from './usage';

export type AskScope = { machineId?: string; documentId?: string; brandId?: string };

type Assistant = Extract<ChatMessage, { role: 'assistant' }>;

type Patch = (m: Assistant) => Partial<Assistant>;

/** `machineId` only starts a thread; a document or brand scopes just this question. */
const askBody = (question: string, conversationId: string | undefined, scope: AskScope) => ({
  question,
  ...(conversationId ? { conversationId } : scope.machineId && { machineId: scope.machineId }),
  ...(scope.documentId && { documentId: scope.documentId }),
  ...(scope.brandId && { brandId: scope.brandId }),
});

/** Applies `start` / `delta` / `done` to the answer; an `error` event throws. */
function streamHandler(onConversation: (id: string) => void, patch: (p: Patch) => void) {
  let sources: ApiSource[] = [];
  return ({ event, data }: SseEvent) => {
    const json: unknown = JSON.parse(data);
    if (event === 'start') {
      const s = startEvent.parse(json);
      sources = s.sources;
      onConversation(s.conversationId);
    } else if (event === 'delta') {
      const { text } = deltaEvent.parse(json);
      patch((m) => ({ text: m.text + text }));
    } else if (event === 'done') {
      const d = doneEvent.parse(json);
      patch(() => ({
        streaming: false,
        messageId: d.assistantMessageId ?? undefined,
        citations: citedOnly(sources, d.citedIndexes),
      }));
    } else if (event === 'error') {
      throw new Error(errorEvent.parse(json).message);
    }
  };
}

const failureText = (error: unknown) =>
  error instanceof ApiError || error instanceof NetworkError || !(error instanceof Error)
    ? errorMessage(error)
    : error.message; // an `error` event from the stream

/**
 * One Ask AI thread. Questions stream their answers (`POST /ai/ask`): the reply grows as
 * `delta` events arrive and gets its sources and message id on `done`.
 */
export function useAskAi() {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string>();
  const [busy, setBusy] = useState(false);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => () => abort.current?.abort(), []);

  const patchAnswer = (id: string, patch: Patch) =>
    setMessages((all) =>
      all.map((m) => (m.id === id && m.role === 'assistant' ? { ...m, ...patch(m) } : m)),
    );

  const send = useCallback(
    async (question: string, scope: AskScope = {}, image?: AskImage) => {
      const at = Date.now();
      const answerId = `a-${at}`;
      setMessages((m) => [
        ...m,
        { id: `u-${at}`, role: 'user', text: question, imageUri: image?.uri },
        { id: answerId, role: 'assistant', text: '', citations: [], streaming: true },
      ]);
      setBusy(true);
      abort.current = new AbortController();
      const onEvent = streamHandler(setConversationId, (patch) => patchAnswer(answerId, patch));
      try {
        const body = {
          ...askBody(question, conversationId, scope),
          ...(image && { image: { mediaType: image.mediaType, data: image.data } }),
        };
        await postEventStream('/ai/ask', body, onEvent, abort.current.signal);
      } catch (error) {
        if (abort.current?.signal.aborted) return;
        const text = failureText(error);
        setMessages((m) => [
          ...m.filter((x) => !(x.id === answerId && x.role === 'assistant' && !x.text)),
          { id: `n-${at}`, role: 'notice', text },
        ]);
      } finally {
        patchAnswer(answerId, () => ({ streaming: false }));
        setBusy(false);
        queryClient.invalidateQueries({ queryKey: aiKeys.conversations });
        queryClient.invalidateQueries({ queryKey: aiUsageKey });
      }
    },
    [conversationId, queryClient],
  );

  const newChat = useCallback(() => {
    abort.current?.abort();
    setMessages([]);
    setConversationId(undefined);
  }, []);

  /** Reopens a past conversation from AI history. */
  const open = useCallback(async (id: string) => {
    abort.current?.abort();
    const detail = conversationDetail.parse(
      await http.get(`/ai/conversations/${encodeURIComponent(id)}`),
    );
    setConversationId(detail.id);
    setMessages(toChatMessages(detail.messages));
    return detail;
  }, []);

  const rate = useCallback(async (messageId: string, rating: Feedback, comment?: string) => {
    await http.post(`/ai/messages/${encodeURIComponent(messageId)}/feedback`, {
      rating,
      ...(comment && { comment }),
    });
    setMessages((all) =>
      all.map((m) =>
        m.role === 'assistant' && m.messageId === messageId ? { ...m, feedback: rating } : m,
      ),
    );
  }, []);

  return { messages, conversationId, busy, send, newChat, open, rate };
}
