import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import type {
  AiConversation,
  ReviewItem,
  ReviewReason,
  ReviewStatus,
} from '@/features/history/data';
import { http } from '@/lib/http';
import { conversationSummary, machineLabel } from './schema';

/** Ask AI history and the admin review queue (Backend API Reference §2). */

export const aiKeys = {
  conversations: ['ai', 'conversations'] as const,
  review: ['ai', 'review'] as const,
};

const list = <T extends z.ZodType>(item: T) =>
  z.union([z.array(item), z.object({ items: z.array(item) }).transform((r) => r.items)]);

/** The user's latest 50 threads. */
export function useAiConversations(enabled = true) {
  return useQuery({
    queryKey: aiKeys.conversations,
    enabled,
    queryFn: async () =>
      list(conversationSummary)
        .parse(await http.get('/ai/conversations'))
        .map((c): AiConversation => ({
          id: c.id,
          question: c.title || 'Untitled conversation',
          machine: machineLabel(c.machine),
          at: c.updatedAt,
        })),
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http.delete(`/ai/conversations/${encodeURIComponent(id)}`),
    onSettled: () => queryClient.invalidateQueries({ queryKey: aiKeys.conversations }),
  });
}

export function useClearConversations() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => http.delete('/ai/conversations'),
    onMutate: () => queryClient.setQueryData(aiKeys.conversations, []),
    onSettled: () => queryClient.invalidateQueries({ queryKey: aiKeys.conversations }),
  });
}

const apiReviewItem = z
  .object({
    id: z.string(),
    status: z.string(),
    reason: z.string().nullish(),
    question: z.string().nullish(),
    title: z.string().nullish(),
    user: z.object({ name: z.string().nullish(), email: z.string().nullish() }).loose().nullish(),
    machine: z
      .object({ fleetNumber: z.string().nullish(), label: z.string().nullish() })
      .loose()
      .nullish(),
    reviewer: z.object({ name: z.string().nullish() }).loose().nullish(),
  })
  .loose();

const REASON: Record<string, ReviewReason> = {
  safety: 'safety',
  safety_refusal: 'safety',
  no_source: 'noSource',
  marked_wrong: 'markedWrong',
  wrong: 'markedWrong',
  user_feedback: 'markedWrong',
  low_confidence: 'lowConfidence',
};
const STATUS: Record<string, ReviewStatus> = {
  unreviewed: 'unreviewed',
  in_review: 'inReview',
  escalated: 'escalated',
  resolved: 'resolved',
};
export const API_STATUS: Record<ReviewStatus, string> = {
  unreviewed: 'unreviewed',
  inReview: 'in_review',
  escalated: 'escalated',
  resolved: 'resolved',
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase();

/** Platform admins: answers flagged for review. */
export function useReviewQueue(enabled: boolean) {
  return useQuery({
    queryKey: aiKeys.review,
    enabled,
    queryFn: async () =>
      list(apiReviewItem)
        .parse(await http.get('/admin/ai/reviewQueue', { query: { pageSize: 100 } }))
        .map((r): ReviewItem => ({
          id: r.id,
          title: r.question || r.title || 'Flagged answer',
          reason: REASON[r.reason ?? ''] ?? 'markedWrong',
          author: r.user?.name || r.user?.email || '',
          machineId: r.machine?.fleetNumber || r.machine?.label || '',
          status: STATUS[r.status] ?? 'unreviewed',
          reviewer: r.reviewer?.name ? initials(r.reviewer.name) : undefined,
        })),
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: ReviewStatus; notes?: string }) =>
      http.patch(`/admin/ai/reviewQueue/${encodeURIComponent(id)}`, {
        status: API_STATUS[status],
        ...(notes && { notes }),
      }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: aiKeys.review }),
  });
}
