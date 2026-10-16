import { Truck } from 'lucide-react-native';
import { View } from 'react-native';

import { Card, ListRow, Tag, Text, toast } from '@/components';
import { formatDate } from '@/lib/date';
import { formatHours } from '@/lib/format';
import { Section } from './Section';

export function DataSection() {
  return (
    <Section title="Tags · Cards · Rows">
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Tag label="Open" tone="accent" dot />
        <Tag label="Resolved" tone="success" />
        <Tag label="Pending sync" tone="warning" />
        <Tag label="Info" tone="info" />
        <Tag label="Enterprise" tone="ink" />
        <Tag label="Overdue" tone="solidAccent" />
      </View>
      <Card onPress={() => toast.show('Card pressed')} accessibilityLabel="CAT 793F">
        <Text variant="overline" color="inkMuted">
          Haul truck
        </Text>
        <Text variant="heading">CAT 793F · #HT-14</Text>
        <Text color="inkMuted">
          {formatHours(12480)} · read {formatDate('2026-10-02')}
        </Text>
      </Card>
      <Card emphasis>
        <Text variant="heading">SLA breached</Text>
        <Text color="accentText">Response overdue by 2 h</Text>
      </Card>
      <View>
        <ListRow
          icon={Truck}
          title="Komatsu PC2000"
          subtitle="Pit 3 · Serial KMT20045"
          meta={formatHours(8420)}
          onPress={() => undefined}
        />
        <ListRow
          title="Static row"
          subtitle="No chevron"
          trailing={<Tag label="Down" tone="accent" />}
        />
      </View>
    </Section>
  );
}
