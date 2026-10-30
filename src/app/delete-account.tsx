import { useMutation, useQuery } from '@tanstack/react-query';

import {
  deleteAccount,
  deletionEligibilityKey,
  fetchDeletionEligibility,
} from '@/auth/accountDeletion';
import { useCurrentUser } from '@/auth/useCurrentUser';
import { toast } from '@/components';
import { DeleteAccount } from '@/features/me/DeleteAccount';
import { ApiError, errorMessage } from '@/lib/http';
import { useOutbox } from '@/offline/outbox';

// A 503 means the sign-in couldn't be removed and nothing was deleted: the API's own words say so.
const deleteError = (error: unknown) =>
  error instanceof ApiError && error.status === 503 ? error.message : errorMessage(error);

/** Me → Delete account (also linked from the Payment required popup). */
export default function DeleteAccountRoute() {
  const { data: user } = useCurrentUser();
  const pendingChanges = useOutbox((s) => s.items.length);
  const eligibility = useQuery({
    queryKey: deletionEligibilityKey,
    staleTime: 0,
    queryFn: fetchDeletionEligibility,
  });
  const remove = useMutation({
    mutationFn: () => deleteAccount(user?.email ?? ''),
    // Signed out by now: the session gate has already moved to sign-in.
    onSuccess: () => toast.success('Your account has been deleted.'),
  });

  return (
    <DeleteAccount
      eligibility={eligibility.data}
      loadError={eligibility.error}
      onRetryLoad={() => eligibility.refetch()}
      pendingChanges={pendingChanges}
      deleting={remove.isPending}
      error={remove.error ? deleteError(remove.error) : undefined}
      onDelete={() => remove.mutate()}
    />
  );
}
