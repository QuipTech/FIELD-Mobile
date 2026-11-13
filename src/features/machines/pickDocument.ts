import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

import { ALLOWED_TYPES, type PickedFile } from './documentsApi';

export type DocumentSource = 'files' | 'camera' | 'photos';

async function fromFiles(): Promise<PickedFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: [...new Set(Object.values(ALLOWED_TYPES))],
    copyToCacheDirectory: true,
    multiple: false,
  });
  const asset = result.canceled ? undefined : result.assets[0];
  if (!asset) return null;
  return {
    uri: asset.uri,
    name: asset.name,
    type: asset.mimeType ?? 'application/octet-stream',
    size: asset.size,
  };
}

async function fromImages(source: 'camera' | 'photos'): Promise<PickedFile | null> {
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
  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.8 };
  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
  const asset = result.canceled ? undefined : result.assets[0];
  if (!asset) return null;
  const type = asset.mimeType ?? 'image/jpeg';
  const ext = type === 'image/heic' ? 'heic' : type === 'image/png' ? 'png' : 'jpg';
  return {
    uri: asset.uri,
    name: asset.fileName ?? `photo-${Date.now()}.${ext}`,
    type,
    size: asset.fileSize,
  };
}

/** A file to upload from Files, the camera or the photo library; null when cancelled. */
export function pickDocumentFile(source: DocumentSource): Promise<PickedFile | null> {
  return source === 'files' ? fromFiles() : fromImages(source);
}
