import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert } from 'react-native';

/** A photo ready to send with a question (`image` on `POST /ai/ask`). */
export type AskImage = { uri: string; mediaType: string; data: string };

/** The API accepts about 3.75 MB of image data. */
const MAX_BYTES = 3_750_000;
const QUALITY = 0.5;

const bytesOf = (base64: string) => Math.floor((base64.length * 3) / 4);

async function pick(source: 'camera' | 'library'): Promise<AskImage | null> {
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error(
      source === 'camera'
        ? 'Camera access is off. Turn it on in Settings to take a photo.'
        : 'Photo access is off. Turn it on in Settings to attach a photo.',
    );
  }
  const options = {
    mediaTypes: ['images'] as ImagePicker.MediaType[],
    base64: true,
    quality: QUALITY,
  };
  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
  const asset = result.canceled ? undefined : result.assets[0];
  if (!asset?.base64) return null;
  if (bytesOf(asset.base64) > MAX_BYTES) {
    throw new Error('That photo is too large. Try a closer crop or a different photo.');
  }
  return { uri: asset.uri, mediaType: asset.mimeType ?? 'image/jpeg', data: asset.base64 };
}

/** Asks camera or library, then resolves to the photo (null if cancelled). */
export function chooseImage(): Promise<AskImage | null> {
  return new Promise((resolve, reject) => {
    const run = (source: 'camera' | 'library') => () => pick(source).then(resolve, reject);
    Alert.alert('Attach a photo', 'Ask AI can look at a photo with your question.', [
      { text: 'Take photo', onPress: run('camera') },
      { text: 'Choose from library', onPress: run('library') },
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) },
    ]);
  });
}

/** The photo waiting to go with the next question, and the "+" handler that picks it. */
export function useAttachedImage(onError: (message: string) => void) {
  const [image, setImage] = useState<AskImage>();
  const attach = () =>
    chooseImage()
      .then((picked) => picked && setImage(picked))
      .catch((e: unknown) =>
        onError(e instanceof Error ? e.message : 'Couldn’t attach that photo.'),
      );
  return { image, attach, clear: () => setImage(undefined) };
}
