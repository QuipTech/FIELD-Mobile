import { Stack } from 'expo-router';
import { FileX, ListTree, MoreHorizontal } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/Button/IconButton';
import { EmptyPanel } from '@/components/EmptyPanel/EmptyPanel';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { SkeletonList } from '@/components/Skeleton/SkeletonList';
import { Text } from '@/components/Text/Text';
import { ApiError } from '@/lib/http';
import { fontFamily, makeStyles, useTheme } from '@/theme';
import { useArticle, type ArticleFigure } from './readerApi';
import { LinkCard, MetaChips, SectionView } from './ArticleBody';
import { ContentsSheet } from './ContentsSheet';
import { PdfFallback, ReaderBar, ReaderMenu } from './ReaderParts';
import { useSectionScroll } from './useSectionScroll';
import { openReader } from './openReader';
import { ZoomImage } from './ZoomImage';

/** Screen 2: the document as an article, with contents, figures and related documents. */
export function ArticleReader({ id, sectionId }: { id: string; sectionId?: string }) {
  const article = useArticle(id);
  const [menu, setMenu] = useState(false);
  const header = (
    <Stack.Screen
      options={{
        title: article.data?.title ?? 'Document',
        headerRight: () =>
          article.data ? (
            <IconButton
              icon={MoreHorizontal}
              accessibilityLabel="More actions"
              onPress={() => setMenu(true)}
            />
          ) : null,
      }}
    />
  );

  if (article.isPending) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        {header}
        <SkeletonList rows={6} />
      </View>
    );
  }
  if (article.error) {
    const missing = article.error instanceof ApiError && article.error.status === 404;
    return (
      <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
        {header}
        {missing ? (
          <EmptyPanel
            icon={FileX}
            title="Not available"
            message="This document was removed or isn't live."
          />
        ) : (
          <ErrorState
            error={article.error}
            onRetry={() => void article.refetch()}
            retrying={article.isRefetching}
          />
        )}
      </View>
    );
  }
  return (
    <>
      {header}
      <ReaderContent
        article={article.data}
        sectionId={sectionId}
        refetch={article.refetch}
        fetchedAt={article.dataUpdatedAt}
      />
      <ReaderMenu
        visible={menu}
        onClose={() => setMenu(false)}
        article={article.data}
        refetch={article.refetch}
        fetchedAt={article.dataUpdatedAt}
      />
    </>
  );
}

function ReaderContent({
  article: a,
  sectionId,
  refetch,
  fetchedAt,
}: {
  article: NonNullable<ReturnType<typeof useArticle>['data']>;
  sectionId?: string;
  refetch: ReturnType<typeof useArticle>['refetch'];
  fetchedAt: number;
}) {
  const styles = useStyles();
  const { scrollRef, scrollTo, onSectionLayout, onContainerLayout, onScroll, current, flash } =
    useSectionScroll(
      a.sections.map((s) => s.id),
      sectionId,
    );
  const [contents, setContents] = useState(false);
  const [zoom, setZoom] = useState<ArticleFigure>();
  const hasSections = a.sections.length > 0;

  return (
    <View style={styles.root}>
      <ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={64}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title} accessibilityRole="header">
          {a.title}
        </Text>
        <MetaChips article={a} />
        {!!a.summary && (
          <View style={styles.summary}>
            <Text>{a.summary}</Text>
          </View>
        )}
        {hasSections ? (
          <View style={{ gap: 8 }} onLayout={(e) => onContainerLayout(e.nativeEvent.layout.y)}>
            {a.sections.map((s) => (
              <SectionView
                key={s.id}
                section={s}
                flash={flash === s.id}
                onLayoutY={onSectionLayout}
                onZoom={setZoom}
              />
            ))}
          </View>
        ) : (
          <PdfFallback article={a} refetch={refetch} fetchedAt={fetchedAt} />
        )}
        <LinkCard title="Related documents" links={a.related} onOpen={(rid) => openReader(rid)} />
        <LinkCard
          title="Applies to bulletins"
          links={a.appliesBulletins}
          onOpen={(rid) => openReader(rid)}
        />
      </ScrollView>
      {a.sections.length > 1 && <ContentsButton onPress={() => setContents(true)} />}
      <ReaderBar id={a.id} title={a.title} />
      <ContentsSheet
        visible={contents}
        sections={a.sections}
        current={current}
        onPick={(sid) => scrollTo(sid)}
        onClose={() => setContents(false)}
      />
      <ZoomImage
        uri={zoom?.imageUrl ?? undefined}
        caption={zoom?.caption}
        onClose={() => setZoom(undefined)}
      />
    </View>
  );
}

function ContentsButton({ onPress }: { onPress: () => void }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.fab, { bottom: 88 + insets.bottom }]}
      accessibilityRole="button"
      accessibilityLabel="Contents"
    >
      <ListTree size={18} color={colors.onButton} strokeWidth={2} />
      <Text variant="caption" color="onButton" style={styles.fabText}>
        Contents
      </Text>
    </Pressable>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.bg },
  content: { padding: 16, gap: 14, paddingBottom: 120 },
  title: { fontFamily: fontFamily.semibold, fontSize: 22, lineHeight: 28 },
  summary: { backgroundColor: c.primaryTint, borderRadius: 12, padding: 14 },
  fab: {
    position: 'absolute',
    right: 16,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: c.button,
  },
  fabText: { fontFamily: fontFamily.medium },
}));
