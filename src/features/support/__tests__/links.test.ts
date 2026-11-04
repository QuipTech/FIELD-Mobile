import Constants from 'expo-constants';
import { Linking, Platform } from 'react-native';

import { toast } from '@/components/Toast/store';
import { openSupportUrl, rateApp, supportUrl } from '../links';

jest.mock('expo-constants', () => ({ expoConfig: { extra: { supportLinks: {} } } }));

const links = Constants.expoConfig!.extra!.supportLinks;
const originalPlatform = Platform.OS;

beforeEach(() => {
  jest.clearAllMocks();
  Object.keys(links).forEach((key) => delete links[key]);
  jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  jest.spyOn(toast, 'show').mockImplementation(() => undefined);
});
afterEach(() => {
  jest.restoreAllMocks();
  Object.defineProperty(Platform, 'OS', { value: originalPlatform });
});

it('opens the configured policy and rejects missing or invalid destinations', async () => {
  expect(supportUrl('privacyPolicy')).toBeUndefined();
  links.privacyPolicy = 'not a url';
  expect(supportUrl('privacyPolicy')).toBeUndefined();
  links.privacyPolicy = 'javascript:alert(1)';
  expect(supportUrl('privacyPolicy')).toBeUndefined();
  links.privacyPolicy = 'https://www.quiptechfield.com.au/privacy';
  await openSupportUrl(supportUrl('privacyPolicy')!);
  expect(Linking.openURL).toHaveBeenCalledWith(links.privacyPolicy);
});

it('keeps ratings unavailable while the app is in testing', async () => {
  links.playStore = 'https://play.google.com/store/apps/details?id=au.com.quiptechfield.field';
  await rateApp();
  expect(Linking.openURL).not.toHaveBeenCalled();
  expect(toast.show).toHaveBeenCalledWith(expect.stringContaining('public'));
});

it.each([
  [
    'android',
    'playStore',
    'https://play.google.com/store/apps/details?id=au.com.quiptechfield.field',
    'showAllReviews=true',
  ],
  ['ios', 'appStore', 'https://apps.apple.com/app/id123456789', 'action=write-review'],
])(
  'opens the published %s listing for a user-initiated rating',
  async (platform, key, url, query) => {
    Object.defineProperty(Platform, 'OS', { value: platform });
    links.ratingsEnabled = true;
    links[key] = url;
    await rateApp();
    expect(Linking.openURL).toHaveBeenCalledWith(expect.stringContaining(query));
  },
);

it('handles a browser failure without an unhandled rejection', async () => {
  jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('No browser'));
  await openSupportUrl('https://www.quiptechfield.com.au/terms');
  expect(toast.show).toHaveBeenCalledWith(expect.stringContaining('Couldn’t open'));
});
