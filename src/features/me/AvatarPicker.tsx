import { Camera } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Avatar, PressableScale, toast } from '@/components';
import { errorMessage } from '@/lib/http';
import { makeStyles, useTheme } from '@/theme';
import { useUploadAvatar } from './api';
import { pickAvatar } from './pickAvatar';

const SIZE = 80;

/** Tap the avatar to take or choose a photo; it uploads straight away. */
export function AvatarPicker({ name, imageUrl }: { name: string; imageUrl?: string | null }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const upload = useUploadAvatar();
  const [preview, setPreview] = useState<string>();
  const change = async () => {
    try {
      const file = await pickAvatar();
      if (!file) return;
      setPreview(file.uri);
      upload.mutate(file, {
        onSuccess: () => toast.show('Profile photo updated.'),
        onError: (e) => {
          setPreview(undefined);
          toast.show(errorMessage(e));
        },
      });
    } catch (e) {
      toast.show(e instanceof Error ? e.message : 'Couldn’t choose that photo.');
    }
  };
  return (
    <PressableScale
      onPress={change}
      disabled={upload.isPending}
      accessibilityRole="button"
      accessibilityLabel="Change profile photo"
      accessibilityState={{ busy: upload.isPending }}
      containerStyle={styles.wrap}
    >
      <Avatar name={name} imageUrl={preview ?? imageUrl} size={SIZE} />
      {upload.isPending ? (
        <View style={styles.busy}>
          <ActivityIndicator color={colors.onButton} />
        </View>
      ) : null}
      <View style={styles.badge}>
        <Camera size={14} color={colors.onButton} strokeWidth={2} />
      </View>
    </PressableScale>
  );
}

const useStyles = makeStyles((c) => ({
  wrap: { alignSelf: 'center' },
  busy: {
    ...StyleSheet.absoluteFill,
    borderRadius: SIZE / 2,
    backgroundColor: c.scrim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: c.button,
    borderWidth: 2,
    borderColor: c.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
