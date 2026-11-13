import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { colors } from '@/theme';
import { LIFECYCLE, type MachineLifecycle, type MachineStatus } from './data';
import { MachineIcon } from './MachineParts';

/**
 * The machine's cover photo (truck tile if it has none, or the signed URL has expired), with a
 * lifecycle dot on the corner: green when active, amber before activation, grey when archived.
 */
export function MachineThumb({
  photoUrl,
  status,
  lifecycle,
  size = 56,
}: {
  photoUrl?: string;
  status: MachineStatus;
  lifecycle?: MachineLifecycle;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const showPhoto = !!photoUrl && !failed;
  const dot = lifecycle ? LIFECYCLE[lifecycle].dot : undefined;
  return (
    <View
      style={{ width: size, height: size }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {showPhoto ? (
        <Image
          source={{ uri: photoUrl }}
          style={[
            styles.photo,
            { width: size, height: size },
            (lifecycle === 'archived' || lifecycle === 'sold') && styles.dimmed,
          ]}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <MachineIcon status={status} size={size} />
      )}
      {dot && <View style={[styles.dot, { backgroundColor: dot }]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  photo: { borderRadius: 12, backgroundColor: colors.fill },
  dimmed: { opacity: 0.5 },
  dot: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2.5,
    borderColor: colors.surface,
  },
});
