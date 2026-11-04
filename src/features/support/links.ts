import Constants from 'expo-constants';
import { Linking, Platform } from 'react-native';

import { toast } from '@/components/Toast/store';

export type LegalPage = 'privacyPolicy' | 'terms';
type SupportLinks = Partial<Record<LegalPage | 'appStore' | 'playStore', string>>;

export function supportUrl(key: keyof SupportLinks): string | undefined {
  const links = Constants.expoConfig?.extra?.supportLinks as SupportLinks | undefined;
  const value = links?.[key];
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

export async function openSupportUrl(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    toast.show('Couldn’t open this link. Please try again.');
  }
}

/** A user-initiated rating opens the listing, rather than a quota-limited review prompt. */
export async function rateApp() {
  const key = Platform.OS === 'ios' ? 'appStore' : Platform.OS === 'android' ? 'playStore' : null;
  const enabled = Constants.expoConfig?.extra?.supportLinks?.ratingsEnabled === true;
  const url = key && enabled ? supportUrl(key) : undefined;
  if (!url) {
    toast.show('Ratings will be available when FIELD is public on the app stores.');
    return;
  }
  const target = new URL(url);
  target.searchParams.set(
    Platform.OS === 'ios' ? 'action' : 'showAllReviews',
    Platform.OS === 'ios' ? 'write-review' : 'true',
  );
  await openSupportUrl(target.toString());
}
