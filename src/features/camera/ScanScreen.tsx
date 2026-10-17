import { StatusBar } from 'expo-status-bar';
import { X } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandButton } from '@/components/BrandButton/BrandButton';
import { Text } from '@/components/Text/Text';
import { colors, layout } from '@/theme';
import { CameraSurface } from './CameraSurface';
import { styles } from './styles';

export type ScanScreenProps = {
  /** Maps a scanned or typed code to a machine id, or undefined if it isn't in the fleet. */
  resolve: (code: string) => string | undefined;
  onFound: (machineId: string) => void;
  onClose: () => void;
};

/** Scan an asset tag (QR / barcode) to open that machine; type the fleet number as a fallback. */
export function ScanScreen({ resolve, onFound, onClose }: ScanScreenProps) {
  const insets = useSafeAreaInsets();
  const [manual, setManual] = useState('');
  const [error, setError] = useState<string | null>(null);
  // The scanner fires many times a second: act on the first hit and report each miss once.
  const found = useRef(false);
  const lastMiss = useRef('');

  const tryCode = (code: string, fromCamera: boolean) => {
    const id = resolve(code);
    if (id) {
      if (found.current) return;
      found.current = true;
      onFound(id);
    } else if (!fromCamera || code !== lastMiss.current) {
      lastMiss.current = code;
      setError(`“${code.trim()}” isn’t a machine in your fleet.`);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      <View style={styles.topBar}>
        <Pressable
          onPress={onClose}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <X size={24} color={colors.onAccent} strokeWidth={2} />
        </Pressable>
        <Text color="onAccent" style={styles.topTitle} accessibilityRole="header">
          Scan asset tag
        </Text>
      </View>

      <CameraSurface mode="scan" onBarcode={(code) => tryCode(code, true)}>
        <View style={styles.center} pointerEvents="none">
          <ScanFrame />
        </View>
        <View style={styles.hint} pointerEvents="none">
          <View style={styles.hintPill}>
            <Text variant="caption" color="onAccent">
              Point at the QR tag on the machine
            </Text>
          </View>
        </View>
      </CameraSurface>

      <View style={[styles.manual, { paddingBottom: insets.bottom + 12 }]}>
        {error && (
          <Text variant="caption" style={styles.error} accessibilityLiveRegion="polite">
            {error}
          </Text>
        )}
        <Text variant="caption" color="onBrandMuted">
          Can’t scan? Enter the fleet number
        </Text>
        <View style={styles.manualRow}>
          <TextInput
            value={manual}
            onChangeText={setManual}
            onSubmitEditing={() => manual.trim() && tryCode(manual, false)}
            placeholder="e.g. HT-2201"
            placeholderTextColor={colors.onBrandFaint}
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="go"
            maxFontSizeMultiplier={layout.maxFontScale}
            style={styles.manualInput}
            accessibilityLabel="Fleet number"
          />
          <BrandButton
            label="Open"
            onPress={() => tryCode(manual, false)}
            disabled={!manual.trim()}
            style={styles.manualButton}
          />
        </View>
      </View>
    </View>
  );
}

/** Four white corner brackets around the scan target. */
function ScanFrame() {
  return (
    <View style={styles.frame}>
      <View style={[styles.corner, styles.cornerTopLeft]} />
      <View style={[styles.corner, styles.cornerTopRight]} />
      <View style={[styles.corner, styles.cornerBottomLeft]} />
      <View style={[styles.corner, styles.cornerBottomRight]} />
    </View>
  );
}
