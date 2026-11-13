import { router } from 'expo-router';
import { useState } from 'react';

import { useAccess } from '@/auth/access';
import { useCurrentUser } from '@/auth/useCurrentUser';
import { Button, DetailScreen, ErrorState, Input, Text, toast } from '@/components';
import { errorMessage } from '@/lib/http';
import { useUpdateProfile, type ProfilePatch } from './api';
import { AvatarPicker } from './AvatarPicker';

type User = NonNullable<ReturnType<typeof useCurrentUser>['data']>;
type Profile = ReturnType<typeof useAccess.getState>['profile'];

/**
 * Profile editor: photo, name and phone. Email and company are shown read-only; the API has no
 * endpoint for renaming the organisation yet.
 */
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

/** The editable fields, what changed, and saving them (closes on success). */
function useProfileDraft(user: User, profile: Profile) {
  const savedPhone = profile?.phoneNumber ?? '';
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [phone, setPhone] = useState(savedPhone);
  const save = useUpdateProfile();
  const first = firstName.trim();
  const last = lastName.trim();
  const phoneNumber = phone.trim();
  const phoneChanged = phoneNumber !== savedPhone;
  // A phone number was required at sign-up, so don't let it be cleared.
  const phoneMissing = !!savedPhone && !phoneNumber;
  const changed = first !== user.firstName || last !== user.lastName || phoneChanged;
  const submit = () => {
    const patch: ProfilePatch = {
      firstName: first,
      lastName: last,
      ...(phoneChanged ? { phoneNumber } : {}),
    };
    save.mutate(patch, {
      onSuccess: () => {
        toast.show('Profile updated.');
        router.back();
      },
      onError: (e) => toast.show(errorMessage(e)),
    });
  };
  return {
    fields: { firstName, setFirstName, lastName, setLastName, phone, setPhone },
    fullName: `${first} ${last}`,
    phoneMissing,
    canSave: !!first && !!last && !phoneMissing && changed,
    saving: save.isPending,
    submit,
  };
}

function ProfileForm({ user, profile }: { user: User; profile: Profile }) {
  const draft = useProfileDraft(user, profile);
  const { fields, saving } = draft;
  const company = profile?.tenant?.name;
  return (
    <DetailScreen
      footer={
        <Button
          label="Save changes"
          onPress={draft.submit}
          loading={saving}
          disabled={!draft.canSave}
        />
      }
    >
      <AvatarPicker name={draft.fullName} imageUrl={profile?.avatarUrl ?? user.avatarUrl} />
      <Input
        label="First name"
        value={fields.firstName}
        onChangeText={fields.setFirstName}
        autoComplete="given-name"
        autoCapitalize="words"
        maxLength={100}
        editable={!saving}
      />
      <Input
        label="Last name"
        value={fields.lastName}
        onChangeText={fields.setLastName}
        autoComplete="family-name"
        autoCapitalize="words"
        maxLength={100}
        editable={!saving}
      />
      <Input
        label="Phone"
        value={fields.phone}
        onChangeText={fields.setPhone}
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
        maxLength={30}
        editable={!saving}
        error={draft.phoneMissing ? 'Enter a phone number.' : undefined}
      />
      <Input label="Email" value={user.email} editable={false} />
      {company ? (
        <Input
          label="Company"
          value={company}
          editable={false}
          hint="Contact FIELD support to change your company name."
        />
      ) : null}
    </DetailScreen>
  );
}
