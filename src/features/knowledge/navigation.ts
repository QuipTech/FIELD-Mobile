import { router } from 'expo-router';

/** Opens the document viewer, optionally at a page and cited section (AI citations). */
export function openDoc(id: string, page?: number, section?: string) {
  router.push({
    pathname: '/document/[id]',
    params: { id, ...(page && { page: String(page) }), ...(section && { section }) },
  });
}
