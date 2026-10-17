import type { CameraView as CameraViewType } from 'expo-camera';
import { Camera, CameraOff } from 'lucide-react-native';
import type { ReactNode, Ref } from 'react';
import { Linking, View } from 'react-native';

import { BrandButton } from '@/components/BrandButton/BrandButton';
import { Text } from '@/components/Text/Text';
import { colors } from '@/theme';
import { expoCamera } from './nativeCamera';
import { styles } from './styles';

export type CameraHandle = CameraViewType;

export type CameraSurfaceProps = {
  /** "scan" reads QR / barcodes; "photo" is a plain preview for the shutter. */
  mode: 'scan' | 'photo';
  onBarcode?: (data: string) => void;
  cameraRef?: Ref<CameraHandle>;
  onReady?: () => void;
  /** Overlay drawn above the preview (scan frame, hint). */
  children?: ReactNode;
};

const BARCODE_TYPES = ['qr', 'code128', 'code39', 'datamatrix'] as const;

/** Rounded camera viewfinder with permission handling and a fallback when there's no camera. */
export function CameraSurface(props: CameraSurfaceProps) {
  return (
    <View style={styles.viewfinder}>
      {expoCamera ? (
        <LiveCamera {...props} />
      ) : (
        <Message
          icon={<CameraOff size={28} color={colors.onBrandMuted} strokeWidth={1.75} />}
          title="Camera not available"
          body="This build doesn't include the camera yet. Rebuild the app to use it."
        />
      )}
    </View>
  );
}

function LiveCamera({ mode, onBarcode, cameraRef, onReady, children }: CameraSurfaceProps) {
  const { CameraView, useCameraPermissions } = expoCamera!;
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) return null;
  if (!permission.granted) {
    const canAsk = permission.canAskAgain;
    return (
      <Message
        icon={<Camera size={28} color={colors.onBrandMuted} strokeWidth={1.75} />}
        title="Allow camera access"
        body={
          mode === 'scan'
            ? 'FIELD uses the camera to read asset tags.'
            : 'FIELD uses the camera to photograph machines for the log.'
        }
        action={{
          label: canAsk ? 'Allow camera' : 'Open Settings',
          onPress: () => (canAsk ? requestPermission() : Linking.openSettings()),
        }}
      />
    );
  }

  return (
    <>
      <CameraView
        ref={cameraRef}
        style={styles.fill}
        facing="back"
        onCameraReady={onReady}
        barcodeScannerSettings={mode === 'scan' ? { barcodeTypes: [...BARCODE_TYPES] } : undefined}
        onBarcodeScanned={mode === 'scan' && onBarcode ? (r) => onBarcode(r.data) : undefined}
      />
      {children}
    </>
  );
}

function Message({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: { label: string; onPress: () => void };
}) {
  return (
    <View style={styles.center}>
      {icon}
      <Text color="onAccent" style={styles.centerTitle}>
        {title}
      </Text>
      <Text variant="caption" color="onBrandMuted" style={styles.centerText}>
        {body}
      </Text>
      {action && (
        <BrandButton
          label={action.label}
          onPress={action.onPress}
          style={styles.permissionButton}
        />
      )}
    </View>
  );
}
