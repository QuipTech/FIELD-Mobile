import { toast } from '@/components';
import { authErrorMessage } from './errors';

/** Runs an auth action, showing a friendly error toast if Cognito rejects it. */
export async function runAuth(action: () => Promise<void>) {
  try {
    await action();
  } catch (error) {
    toast.error(authErrorMessage(error));
  }
}
