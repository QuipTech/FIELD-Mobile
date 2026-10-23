import { compareSnapshots, snapshotVersion } from '../compare';
import { sampleRecords } from '@/test/fixtures/machines/records';

const changes = sampleRecords('HT-2201').configuration;

describe('compareSnapshots', () => {
  it('turns "part: old → new" changes into a before/after row', () => {
    const [pump] = compareSnapshots(changes, changes[1]!.id, changes[0]!.id);
    expect(pump).toEqual({
      title: 'Hydraulic pump',
      rows: [{ field: 'Part no.', before: '4T-9410', after: '4T-9455' }],
    });
  });

  it('works in either order and is empty for the same snapshot', () => {
    expect(compareSnapshots(changes, changes[0]!.id, changes[2]!.id)).toHaveLength(2);
    expect(compareSnapshots(changes, changes[0]!.id, changes[0]!.id)).toEqual([]);
  });

  it('numbers snapshots oldest = v1', () => {
    expect(snapshotVersion(changes, changes[changes.length - 1]!.id)).toBe(1);
  });
});
