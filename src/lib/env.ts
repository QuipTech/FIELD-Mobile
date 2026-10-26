import Constants from 'expo-constants';
import { z } from 'zod';

const envSchema = z.object({
  appEnv: z.enum(['development', 'staging', 'production']),
  apiBaseUrl: z.url(),
  wsUrl: z.string(),
  webUrl: z.url(),
  sentryDsn: z.string(),
  scheme: z.string().min(1),
  cognito: z.object({
    region: z.string().min(1),
    userPoolId: z.string().min(1),
    userPoolClientId: z.string().min(1),
    hostedUiDomain: z.string().min(1),
  }),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(Constants.expoConfig?.extra);
  if (!parsed.success) {
    // Misconfigured build — fail loudly at startup rather than at first request.
    throw new Error(`Invalid app config (extra): ${z.prettifyError(parsed.error)}`);
  }
  const { apiBaseUrl, webUrl } = parsed.data;
  return {
    ...parsed.data,
    apiBaseUrl: apiBaseUrl.replace(/\/+$/, ''),
    webUrl: webUrl.replace(/\/+$/, ''),
  };
}

export const env: Env = loadEnv();
