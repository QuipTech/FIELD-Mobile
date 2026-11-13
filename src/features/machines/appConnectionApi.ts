import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { http } from '@/lib/http';

/** The tablet paired to a machine (Portal: Machine app tab). */

const enc = encodeURIComponent;

const appConnection = z.object({
  connected: z.boolean(),
  device: z
    .object({
      id: z.string(),
      serialNumber: z.string().nullable().default(null),
      platform: z.string().nullable().default(null),
      appVersion: z.string().nullable().default(null),
      pairedAt: z.string(),
    })
    .nullable()
    .default(null),
});
export type AppConnection = z.infer<typeof appConnection>;

const pairingCode = z.object({
  connected: z.boolean(),
  code: z.string().optional(),
  expiresAt: z.string().optional(),
});
export type PairingCode = z.infer<typeof pairingCode>;

export const appKeys = { one: (id: string) => ['machines', id, 'app-connection'] as const };

const POLL_MS = 5_000;

/** `polling`: while a pairing code is on screen, check every 5 s for the tablet. */
export function useAppConnection(id: string, polling = false) {
  return useQuery({
    queryKey: appKeys.one(id),
    staleTime: 0,
    refetchInterval: polling ? POLL_MS : false,
    queryFn: async () => appConnection.parse(await http.get(`/machines/${enc(id)}/app-connection`)),
  });
}

/** A new 6-digit code; it replaces any earlier one. */
export function useGeneratePairingCode(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      pairingCode.parse(
        await http.post(`/machines/${enc(id)}/app-connection/pairing-code`, undefined, {
          retry: false,
        }),
      ),
    onSuccess: (res) => {
      if (res.connected) void client.invalidateQueries({ queryKey: appKeys.one(id) });
    },
  });
}

export function useDisconnectApp(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => http.delete(`/machines/${enc(id)}/app-connection`, { retry: false }),
    onSettled: () => client.invalidateQueries({ queryKey: appKeys.one(id) }),
  });
}

/** "123456" → "123 456". */
export const formatPairingCode = (code: string) =>
  code.length === 6 ? `${code.slice(0, 3)} ${code.slice(3)}` : code;

/** Milliseconds → "m:ss". */
export function formatCountdown(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}
