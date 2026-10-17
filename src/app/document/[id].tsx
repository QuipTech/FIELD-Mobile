import { router, Stack, useLocalSearchParams } from 'expo-router';
import { SearchX } from 'lucide-react-native';
import { useState } from 'react';

import { DetailScreen, EmptyPanel, toast } from '@/components';
import { ArticleView } from '@/features/knowledge/ArticleView';
import { useArticle } from '@/features/knowledge/data';
import { HeaderActions } from '@/features/knowledge/HeaderActions';

export default function DocumentRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const article = useArticle(id);
  const [largeText, setLargeText] = useState(false);

  if (!article) {
    return (
      <DetailScreen>
        <EmptyPanel
          icon={SearchX}
          title="Document not found"
          message="It may have been replaced."
        />
      </DetailScreen>
    );
  }
  return (
    <>
      <Stack.Screen
        options={{
          title: article.kind,
          headerRight: () => (
            <HeaderActions
              largeText={largeText}
              onToggleText={() => setLargeText((v) => !v)}
              offline={article.offline}
              onDownload={() =>
                toast.show(
                  article.offline
                    ? 'Already saved for offline use.'
                    : 'Offline downloads are coming soon.',
                )
              }
            />
          ),
        }}
      />
      <ArticleView
        article={article}
        largeText={largeText}
        onAskAi={() =>
          router.navigate({ pathname: '/ask-ai', params: { prompt: `About “${article.title}”: ` } })
        }
      />
    </>
  );
}
