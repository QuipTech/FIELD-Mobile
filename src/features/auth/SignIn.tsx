import { zodResolver } from '@hookform/resolvers/zod';
import { ScanFace, User } from 'lucide-react-native';
import { useForm } from 'react-hook-form';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  onBiometric: () => void;
  onCreateAccount: () => void;
  onForgotPassword: () => void;
};

const BIOMETRIC_LABEL = Platform.OS === 'ios' ? 'Sign in with Face ID' : 'Sign in with biometrics';

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
          <BrandButton
            variant="outline"
            label={BIOMETRIC_LABEL}
            icon={<ScanFace size={20} color={colors.ink} strokeWidth={2} />}
            onPress={props.onBiometric}
          />
          <FooterLinks
            onCreateAccount={props.onCreateAccount}
            onForgotPassword={props.onForgotPassword}
          />
        </View>
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
