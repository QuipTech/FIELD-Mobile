import { router } from 'expo-router';

import { toast } from '@/components';
import { useFaqs } from '@/features/support/data';
import { Help } from '@/features/support/Help';

export default function HelpRoute() {
  const faqs = useFaqs();
  return (
    <Help
      faqs={faqs}
      onAskAi={() => router.navigate('/ask-ai')}
      onContactSupport={() => router.navigate('/cases')}
      onOpenFaq={(id) => router.push({ pathname: '/help/[id]', params: { id } })}
      onLiveChat={() => toast.show('Live chat is coming soon.')}
      // TODO(api): dial the site coordinator's number once sites expose it.
      onCallCoordinator={() => toast.show('Calling your site coordinator is coming soon.')}
    />
  );
}
