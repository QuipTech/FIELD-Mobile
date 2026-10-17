import { ScrollView, View } from 'react-native';

import { BrandButton } from '@/components/BrandButton/BrandButton';
import { APP_MESH, MeshBackground } from '@/components/MeshBackground/MeshBackground';
import { TabHeader } from '@/components/TabHeader/TabHeader';
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
  /** Shows a small note while plan and usage use sample data. */
  isSample?: boolean;
};

/** M9 Profile & settings (the Me tab). */
export function Me({ name, email, initials, version, isSample, ...sections }: MeProps) {
  const { data, onNavigate } = sections;

  return (
    <View style={styles.root}>
      <MeshBackground spots={APP_MESH} />
      <TabHeader title="Me" />

      <ScrollView contentContainerStyle={styles.content}>
        <ProfileSummary
          name={name}
          email={email}
          initials={initials}
          role={data.role}
          site={data.site}
        />
        <PlanCard plan={data.plan} />
        <View style={styles.actions}>
          <BrandButton
            variant="outline"
            label="Billing"
            onPress={() => onNavigate('billing')}
            style={styles.action}
          />
          <BrandButton
            label="Upgrade"
            onPress={() => onNavigate('upgrade')}
            style={styles.action}
          />
        </View>

        <MeSections {...sections} />

        <Text variant="caption" color="inkSubtle" style={styles.footnote}>
          QuipTech FIELD · Version {version}
          {isSample ? '\nSample plan and usage — live data arrives with the API.' : ''}
        </Text>
      </ScrollView>
    </View>
  );
}
