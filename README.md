# QuipTech FIELD — mobile

Field-service app for heavy-equipment technicians. Expo SDK 57 · TypeScript · Expo Router · iOS + Android.
The backend (NestJS on AWS) is consumed only — this repo never defines or mocks it.

## Setup

```bash
npm install
cp .env.example .env        # optional overrides
```

Environment is chosen by `APP_ENV` (`development` | `staging` | `production`) and resolved in
[`app.config.js`](app.config.js) → `extra`, validated at startup by [`src/lib/env.ts`](src/lib/env.ts).

`development` and `staging` builds use the staging values; `production` uses the production values.

| Setting               | Staging                                                                   | Production                                             |
| --------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------ |
| API base URL          | `https://staging-api.quiptechfield.com.au`                                | `https://app-api.quiptechfield.com.au`                 |
| Web portal            | `https://staging.quiptechfield.com.au`                                    | `https://app.quiptechfield.com.au`                     |
| Cognito region / pool | `ap-southeast-2` / `ap-southeast-2_bxjA9dw2z`                             | `ap-southeast-2` / `ap-southeast-2_wKANhY7Gj`          |
| App client            | `7k0eurkl5j7fngo2kiuplj0jq6`                                              | `1jdchvunhr03hl5pll13od20k0`                           |
| Hosted UI             | `ap-southeast-2bxja9dw2z.auth.ap-southeast-2.amazoncognito.com`           | `quiptech-field.auth.ap-southeast-2.amazoncognito.com` |
| OAuth redirect        | `quiptechfield://auth/callback` (sign-out `quiptechfield://auth/signout`) |

## Run

The app uses native modules (Amplify, Apple/Google sign-in, push), so it needs a **development build** — not Expo Go.
EAS project: [`@uneebmalik99/quiptech-field`](https://expo.dev/accounts/uneebmalik99/projects/quiptech-field).

```bash
# Android — local (needs ~10 GB free disk, x86_64 emulator image on Intel Macs)
npx expo run:android

# iOS — cloud build (SDK 57 needs Xcode 26.4+ / macOS Tahoe to build locally)
npx eas-cli@latest device:create                                   # register your iPhone once
npx eas-cli@latest build --profile development --platform ios      # install via the QR/link it prints

npx expo start --dev-client                                        # then serve JS from this machine
```

EAS profiles (`eas.json`): `development`, `development-simulator`, `staging`, `production` — each sets `APP_ENV`.

## Quality gates

```bash
npm run verify              # typecheck + eslint + prettier + 200-line check + jest
npm run lines               # line-count table for all source files
```

Hard rules (enforced by ESLint + CI): every file ≤ 200 lines, functions ≤ 80 lines, no `any`,
route files in `src/app/` stay thin and compose `src/features/*` via their `index.ts`.

## Structure

```
src/app/         Expo Router routes (thin)
src/components/  UI primitives — Button, Input, Seg, Tag, Card, ListRow, Sheet, Toast, …
src/features/    one self-contained module per feature
src/lib/         http client, env, date/format/sanitize, network, query client
src/offline/     SQLite + outbox + sync (Step 5)
src/auth/        Amplify config + session (Step 2)
src/theme/       tokens.ts — the only place raw colours/sizes live
```

Build and release (EAS) instructions land in Step 8.

## Side menu links

The side drawer contains FAQs, support, account settings, legal pages, and a store-rating link.
Privacy Policy and Terms use the approved public website URLs by default. The Android listing
URL is configured, but ratings stay unavailable while the apps are in testing. Override the
destinations through these build environment variables:

- `EXPO_PUBLIC_PRIVACY_POLICY_URL`
- `EXPO_PUBLIC_TERMS_URL`
- `EXPO_PUBLIC_APP_STORE_URL` (the published iOS listing)
- `EXPO_PUBLIC_PLAY_STORE_URL` (defaults to `au.com.quiptechfield.field` on Google Play)
- `EXPO_PUBLIC_STORE_RATINGS_ENABLED=true` (enable only once the listings are public)

If a legal URL is unavailable, its page explains how to request a copy. Rate this app explains
that ratings become available after publication until ratings are enabled and a listing is set. No generated legal text or guessed store links are used.
The drawer wraps `(tabs)/(main)`; existing public route paths and the five-tab bar are unchanged.
