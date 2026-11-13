import { View } from 'react-native';

import { Card, ListRow, Pill, Text } from '@/components';
import { formatDate } from '@/lib/date';
import { useAiPlatform, useAiPrompts, useAiUsage, type AiUsage, type PromptVersion } from './aiApi';
import { Loaded, PlatformAdminScreen, RowCard, SectionTitle } from './shared';

const count = (n: number) => n.toLocaleString('en-AU');
const money = (n: number) =>
  n === 0
    ? '$0'
    : n < 0.00001
      ? '< $0.00001'
      : `$${n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 5 })}`;

function Kpi({ label, value, caption }: { label: string; value: string; caption: string }) {
  return (
    <Card style={{ flexBasis: '47%', flexGrow: 1, gap: 2 }}>
      <Text variant="caption" color="muted">
        {label}
      </Text>
      <Text variant="kpi">{value}</Text>
      <Text variant="caption" color="muted">
        {caption}
      </Text>
    </Card>
  );
}

function Usage({ usage }: { usage: AiUsage }) {
  const change = usage.changePercent;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      <Kpi
        label="Total queries"
        value={count(usage.totalQueries)}
        caption={
          change == null
            ? 'No queries in the prior period'
            : `${change >= 0 ? '↑' : '↓'} ${Math.abs(change)}% vs prior period`
        }
      />
      <Kpi
        label="Active users"
        value={count(usage.activeUsers)}
        caption={`of ${count(usage.totalUsers)} on the platform`}
      />
      <Kpi
        label="Avg. cost / query"
        value={money(usage.avgCostPerQuery)}
        caption={`${money(usage.totalCost)} total`}
      />
      <Kpi
        label="Flagged for review"
        value={count(usage.unreviewedCount)}
        caption={`of ${count(usage.flaggedInPeriod)} flagged`}
      />
    </View>
  );
}

const versionLine = (v: PromptVersion) => {
  const published = !!v.publishedAt;
  const by = published ? v.publishedByName : v.createdByName;
  return `${published ? 'Published' : 'Saved'} ${formatDate(v.publishedAt ?? v.createdAt)}${by ? ` by ${by}` : ''}`;
};

/** Models, usage and system prompt versions (portal: Admin › AI configuration). */
export function AiConfiguration() {
  const platform = useAiPlatform();
  const usage = useAiUsage();
  const prompts = useAiPrompts();
  return (
    <PlatformAdminScreen>
      <SectionTitle>Last 30 days</SectionTitle>
      <Loaded query={usage}>{() => usage.data && <Usage usage={usage.data} />}</Loaded>

      <SectionTitle>Platform</SectionTitle>
      <Loaded query={platform}>
        {() =>
          platform.data && (
            <Card padded={false} style={{ overflow: 'hidden' }}>
              <ListRow
                title="Provider"
                subtitle={platform.data.provider}
                trailing={platform.data.region ? <Pill label={platform.data.region} /> : undefined}
              />
              {platform.data.models.map((m, i, all) => (
                <ListRow
                  key={m.role}
                  title={m.label}
                  subtitle={[m.role, m.purpose].filter(Boolean).join(' · ')}
                  last={i === all.length - 1}
                />
              ))}
            </Card>
          )
        }
      </Loaded>
      <Text variant="caption" color="muted">
        Platform-managed for every tenant. No keys, endpoints or model choices here.
      </Text>

      <SectionTitle>System prompt versions</SectionTitle>
      <Loaded query={prompts}>
        {() => (
          <RowCard empty="No prompt versions yet.">
            {[...(prompts.data ?? [])]
              .sort((a, b) => b.versionNumber - a.versionNumber)
              .map((v, i, all) => (
                <ListRow
                  key={v.id}
                  title={`v${v.versionNumber}`}
                  subtitle={[versionLine(v), v.notes].filter(Boolean).join(' · ')}
                  trailing={v.isLive ? <Pill label="Live" tone="success" /> : undefined}
                  last={i === all.length - 1}
                />
              ))}
          </RowCard>
        )}
      </Loaded>
      <Text variant="caption" color="muted">
        Edit, test and publish prompts in the FIELD web portal.
      </Text>
    </PlatformAdminScreen>
  );
}
