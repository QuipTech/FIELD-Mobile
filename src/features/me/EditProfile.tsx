import { router } from 'expo-router';
import { useState } from 'react';

import { useAccess } from '@/auth/access';
import { useCurrentUser } from '@/auth/useCurrentUser';
import { Avatar, Button, DetailScreen, ErrorState, Input, Text, toast } from '@/components';
import { errorMessage } from '@/lib/http';
import { useUpdateProfile } from './api';

/** Account name editor. Photo uploads need a confirmed backend contract. */
export function EditProfile() {
  const { data: user, error, refetch } = useCurrentUser();
  const profile = useAccess((s) => s.profile);
  if (!user)
    return (
      <DetailScreen>
        {error ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : (
          <Text>Loading profile…</Text>
        )}
      </DetailScreen>
    );
  return <ProfileForm key={user.id} user={user} profile={profile} />;
}

function ProfileForm({
  user,
  profile,
}: {
  user: NonNullable<ReturnType<typeof useCurrentUser>['data']>;
  profile: ReturnType<typeof useAccess.getState>['profile'];
}) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const save = useUpdateProfile();
  const first = firstName.trim();
  const last = lastName.trim();
  const changed = first !== user.firstName || last !== user.lastName;
  const submit = () =>
    save.mutate(
      { firstName: first, lastName: last },
      {
        onSuccess: () => {
          toast.show('Profile updated.');
          router.back();
        },
        onError: (e) => toast.show(errorMessage(e)),
      },
    );
  return (
    <DetailScreen
      footer={
        <Button
          label="Save changes"
          onPress={submit}
          loading={save.isPending}
          disabled={!first || !last || !changed}
        />
      }
    >
      <Avatar name={`${first} ${last}`} imageUrl={profile?.avatarUrl ?? user.avatarUrl} size={80} />
      <Input
        label="First name"
        value={firstName}
        onChangeText={setFirstName}
        autoComplete="given-name"
        autoCapitalize="words"
        maxLength={100}
        editable={!save.isPending}
      />
      <Input
        label="Last name"
        value={lastName}
        onChangeText={setLastName}
        autoComplete="family-name"
        autoCapitalize="words"
        maxLength={100}
        editable={!save.isPending}
      />
      <Input label="Email" value={user.email} editable={false} />
    </DetailScreen>
  );
}
