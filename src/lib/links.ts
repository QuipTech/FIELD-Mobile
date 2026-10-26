/**
 * Links shared out of the app use the web portal's https addresses, so they're tappable in any
 * chat or email and open in the browser when the app isn't installed. With the app installed,
 * Universal Links / App Links open it instead, and `appPathFor` maps the portal path to ours.
 */

const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
// Optional scheme + host, then /knowledge/<uuid>, then an optional query (fragment dropped).
const PORTAL_DOCUMENT = new RegExp(
  `^(?:[a-z][\\w+.-]*://[^/?#]*)?/?knowledge/(${UUID})/?(\\?[^#]*)?(?:#.*)?$`,
  'i',
);

/** The portal's address for a knowledge document page. */
export function documentWebUrl(webUrl: string, id: string, page: number): string {
  return `${webUrl}/knowledge/${encodeURIComponent(id)}?page=${page}`;
}

/** App route for an incoming link: a portal document becomes `/document/<id>`; others pass through. */
export function appPathFor(path: string): string {
  const match = PORTAL_DOCUMENT.exec(path.trim());
  if (!match) return path;
  return `/document/${match[1]}${match[2] ?? ''}`;
}

// Portal pages a notification `link` can point at, and the app screens that show them.
const PORTAL_ROUTES: [RegExp, (id: string) => string][] = [
  [/^\/cases\/([^/?#]+)\/?(?:[?#].*)?$/, (id) => `/case/${id}`],
  [/^\/machines\/([^/?#]+)\/?(?:[?#].*)?$/, (id) => `/machine/${id}`],
  [/^\/ai-reviews?\/([^/?#]+)\/?(?:[?#].*)?$/, (id) => `/ai-review/${id}`],
];

/**
 * App route for a notification's portal `link` (e.g. `/cases/1042` → `/case/1042`); null when
 * the app has no screen for it, so the caller can fall back to the notification list.
 */
export function notificationRoute(link: string | null | undefined): string | null {
  if (!link) return null;
  const document = appPathFor(link);
  if (document.startsWith('/document/')) return document;
  const path = link.trim().replace(/^[a-z][\w+.-]*:\/\/[^/?#]*/i, '');
  for (const [pattern, route] of PORTAL_ROUTES) {
    const match = pattern.exec(path);
    if (match) return route(match[1]!);
  }
  return null;
}
