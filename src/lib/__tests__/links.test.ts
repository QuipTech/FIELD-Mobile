import { redirectSystemPath } from '@/app/+native-intent';
import { appPathFor, documentWebUrl } from '../links';

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
