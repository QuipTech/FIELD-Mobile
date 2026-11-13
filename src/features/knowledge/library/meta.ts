import {
  AlertTriangle,
  BookOpen,
  FileText,
  Layers,
  ListChecks,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react-native';

import type { LibraryType } from './api';

/** Type label and icon, matching the web portal. */
export const TYPE_META: Record<LibraryType, { label: string; plural: string; icon: LucideIcon }> = {
  manual: { label: 'Manual', plural: 'Manuals', icon: BookOpen },
  bulletin: { label: 'Bulletin', plural: 'Bulletins', icon: AlertTriangle },
  knownIssue: { label: 'Known issue', plural: 'Known issues', icon: AlertTriangle },
  procedure: { label: 'Procedure', plural: 'Procedures', icon: ListChecks },
  policy: { label: 'Safety & policy', plural: 'Safety & policy', icon: ShieldCheck },
  parts_book: { label: 'Parts book', plural: 'Parts books', icon: Layers },
  guide: { label: 'Guide', plural: 'Guides', icon: FileText },
};

/** The order of the type filter in the sheet. */
export const TYPE_ORDER: LibraryType[] = [
  'guide',
  'knownIssue',
  'manual',
  'procedure',
  'bulletin',
  'policy',
  'parts_book',
];

/** Unknown types from a newer API still get a sensible label and icon. */
export function typeMeta(type: string) {
  return (
    TYPE_META[type as LibraryType] ?? {
      label: type.replace(/[_-]+/g, ' ').replace(/^\w/, (c) => c.toUpperCase()),
      plural: type,
      icon: FileText,
    }
  );
}

/** "Hemisphere VR1000" → "HV". */
export function initials(name: string) {
  const words = name
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .trim()
    .split(/\s+/);
  return ((words[0]?.[0] ?? '?') + (words[1]?.[0] ?? '')).toUpperCase();
}
