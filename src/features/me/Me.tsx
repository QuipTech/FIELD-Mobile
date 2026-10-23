import { ScrollView, View } from 'react-native';

import { TabHeader } from '@/components/TabHeader/TabHeader';
import { APP_MESH, MeshBackground } from '@/components/MeshBackground/MeshBackground';
import { Text } from '@/components/Text/Text';
import { MeSections, type MeSectionsProps } from './MeSections';
import { PlanCard, ProfileSummary } from './ProfileCards';
import { styles } from './styles';

export type MeProps = MeSectionsProps & {
  name: string;
  email: string;
  initials: string;
  /** App version shown at the bottom, e.g. "1.0.0". */
  version: string;
};

/** M9 Profile & settings (the Me tab). */
export function Me({ name, email, initials, version, ...sections }: MeProps) {
  const { data, isAdmin } = sections;

  return (
    <View style={styles.root}>
      <MeshBackground spots={APP_MESH} />
      <TabHeader title="Me" />

      <ScrollView contentContainerStyle={styles.content}>
        <ProfileSummary
          name={name}
          email={email}
          initials={initials}
          isAdmin={isAdmin}
          site={data.site}
        />
        {data.plan && <PlanCard plan={data.plan} />}

        <MeSections {...sections} />

        <Text variant="caption" color="inkSubtle" style={styles.footnote}>
          QuipTech FIELD · Version {version}
        </Text>
      </ScrollView>
    </View>
  );
}
