import { Inbox } from 'lucide-react-native';
import { useState } from 'react';

import {
  Button,
  EmptyState,
  ErrorState,
  Sheet,
  Skeleton,
  SkeletonList,
  Text,
  toast,
} from '@/components';
import { ApiError, NetworkError } from '@/lib/http';
import { Section } from './Section';

export function StatesSection() {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <Section title="States · Overlays">
      <Skeleton width="50%" height={20} />
      <SkeletonList rows={2} />
      <EmptyState
        icon={Inbox}
        title="No open cases"
        message="Cases you raise with support will appear here."
        action={{ label: 'Raise a case', onPress: () => undefined }}
      />
      <ErrorState error={new ApiError(500, 'Boom')} onRetry={() => undefined} />
      <ErrorState error={new NetworkError('offline')} onRetry={() => undefined} />
      <Button label="Open sheet" variant="secondary" onPress={() => setSheetOpen(true)} />
      <Button
        label="Show error toast"
        variant="secondary"
        onPress={() => toast.error('Upload failed')}
      />
      <Sheet visible={sheetOpen} onClose={() => setSheetOpen(false)} title="Filter machines">
        <Text>Sheet content goes here.</Text>
        <Button label="Apply" onPress={() => setSheetOpen(false)} />
      </Sheet>
    </Section>
  );
}
