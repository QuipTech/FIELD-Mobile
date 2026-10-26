import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Share as ShareIcon, SearchX, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, Share, View } from 'react-native';

import { Button, EmptyPanel, ErrorState, IconButton, Screen, SkeletonList } from '@/components';
import { useDocPage, useKnowledgeDoc } from '@/features/knowledge/api';
import { useRecordView } from '@/features/knowledge/personal';
import { AskDocSheet } from '@/features/knowledge/AskDocSheet';
import { DocInfo } from '@/features/knowledge/DocInfo';
import { DocumentViewer } from '@/features/knowledge/DocumentViewer';
import type { KnowledgeDoc } from '@/features/knowledge/types';
import { env } from '@/lib/env';
import { ApiError } from '@/lib/http';
import { documentWebUrl } from '@/lib/links';

const toKnowledge = { label: 'Go to Knowledge', onPress: () => router.navigate('/knowledge') };

export default function DocumentRoute() {
  const { id, page, section } = useLocalSearchParams<{
    id: string;
    page?: string;
    section?: string;
  }>();
  const doc = useKnowledgeDoc(id);

  if (doc.isPending && !doc.error) {
    return (
      <Screen>
        <SkeletonList rows={4} />
      </Screen>
    );
  }
  if (!doc.data) {
    const missing = doc.error instanceof ApiError && doc.error.isNotFound;
    return (
      <Screen>
        {missing ? (
          <EmptyPanel
            icon={SearchX}
            title="Document not found"
            message="It may have been replaced."
          />
        ) : (
          <ErrorState
            error={doc.error}
            onRetry={() => doc.refetch()}
            noAccessAction={toKnowledge}
          />
        )}
      </Screen>
    );
  }
  return <Viewer doc={doc.data} initialPage={Number(page) || 1} section={section} />;
}

function Viewer({
  doc,
  initialPage,
  section,
}: {
  doc: KnowledgeDoc;
  initialPage: number;
  section?: string;
}) {
  const [pageNumber, setPageNumber] = useState(Math.min(initialPage, doc.pageCount));
  const [sheet, setSheet] = useState<'info' | 'ask'>();
  const page = useDocPage(doc.id, pageNumber, doc.title);
  useRecordView(doc.id, pageNumber);
  const share = () => {
    const url = documentWebUrl(env.webUrl, doc.id, pageNumber);
    const label = `${doc.title} (p.${pageNumber})`;
    // iOS takes the link separately (rich preview in Messages); Android only shares `message`.
    const content =
      Platform.OS === 'ios' ? { message: label, url } : { message: `${label}\n${url}` };
    Share.share(content).catch(() => undefined);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: doc.title,
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <IconButton icon={ShareIcon} accessibilityLabel="Share" onPress={share} />
              <Button label="Ask AI" icon={Sparkles} size="small" onPress={() => setSheet('ask')} />
            </View>
          ),
        }}
      />
      <DocumentViewer
        doc={doc}
        pageNumber={pageNumber}
        page={page.data}
        // Only the cited page outlines the section.
        sectionId={pageNumber === initialPage ? section : undefined}
        onPage={setPageNumber}
        onInfo={() => setSheet('info')}
      />
      <DocInfo doc={doc} visible={sheet === 'info'} onClose={() => setSheet(undefined)} />
      <AskDocSheet
        visible={sheet === 'ask'}
        onClose={() => setSheet(undefined)}
        doc={doc}
        onAsk={(q, scope) => {
          setSheet(undefined);
          router.navigate({
            pathname: '/ask-ai',
            params: {
              prompt: q,
              ...(scope === 'document' ? { document: doc.id } : { brand: doc.brandId }),
            },
          });
        }}
      />
    </>
  );
}
