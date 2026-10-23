import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import { useRole } from '@/auth/useRole';
import { NoAccess, toast } from '@/components';
import { AskAi, NO_MACHINE } from '@/features/assistant/AskAi';
import { useAttachedImage } from '@/features/assistant/attachImage';
import { toAiUsage } from '@/features/assistant/data';
import { useAiUsageReport } from '@/features/assistant/usage';
import { useAskAi } from '@/features/assistant/useAskAi';
import { openDoc } from '@/features/knowledge/navigation';
import { useMachines } from '@/features/machines/api';
import { errorMessage } from '@/lib/http';

export default function AskAiRoute() {
  const params = useLocalSearchParams<{
    prompt?: string;
    machine?: string;
    conversation?: string;
    /** Scope the next question to one Knowledge document or brand. */
    document?: string;
    brand?: string;
  }>();
  const { capabilities, isAdmin, loaded } = useRole();
  const { data: machines = [] } = useMachines();
  const usage = useAiUsageReport(capabilities.canUseAi);
  const chat = useAskAi();
  const [machineId, setMachineId] = useState(params.machine ?? NO_MACHINE);
  const photo = useAttachedImage(toast.show);

  // "Ask AI" from a machine page switches the context to that machine and starts a new thread.
  const [lastMachine, setLastMachine] = useState(params.machine);
  if (params.machine !== lastMachine) {
    setLastMachine(params.machine);
    if (params.machine) setMachineId(params.machine);
  }

  const [docScope, setDocScope] = useDocScope(params.document, params.brand);

  // Reopening a past conversation from AI history.
  const { open } = chat;
  useEffect(() => {
    if (params.conversation) open(params.conversation).catch((e) => toast.show(errorMessage(e)));
  }, [params.conversation, open]);

  if (loaded && !capabilities.canUseAi) return <NoAccess title="Ask AI isn’t on for you" />;

  const changeMachine = (id: string) => {
    setMachineId(id);
    chat.newChat(); // the machine is fixed when a thread starts
  };

  return (
    <AskAi
      machines={machines}
      machineId={machineId}
      onMachineChange={changeMachine}
      messages={chat.messages}
      busy={chat.busy}
      isAdmin={isAdmin}
      usage={usage.data ? toAiUsage(usage.data, isAdmin) : undefined}
      prompt={params.prompt}
      onSend={(text) => {
        chat.send(
          text,
          { ...docScope, ...(machineId !== NO_MACHINE && { machineId }) },
          photo.image,
        );
        setDocScope({});
        photo.clear();
      }}
      onNewChat={chat.newChat}
      onHistory={() => router.push('/ai-history')}
      onAttach={photo.attach}
      image={photo.image}
      onRemoveImage={photo.clear}
      onVoice={() => toast.show('Voice questions are coming soon.')}
      onOpenCitation={(c) =>
        c.documentId
          ? openDoc(c.documentId, c.page, c.sectionId)
          : toast.show('This source can’t be opened in the app.')
      }
      onFeedback={(messageId, rating) =>
        chat
          .rate(messageId, rating)
          .then(() => toast.show(rating === 'wrong' ? 'Sent for review. Thanks.' : 'Thanks.'))
          .catch((e) => toast.show(errorMessage(e)))
      }
      onLogEntry={() =>
        router.push({ pathname: '/capture', params: machineId === NO_MACHINE ? {} : { machineId } })
      }
      onRaiseCase={() =>
        router.push({
          pathname: '/new-case',
          params: machineId === NO_MACHINE ? {} : { machineId },
        })
      }
    />
  );
}

/** "Ask AI" from a document scopes the next question to it (or its brand). */
function useDocScope(documentId?: string, brandId?: string) {
  const [scope, setScope] = useState<{ documentId?: string; brandId?: string }>({});
  const key = `${documentId ?? ''}|${brandId ?? ''}`;
  const [last, setLast] = useState(key);
  if (key !== last) {
    setLast(key);
    setScope({ documentId, brandId });
  }
  return [scope, setScope] as const;
}
