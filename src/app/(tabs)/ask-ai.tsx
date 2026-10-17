import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { toast } from '@/components';
import { AskAi, NO_MACHINE } from '@/features/assistant/AskAi';
import { NOT_CONNECTED, SAMPLE_THREAD, type ChatMessage } from '@/features/assistant/data';
import { useMachines } from '@/features/machines/data';

export default function AskAiRoute() {
  const params = useLocalSearchParams<{ prompt?: string; machine?: string }>();
  const { data: machines } = useMachines();
  const [machineId, setMachineId] = useState(params.machine ?? 'HT-2201');
  // TODO(api): stream answers from the Ask AI endpoint; until then questions get a notice.
  const [messages, setMessages] = useState<ChatMessage[]>(SAMPLE_THREAD);

  // "Ask AI" from a machine page switches the context to that machine.
  const [lastMachine, setLastMachine] = useState(params.machine);
  if (params.machine !== lastMachine) {
    setLastMachine(params.machine);
    if (params.machine) setMachineId(params.machine);
  }

  const send = (text: string) => {
    const at = Date.now();
    setMessages((m) => [
      ...m,
      { id: `u-${at}`, role: 'user', text },
      { id: `n-${at}`, role: 'notice', text: NOT_CONNECTED },
    ]);
  };

  return (
    <AskAi
      machines={machines}
      machineId={machineId}
      onMachineChange={setMachineId}
      messages={messages}
      prompt={params.prompt}
      onSend={send}
      onNewChat={() => setMessages([])}
      onHistory={() => router.push('/ai-history')}
      onAttach={() => toast.show('Attaching photos is coming soon.')}
      onVoice={() => toast.show('Voice questions are coming soon.')}
      onOpenCitation={(c) =>
        c.articleId
          ? router.push({ pathname: '/document/[id]', params: { id: c.articleId } })
          : toast.show('Opening manual pages is coming soon.')
      }
      onLogEntry={() =>
        router.push({
          pathname: '/capture',
          params: machineId === NO_MACHINE ? {} : { machineId },
        })
      }
      onRaiseCase={() => toast.show('Raising cases from Ask AI is coming soon.')}
    />
  );
}
