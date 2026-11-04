import { router } from 'expo-router';
import { ExternalLink } from 'lucide-react-native';

import { Button } from '@/components/Button/Button';
import { DetailScreen } from '@/components/DetailScreen/DetailScreen';
import { Text } from '@/components/Text/Text';
import { openSupportUrl, supportUrl, type LegalPage as LegalPageKind } from './links';

/** Links to the approved legal text; the app never substitutes a generated policy. */
export function LegalPage({ kind }: { kind: LegalPageKind }) {
  const url = supportUrl(kind);
  const title = kind === 'privacyPolicy' ? 'Privacy policy' : 'Terms of service';
  return (
    <DetailScreen>
      <Text variant="section">{title}</Text>
      <Text color="muted">
        {url
          ? `Read the official FIELD ${title.toLowerCase()} in your browser.`
          : 'This document is currently unavailable. Please contact your organisation administrator or support for a copy.'}
      </Text>
      {url ? (
        <Button
          label={`Read ${title.toLowerCase()}`}
          icon={ExternalLink}
          onPress={() => void openSupportUrl(url)}
        />
      ) : (
        <Button label="Contact support" variant="secondary" onPress={() => router.push('/cases')} />
      )}
    </DetailScreen>
  );
}
