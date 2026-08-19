import { InMemoryAnimalsRepository } from './in-memory-animal.repository';

describe('InMemoryAnimalsRepository', () => {
  let repo: InMemoryAnimalsRepository;

  beforeEach(() => {
    repo = new InMemoryAnimalsRepository();
  });

  it('lists seeded animals filtered by type', async () => {
    const cattle = await repo.list({ type: 'Cattle' });
    expect(cattle.length).toBeGreaterThan(0);
    expect(cattle.every((a) => a.type === 'Cattle')).toBe(true);
  });

  it('creates an animal with an incrementing id', async () => {
    const created = await repo.create({
      name: 'Test',
      type: 'Goat',
      health: 'Healthy',
      county: 'Nakuru',
      owner: 'Jane',
      lat: -0.28,
      lng: 36.08,
    });
    expect(created.id).toBeGreaterThan(0);
    const all = await repo.list({});
    expect(all.some((a) => a.id === created.id)).toBe(true);
  });

  it('updates health status and returns null for missing animals', async () => {
    const updated = await repo.updateHealth(1, 'Sick');
    expect(updated).not.toBeNull();
    expect(updated!.health).toBe('Sick');

    const missing = await repo.updateHealth(99999, 'Sick');
    expect(missing).toBeNull();
  });

  it('computes statistics', async () => {
    const stats = await repo.getStatistics();
    expect(stats.totalAnimals).toBeGreaterThan(0);
    expect(stats.counties).toBeGreaterThan(0);
    expect(typeof stats.lastUpdated).toBe('string');
  });
});
