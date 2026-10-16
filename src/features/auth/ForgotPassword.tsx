import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, User } from 'lucide-react-native';
import { useForm } from 'react-hook-form';

import { BrandButton } from '@/components/BrandButton/BrandButton';
import { AuthStepLayout, InlineLink } from './AuthStepLayout';
import { FormField } from './FormField';
import { CODE_LENGTH, forgotPasswordSchema, type ForgotPasswordValues } from './schema';

export type ForgotPasswordProps = {
  defaultEmail?: string;
  onSubmit: (values: ForgotPasswordValues) => Promise<void>;
  onBackToSignIn: () => void;
};

/** M1c Forgot password — request a reset code by email. */
export function ForgotPassword({
  defaultEmail = '',
  onSubmit,
  onBackToSignIn,
}: ForgotPasswordProps) {
  const { control, handleSubmit, formState } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: defaultEmail },
  });
  const submit = handleSubmit(onSubmit);

  return (
    <AuthStepLayout
      icon={Lock}
      title="Reset your password"
      subtitle={`Enter your work email and we'll send you a ${CODE_LENGTH}-digit code`}
    >
      <FormField
        control={control}
        name="email"
        label="Work email"
        icon={User}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="send"
        onSubmitEditing={submit}
      />
      <BrandButton label="Send reset code" onPress={submit} loading={formState.isSubmitting} />
      <InlineLink label="Back to sign in" onPress={onBackToSignIn} />
    </AuthStepLayout>
  );
}
