import { useLocalSearchParams } from 'expo-router';

import { ArticleReader } from '@/features/knowledge/library/ArticleReader';

export default function KnowledgeReaderRoute() {
  const { id = '', sectionId } = useLocalSearchParams<{ id: string; sectionId?: string }>();
  return <ArticleReader id={id} sectionId={sectionId} />;
}
