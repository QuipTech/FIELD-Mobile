import { establishSession, signOutUser } from '@/auth/flows';
import { runAuth } from '@/auth/runAuth';
import { CompleteProfile } from '@/features/auth/CompleteProfile';

/** First sign-in: the API needs company and phone. The session gate moves on once it has them. */
export default function CompleteProfileRoute() {
  return (
    <CompleteProfile
      onSubmit={({ company, phone }) =>
        runAuth(() => establishSession({ companyName: company, phoneNumber: phone }))
      }
      onUseAnotherAccount={() => runAuth(signOutUser)}
    />
  );
}
