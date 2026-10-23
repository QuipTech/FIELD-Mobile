/** Fake FIELD API for tests: `fetch` answers from fixtures shaped like the staging API's. */

import { EXTRA_ROUTES } from './fakeApiRoutes';
import { knowledgeRoute } from './fakeKnowledge';

type Json = unknown;
type Route = (url: URL, init?: RequestInit) => Json | undefined;

const machine = (m: {
  id: string;
  serial: string;
  make: string;
  model: string;
  site: string | null;
  hours: number | null;
  status: 'running' | 'down' | 'service_due';
}) => ({
  id: m.id,
  label: m.id,
  serialNumber: m.serial,
  manufacturer: m.make,
  model: m.model,
  machineClass: 'haul truck',
  site: m.site,
  operatingHours: m.hours,
  status: m.status,
});

export const API_MACHINES = [
  machine({
    id: 'HT-2201',
    serial: '4GZ01288',
    make: 'CAT',
    model: '793F',
    site: 'Pit 4',
    hours: 14208,
    status: 'down',
  }),
  machine({
    id: 'LD-0904',
    serial: 'A90217',
    make: 'Komatsu',
    model: 'WA900',
    site: 'Pit 4',
    hours: 9771,
    status: 'service_due',
  }),
  machine({
    id: 'HT-2188',
    serial: '4GZ01107',
    make: 'CAT',
    model: '793F',
    site: 'Pit 2',
    hours: 18402,
    status: 'running',
  }),
];

const machineDetail = (m: (typeof API_MACHINES)[number]) => ({
  ...m,
  fleetNumber: m.id,
  modelId: 'c81a2c9a-f495-4570-953d-037a32aef72c',
  plantId: null,
  hoursReadAt: '2026-10-20T14:22:52.328Z',
  owner: { id: 'u1', name: 'Jo Okoye', avatarUrl: null },
  openCaseCount: 1,
});

export const API_HISTORY = [
  {
    id: 'e1',
    entryType: 'fault',
    description: 'E-2204 · accumulator pre-charge low',
    isAmendment: false,
    createdAt: '2026-02-28T12:00:00.000Z',
    author: null,
    component: null,
    operatingHours: 14100,
    downtimeHours: null,
    photos: [],
  },
  {
    id: 'e2',
    entryType: 'repair',
    description: 'Main hydraulic pump replaced',
    isAmendment: false,
    createdAt: '2026-03-12T12:00:00.000Z',
    author: { id: 'u1', name: 'J. Okoye' },
    component: null,
    operatingHours: 14208,
    downtimeHours: 3.5,
    photos: [{ id: 'p1' }, { id: 'p2' }],
  },
];

const component = (id: string, systemId: string, systemName: string, condition: string | null) => ({
  id,
  systemId,
  systemName,
  name: id,
  condition,
  caption: 'No history recorded',
});

export const API_COMPONENTS = [
  component('Engine', 'pt', 'Powertrain', null),
  component('Transmission', 'pt', 'Powertrain', 'worn'),
  component('Hydraulic pump', 'hy', 'Hydraulics', null),
];

export const API_DASHBOARD = {
  openCases: { total: 1, breachingSla: 0, byPriority: { P1: 1, P2: 0, P3: 0 } },
  machinesDown: { total: 1, machines: [API_MACHINES[0]] },
  entriesThisWeek: { total: 2, mine: 1 },
  fleetUptime: {
    trackingSince: '2026-08-31T00:00:00.000Z',
    averagePercent: 91.4,
    weeks: [88, 92, 85, 95, 90, 97, 87, 94].map((uptimePercent, i) => ({
      weekStart: `2026-09-${String(1 + i * 7).padStart(2, '0')}`,
      uptimePercent,
    })),
  },
  recentActivity: [
    {
      id: 'entry-e2',
      kind: 'history_entry',
      title: 'Repair logged on HT-2201',
      caption: 'J. Okoye · Main hydraulic pump replaced',
      occurredAt: '2026-03-12T12:00:00.000Z',
      href: '/machines/HT-2201/history',
      tag: null,
    },
  ],
  myMachines: API_MACHINES.slice(0, 2),
};

const NOT_FOUND = Symbol('not found');

const ROUTES: Route[] = [
  ...EXTRA_ROUTES,
  knowledgeRoute,
  (u) => (u.pathname === '/dashboard' ? API_DASHBOARD : undefined),
  (u) =>
    u.pathname === '/machines'
      ? {
          items: API_MACHINES,
          total: API_MACHINES.length,
          page: 1,
          pageSize: 100,
          facets: { sites: ['Pit 2', 'Pit 4'], makes: [], classes: ['haul truck'] },
          featuredDown: null,
        }
      : undefined,
  (u) => {
    const m = u.pathname.match(/^\/machines\/([^/]+)(\/history|\/components)?$/);
    if (!m) return undefined;
    const found = API_MACHINES.find((x) => x.id === decodeURIComponent(m[1]!));
    if (!found) return NOT_FOUND;
    if (m[2] === '/history') return API_HISTORY;
    if (m[2] === '/components') return API_COMPONENTS;
    return machineDetail(found);
  },
];

function respond(status: number, body: Json) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (h: string) => (h.toLowerCase() === 'content-type' ? 'application/json' : null),
    },
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

/** Installs the fake API on `globalThis.fetch` for the current test file. */
export function installFakeApi() {
  const fetchMock = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input));
    for (const route of ROUTES) {
      const body = route(url, init);
      if (body === NOT_FOUND)
        return respond(404, { message: 'Machine not found', statusCode: 404 });
      if (body && typeof body === 'object' && '__status' in body) {
        const { __status, body: errorBody } = body as { __status: number; body: Json };
        return respond(__status, errorBody);
      }
      if (body !== undefined) return respond(200, body);
    }
    return respond(404, {
      message: `Cannot ${init?.method ?? 'GET'} ${url.pathname}`,
      statusCode: 404,
    });
  });
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}
