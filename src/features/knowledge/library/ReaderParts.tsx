import { router } from 'expo-router';
import { Download, ExternalLink, FileText, Share2, Sparkles, Trash2 } from 'lucide-react-native';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button/Button';
import { Card } from '@/components/Card/Card';
import { Text } from '@/components/Text/Text';
import { toast } from '@/components/Toast/store';
import { openInAppBrowser } from '@/lib/files';
import { errorMessage } from '@/lib/http';
import { makeStyles } from '@/theme';
import { ActionSheet, type SheetAction } from '@/components/ActionSheet/ActionSheet';
import type { Article, useArticle } from './readerApi';
import { useDocumentActions } from './useDocumentActions';

/** pdfUrl is signed for 15 minutes; past ~14 the article is fetched again before opening. */
const STALE_MS = 14 * 60_000;

type Refetch = ReturnType<typeof useArticle>['refetch'];

async function openPdf(article: Article, refetch: Refetch, fetchedAt: number) {
  try {
    let url = article.pdfUrl;
    if (Date.now() - fetchedAt > STALE_MS) url = (await refetch()).data?.pdfUrl ?? null;
    if (!url) throw new Error('This document has no PDF.');
    await openInAppBrowser(url);
  } catch (e) {
    toast.show(errorMessage(e));
  }
}

/** Sticky bottom bar: Download (with progress) and Ask AI scoped to this document. */
export function ReaderBar({ id, title }: { id: string; title: string }) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const docs = useDocumentActions();
  const pct = docs.progress === null ? null : Math.round(docs.progress * 100);
  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + 8 }]}>
      <View style={{ flex: 1 }}>
        <Button
          label={pct === null ? 'Download' : `Downloading ${pct}%`}
          icon={Download}
          variant="secondary"
          onPress={() => void docs.download(id, title)}
          loading={pct !== null && pct === 0}
          disabled={pct !== null}
        />
      </View>
      <View style={{ flex: 1.2 }}>
        <Button
          label="Ask AI about this"
          icon={Sparkles}
          onPress={() => router.navigate({ pathname: '/ask-ai', params: { document: id } })}
        />
      </View>
    </View>
  );
}

/** No text version: the PDF opens in the in-app viewer. */
export function PdfFallback(props: { article: Article; refetch: Refetch; fetchedAt: number }) {
  return (
    <Card style={{ gap: 10, alignItems: 'center' }}>
      <FileText size={28} strokeWidth={1.6} />
      <Text color="muted" style={{ textAlign: 'center' }}>
        This document has no text version yet. Read it as a PDF.
      </Text>
      {props.article.pdfUrl && (
        <Button
          label="Open PDF"
          icon={ExternalLink}
          onPress={() => void openPdf(props.article, props.refetch, props.fetchedAt)}
        />
      )}
    </Card>
  );
}

/** The ⋯ menu: Download, Share, Open PDF (when there is one) and Delete (when allowed). */
export function ReaderMenu(props: {
  visible: boolean;
  onClose: () => void;
  article: Article;
  refetch: Refetch;
  fetchedAt: number;
}) {
  const a = props.article;
  const docs = useDocumentActions();
  const actions: SheetAction[] = [
    { label: 'Download', icon: Download, onPress: () => void docs.download(a.id, a.title) },
    { label: 'Share', icon: Share2, onPress: () => void docs.download(a.id, a.title) },
    ...(a.pdfUrl
      ? [
          {
            label: 'Open PDF',
            icon: ExternalLink,
            onPress: () => void openPdf(a, props.refetch, props.fetchedAt),
          },
        ]
      : []),
    ...(docs.canDelete(a.source)
      ? [
          {
            label: 'Delete',
            icon: Trash2,
            destructive: true,
            onPress: async () => {
              if (await docs.confirmDelete(a.id, a.title)) router.back();
            },
          },
        ]
      : []),
  ];
  return (
    <ActionSheet
      visible={props.visible}
      title={a.title}
      actions={actions}
      onClose={props.onClose}
    />
  );
}

const useStyles = makeStyles((c) => ({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: c.card,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
}));
