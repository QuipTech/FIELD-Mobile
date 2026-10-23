import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  useBottomSheetSpringConfigs,
  useBottomSheetTimingConfigs,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { X } from 'lucide-react-native';
import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { durations, scrimOpacity, springs, useReducedMotion } from '@/theme';
import { IconButton } from '../Button/IconButton';
import { Text } from '../Text/Text';
import { useStyles } from './styles';

export type SheetProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** False to ignore scrim taps and swipe-down (e.g. unsaved form). */
  dismissable?: boolean;
  /** Fixed footer, e.g. the "Save entry" button. */
  footer?: ReactNode;
};

/**
 * Bottom sheet (M4, K5b, K6): springs in (damping 20, stiffness 220), scrim to 45%.
 * Fields inside should use `BottomSheetTextInput` so the keyboard keeps them visible.
 */
export function Sheet({
  visible,
  onClose,
  title,
  children,
  dismissable = true,
  footer,
}: SheetProps) {
  const ref = useRef<BottomSheetModal>(null);
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const spring = useBottomSheetSpringConfigs(springs.sheet);
  const fade = useBottomSheetTimingConfigs({ duration: durations.reducedFade });

  useEffect(() => {
    if (visible) ref.current?.present();
    else ref.current?.dismiss();
  }, [visible]);

  const backdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        opacity={scrimOpacity}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior={dismissable ? 'close' : 'none'}
      />
    ),
    [dismissable],
  );

  return (
    <BottomSheetModal
      ref={ref}
      onDismiss={onClose}
      enablePanDownToClose={dismissable}
      enableDynamicSizing
      animationConfigs={reduced ? fade : spring}
      backdropComponent={backdrop}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.grab}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      topInset={insets.top}
      accessibilityLabel={title}
    >
      <View style={styles.header}>
        <Text variant="sheetTitle" style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        <IconButton icon={X} accessibilityLabel="Close" onPress={() => ref.current?.dismiss()} />
      </View>
      <BottomSheetScrollView
        contentContainerStyle={[styles.body, !footer && { paddingBottom: insets.bottom + 16 }]}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </BottomSheetScrollView>
      {footer && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>{footer}</View>
      )}
    </BottomSheetModal>
  );
}
