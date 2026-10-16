import { ArrowRight, Bell, ScanLine } from 'lucide-react-native';

import { Button, IconButton, toast } from '@/components';
import { Section } from './Section';

export function ButtonsSection() {
  return (
    <Section title="Buttons">
      <Button label="Scan asset" icon={ScanLine} onPress={() => toast.show('Primary pressed')} />
      <Button label="Continue" icon={ArrowRight} variant="secondary" onPress={() => undefined} />
      <Button label="Saving…" loading onPress={() => undefined} />
      <Button label="Disabled" disabled onPress={() => undefined} />
      <Button label="Forgot password?" variant="ghost" onPress={() => undefined} />
      <IconButton icon={Bell} accessibilityLabel="Notifications" onPress={() => undefined} />
    </Section>
  );
}
