import { useAccess } from '@/auth/access';
import { useOfflineLibrary } from '@/features/knowledge/offlineStore';
import { usePendingCount } from '@/offline/outbox';
import { useSubscription } from './api';
import type { MeData } from './data';

const LANGUAGES: Record<string, string> = {
  en: 'English',
  'en-AU': 'English (Australia)',
  'en-US': 'English (US)',
  'en-GB': 'English (UK)',
};

export const LANGUAGE_CODES = Object.keys(LANGUAGES);

export const languageName = (code: string | null | undefined) =>
  code ? (LANGUAGES[code] ?? code) : 'English';

/** Profile tab data: site and language from `/auth/me`, the plan, and this device's offline state. */
export function useMeData(): { data: MeData; plan: ReturnType<typeof useSubscription> } {
  const profile = useAccess((s) => s.profile);
  const offlineDocs = useOfflineLibrary((s) => s.docs.length);
  const pendingSync = usePendingCount();
  const plan = useSubscription();
  return {
    plan,
    data: {
      site: profile?.site ?? '',
      plan: plan.data,
      offlineDocs,
      pendingSync,
      language: languageName(profile?.language),
    },
  };
}
