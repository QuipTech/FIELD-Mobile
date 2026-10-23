import { pickLocale } from '../voiceLocale';

const IOS = ['en-AU', 'en-GB', 'en-IN', 'en-US', 'ur-PK', 'fr-FR', 'fr-CA'];

describe('pickLocale', () => {
  it('uses the phone locale when the recogniser has it', () => {
    expect(pickLocale('en-AU', IOS)).toBe('en-AU');
    expect(pickLocale('en_au', IOS)).toBe('en-AU');
  });

  it('falls back to US English for an English region it lacks', () => {
    expect(pickLocale('en-PK', IOS)).toBe('en-US');
  });

  it('keeps the language when it can, e.g. French from Belgium', () => {
    expect(pickLocale('fr-BE', IOS)).toBe('fr-FR');
  });

  it('uses US English for a language it has no model for', () => {
    expect(pickLocale('xx-YY', IOS)).toBe('en-US');
  });

  it('passes the locale through when there is no list to check (Android 12-)', () => {
    expect(pickLocale('en-PK', [])).toBe('en-PK');
  });
});
