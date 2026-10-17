import { router, useLocalSearchParams } from 'expo-router';
import { SearchX } from 'lucide-react-native';

import { DetailScreen, EmptyPanel } from '@/components';
import { useFaq } from '@/features/support/data';
import { FaqArticleView } from '@/features/support/FaqArticleView';

export default function FaqRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const article = useFaq(id);

  if (!article) {
    return (
      <DetailScreen>
        <EmptyPanel icon={SearchX} title="Article not found" message="It may have been moved." />
      </DetailScreen>
    );
  }
  return (
    <FaqArticleView
      article={article}
      onContactSupport={() => router.navigate('/cases')}
      // TODO(api): record article feedback with the knowledge-base API.
      onFeedback={() => undefined}
    />
  );
}
