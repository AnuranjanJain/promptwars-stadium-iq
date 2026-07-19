import {
  buildFallbackOperationsBrief,
  buildSectorSnapshots,
  calculateReadiness,
  INITIAL_OPERATIONS_INCIDENTS,
  OPERATIONS_SCENARIOS,
  STADIUM_SECTORS,
} from '@/lib/operations';
import { initialCrowdData } from '@/lib/venue-data';

describe('operations intelligence', () => {
  it('builds a snapshot for every digital-twin sector', () => {
    const snapshots = buildSectorSnapshots(initialCrowdData, 'steady');

    expect(snapshots).toHaveLength(STADIUM_SECTORS.length);
    expect(snapshots.every(item => item.risk >= 0 && item.risk <= 100)).toBe(true);
    expect(snapshots.every(item => item.predictedDensity >= 0.08 && item.predictedDensity <= 0.99)).toBe(true);
  });

  it('raises Food Hall risk during the halftime scenario', () => {
    const steady = buildSectorSnapshots(initialCrowdData, 'steady').find(item => item.id === 'food');
    const halftime = buildSectorSnapshots(initialCrowdData, 'halftime').find(item => item.id === 'food');

    expect(halftime).toBeDefined();
    expect(steady).toBeDefined();
    expect(halftime!.risk).toBeGreaterThan(steady!.risk);
    expect(halftime!.recommendation).toContain('express kiosk');
  });

  it('calculates bounded readiness and tournament impact metrics', () => {
    const scenario = OPERATIONS_SCENARIOS.find(item => item.id === 'egress')!;
    const snapshots = buildSectorSnapshots(initialCrowdData, scenario.id);
    const metrics = calculateReadiness(snapshots, INITIAL_OPERATIONS_INCIDENTS, scenario);

    expect(metrics.readiness).toBeGreaterThanOrEqual(42);
    expect(metrics.readiness).toBeLessThanOrEqual(98);
    expect(metrics.attendance).toBeGreaterThan(0);
    expect(metrics.accessibilitySla).toBeGreaterThanOrEqual(72);
    expect(metrics.carbonSavedKg).toBeGreaterThan(0);
  });

  it('provides three deterministic actions when Gemini is unavailable', () => {
    const scenario = OPERATIONS_SCENARIOS.find(item => item.id === 'weather')!;
    const snapshots = buildSectorSnapshots(initialCrowdData, scenario.id);
    const brief = buildFallbackOperationsBrief(snapshots, scenario, INITIAL_OPERATIONS_INCIDENTS);

    expect(brief.actions).toHaveLength(3);
    expect(brief.summary).toContain('Weather hold');
    expect(brief.source).toBe('deterministic-fallback');
  });
});
