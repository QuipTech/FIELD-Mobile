import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Database, Phone, User } from 'lucide-react-native';
import { Controller, useForm, type Control, type UseFormSetFocus } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandButton } from '@/components/BrandButton/BrandButton';
import { Text } from '@/components/Text/Text';
import { colors } from '@/theme';
import { Decorations } from './Decorations';
import { FormField, PasswordField } from './FormField';
import { registerSchema, type RegisterInput, type RegisterValues } from './schema';
import { SocialButtons } from './SocialButtons';
import { styles } from './styles';

export type RegisterProps = {
  onSubmit: (values: RegisterValues) => Promise<void>;
  onGoogle: () => void;
  onApple: () => void;
  onSignIn: () => void;
};

/** M1b Register — self-serve sign-up with social or work email. */
export function Register({ onSubmit, onGoogle, onApple, onSignIn }: RegisterProps) {
  const insets = useSafeAreaInsets();
  const { control, handleSubmit, formState, setFocus } = useForm<
    RegisterInput,
    unknown,
    RegisterValues
  >({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      company: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });
  const submit = handleSubmit(onSubmit);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Decorations placement="register" />
      <ScrollView
        contentContainerStyle={[styles.registerScroll, { paddingBottom: insets.bottom + 16 }]}
        keyboardShouldPersistTaps="handled"
      >
        <SocialButtons onGoogle={onGoogle} onApple={onApple} />
        <RegisterFields control={control} setFocus={setFocus} />
        <TermsCheckbox control={control} />
        <BrandButton label="Create account" onPress={submit} loading={formState.isSubmitting} />
        <View style={styles.signInRow}>
          <Text variant="caption" color="inkMuted">
            Already have an account?
          </Text>
          <Pressable onPress={onSignIn} style={styles.link} accessibilityRole="link" hitSlop={4}>
            <Text variant="caption" color="brand">
              Sign in
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

type FormControl = Control<RegisterInput, unknown, RegisterValues>;

/** Both password fields opt in to iOS strong-password suggestions. */
const newPasswordAutofill = {
  autoComplete: 'new-password',
  textContentType: 'newPassword',
} as const;

function RegisterFields({
  control,
  setFocus,
}: {
  control: FormControl;
  setFocus: UseFormSetFocus<RegisterInput>;
}) {
  // Keyboard "next" moves to the following field without dismissing the keyboard.
  const next = (name: keyof RegisterInput) => ({
    returnKeyType: 'next' as const,
    submitBehavior: 'submit' as const,
    onSubmitEditing: () => setFocus(name),
  });

  return (
    <>
      <View style={styles.nameRow}>
        <FormField
          control={control}
          name="firstName"
          label="First name"
          autoComplete="given-name"
          textContentType="givenName"
          containerStyle={styles.nameField}
          {...next('lastName')}
        />
        <FormField
          control={control}
          name="lastName"
          label="Last name"
          autoComplete="family-name"
          textContentType="familyName"
          containerStyle={styles.nameField}
          {...next('company')}
        />
      </View>
      <FormField
        control={control}
        name="company"
        label="Company name"
        icon={Database}
        autoComplete="organization"
        textContentType="organizationName"
        {...next('email')}
      />
      <FormField
        control={control}
        name="email"
        label="Work email"
        icon={User}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        {...next('phone')}
      />
      <FormField
        control={control}
        name="phone"
        label="Phone number"
        icon={Phone}
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
        {...next('password')}
      />
      <PasswordField
        control={control}
        name="password"
        {...newPasswordAutofill}
        {...next('confirmPassword')}
      />
      <PasswordField
        control={control}
        name="confirmPassword"
        label="Confirm password"
        {...newPasswordAutofill}
        returnKeyType="done"
      />
    </>
  );
}

function TermsCheckbox({ control }: { control: FormControl }) {
  return (
    <Controller
      control={control}
      name="acceptTerms"
      render={({ field, fieldState }) => (
        <View style={styles.fieldWrap}>
          <Pressable
            onPress={() => field.onChange(!field.value)}
            style={styles.checkRow}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: !!field.value }}
            accessibilityLabel="I agree to the Terms of Service and Privacy Policy"
          >
            <View style={[styles.checkbox, field.value && styles.checkboxOn]}>
              {field.value && <Check size={12} color={colors.onAccent} strokeWidth={3} />}
            </View>
            <Text variant="caption" color="inkMuted" style={styles.checkLabel}>
              I agree to the Terms of Service and Privacy Policy
            </Text>
          </Pressable>
          {fieldState.error && (
            <Text variant="caption" color="accentText" accessibilityLiveRegion="polite">
              {fieldState.error.message}
            </Text>
          )}
        </View>
      )}
    />
  );
}
