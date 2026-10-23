import { apiCase, apiMessage, toActivity, toSupportCase } from '../schema';

describe('case parsing', () => {
  const raw = {
    caseNumber: 1042,
    subject: "Brake pressure alarm won't clear",
    status: 'waiting_on_customer',
    priority: 'P1',
    createdAt: '2026-10-20T01:00:00.000Z',
    updatedAt: '2026-10-21T01:00:00.000Z',
    machine: { id: 'm-1', fleetNumber: 'HT-2201', manufacturer: 'CAT', model: '793F' },
    assignee: { id: 's1', firstName: 'Rae', lastName: 'Mendes' },
    sla: { state: 'due_soon', dueAt: '2026-10-21T03:00:00.000Z', minutesRemaining: 42 },
  };

  it('maps an API case to the screen shape, keyed by case number', () => {
    const c = toSupportCase(apiCase.parse(raw));
    expect(c).toMatchObject({
      id: '1042',
      status: 'open',
      rawStatus: 'waiting_on_customer',
      summary: 'awaiting your reply',
      machine: { id: 'm-1', label: 'HT-2201', model: 'CAT 793F' },
      assignee: 'Rae Mendes',
      slaBreaching: true,
    });
  });

  it('allows cases without a machine and treats closed as resolved', () => {
    const c = toSupportCase(apiCase.parse({ ...raw, machine: null, status: 'closed' }));
    expect(c.machine).toBeUndefined();
    expect(c.status).toBe('resolved');
  });

  it('marks my own messages and internal notes', () => {
    const mine = toActivity(
      apiMessage.parse({ id: 'a', body: 'Hi', createdAt: raw.createdAt, author: { id: 'u1' } }),
      'u1',
    );
    expect(mine).toMatchObject({ author: 'You', mine: true });
    const note = toActivity(
      apiMessage.parse({
        id: 'b',
        body: 'Warranty likely',
        createdAt: raw.createdAt,
        isInternal: true,
        author: { id: 's1', name: 'Rae Mendes' },
      }),
      'u1',
    );
    expect(note).toMatchObject({ author: 'Rae Mendes', initials: 'RM', internal: true });
  });
});
