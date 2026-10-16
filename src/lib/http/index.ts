import { env } from '../env';
import { createHttpClient } from './client';

/** App-wide client for the QuipTech FIELD API. Feature `api.ts` files import this. */
export const http = createHttpClient({ baseUrl: env.apiBaseUrl });

export { createHttpClient, type HttpClient, type RequestOptions } from './client';
export { ApiError, NetworkError, errorMessage } from './errors';
export { setTokenProvider, type TokenProvider } from './auth';
export type { Query } from './url';
