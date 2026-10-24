/**
 * Tagged diagnostic logs, e.g. `[sync] sent historyEntry …`. They show in the Metro terminal in
 * development and in `adb logcat -s ReactNativeJS` / the Xcode console on device builds.
 * Never pass tokens or other secrets.
 */
export function log(tag: string, message: string, data?: unknown) {
  // eslint-disable-next-line no-console
  if (data === undefined) console.log(`[${tag}] ${message}`);
  // eslint-disable-next-line no-console
  else console.log(`[${tag}] ${message}`, safeJson(data));
}

function safeJson(data: unknown): string {
  try {
    return JSON.stringify(data);
  } catch {
    return String(data);
  }
}
