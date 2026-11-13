import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { env } from './env';
import { getToken } from './http/auth';

/**
 * Opens a page (a signed file URL, a hosted invoice) in the in-app browser: a page sheet on iOS,
 * a Custom Tab on Android. Resolves when the user closes it.
 */
export async function openInAppBrowser(url: string): Promise<void> {
  await WebBrowser.openBrowserAsync(url, {
    presentationStyle: 'pageSheet' as WebBrowser.WebBrowserPresentationStyle,
  });
}

/** Characters iOS and Android file systems won't take in a name. */
const safeName = (name: string) => name.replace(/[\\/:*?"<>|\n\r]+/g, '_').slice(0, 120) || 'file';

type DownloadOptions = {
  /** Saved under this name; omitted → taken from Content-Disposition or the URL. */
  fileName?: string;
  /** Send the signed-in user's bearer token (API endpoints; not signed storage URLs). */
  auth?: boolean;
  mimeType?: string;
  /** 0–1 while downloading (when the server sends a length). */
  onProgress?: (fraction: number) => void;
};

/**
 * Downloads to the cache and opens the share sheet (save to Files, AirDrop, email…). Each call
 * downloads again: signed URLs expire after 15 minutes, so nothing is reused.
 */
export async function downloadAndShare(url: string, options: DownloadOptions = {}) {
  const dir = new Directory(Paths.cache, 'downloads', String(Date.now()));
  dir.create({ intermediates: true, idempotent: true });
  const token = options.auth ? await getToken() : null;
  const absolute = url.startsWith('http') ? url : `${env.apiBaseUrl}${url}`;
  const destination = options.fileName ? new File(dir, safeName(options.fileName)) : dir;
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const { onProgress } = options;
  const file = onProgress
    ? await File.createDownloadTask(absolute, destination, {
        headers,
        onProgress: ({ bytesWritten, totalBytes }) => {
          if (totalBytes > 0) onProgress(Math.min(1, bytesWritten / totalBytes));
        },
      }).downloadAsync()
    : await File.downloadFileAsync(absolute, destination, { idempotent: true, headers });
  if (!file) throw new Error('The download was interrupted.');
  if (!(await Sharing.isAvailableAsync()))
    throw new Error("Sharing isn't available on this device.");
  await Sharing.shareAsync(file.uri, {
    mimeType: options.mimeType ?? file.type ?? undefined,
    ...(Platform.OS === 'ios' &&
      options.mimeType === 'application/pdf' && { UTI: 'com.adobe.pdf' }),
  });
}
