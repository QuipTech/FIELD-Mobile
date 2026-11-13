import { Mail, Phone } from 'lucide-react-native';
import { useState } from 'react';
import { Linking, View } from 'react-native';

import { Button, Card, Input, ListRow, OptionSheet, Pill, Text, toast } from '@/components';
import { formatDateTime } from '@/lib/date';
import { errorMessage } from '@/lib/http';
import { DEMO_STATUSES, useDemoRequest, useUpdateDemoRequest, type DemoRequest } from './demoApi';
import { nameOf, statusOf } from './DemoRequests';
import { Field, Loaded, PlatformAdminScreen } from './shared';

/** One request: contact details, status and internal notes. */
export function DemoRequestDetail({ id }: { id: string }) {
  const request = useDemoRequest(id);
  return (
    <Loaded query={request}>
      {() =>
        request.data ? <DemoRequestForm key={request.data.id} request={request.data} /> : null
      }
    </Loaded>
  );
}

function DemoRequestForm({ request }: { request: DemoRequest }) {
  const save = useUpdateDemoRequest(request.id);
  const [picking, setPicking] = useState(false);
  const [notes, setNotes] = useState(request.notes ?? '');
  const s = statusOf(request.status);
  const update = (patch: { status?: string; notes?: string }, done: string) =>
    save.mutate(patch, {
      onSuccess: () => toast.show(done),
      onError: (e) => toast.show(errorMessage(e)),
    });
  const notesChanged = notes.trim() !== (request.notes ?? '').trim();

  return (
    <PlatformAdminScreen
      footer={
        <Button
          label="Save notes"
          onPress={() => update({ notes: notes.trim() }, 'Notes saved.')}
          loading={save.isPending}
          disabled={!notesChanged}
        />
      }
    >
      <View style={{ gap: 4 }}>
        <Text variant="section">{nameOf(request)}</Text>
        <Text variant="caption" color="muted">
          {[request.company, `Requested ${formatDateTime(request.createdAt)}`]
            .filter(Boolean)
            .join(' · ')}
        </Text>
      </View>
      <Card padded={false} style={{ overflow: 'hidden' }}>
        <ListRow
          title="Status"
          trailing={<Pill label={s.label} tone={s.tone} />}
          onPress={() => setPicking(true)}
          last
        />
      </Card>
      <ContactDetails request={request} />
      <Input
        label="Internal notes"
        value={notes}
        onChangeText={setNotes}
        multiline
        maxLength={4000}
        editable={!save.isPending}
      />
      <OptionSheet<string>
        title={picking ? 'Status' : undefined}
        options={DEMO_STATUSES.map((o) => ({ value: o.value, label: o.label }))}
        value={request.status}
        onChange={(value) => {
          if (value && value !== request.status) update({ status: value }, 'Status updated.');
        }}
        onClose={() => setPicking(false)}
      />
    </PlatformAdminScreen>
  );
}

/** Email / call shortcuts and what the requester told us. */
function ContactDetails({ request }: { request: DemoRequest }) {
  return (
    <>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Button
            label="Email"
            variant="secondary"
            icon={Mail}
            onPress={() => Linking.openURL(`mailto:${request.email}`)}
          />
        </View>
        {request.phone ? (
          <View style={{ flex: 1 }}>
            <Button
              label="Call"
              variant="secondary"
              icon={Phone}
              onPress={() => Linking.openURL(`tel:${request.phone!.replace(/\s/g, '')}`)}
            />
          </View>
        ) : null}
      </View>
      <Card style={{ gap: 12 }}>
        <Field label="Email" value={request.email} />
        <Field label="Phone" value={request.phone} />
        <Field label="Country" value={request.country} />
        <Field label="Message" value={request.message} />
        <Field
          label="Emails"
          value={[
            `Team ${request.teamEmailSentAt ? 'notified' : 'not notified'}`,
            `requester ${request.userEmailSentAt ? 'confirmed' : 'not confirmed'}`,
          ].join(', ')}
        />
      </Card>
    </>
  );
}
