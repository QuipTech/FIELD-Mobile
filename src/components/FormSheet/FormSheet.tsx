import { useState, type ReactNode } from 'react';

import { errorMessage } from '@/lib/http';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { ModalSheet } from '../ModalSheet/ModalSheet';
import { Text } from '../Text/Text';

export type FormField = {
  key: string;
  label: string;
  required?: boolean;
  multiline?: boolean;
  placeholder?: string;
  maxLength?: number;
  /** Shown under the field. */
  hint?: string;
  /** Minimum trimmed length when required (default 1). */
  minLength?: number;
};

type FormSheetProps = {
  visible: boolean;
  title: string;
  fields: FormField[];
  initial?: Record<string, string>;
  submitLabel: string;
  destructive?: boolean;
  onSubmit: (values: Record<string, string>) => Promise<unknown>;
  onClose: () => void;
  /** Extra controls under the fields (e.g. a colour picker). */
  children?: ReactNode;
  intro?: string;
};

/**
 * A sheet with text fields and one submit button. Input is kept when the request fails and the
 * server's message shows above the button. `onSubmit` resolves when done (the sheet then closes).
 */
export function FormSheet(props: FormSheetProps) {
  // Mounted only while open, so every opening starts from `initial` with no stale error.
  return props.visible ? <OpenFormSheet {...props} /> : null;
}

function OpenFormSheet(props: FormSheetProps) {
  const [values, setValues] = useState<Record<string, string>>(() => props.initial ?? {});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const valid = props.fields.every(
    (f) => !f.required || (values[f.key] ?? '').trim().length >= (f.minLength ?? 1),
  );
  const submit = async () => {
    setBusy(true);
    setError(undefined);
    try {
      const trimmed = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim()]));
      await props.onSubmit(trimmed);
      props.onClose();
    } catch (e) {
      setError(errorMessage(e) || "That didn't work. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalSheet
      visible
      title={props.title}
      onClose={props.onClose}
      busy={busy}
      footer={
        <Button
          label={props.submitLabel}
          variant={props.destructive ? 'danger' : 'primary'}
          onPress={() => void submit()}
          disabled={!valid}
          loading={busy}
        />
      }
    >
      {!!props.intro && <Text color="muted">{props.intro}</Text>}
      {props.fields.map((f, i) => (
        <Input
          key={f.key}
          label={f.required ? f.label : `${f.label} (optional)`}
          value={values[f.key] ?? ''}
          onChangeText={(v) => setValues((s) => ({ ...s, [f.key]: v }))}
          placeholder={f.placeholder}
          hint={f.hint}
          multiline={f.multiline}
          maxLength={f.maxLength ?? (f.multiline ? 500 : 120)}
          autoFocus={i === 0}
          editable={!busy}
        />
      ))}
      {props.children}
      {!!error && <Text color="danger">{error}</Text>}
    </ModalSheet>
  );
}
