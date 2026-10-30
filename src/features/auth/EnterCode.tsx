import { ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';

import { BrandButton } from '@/components/BrandButton/BrandButton';
import { AuthStepLayout, InlineLink } from './AuthStepLayout';
import { CodeInput } from './CodeInput';
import { CODE_LENGTH } from './schema';

export type EnterCodeProps = {
  /** Where the code was sent, shown as "Sent to …". */
  destination: string;
  onSubmit: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
};

/** M1d Enter code — 6-digit one-time code with resend. */
export function EnterCode({ destination, onSubmit, onResend }: EnterCodeProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState<'verify' | 'resend'>();

  const verify = async (value = code) => {
    if (value.length !== CODE_LENGTH) {
      setError(`Enter the ${CODE_LENGTH}-digit code`);
      return;
    }
    setBusy('verify');
    try {
      await onSubmit(value);
    } finally {
      setBusy(undefined);
    }
  };

  const resend = async () => {
    setBusy('resend');
    try {
      await onResend();
      setCode('');
      setError(undefined);
    } finally {
      setBusy(undefined);
    }
  };

  return (
    <AuthStepLayout
      icon={ShieldCheck}
      title="Enter the code"
      subtitle={`Sent to ${destination}`}
      footer={
        <BrandButton
          label="Verify code"
          onPress={() => verify()}
          loading={busy === 'verify'}
          disabled={busy === 'resend'}
        />
      }
    >
      <CodeInput
        value={code}
        onChange={(next) => {
          setCode(next);
          setError(undefined);
        }}
        onComplete={verify}
        error={error}
      />
      <InlineLink prefix="Didn't get it?" label="Resend code" onPress={resend} disabled={!!busy} />
    </AuthStepLayout>
  );
}
