import { RefreshCw } from 'lucide-react-native';
import { ActivityIndicator } from 'react-native';

import { PressableScale } from '@/components/PressableScale/PressableScale';
import { toast } from '@/components/Toast/store';
import { errorMessage } from '@/lib/http';
import { useTheme } from '@/theme';
import { useRefreshFromStripe } from './billingApi';

export function StripeRefreshButton() {
  const refresh = useRefreshFromStripe();
  const { colors } = useTheme();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={refresh.isPending ? 'Checking Stripe…' : 'Refresh from Stripe'}
      accessibilityState={{ disabled: refresh.isPending, busy: refresh.isPending }}
      disabled={refresh.isPending}
      style={({ pressed }) => ({
        width: 48,
        height: 48,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: pressed ? colors.primaryTint : colors.card,
        alignItems: 'center',
        justifyContent: 'center',
      })}
      onPress={() =>
        refresh.mutate(undefined, {
          onSuccess: (msg) => toast.show(msg),
          onError: (e) => toast.show(errorMessage(e) || "Couldn't reach Stripe. Please try again."),
        })
      }
    >
      {refresh.isPending ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <RefreshCw size={21} color={colors.primary} strokeWidth={2} />
      )}
    </PressableScale>
  );
}
