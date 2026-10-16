/**
 * Bridge between the HTTP client and the auth module (wired in Step 2).
 * Keeps src/lib free of any dependency on Amplify.
 */
export type TokenProvider = {
  /** Current token, or null when signed out. */
  getToken: () => Promise<string | null>;
  /** Force a refresh; resolves to the new token or null if the session is gone. */
  refreshToken: () => Promise<string | null>;
  /** Called when a refreshed token is still rejected — session is dead. */
  onSessionExpired: () => void;
};

let provider: TokenProvider | null = null;
let inflightRefresh: Promise<string | null> | null = null;

export function setTokenProvider(next: TokenProvider | null): void {
  provider = next;
}

export function getToken(): Promise<string | null> {
  return provider ? provider.getToken() : Promise.resolve(null);
}

/** De-duplicates concurrent refreshes so a burst of 401s triggers one refresh. */
export function refreshToken(): Promise<string | null> {
  if (!provider) return Promise.resolve(null);
  if (!inflightRefresh) {
    inflightRefresh = provider.refreshToken().finally(() => {
      inflightRefresh = null;
    });
  }
  return inflightRefresh;
}

export function notifySessionExpired(): void {
  provider?.onSessionExpired();
}
