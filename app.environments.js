// Per-environment backend config, read by app.config.js. Plain JS for the same reason.
// Cognito IDs and API URLs are public client config, not secrets.

/** @typedef {'development' | 'staging' | 'production'} AppEnv */
/**
 * @typedef {{ apiBaseUrl: string, wsUrl: string, webUrl: string, cognito: { region: string, userPoolId: string,
 *   userPoolClientId: string, hostedUiDomain: string } }} EnvConfig
 */

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

/** @type {EnvConfig} */
const PRODUCTION = {
  apiBaseUrl: 'https://app-api.quiptechfield.com.au',
  wsUrl: '',
  // Drives shared links and the iOS associated domain / Android App Links host: the portal must
  // serve apple-app-site-association and assetlinks.json for the production build.
  webUrl: 'https://app.quiptechfield.com.au',
  // "field production" pool; the production API only accepts tokens from it. The app client must
  // allow quiptechfield://auth/callback and quiptechfield://auth/signout as callback/sign-out URLs.
  cognito: {
    region: 'ap-southeast-2',
    userPoolId: 'ap-southeast-2_wKANhY7Gj',
    userPoolClientId: '1jdchvunhr03hl5pll13od20k0',
    hostedUiDomain: 'quiptech-field.auth.ap-southeast-2.amazoncognito.com',
  },
};

/** @type {Record<AppEnv, EnvConfig>} */
const ENVIRONMENTS = {
  development: STAGING,
  staging: STAGING,
  production: PRODUCTION,
};

module.exports = { ENVIRONMENTS };
