import { router } from 'expo-router';

import { useKnowledgeModels } from '@/features/knowledge/library/api';
import { openLibraryForModel } from '@/features/knowledge/library/filters';
import type { Machine } from './data';

/**
 * Manuals › "Search all manuals": the Knowledge list filtered to this machine's model. The model
 * id comes from the machine, else by name from the Knowledge models; with neither, the machine's
 * own manuals screen opens.
 */
export function useOpenManuals(machine: Machine | undefined) {
  const models = useKnowledgeModels();
  return () => {
    if (!machine) return;
    const name = machine.model.toLowerCase();
    const modelId =
      machine.modelId ??
      models.data?.find((m) => m.displayName.toLowerCase() === name)?.id ??
      models.data?.find((m) => name.endsWith(m.displayName.toLowerCase()))?.id;
    if (modelId) openLibraryForModel(modelId);
    else router.push({ pathname: '/machine/[id]/manuals', params: { id: machine.id } });
  };
}
