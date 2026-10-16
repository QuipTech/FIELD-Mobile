import { Amplify } from 'aws-amplify';

import { env } from '@/lib/env';

let configured = false;

/**
 * Points Amplify Auth at the existing Cognito user pool. No identity pool: the app only needs
 * user-pool tokens for its own API, not direct AWS credentials.
 */
export function configureAmplify() {
  if (configured) return;
  configured = true;
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: env.cognito.userPoolId,
        userPoolClientId: env.cognito.userPoolClientId,
        loginWith: {
          email: true,
          // Google / Apple via Cognito's hosted UI (signInWithRedirect). These URLs must match the
          // app client's allowed callback / sign-out URLs exactly.
          oauth: {
            domain: env.cognito.hostedUiDomain,
            scopes: ['openid', 'email', 'profile', 'phone'],
            redirectSignIn: [`${env.scheme}://auth/callback`],
            redirectSignOut: [`${env.scheme}://auth/signout`],
            responseType: 'code',
          },
        },
        signUpVerificationMethod: 'code',
        userAttributes: { email: { required: true } },
        // Mirrors the user pool's policy (see PASSWORD_RULE in features/auth/schema.ts).
        passwordFormat: {
          minLength: 8,
          requireLowercase: true,
          requireUppercase: true,
          requireNumbers: true,
          requireSpecialCharacters: true,
        },
      },
    },
  });
}
