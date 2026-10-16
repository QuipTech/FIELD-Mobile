import { Redirect, router } from 'expo-router';
import { useEffect } from 'react';

import { useSession } from '@/auth/session';

/**
 * Landing for quiptechfield://auth/callback and /auth/signout. Amplify's browser session reads
 * the URL and finishes sign-in or sign-out itself, so this just steps out of the way: back to
 * the screen underneath, where the session gate then routes signed-in or signed-out.
 */
export default function AuthRedirectRoute() {
  const signedIn = useSession((s) => s.status === 'signedIn');
  const canGoBack = router.canGoBack();
  useEffect(() => {
    if (canGoBack) router.back();
  }, [canGoBack]);
  if (canGoBack) return null;
  // Opened cold (nothing underneath): go straight to a real screen, never back through `/`.
  return <Redirect href={signedIn ? '/' : '/sign-in'} />;
}
