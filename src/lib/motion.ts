import { useReducedMotion } from '@/theme/motion';

/** @deprecated Use `useReducedMotion` from `@/theme`. False while Reduce Motion is on. */
export function useMotionAllowed() {
  return !useReducedMotion();
}
