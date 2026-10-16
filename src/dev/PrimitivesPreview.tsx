import { ButtonsSection } from './ButtonsSection';
import { DataSection } from './DataSection';
import { FormsSection } from './FormsSection';
import { StatesSection } from './StatesSection';

/** Step 1 visual check of every primitive. Delete once real screens exist. */
export function PrimitivesPreview() {
  return (
    <>
      <ButtonsSection />
      <FormsSection />
      <DataSection />
      <StatesSection />
    </>
  );
}
