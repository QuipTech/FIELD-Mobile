import { AppState } from 'react-native';
import { z } from 'zod';
import { create } from 'zustand';

import { useSession } from '@/auth/session';
import { http } from '@/lib/http';

/**
 * What the organisation's plan includes, from `GET /organisation/entitlements`. Read after sign-in
 * and whenever the app returns to the foreground. Never hard-code what a plan includes: the API
 * also enforces each key (403 `feature_not_in_plan`).
 */

export type FeatureKey =
  'fleet.register' | 'org.users.unlimited' | 'whitelabel' | 'ai.assistant' | 'asset.history';

const entitlementList = z.array(
  z.object({ featureCode: z.string(), isActive: z.boolean().nullish() }).loose(),
);

/** Null until the first read. */
export const useEntitlements = create<{ features: ReadonlySet<string> | null }>(() => ({
  features: null,
}));

export async function refreshEntitlements(): Promise<void> {
  try {
    const rows = entitlementList.parse(await http.get('/organisation/entitlements'));
    const active = rows.filter((r) => r.isActive !== false).map((r) => r.featureCode);
    useEntitlements.setState({ features: new Set(active) });
  } catch {
    // Offline or unexpected shape: keep what we have.
  }
}

/**
 * True when the plan includes the feature. Also true before the first read, so nothing flickers
 * out on launch; the API still refuses what the plan lacks.
 */
export function useFeature(key: FeatureKey): boolean {
  return useEntitlements((s) => s.features === null || s.features.has(key));
}

/** Wires the refresh triggers. Call once from the root layout; returns cleanup. */
export function startEntitlementSync() {
  const whenSignedIn = () => {
    if (useSession.getState().status === 'signedIn') void refreshEntitlements();
  };
  const unsubSession = useSession.subscribe((s, prev) => {
    if (s.status === prev.status) return;
    if (s.status === 'signedIn') void refreshEntitlements();
    else useEntitlements.setState({ features: null });
  });
  const appState = AppState.addEventListener('change', (state) => {
    if (state === 'active') whenSignedIn();
  });
  whenSignedIn();
  return () => {
    unsubSession();
    appState.remove();
  };
}
