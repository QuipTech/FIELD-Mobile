import { zodResolver } from '@hookform/resolvers/zod';
import { Check } from 'lucide-react-native';
import { useForm } from 'react-hook-form';

import { BrandButton } from '@/components/BrandButton/BrandButton';
import { AuthStepLayout } from './AuthStepLayout';
import { PasswordField } from './FormField';
import { newPasswordSchema, PASSWORD_RULE, type NewPasswordValues } from './schema';

export type NewPasswordProps = {
  onSubmit: (values: NewPasswordValues) => Promise<void>;
};

/** M1e Set a new password — new + confirm, checked against the password policy. */
export function NewPassword({ onSubmit }: NewPasswordProps) {
  const { control, handleSubmit, formState, setFocus } = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: '', confirm: '' },
  });
  const submit = handleSubmit(onSubmit);

  return (
    <AuthStepLayout icon={Check} title="Set a new password" subtitle={PASSWORD_RULE}>
      <PasswordField
        control={control}
        name="password"
        label="New password"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => setFocus('confirm')}
      />
      <PasswordField
        control={control}
        name="confirm"
        label="Confirm password"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      <BrandButton label="Update password" onPress={submit} loading={formState.isSubmitting} />
    </AuthStepLayout>
  );
}
