import { useEffect, useState } from 'react';
import { Alert, BackHandler } from 'react-native';

import type { Machine } from '@/features/machines/data';
import { DetailsStep, NotesStep } from './FormSteps';
import { PhotosStep } from './PhotosStep';
import { emptyDraft, type CaptureDraft } from './store';

export type CaptureFlowProps = {
  machines: Machine[];
  /** Prefill, e.g. the machine when started from its detail page. */
  initial?: Partial<CaptureDraft>;
  onSave: (draft: CaptureDraft & { machineId: string }) => void;
  onClose: () => void;
};

/** M6 Capture flow: details → photos → notes & hours, then save to the machine's history. */
export function CaptureFlow({ machines, initial, onSave, onClose }: CaptureFlowProps) {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState(() => emptyDraft(initial));
  const update = (patch: Partial<CaptureDraft>) => setDraft((d) => ({ ...d, ...patch }));

  const dirty = !!draft.title.trim() || draft.photos.length > 0 || !!draft.notes.trim();
  const close = () => {
    if (!dirty) return onClose();
    Alert.alert('Discard this entry?', 'Your details and photos will be lost.', [
      { text: 'Keep editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: onClose },
    ]);
  };

  // Android back steps back through the flow before leaving it (re-bound each render: cheap).
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (step > 1) setStep(step - 1);
      else close();
      return true;
    });
    return () => sub.remove();
  });

  const save = () => {
    if (draft.machineId) onSave({ ...draft, machineId: draft.machineId });
  };
  const steps = { draft, update, machines, onClose: close };

  if (step === 2) {
    return (
      <PhotosStep
        photos={draft.photos}
        onChange={(photos) => update({ photos })}
        onClose={close}
        onNext={() => setStep(3)}
      />
    );
  }
  if (step === 3) return <NotesStep {...steps} onBack={() => setStep(2)} onSave={save} />;
  return <DetailsStep {...steps} onNext={() => setStep(2)} />;
}
