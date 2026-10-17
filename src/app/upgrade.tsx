import { toast } from '@/components';
import { usePlanOptions } from '@/features/me/data';
import { Upgrade } from '@/features/me/Upgrade';

export default function UpgradeRoute() {
  const plans = usePlanOptions();
  // TODO(api): create a Stripe Checkout session for the plan and open it in the browser.
  return <Upgrade plans={plans} onCheckout={() => toast.show('Stripe checkout is coming soon.')} />;
}
