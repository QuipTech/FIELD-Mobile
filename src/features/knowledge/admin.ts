import { useMutation, useQueryClient } from '@tanstack/react-query';

import { http } from '@/lib/http';
import { knowledgeKeys } from './api';

type Action = 'approve' | 'archive' | 'delete';

/** Knowledge admin actions on one document. Approving needs the platform admin role. */
export function useDocAdminAction(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (action: Action) => {
      const doc = encodeURIComponent(id);
      if (action === 'delete') return http.delete(`/documents/${doc}`);
      return http.post(`/admin/knowledge/documents/${doc}/${action}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: knowledgeKeys.all }),
  });
}
