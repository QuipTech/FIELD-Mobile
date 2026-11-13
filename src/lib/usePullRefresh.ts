import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import { useState } from 'react';

/** Pull to refresh: reloads every query under `key`, spinning until they've all come back. */
export function usePullRefresh(key: QueryKey) {
  const client = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await client.invalidateQueries({ queryKey: key });
    } finally {
      setRefreshing(false);
    }
  };
  return { refreshing, onRefresh: () => void onRefresh() };
}
