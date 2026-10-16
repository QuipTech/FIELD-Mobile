import { useQuery } from '@tanstack/react-query';
import { fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth';

export type CurrentUser = {
  /** Cognito `sub` — stable per user, safe for per-user device flags. */
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

async function loadCurrentUser(): Promise<CurrentUser> {
  const [{ userId }, attrs] = await Promise.all([getCurrentUser(), fetchUserAttributes()]);
  const email = attrs.email ?? '';
  return {
    id: userId,
    email,
    // Google/Apple accounts may lack a name; fall back to the email's local part.
    firstName: attrs.given_name || email.split('@')[0] || '',
    lastName: attrs.family_name ?? '',
  };
}

/** The signed-in Cognito user's profile (cached for the session). */
export function useCurrentUser() {
  return useQuery({ queryKey: ['currentUser'], queryFn: loadCurrentUser, staleTime: Infinity });
}

export const initials = (user: Pick<CurrentUser, 'firstName' | 'lastName' | 'email'>) =>
  ((user.firstName[0] ?? '') + (user.lastName[0] ?? '')).toUpperCase() ||
  (user.email[0] ?? '?').toUpperCase();
