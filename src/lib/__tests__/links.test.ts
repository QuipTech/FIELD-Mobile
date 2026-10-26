import { redirectSystemPath } from '@/app/+native-intent';
import { appPathFor, documentWebUrl, notificationRoute } from '../links';

const ID = '9ae726fc-3481-4662-b0bf-6cc651cbaff2';

describe('document links', () => {
  it('shares the portal address for a document page', () => {
    expect(documentWebUrl('https://staging.quiptechfield.com.au', ID, 3)).toBe(
      `https://staging.quiptechfield.com.au/knowledge/${ID}?page=3`,
    );
  });

  it('opens a portal document link on the app’s document screen', () => {
    expect(appPathFor(`https://staging.quiptechfield.com.au/knowledge/${ID}?page=1`)).toBe(
      `/document/${ID}?page=1`,
    );
    expect(appPathFor(`/knowledge/${ID}/`)).toBe(`/document/${ID}`);
    expect(appPathFor(`knowledge/${ID.toUpperCase()}?page=2#top`)).toBe(
      `/document/${ID.toUpperCase()}?page=2`,
    );
  });

  it('leaves every other link alone', () => {
    for (const path of [
      `quiptechfield:///document/${ID}?page=1`,
      '/knowledge',
      '/knowledge/brand/cat',
      `/knowledge/${ID}/edit`,
      '/machine/HT-2201',
      'not a url',
    ]) {
      expect(appPathFor(path)).toBe(path);
      expect(redirectSystemPath({ path, initial: true })).toBe(path);
    }
  });
});

describe('notification links', () => {
  it('maps portal paths to app screens', () => {
    expect(notificationRoute('/cases/1042')).toBe('/case/1042');
    expect(notificationRoute('https://staging.quiptechfield.com.au/machines/HT-2201/')).toBe(
      '/machine/HT-2201',
    );
    expect(notificationRoute('/ai-reviews/r1?tab=answer')).toBe('/ai-review/r1');
    expect(notificationRoute(`/knowledge/${ID}`)).toBe(`/document/${ID}`);
  });

  it('returns null when the app has no screen for it', () => {
    for (const link of [undefined, null, '', '/settings', '/cases', '/cases/1042/edit']) {
      expect(notificationRoute(link)).toBeNull();
    }
  });
});
