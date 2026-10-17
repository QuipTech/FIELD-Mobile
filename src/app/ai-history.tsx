import { useState } from 'react';
import { Alert } from 'react-native';

import { toast } from '@/components';
import { AiHistory } from '@/features/history/AiHistory';
import { useAiHistory } from '@/features/history/data';

export default function AiHistoryRoute() {
  const initial = useAiHistory();
  // TODO(api): load and clear conversations through the Ask AI history endpoints.
  const [conversations, setConversations] = useState(initial);

  const confirmClear = () =>
    Alert.alert('Clear AI history?', 'This removes all your past Ask AI conversations.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => setConversations([]) },
    ]);

  return (
    <AiHistory
      conversations={conversations}
      onOpen={() => toast.show('Reopening past conversations is coming soon.')}
      onClear={confirmClear}
    />
  );
}
