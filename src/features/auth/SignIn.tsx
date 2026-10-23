import { zodResolver } from '@hookform/resolvers/zod';
import { FingerprintPattern, ScanFace, User } from 'lucide-react-native';
import { useForm } from 'react-hook-form';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { BiometricSupport } from '@/auth/biometrics';
import { BrandButton } from '@/components/BrandButton/BrandButton';
import { Text } from '@/components/Text/Text';
import { colors } from '@/theme';
import { Decorations } from './Decorations';
import { FormField, PasswordField } from './FormField';
import { signInSchema, type SignInValues } from './schema';
import { SocialButtons } from './SocialButtons';
import { styles } from './styles';

const logo = require('../../../assets/logo.png');

export type SignInProps = {
  onSubmit: (values: SignInValues) => Promise<void>;
  onGoogle: () => void;
  onApple: () => void;
  /** Face ID / fingerprint button; omitted hides it. */
  biometric?: BiometricSupport;
  biometricBusy?: boolean;
  onBiometric: () => void;
  onCreateAccount: () => void;
  onForgotPassword: () => void;
  /** App version shown small at the bottom, e.g. "1.0.0". */
  version?: string;
};

/** M1 Sign in — social sign-in, work email + password, and biometric re-entry. */
export function SignIn(props: SignInProps) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Decorations />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 28 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Equal spacers keep the form centred while the version sits at the bottom. */}
        <View style={styles.grow} />
        <Image
          source={logo}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="QuipTech FIELD"
        />
        <Text variant="caption" color="inkMuted" style={styles.tagline}>
          Machine history, manuals and AI in the pit
        </Text>

        <View style={styles.form}>
          <SocialButtons onGoogle={props.onGoogle} onApple={props.onApple} />
          <EmailForm onSubmit={props.onSubmit} />
          {props.biometric && (
            <BiometricButton
              biometric={props.biometric}
              loading={props.biometricBusy}
              onPress={props.onBiometric}
            />
          )}
          <FooterLinks
            onCreateAccount={props.onCreateAccount}
            onForgotPassword={props.onForgotPassword}
          />
        </View>
        <View style={styles.grow} />
        {props.version ? (
          <Text variant="caption" color="inkSubtle" style={styles.version}>
            Version {props.version}
          </Text>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function EmailForm({ onSubmit }: Pick<SignInProps, 'onSubmit'>) {
  const { control, handleSubmit, formState, setFocus } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });
  const submit = handleSubmit(onSubmit);

  return (
    <>
      <FormField
        control={control}
        name="email"
        label="Work email"
        icon={User}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="username"
        returnKeyType="next"
        onSubmitEditing={() => setFocus('password')}
      />
      <PasswordField
        control={control}
        name="password"
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={submit}
      />
      <BrandButton label="Sign in" onPress={submit} loading={formState.isSubmitting} />
    </>
  );
}

function BiometricButton({
  biometric,
  loading,
  onPress,
}: {
  biometric: BiometricSupport;
  loading?: boolean;
  onPress: () => void;
}) {
  const Icon = biometric.kind === 'face' ? ScanFace : FingerprintPattern;
  return (
    <BrandButton
      variant="outline"
      label={`Sign in with ${biometric.label}`}
      icon={<Icon size={20} color={colors.ink} strokeWidth={2} />}
      loading={loading}
      onPress={onPress}
    />
  );
}

function FooterLinks({
  onCreateAccount,
  onForgotPassword,
}: Pick<SignInProps, 'onCreateAccount' | 'onForgotPassword'>) {
  return (
    <View style={styles.links}>
      <Pressable onPress={onCreateAccount} style={styles.link} accessibilityRole="link" hitSlop={4}>
        <Text variant="caption" color="brand">
          Create account
        </Text>
      </Pressable>
      <Text variant="caption" color="inkMuted" accessibilityElementsHidden>
        ·
      </Text>
      <Pressable
        onPress={onForgotPassword}
        style={styles.link}
        accessibilityRole="link"
        hitSlop={4}
      >
        <Text variant="caption" color="brand">
          Forgot password
        </Text>
      </Pressable>
    </View>
  );
}
