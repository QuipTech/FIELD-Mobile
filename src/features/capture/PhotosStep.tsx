import { StatusBar } from 'expo-status-bar';
import { ArrowRight, Image as ImageIcon, X } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Alert, Image, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandButton } from '@/components/BrandButton/BrandButton';
import { Text } from '@/components/Text/Text';
import { toast } from '@/components/Toast/store';
import { CameraSurface, type CameraHandle } from '@/features/camera/CameraSurface';
import { styles } from '@/features/camera/styles';
import { colors } from '@/theme';

const MAX_PHOTOS = 6;

export type PhotosStepProps = {
  photos: string[];
  onChange: (photos: string[]) => void;
  onClose: () => void;
  onNext: () => void;
};

/** M6 Capture flow, camera step: shoot up to six photos, then add notes and hours. */
export function PhotosStep({ photos, onChange, onClose, onNext }: PhotosStepProps) {
  const insets = useSafeAreaInsets();
  const camera = useRef<CameraHandle>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const full = photos.length >= MAX_PHOTOS;

  const shoot = async () => {
    if (!camera.current || busy || full) return;
    setBusy(true);
    try {
      const picture = await camera.current.takePictureAsync({ quality: 0.6 });
      if (picture?.uri) onChange([...photos, picture.uri]);
    } catch {
      toast.error('Couldn’t take a photo. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const remove = (uri: string) =>
    Alert.alert('Remove this photo?', undefined, [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => onChange(photos.filter((p) => p !== uri)),
      },
    ]);

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
          Step 2 of 3 · Photos
        </Text>
      </View>

      <CameraSurface mode="photo" cameraRef={camera} onReady={() => setReady(true)}>
        <View style={styles.hint} pointerEvents="none">
          <View style={styles.hintPill}>
            <Text variant="caption" color="onAccent">
              {full
                ? `That’s the limit of ${MAX_PHOTOS} photos`
                : 'Tap the shutter to take a photo'}
            </Text>
          </View>
        </View>
      </CameraSurface>

      <PhotoTray
        photos={photos}
        canShoot={ready && !busy && !full}
        busy={busy}
        onShoot={shoot}
        onRemove={remove}
      />

      <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
        {photos.length === 0 && (
          <BrandButton variant="outline" label="Skip photos" onPress={onNext} />
        )}
        <BrandButton
          label="Next — notes & hours"
          icon={<ArrowRight size={18} color={colors.onAccent} strokeWidth={2} />}
          onPress={onNext}
          disabled={photos.length === 0}
        />
      </View>
    </View>
  );
}

function PhotoTray({
  photos,
  canShoot,
  busy,
  onShoot,
  onRemove,
}: {
  photos: string[];
  canShoot: boolean;
  busy: boolean;
  onShoot: () => void;
  onRemove: (uri: string) => void;
}) {
  return (
    <View style={styles.tray}>
      {photos.length === 0 && (
        <View style={styles.thumb} accessibilityElementsHidden importantForAccessibility="no">
          <ImageIcon size={18} color={colors.onBrandFaint} strokeWidth={2} />
        </View>
      )}
      {photos.slice(-3).map((uri, i) => (
        <Pressable
          key={uri}
          onPress={() => onRemove(uri)}
          style={styles.thumb}
          accessibilityRole="imagebutton"
          accessibilityLabel={`Photo ${photos.length - Math.min(photos.length, 3) + i + 1}. Remove`}
        >
          <Image source={{ uri }} style={styles.thumbImage} />
        </Pressable>
      ))}
      <Text variant="caption" color="onBrandMuted" style={styles.trayCount}>
        {photos.length === 1 ? '1 photo' : `${photos.length} photos`}
      </Text>
      <Pressable
        onPress={onShoot}
        disabled={!canShoot}
        style={[styles.shutter, !canShoot && styles.shutterBusy]}
        accessibilityRole="button"
        accessibilityLabel="Take photo"
        accessibilityState={{ disabled: !canShoot, busy }}
      >
        <View style={styles.shutterInner} />
      </Pressable>
    </View>
  );
}
