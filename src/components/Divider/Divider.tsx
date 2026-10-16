import { View } from 'react-native';

import { spacing } from '@/theme';
import { styles } from './styles';

export type DividerProps = {
  /** strong = 2px ink rule (sections); soft = 1px grey (rows). */
  weight?: 'strong' | 'soft';
  spacing?: keyof typeof spacing | 0;
};

export function Divider({ weight = 'strong', spacing: gap = 0 }: DividerProps) {
  const margin = gap === 0 ? 0 : spacing[gap];
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[weight === 'strong' ? styles.strong : styles.soft, { marginVertical: margin }]}
    />
  );
}
