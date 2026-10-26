import { appPathFor } from '@/lib/links';

/** Rewrites incoming links (web portal addresses) to app routes before Expo Router sees them. */
export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  try {
    return appPathFor(path);
  } catch {
    // Never crash on a malformed link; let the router show its not-found screen.
    return path;
  }
}
