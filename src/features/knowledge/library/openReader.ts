import { router } from 'expo-router';

/** Opens the reader; `sectionId` (a search hit) scrolls to and flashes that section. */
export const openReader = (id: string, sectionId?: string | null) =>
  router.push({
    pathname: '/knowledge/read/[id]',
    params: { id, ...(sectionId && { sectionId }) },
  });
