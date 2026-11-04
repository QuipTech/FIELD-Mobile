import { useQuery } from '@tanstack/react-query';
import { fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth';

import { useAccess } from './access';
import { getApiSession } from './apiSession';

export type CurrentUser = {
  /** Cognito `sub` — stable per user, safe for per-user device flags. */
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
};

async function loadCurrentUser(): Promise<CurrentUser> {
  const cognito = await Promise.all([getCurrentUser(), fetchUserAttributes()]).catch(() => null);
  if (!cognito) return apiUser(); // biometric sign-in: no Cognito session, only the API's
  const [{ userId }, attrs] = cognito;
  const email = attrs.email ?? '';
  const saved = (await getApiSession())?.user;
  const api = saved?.email === email ? saved : undefined;
  return {
    id: userId,
    email,
    // Google/Apple accounts may lack a name; fall back to the email's local part.
    firstName: api?.firstName ?? (attrs.given_name || email.split('@')[0] || ''),
    avatarUrl: api?.avatarUrl,
    lastName: api?.lastName ?? attrs.family_name ?? '',
  };
}

/** The user from the stored API session. */
async function apiUser(): Promise<CurrentUser> {
  const user = (await getApiSession())?.user;
  if (!user) throw new Error('Not signed in');
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName || user.email.split('@')[0] || '',
    lastName: user.lastName ?? '',
    avatarUrl: user.avatarUrl,
  };
}

/** The signed-in user's profile (cached for the session). */
export function useCurrentUser() {
  const profile = useAccess((s) => s.profile);
  const query = useQuery({
    queryKey: ['currentUser'],
    queryFn: loadCurrentUser,
    staleTime: Infinity,
  });
  return {
    ...query,
    data:
      query.data && profile
        ? {
            ...query.data,
            firstName: profile.firstName,
            lastName: profile.lastName,
            avatarUrl: profile.avatarUrl,
          }
        : query.data,
  };
}

export const initials = (user: Pick<CurrentUser, 'firstName' | 'lastName' | 'email'>) =>
  ((user.firstName[0] ?? '') + (user.lastName[0] ?? '')).toUpperCase() ||
  (user.email[0] ?? '?').toUpperCase();
