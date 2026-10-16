// Plain JS (not TS) so every tool — including EAS CLI on Node 20 — can load it.

/** @typedef {'development' | 'staging' | 'production'} AppEnv */
/**
 * @typedef {{ apiBaseUrl: string, wsUrl: string, cognito: { region: string, userPoolId: string,
 *   userPoolClientId: string, hostedUiDomain: string } }} EnvConfig
 */

// Cognito IDs and API URLs are public client config, not secrets.
/** @type {EnvConfig} */
const STAGING = {
  apiBaseUrl: 'https://staging-api.quiptechfield.com.au',
  wsUrl: '',
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
  // TODO(confirm): production API URL and Cognito pool. Uses staging values until provided.
  production: STAGING,
};

const SCHEME = 'quiptechfield';
const EAS_PROJECT_ID = '0d1bab1e-7439-4c09-b7a9-b2b4e2b1ab1a';
const BASE_ID = 'au.com.quiptechfield.field';
// Bare workflow (android/ exists) disallows runtimeVersion policies; keep this equal to the app version.
const APP_VERSION = '1.0.0';

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
    userInterfaceStyle: 'light',
    ios: {
      supportsTablet: true,
      bundleIdentifier: `${BASE_ID}${suffix}`,
      usesAppleSignIn: true,
    },
    android: {
      package: `${BASE_ID}${suffix}`,
      adaptiveIcon: {
        backgroundColor: '#F3F2F2',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
    },
    plugins: [
      'expo-router',
      'expo-status-bar',
      'expo-dev-client',
      'expo-updates',
      'expo-secure-store',
      'expo-font',
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
      sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
      scheme: SCHEME,
      cognito: env.cognito,
      eas: { projectId: EAS_PROJECT_ID },
    },
  };
};
