// Plain JS (not TS) so every tool — including EAS CLI on Node 20 — can load it.
const fs = require('fs');

/** @typedef {'development' | 'staging' | 'production'} AppEnv */
/**
 * @typedef {{ apiBaseUrl: string, wsUrl: string, webUrl: string, cognito: { region: string, userPoolId: string,
 *   userPoolClientId: string, hostedUiDomain: string } }} EnvConfig
 */

// Cognito IDs and API URLs are public client config, not secrets.
/** @type {EnvConfig} */
const STAGING = {
  apiBaseUrl: 'https://staging-api.quiptechfield.com.au',
  wsUrl: '',
  // Web portal: shared links point here and open the app via Universal Links / App Links.
  webUrl: 'https://staging.quiptechfield.com.au',
  cognito: {
    region: 'ap-southeast-2',
    userPoolId: 'ap-southeast-2_bxjA9dw2z',
    userPoolClientId: '7k0eurkl5j7fngo2kiuplj0jq6',
    hostedUiDomain: 'ap-southeast-2bxja9dw2z.auth.ap-southeast-2.amazoncognito.com',
  },
};

/** @type {Record<AppEnv, EnvConfig>} */
const ENVIRONMENTS = {
  development: STAGING,
  staging: STAGING,
  // Deliberately staging: every build, including production, talks to the staging API.
  production: STAGING,
};

const SCHEME = 'quiptechfield';
const EAS_PROJECT_ID = '0d1bab1e-7439-4c09-b7a9-b2b4e2b1ab1a';
const BASE_ID = 'au.com.quiptechfield.field';
// Bare workflow (android/ exists) disallows runtimeVersion policies; keep this equal to the app version.
const APP_VERSION = '1.0.0';
const FACE_ID_PERMISSION = 'Allow $(PRODUCT_NAME) to use Face ID to sign you in.';
/**
 * How technicians pay their personal monthly fee. 'in-app' opens the Stripe invoice in an in-app
 * browser; 'web' shows the status only and asks them to pay on the web portal. iOS stays on 'web'
 * until the App Store question is settled: Apple may require in-app purchase for a personal
 * subscription paid inside the app (organisation billing is fine).
 */
const PERSONAL_CHECKOUT = { ios: 'web', android: 'in-app' };
const MICROPHONE_PERMISSION =
  'Allow $(PRODUCT_NAME) to use the microphone so you can ask AI by voice.';

/** Native permissions and their prompts (the same in every environment). */
const PERMISSION_PLUGINS = [
  // Both set NSFaceIDUsageDescription; keep the wording identical.
  ['expo-secure-store', { faceIDPermission: FACE_ID_PERMISSION }],
  ['expo-local-authentication', { faceIDPermission: FACE_ID_PERMISSION }],
  'expo-font',
  [
    'expo-camera',
    {
      cameraPermission:
        'Allow $(PRODUCT_NAME) to use the camera to scan asset tags and photograph machines.',
      // Photos only; no video recording. (Voice questions add the microphone themselves.)
      recordAudioAndroid: false,
    },
  ],
  [
    'expo-image-picker',
    {
      photosPermission: 'Allow $(PRODUCT_NAME) to attach photos to your Ask AI questions.',
      cameraPermission:
        'Allow $(PRODUCT_NAME) to use the camera to scan asset tags and photograph machines.',
      // Not `false`: that blocks RECORD_AUDIO on Android, which voice questions need.
      microphonePermission: MICROPHONE_PERMISSION,
    },
  ],
  [
    'expo-speech-recognition',
    {
      microphonePermission: MICROPHONE_PERMISSION,
      speechRecognitionPermission:
        'Allow $(PRODUCT_NAME) to turn your speech into text for Ask AI questions.',
    },
  ],
];

/**
 * Firebase config for Android push (FCM). Not committed: EAS builds get it from the
 * GOOGLE_SERVICES_JSON file env var; local builds read ./google-services.json when present.
 * Without it the app still builds, but Android can't get a push token.
 */
function googleServicesFile() {
  if (process.env.GOOGLE_SERVICES_JSON) return process.env.GOOGLE_SERVICES_JSON;
  return fs.existsSync('./google-services.json') ? './google-services.json' : undefined;
}

/** @returns {AppEnv} */
function resolveEnv() {
  const value = process.env.APP_ENV;
  return value === 'staging' || value === 'production' ? value : 'development';
}

/** @param {import('expo/config').ConfigContext} ctx @returns {import('expo/config').ExpoConfig} */
module.exports = ({ config }) => {
  const appEnv = resolveEnv();
  const env = ENVIRONMENTS[appEnv];
  const suffix = appEnv === 'production' ? '' : `.${appEnv === 'development' ? 'dev' : 'staging'}`;
  const webHost = new URL(env.webUrl).host;
  const nameSuffix =
    appEnv === 'production' ? '' : ` (${appEnv === 'development' ? 'Dev' : 'Staging'})`;

  return {
    ...config,
    name: `QuipTech FIELD${nameSuffix}`,
    slug: 'quiptech-field',
    owner: 'uneebmalik99',
    scheme: SCHEME,
    version: APP_VERSION,
    orientation: 'portrait',
    icon: './assets/icon.png',
    // Light only until every screen uses the themed colours: most still draw light backgrounds,
    // so following a dark phone turned their text light-on-light. Set back to 'automatic' then.
    userInterfaceStyle: 'light',
    ios: {
      supportsTablet: true,
      bundleIdentifier: `${BASE_ID}${suffix}`,
      usesAppleSignIn: true,
      // Needs public/.well-known/apple-app-site-association on the portal (see src/lib/links.ts).
      associatedDomains: [`applinks:${webHost}`],
    },
    android: {
      package: `${BASE_ID}${suffix}`,
      adaptiveIcon: {
        backgroundColor: '#39279B', // brandSplash; the background PNG draws the gradient
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
      googleServicesFile: googleServicesFile(),
      // Needs /.well-known/assetlinks.json on the portal with this build's signing fingerprint.
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [{ scheme: 'https', host: webHost, pathPrefix: '/knowledge' }],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    plugins: [
      'expo-router',
      'expo-status-bar',
      'expo-dev-client',
      'expo-updates',
      // Stripe pages (invoices, Customer Portal) open in an in-app browser session.
      'expo-web-browser',
      ...PERMISSION_PLUGINS,
      [
        // Push via the backend (SNS → APNs / FCM). Adds the iOS aps-environment entitlement.
        'expo-notifications',
        {
          icon: './assets/android-icon-monochrome.png',
          color: '#39279B',
          defaultChannel: 'default', // ANDROID_CHANNEL in src/features/notifications/push.ts
        },
      ],
      [
        'expo-splash-screen',
        // Logo card on brand violet; BrandSplash (src/features/splash) takes over seamlessly.
        { image: './assets/splash-icon.png', imageWidth: 144, backgroundColor: '#39279B' },
      ],
    ],
    // EAS Update: OTA JS updates; builds only accept updates with the same app version.
    updates: { url: `https://u.expo.dev/${EAS_PROJECT_ID}` },
    runtimeVersion: APP_VERSION,
    experiments: { typedRoutes: true },
    extra: {
      appEnv,
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || env.apiBaseUrl,
      wsUrl: process.env.EXPO_PUBLIC_WS_URL || env.wsUrl,
      webUrl: env.webUrl,
      sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
      scheme: SCHEME,
      cognito: env.cognito,
      personalCheckout: PERSONAL_CHECKOUT,
      eas: { projectId: EAS_PROJECT_ID },
    },
  };
};
