import { useState } from 'react';

import { Input, Seg } from '@/components';
import { Section } from './Section';

const RANGES = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: 'all', label: 'All' },
] as const;

export function FormsSection() {
  const [range, setRange] = useState<(typeof RANGES)[number]['value']>('30d');
  const [hours, setHours] = useState('12480');

  return (
    <Section title="Inputs">
      <Input label="Email" placeholder="you@company.com.au" keyboardType="email-address" />
      <Input
        label="Hours"
        value={hours}
        onChangeText={setHours}
        keyboardType="numeric"
        hint="Last reading 12,410 h on 2 Oct"
      />
      <Input label="Serial" value="CAT0793F" error="Serial not found in your fleet" />
      <Seg options={RANGES} value={range} onChange={setRange} accessibilityLabel="Date range" />
    </Section>
  );
}
