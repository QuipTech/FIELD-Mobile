import { Mail, Smartphone, type LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandButton } from '@/components/BrandButton/BrandButton';
import { Text } from '@/components/Text/Text';
import { colors } from '@/theme';
import { Decorations } from './Decorations';
import { styles } from './recoveryStyles';

export type MfaMethod = 'sms' | 'email';

export type TwoFactorMethodProps = {
  /** Full phone number; only the last 3 digits are shown. */
  phone: string;
  email: string;
  onContinue: (method: MfaMethod) => Promise<void>;
};

/** "•••• 214" — never show the full number on screen. */
export const maskPhone = (phone: string) => `•••• ${phone.replace(/\D/g, '').slice(-3)}`;

/** M1f Two-factor authentication — choose where verification codes are sent. */
export function TwoFactorMethod({ phone, email, onContinue }: TwoFactorMethodProps) {
  const insets = useSafeAreaInsets();
  const [method, setMethod] = useState<MfaMethod>('sms');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await onContinue(method);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <Decorations placement="twoFactor" />
      <ScrollView contentContainerStyle={[styles.mfaScroll, { paddingBottom: insets.bottom + 16 }]}>
        <Text variant="caption" color="inkMuted">
          Choose how you&apos;d like to receive your verification code
        </Text>
        <View accessibilityRole="radiogroup" style={styles.options}>
          <MethodOption
            icon={Smartphone}
            title="Text message (SMS)"
            detail={`Codes sent to ${maskPhone(phone)}`}
            selected={method === 'sms'}
            onPress={() => setMethod('sms')}
          />
          <MethodOption
            icon={Mail}
            title="Email code"
            detail={`Sent to ${email}`}
            selected={method === 'email'}
            onPress={() => setMethod('email')}
          />
        </View>
        <BrandButton label="Continue" onPress={submit} loading={busy} />
      </ScrollView>
    </View>
  );
}

function MethodOption({
  icon: Icon,
  title,
  detail,
  selected,
  onPress,
}: {
  icon: LucideIcon;
  title: string;
  detail: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.option, selected && styles.optionOn]}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${title}. ${detail}`}
    >
      <View style={[styles.optionIcon, selected && styles.optionIconOn]}>
        <Icon size={20} color={selected ? colors.brandDeep : colors.inkMuted} strokeWidth={2} />
      </View>
      <View style={styles.optionText}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text variant="caption" color="inkMuted">
          {detail}
        </Text>
      </View>
      <View style={[styles.radio, selected && styles.radioOn]}>
        {selected && <View style={styles.radioDot} />}
      </View>
    </Pressable>
  );
}
