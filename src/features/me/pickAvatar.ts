import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

/** A square photo picked for the profile, as React Native's FormData file part. */
export type AvatarFile = { uri: string; name: string; type: string };

const QUALITY = 0.7;

async function pick(source: 'camera' | 'library'): Promise<AvatarFile | null> {
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error(
      source === 'camera'
        ? 'Camera access is off. Turn it on in Settings to take a photo.'
        : 'Photo access is off. Turn it on in Settings to choose a photo.',
    );
  }
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: QUALITY,
  };
  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
  const asset = result.canceled ? undefined : result.assets[0];
  if (!asset) return null;
  const type = asset.mimeType ?? 'image/jpeg';
  const ext = type.split('/')[1] ?? 'jpg';
  return { uri: asset.uri, name: asset.fileName ?? `avatar.${ext}`, type };
}

/** Asks camera or library, then resolves to a square-cropped photo (null if cancelled). */
export function pickAvatar(): Promise<AvatarFile | null> {
  return new Promise((resolve, reject) => {
    const run = (source: 'camera' | 'library') => () => pick(source).then(resolve, reject);
    Alert.alert('Profile photo', undefined, [
      { text: 'Take photo', onPress: run('camera') },
      { text: 'Choose from library', onPress: run('library') },
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) },
    ]);
  });
}
