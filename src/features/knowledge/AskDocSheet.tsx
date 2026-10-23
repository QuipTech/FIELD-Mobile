import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { FileSearch, Send } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { IconButton } from '@/components/Button/IconButton';
import { Chip } from '@/components/Chip/Chip';
import { Segmented } from '@/components/Segmented/Segmented';
import { Sheet } from '@/components/Sheet/Sheet';
import { Text } from '@/components/Text/Text';
import {
  borders,
  fontFamily,
  layout,
  makeStyles,
  radii,
  spacing,
  typeScale,
  useTheme,
} from '@/theme';
import type { KnowledgeDoc } from './types';

export type AskScope = 'document' | 'brand';

const SUGGESTIONS = ['Troubleshoot a fault', 'Service intervals', 'Torque specs'];

export type AskDocSheetProps = {
  visible: boolean;
  onClose: () => void;
  doc: KnowledgeDoc;
  onAsk: (question: string, scope: AskScope) => void;
};

/** K6 Ask FIELD AI about this document: scope defaults to the document, widens to the brand. */
export function AskDocSheet({ visible, onClose, doc, onAsk }: AskDocSheetProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const [scope, setScope] = useState<AskScope>('document');
  const [text, setText] = useState('');
  const where = scope === 'document' ? `${doc.brandName} › ${doc.title}` : `All ${doc.brandName}`;
  const send = () => {
    const q = text.trim();
    if (!q) return;
    setText('');
    onAsk(q, scope);
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Ask FIELD AI"
      footer={
        <View style={styles.composer}>
          <BottomSheetTextInput
            value={text}
            onChangeText={setText}
            onSubmitEditing={send}
            placeholder={
              scope === 'document' ? 'Ask about this manual…' : `Ask about ${doc.brandName}…`
            }
            placeholderTextColor={colors.faint}
            returnKeyType="send"
            maxFontSizeMultiplier={layout.maxFontScale}
            style={styles.input}
            accessibilityLabel="Your question"
          />
          <IconButton
            icon={Send}
            color="onButton"
            accessibilityLabel="Ask"
            disabled={!text.trim()}
            onPress={send}
            style={styles.send}
          />
        </View>
      }
    >
      <View style={styles.scope} accessible accessibilityLabel={`Searching in ${where}`}>
        <FileSearch size={16} color={colors.muted} strokeWidth={1.8} />
        <Text variant="caption" style={styles.scopeText} numberOfLines={2}>
          Searching in:{' '}
          <Text variant="caption" style={styles.bold}>
            {where}
          </Text>
        </Text>
      </View>
      <Segmented
        accessibilityLabel="Question scope"
        value={scope}
        onChange={setScope}
        options={[
          { value: 'document', label: 'This document' },
          { value: 'brand', label: `All ${doc.brandName}` },
        ]}
      />
      <Text color="muted">
        Answers cite pages from{' '}
        {scope === 'document' ? 'this document' : `${doc.brandName} documents`} — tap a citation to
        jump to it.
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {SUGGESTIONS.map((s) => (
          <Chip key={s} label={s} onPress={() => setText(s)} />
        ))}
      </ScrollView>
    </Sheet>
  );
}

const useStyles = makeStyles((c) => ({
  scope: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.tight,
    borderRadius: radii.control,
    backgroundColor: c.fill,
  },
  scopeText: { flex: 1, color: c.ink },
  bold: { fontFamily: fontFamily.semibold, color: c.ink },
  chips: { gap: spacing.xs },
  composer: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  input: {
    ...typeScale.body,
    flex: 1,
    height: layout.inputHeight,
    paddingHorizontal: spacing.md,
    color: c.ink,
    borderWidth: borders.control,
    borderColor: c.borderStrong,
    borderRadius: 26,
    backgroundColor: c.card,
  },
  send: { backgroundColor: c.button, borderRadius: 26 },
}));
