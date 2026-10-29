import { router } from 'expo-router';
import { Alert } from 'react-native';

import { ApiError } from '@/lib/http';
import { queryClient } from '@/lib/queryClient';
import { refreshEntitlements } from './entitlements';

/**
 * Any request refused with 403 `feature_not_in_plan` gets one upgrade prompt that links to
 * Billing. (`account_suspended` needs no prompt: `errorMessage` explains it wherever the request
 * failed.)
 */

export const FEATURE_NOT_IN_PLAN = 'feature_not_in_plan';

const PROMPT_GAP_MS = 5_000;
let lastPrompt = 0;

export function showUpgradePrompt(message?: string) {
  if (Date.now() - lastPrompt < PROMPT_GAP_MS) return;
  lastPrompt = Date.now();
  Alert.alert(
    'Not included in your plan',
    message || "Your organisation's plan doesn't include this feature.",
    [
      { text: 'Not now', style: 'cancel' },
      { text: 'View billing', onPress: () => router.push('/billing') },
    ],
  );
}

/** For requests outside React Query (e.g. Ask AI's stream); queries and mutations are watched. */
export function handlePlanError(error: unknown) {
  if (!(error instanceof ApiError) || error.code !== FEATURE_NOT_IN_PLAN) return;
  showUpgradePrompt(error.message);
  // The plan may have changed since the last read.
  void refreshEntitlements();
}

/** Watches every query and mutation. Call once from the root layout; returns cleanup. */
export function startPlanErrorPrompts() {
  const unsubQueries = queryClient.getQueryCache().subscribe((event) => {
    if (event.type === 'updated' && event.action.type === 'error')
      handlePlanError(event.action.error);
  });
  const unsubMutations = queryClient.getMutationCache().subscribe((event) => {
    if (event.type === 'updated' && event.action.type === 'error')
      handlePlanError(event.action.error);
  });
  return () => {
    unsubQueries();
    unsubMutations();
  };
}
