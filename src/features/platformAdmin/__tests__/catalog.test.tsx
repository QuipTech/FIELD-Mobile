import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GroupFilter } from '@/features/machines/GroupFilter';
import { ActivityTab, metadataNames } from '../groups/ActivityTab';
import { humanise } from '../groups/groupsApi';
import { MachineGroups } from '../groups/MachineGroups';
import { libraryKeys } from '../library/libraryApi';
import { MachineLibrary } from '../library/MachineLibrary';
import { ModelTree } from '../library/ModelTree';

const MODELS = [
  {
    id: 'm1',
    manufacturerName: 'CAT',
    name: '793F',
    displayName: 'CAT 793F',
    category: 'Haul truck',
    organisation: null,
    isEditable: true,
    systemsCount: 2,
    assetsCount: 14,
  },
  {
    id: 'm2',
    manufacturerName: 'Komatsu',
    name: '930E',
    displayName: 'Komatsu 930E',
    category: null,
    organisation: { id: 'o1', name: 'Red Edge' },
    isEditable: false,
    systemsCount: 0,
    assetsCount: 1,
  },
];
const TREE = {
  modelId: 'm1',
  systems: [
    { id: 's1', name: 'Engine', componentCount: 1, components: [{ id: 'c1', name: 'Turbo' }] },
    {
      id: 's2',
      name: 'Hydraulics',
      componentCount: 1,
      components: [{ id: 'c2', name: 'Main pump' }],
    },
  ],
};

const mockRoutes: Record<string, unknown> = {
  '/admin/machineModels': MODELS,
  '/admin/machineModels/m1/tree': TREE,
  '/admin/machine-groups': [
    {
      id: 'g1',
      name: 'Pilbara fleet',
      colour: '#2563EB',
      description: 'Shared haul trucks',
      machineCount: 3,
      organisationCount: 1,
      userCount: 2,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
  ],
  '/admin/machine-groups/g1/activity': [
    {
      id: 'a1',
      action: 'machine_added',
      metadata: { machineLabel: 'HT-2201' },
      actorName: null,
      createdAt: new Date().toISOString(),
    },
  ],
};

jest.mock('@/lib/http', () => ({
  http: {
    get: jest.fn((path: string) => Promise.resolve(mockRoutes[path])),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
  errorMessage: (e: Error) => e.message,
}));
jest.mock('@/auth/useRole', () => ({
  useRole: () => ({ loaded: true, capabilities: { isPlatformAdmin: true } }),
}));
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
  Stack: { Screen: () => null },
}));

const setup = (ui: ReactElement, client = new QueryClient()) =>
  render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 },
      }}
    >
      <QueryClientProvider client={client}>{ui}</QueryClientProvider>
    </SafeAreaProvider>,
  );

it('lists models with their owner, counts and edit menu only when editable', async () => {
  await setup(<MachineLibrary />);
  expect(await screen.findByText('CAT 793F')).toBeTruthy();
  expect(screen.getByText('Shared')).toBeTruthy();
  expect(screen.getByText('Red Edge')).toBeTruthy();
  expect(screen.getByText('14 assets · Haul truck')).toBeTruthy();
  expect(screen.getByText('2 systems')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'More actions for CAT 793F' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'More actions for Komatsu 930E' })).toBeNull();
});

it('opens the first system, expands all, and uses the returned tree after a change', async () => {
  const client = new QueryClient();
  client.setQueryData(libraryKeys.list(''), MODELS);
  await setup(<ModelTree modelId="m1" />, client);
  expect(await screen.findByText('Turbo')).toBeTruthy();
  expect(screen.queryByText('Main pump')).toBeNull();
  await fireEvent.press(screen.getByText('Expand all'));
  expect(screen.getByText('Main pump')).toBeTruthy();
  // Adding a system shows the tree the server sends back, as is.
  const { http } = jest.requireMock('@/lib/http');
  http.post.mockResolvedValueOnce({
    ...TREE,
    systems: [...TREE.systems, { id: 's3', name: 'Brakes', componentCount: 0, components: [] }],
  });
  const footer = screen.getByRole('button', { name: 'Add system' });
  await fireEvent.press(footer);
  await fireEvent.changeText(screen.getByLabelText('System name'), 'Brakes');
  const submit = screen.getAllByRole('button', { name: 'Add system' }).find((b) => b !== footer)!;
  await fireEvent.press(submit);
  expect(await screen.findByText('Brakes')).toBeTruthy();
  expect(http.post).toHaveBeenCalledWith(
    '/admin/machineModels/m1/systems',
    { name: 'Brakes' },
    { retry: false },
  );
});

it('lists groups with their stats', async () => {
  await setup(<MachineGroups />);
  expect(await screen.findByText('Pilbara fleet')).toBeTruthy();
  expect(screen.getByText('3 machines · 1 org · 2 people')).toBeTruthy();
});

it('shows group activity in plain words, with names from the metadata', async () => {
  await setup(<ActivityTab groupId="g1" />);
  expect(await screen.findByText('Machine added')).toBeTruthy();
  expect(screen.getByText('HT-2201')).toBeTruthy();
  expect(screen.getByText(/^System · /)).toBeTruthy();
  expect(humanise('assignment.revoked')).toBe('Assignment revoked');
  expect(metadataNames(null)).toEqual([]);
});

it('filters the Machines tab by a shared group', async () => {
  const onChange = jest.fn();
  await render(
    <GroupFilter
      groups={[{ id: 'g1', name: 'Pilbara fleet', colour: '#2563EB' }]}
      value={undefined}
      onChange={onChange}
    />,
  );
  await fireEvent.press(screen.getByRole('button', { name: 'Group Pilbara fleet' }));
  expect(onChange).toHaveBeenCalledWith('g1');
  expect(screen.getByRole('button', { name: 'All groups' }).props.accessibilityState).toEqual({
    selected: true,
  });
});
