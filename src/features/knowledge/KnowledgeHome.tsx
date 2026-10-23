import { Bell, Plus } from 'lucide-react-native';
import { View } from 'react-native';

import { IconButton } from '@/components/Button/IconButton';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { Screen } from '@/components/Screen/Screen';
import { Skeleton } from '@/components/Skeleton/Skeleton';
import { TabHeader } from '@/components/TabHeader/TabHeader';
import { makeStyles, spacing } from '@/theme';
import { DocRow } from './DocRow';
import { Attention, Recent } from './HomeSections';
import { OfflineLibrary } from './OfflineLibrary';
import { BrandTile, RowCard, SectionHeader } from './Parts';
import { SearchEntry } from './SearchEntry';
import type { Brand, KnowledgeDoc } from './types';

export type KnowledgeHomeProps = {
  brands: Brand[] | undefined;
  brandsLoading: boolean;
  brandsError?: unknown;
  onRetry: () => void;
  recent: { doc: KnowledgeDoc; page?: number; viewedAt: string }[];
  forMachines?: { models: string[]; docs: KnowledgeDoc[] };
  /** Admin only. */
  attention?: { inReview: number; failed: KnowledgeDoc[] };
  isAdmin: boolean;
  offline: boolean;
  savedDocs: KnowledgeDoc[];
  onSearch: () => void;
  onNotifications: () => void;
  onUpload?: () => void;
  onOpenBrand: (id: string) => void;
  onOpenDoc: (id: string, page?: number) => void;
  onOpenReview: () => void;
};

/** K1 Knowledge home: search, the brands the company can access, recent and suggested docs. */
export function KnowledgeHome(props: KnowledgeHomeProps) {
  const { isAdmin, offline } = props;
  const styles = useStyles();
  const right = (
    <View style={styles.headerActions}>
      {isAdmin && props.onUpload && (
        <IconButton icon={Plus} accessibilityLabel="Upload a document" onPress={props.onUpload} />
      )}
      <IconButton icon={Bell} accessibilityLabel="Notifications" onPress={props.onNotifications} />
    </View>
  );

  // K7c: with no connection the list falls back to documents saved on this device.
  if (offline) {
    return (
      <>
        <TabHeader title="Knowledge" right={right} />
        <OfflineLibrary
          docs={props.savedDocs}
          onRetry={props.onRetry}
          onOpenDoc={props.onOpenDoc}
        />
      </>
    );
  }

  return (
    <>
      <TabHeader title="Knowledge" right={right} />
      <Screen>
        <SearchEntry label="Search manuals, bulletins, parts..." onPress={props.onSearch} />
        <View style={styles.section}>
          <SectionHeader
            title="Your brands"
            right={props.brands ? `${props.brands.length} brands` : undefined}
          />
          <Brands {...props} />
        </View>
        {isAdmin ? (
          props.attention && <Attention {...props.attention} onOpen={props.onOpenReview} />
        ) : (
          <>
            {props.recent.length > 0 && <Recent items={props.recent} onOpenDoc={props.onOpenDoc} />}
            {props.forMachines && props.forMachines.docs.length > 0 && (
              <View style={styles.section}>
                <SectionHeader
                  title="For your machines"
                  right={props.forMachines.models.join(' · ')}
                />
                <RowCard>
                  {props.forMachines.docs.map((d, i, all) => (
                    <DocRow
                      key={d.id}
                      doc={d}
                      last={i === all.length - 1}
                      onPress={() => props.onOpenDoc(d.id)}
                    />
                  ))}
                </RowCard>
              </View>
            )}
          </>
        )}
      </Screen>
    </>
  );
}

function Brands({ brands, brandsLoading, brandsError, onRetry, onOpenBrand }: KnowledgeHomeProps) {
  const styles = useStyles();
  if (brandsLoading) {
    return (
      <View style={styles.grid} accessibilityLabel="Loading brands">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} width="47%" height={72} radius={14} />
        ))}
      </View>
    );
  }
  if (!brands) return <ErrorState error={brandsError} onRetry={onRetry} />;
  return (
    <View style={styles.grid}>
      {brands.map((b) => (
        <BrandTile key={b.id} brand={b} onPress={() => onOpenBrand(b.id)} />
      ))}
    </View>
  );
}

const useStyles = makeStyles(() => ({
  headerActions: { flexDirection: 'row', gap: spacing.xxs },
  section: { gap: spacing.tight },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.tight },
}));
