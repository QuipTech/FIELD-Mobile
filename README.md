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

| Setting               | Staging value                                                             |
| --------------------- | ------------------------------------------------------------------------- |
| API base URL          | `https://staging-api.quiptechfield.com.au`                                |
| Cognito region / pool | `ap-southeast-2` / `ap-southeast-2_bxjA9dw2z`                             |
| App client            | `7k0eurkl5j7fngo2kiuplj0jq6`                                              |
| Hosted UI             | `ap-southeast-2bxja9dw2z.auth.ap-southeast-2.amazoncognito.com`           |
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
