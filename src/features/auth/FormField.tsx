import { Eye, EyeOff, Lock } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Pressable } from 'react-native';

import { colors } from '@/theme';
import { AuthField, type AuthFieldProps } from './AuthField';
import { styles } from './styles';

export type FormFieldProps<T extends FieldValues> = Omit<
  AuthFieldProps,
  'value' | 'onChangeText' | 'onBlur' | 'error'
> & {
  control: Control<T>;
  name: Path<T>;
};

/** AuthField bound to a react-hook-form field, showing its validation error. */
export function FormField<T extends FieldValues>({ control, name, ...rest }: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <AuthField
          {...rest}
          ref={field.ref}
          value={field.value}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}

/** Password FormField with a lock icon and a show/hide toggle. */
export function PasswordField<T extends FieldValues>(
  props: Omit<FormFieldProps<T>, 'label' | 'icon' | 'secureTextEntry' | 'accessory'> & {
    label?: string;
  },
) {
  const [revealed, setRevealed] = useState(false);
  const Toggle = revealed ? EyeOff : Eye;
  return (
    <FormField
      label="Password"
      {...props}
      icon={Lock}
      secureTextEntry={!revealed}
      autoCapitalize="none"
      accessory={
        <Pressable
          onPress={() => setRevealed((r) => !r)}
          style={styles.reveal}
          accessibilityRole="button"
          accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
        >
          <Toggle size={20} color={colors.inkSubtle} strokeWidth={2} />
        </Pressable>
      }
    />
  );
}
