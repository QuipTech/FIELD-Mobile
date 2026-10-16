import { create } from 'zustand';

import { motion } from '@/theme';

export type ToastTone = 'neutral' | 'success' | 'error';
export type ToastItem = { id: number; message: string; tone: ToastTone };

type ToastState = {
  current: ToastItem | null;
  show: (message: string, tone?: ToastTone) => void;
  dismiss: () => void;
};

let nextId = 1;
let timer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>((set) => ({
  current: null,
  show: (message, tone = 'neutral') => {
    if (timer) clearTimeout(timer);
    set({ current: { id: nextId++, message, tone } });
    timer = setTimeout(() => set({ current: null }), motion.toastDuration);
  },
  dismiss: () => {
    if (timer) clearTimeout(timer);
    set({ current: null });
  },
}));

/** Imperative API usable outside React (e.g. from mutation callbacks). */
export const toast = {
  show: (message: string) => useToastStore.getState().show(message, 'neutral'),
  success: (message: string) => useToastStore.getState().show(message, 'success'),
  error: (message: string) => useToastStore.getState().show(message, 'error'),
};
