import { router } from 'expo-router';
import { useState } from 'react';

import { Button, DetailScreen, Input, toast } from '@/components';
import { FilterSelect } from '@/components/FilterChip/FilterChip';
import { useTeamActions, useTeamRoles } from '@/features/team/api';
import { errorMessage } from '@/lib/http';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Invite someone: the API emails them a temporary password. */
export default function TeamInviteRoute() {
  const roles = useTeamRoles();
  const { invite } = useTeamActions();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [roleId, setRoleId] = useState('');
  const ready = EMAIL.test(email.trim()) && !!firstName.trim() && !!lastName.trim() && !!roleId;

  const send = () =>
    invite.mutate(
      { email: email.trim(), firstName: firstName.trim(), lastName: lastName.trim(), roleId },
      {
        onSuccess: () => {
          toast.show(`Invite sent to ${email.trim()}.`);
          router.back();
        },
        onError: (e) => toast.show(errorMessage(e)),
      },
    );

  return (
    <DetailScreen
      footer={
        <Button label="Send invite" onPress={send} disabled={!ready} loading={invite.isPending} />
      }
    >
      <Input label="First name" value={firstName} onChangeText={setFirstName} />
      <Input label="Last name" value={lastName} onChangeText={setLastName} />
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <FilterSelect
        title="Role"
        value={roleId}
        options={[
          { value: '', label: 'Choose a role' },
          ...(roles.data ?? []).map((r) => ({ value: r.id, label: r.name })),
        ]}
        onChange={setRoleId}
      />
    </DetailScreen>
  );
}
