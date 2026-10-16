import { LayoutGrid, ScanLine, Sparkles, type LucideIcon } from 'lucide-react-native';

export type GuideStep = { key: string; icon: LucideIcon; title: string; body: string };

// Step 1 is from the M2b design. TODO(confirm): steps 2–3 aren't in the design yet.
export const GUIDE_STEPS: GuideStep[] = [
  {
    key: 'welcome',
    icon: Sparkles,
    title: 'Welcome to QuipTech FIELD',
    body: 'Machine history, manuals and AI-backed answers, right in your pocket. A quick look at what you can do.',
  },
  {
    key: 'actions',
    icon: ScanLine,
    title: 'Ask AI or scan an asset',
    body: 'Ask about a fault in plain words, or scan a machine to jump straight to its history and manuals.',
  },
  {
    key: 'tabs',
    icon: LayoutGrid,
    title: 'Everything one tap away',
    body: 'Machines, support cases and your profile live in the bar below. Ask AI is always in the middle.',
  },
];
