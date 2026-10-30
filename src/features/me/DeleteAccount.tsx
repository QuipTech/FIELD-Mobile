import { Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import type { DeletionEligibility } from '@/auth/accountDeletion';
import { Button } from '@/components/Button/Button';
import { DetailScreen } from '@/components/DetailScreen/DetailScreen';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { Input } from '@/components/Input/Input';
import { Skeleton } from '@/components/Skeleton/Skeleton';
import { Text } from '@/components/Text/Text';
import { colors } from '@/theme';
import { styles } from './styles';

/** Typed to confirm, as on the portal. */
export const CONFIRMATION_WORD = 'DELETE';

export type DeleteAccountProps = {
  /** Undefined while it loads (or when it couldn't be read: see `loadError`). */
  eligibility?: DeletionEligibility;
  loadError?: unknown;
  onRetryLoad: () => void;
  /** Changes still waiting to upload; deleting drops them. */
  pendingChanges: number;
  deleting: boolean;
  /** Why the last attempt failed; nothing was deleted, so it's safe to try again. */
  error?: string;
  onDelete: () => void;
};

/** Me → Delete account: what goes, what stays, and a typed confirmation. */
export function DeleteAccount({
  eligibility,
  loadError,
  onRetryLoad,
  pendingChanges,
  deleting,
  error,
  onDelete,
}: DeleteAccountProps) {
  const [typed, setTyped] = useState('');
  const confirmed = typed.trim().toUpperCase() === CONFIRMATION_WORD;

  return (
    <DetailScreen>
      <WhatHappens pendingChanges={pendingChanges} />

      {eligibility ? (
        eligibility.canDelete ? (
          <View style={styles.card}>
            <Input
              label={`Type ${CONFIRMATION_WORD} to confirm`}
              value={typed}
              onChangeText={setTyped}
              autoCapitalize="characters"
              autoCorrect={false}
              autoComplete="off"
              editable={!deleting}
            />
            {error && (
              <Text variant="caption" color="danger" accessibilityLiveRegion="polite">
                {error}
              </Text>
            )}
            <Button
              label="Delete account"
              variant="danger"
              onPress={onDelete}
              disabled={!confirmed}
              loading={deleting}
            />
          </View>
        ) : (
          <View style={styles.card} accessibilityRole="alert">
            <Text style={styles.cardTitle}>You can&apos;t delete this account yet</Text>
            <Text color="inkMuted">{eligibility.blockedReason}</Text>
          </View>
        )
      ) : loadError ? (
        <ErrorState error={loadError} onRetry={onRetryLoad} />
      ) : (
        <View style={styles.card} accessibilityLabel="Loading">
          <Skeleton width="60%" />
          <Skeleton height={48} />
        </View>
      )}
    </DetailScreen>
  );
}

/** What goes, what stays, and any uploads that would be lost. */
function WhatHappens({ pendingChanges }: { pendingChanges: number }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={[styles.iconBox, styles.iconBoxLarge, { backgroundColor: colors.dangerTint }]}>
          <Trash2 size={20} color={colors.danger} strokeWidth={2} />
        </View>
        <Text style={[styles.cardTitle, styles.cardText]} accessibilityRole="header">
          Delete your account?
        </Text>
      </View>
      <Text color="inkMuted">
        This permanently removes your profile, sign-in and AI conversations, and signs you out. It
        can&apos;t be undone.
      </Text>
      <Text variant="caption" color="inkMuted">
        Asset and configuration records belong to your company&apos;s CMDB and are kept, no longer
        linked to you.
      </Text>
      {pendingChanges > 0 && (
        <Text variant="caption" color="amber">
          {pendingChanges} change{pendingChanges === 1 ? '' : 's'} on this phone
          {pendingChanges === 1 ? " hasn't" : " haven't"} uploaded yet and will be lost.
        </Text>
      )}
    </View>
  );
}
