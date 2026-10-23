import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Database, Phone } from 'lucide-react-native';
import { useForm } from 'react-hook-form';

import { BrandButton } from '@/components/BrandButton/BrandButton';
import { AuthStepLayout, InlineLink } from './AuthStepLayout';
import { FormField } from './FormField';
import {
  completeProfileSchema,
  type CompleteProfileInput,
  type CompleteProfileValues,
} from './schema';

export type CompleteProfileProps = {
  onSubmit: (values: CompleteProfileValues) => Promise<void>;
  onUseAnotherAccount: () => void;
};

/**
 * Shown once, on a first sign-in the API can't finish alone (Google/Apple, or an account made
 * outside the app): it needs the company and a phone number to create the user.
 */
export function CompleteProfile({ onSubmit, onUseAnotherAccount }: CompleteProfileProps) {
  const { control, handleSubmit, formState, setFocus } = useForm<
    CompleteProfileInput,
    unknown,
    CompleteProfileValues
  >({ resolver: zodResolver(completeProfileSchema), defaultValues: { company: '', phone: '' } });
  const submit = handleSubmit(onSubmit);

  return (
    <AuthStepLayout
      icon={Building2}
      title="Finish setting up"
      subtitle="Tell us your company and phone number to finish creating your account"
    >
      <FormField
        control={control}
        name="company"
        label="Company name"
        icon={Database}
        autoComplete="organization"
        textContentType="organizationName"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => setFocus('phone')}
      />
      <FormField
        control={control}
        name="phone"
        label="Phone number"
        icon={Phone}
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      <BrandButton label="Finish setup" onPress={submit} loading={formState.isSubmitting} />
      <InlineLink label="Use a different account" onPress={onUseAnotherAccount} />
    </AuthStepLayout>
  );
}
