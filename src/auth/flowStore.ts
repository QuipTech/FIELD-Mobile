import { create } from 'zustand';

import type { CompanyProfile } from './apiSession';

type FlowFields = {
  /** Email the current flow is for (reset, sign-up verification, forced password change). */
  email: string;
  /** Reset code from M1d; Cognito checks it together with the new password on M1e. */
  code: string;
  /** Company and phone from the sign-up form, sent to the API once the email is verified. */
  profile?: CompanyProfile;
};

type AuthFlowState = FlowFields & { set: (patch: Partial<FlowFields>) => void; reset: () => void };

/** In-memory state carried between auth screens, so emails and codes stay out of route params. */
export const useAuthFlow = create<AuthFlowState>((set) => ({
  email: '',
  code: '',
  set: (patch) => set(patch),
  reset: () => set({ email: '', code: '', profile: undefined }),
}));
