import { Lock } from 'lucide-react-native';

import { EmptyState, type StateAction } from '../EmptyState/EmptyState';

export type NoAccessProps = {
  title?: string;
  message?: string;
  /** Usually "Go to <section>". */
  primaryAction?: StateAction;
  /** Usually "Contact admin" (customers) or "Request access" (admins). */
  action?: StateAction;
};

/**
 * K7d: shown for a 403 (shared link, citation, removed permission). Takes no item name on
 * purpose: the user must not learn that the brand or document exists.
 */
export function NoAccess({
  title = 'You do not have access to this content',
  message = 'Contact your admin if you need it.',
  primaryAction,
  action,
}: NoAccessProps) {
  return (
    <EmptyState
      icon={Lock}
      title={title}
      message={message}
      primaryAction={primaryAction}
      action={action}
      testID="no-access"
    />
  );
}
