// ============================================================
// StadiumIQ — Unit Tests: Analytics & Crowd Insights
// ============================================================

import { generateCrowdInsight } from '@/lib/gemini';

// Note: We test the analytics logEvent functions indirectly through
// the analytics module's graceful failure behavior, and focus
// direct testing on the Gemini crowd insight feature.

describe('generateCrowdInsight — Fallback Mode', () => {
  it('returns a non-empty insight string', async () => {
    const mockData = [
      { zoneId: 'z1', zoneName: 'North Concourse', density: 0.9, trend: 'increasing' as const, location: { lat: 28.61, lng: 77.22 }, lastUpdated: Date.now() },
      { zoneId: 'z2', zoneName: 'West Wing', density: 0.2, trend: 'stable' as const, location: { lat: 28.61, lng: 77.23 }, lastUpdated: Date.now() },
    ];

    const insight = await generateCrowdInsight(mockData);
    expect(typeof insight).toBe('string');
    expect(insight.length).toBeGreaterThan(0);
  });

  it('mentions the busiest zone in the insight', async () => {
    const mockData = [
      { zoneId: 'z1', zoneName: 'Food Court', density: 0.95, trend: 'increasing' as const, location: { lat: 28.61, lng: 77.22 }, lastUpdated: Date.now() },
      { zoneId: 'z2', zoneName: 'Parking', density: 0.1, trend: 'decreasing' as const, location: { lat: 28.61, lng: 77.23 }, lastUpdated: Date.now() },
    ];

    const insight = await generateCrowdInsight(mockData);
    expect(insight).toContain('Food Court');
  });

  it('mentions the quietest zone as a recommendation', async () => {
    const mockData = [
      { zoneId: 'z1', zoneName: 'East Wing', density: 0.8, trend: 'stable' as const, location: { lat: 28.61, lng: 77.22 }, lastUpdated: Date.now() },
      { zoneId: 'z2', zoneName: 'South Gate', density: 0.15, trend: 'decreasing' as const, location: { lat: 28.61, lng: 77.23 }, lastUpdated: Date.now() },
    ];

    const insight = await generateCrowdInsight(mockData);
    expect(insight).toContain('South Gate');
  });

  it('warns about zones with increasing trends', async () => {
    const mockData = [
      { zoneId: 'z1', zoneName: 'Main Entrance', density: 0.5, trend: 'increasing' as const, location: { lat: 28.61, lng: 77.22 }, lastUpdated: Date.now() },
      { zoneId: 'z2', zoneName: 'VIP Area', density: 0.3, trend: 'stable' as const, location: { lat: 28.61, lng: 77.23 }, lastUpdated: Date.now() },
    ];

    const insight = await generateCrowdInsight(mockData);
    expect(insight).toContain('⚠️');
    expect(insight).toContain('Main Entrance');
  });

  it('handles a single zone gracefully', async () => {
    const mockData = [
      { zoneId: 'z1', zoneName: 'Solo Zone', density: 0.5, trend: 'stable' as const, location: { lat: 28.61, lng: 77.22 }, lastUpdated: Date.now() },
    ];

    const insight = await generateCrowdInsight(mockData);
    expect(typeof insight).toBe('string');
    expect(insight).toContain('Solo Zone');
  });

  it('includes percentage data in the insight', async () => {
    const mockData = [
      { zoneId: 'z1', zoneName: 'North Stand', density: 0.75, trend: 'stable' as const, location: { lat: 28.61, lng: 77.22 }, lastUpdated: Date.now() },
      { zoneId: 'z2', zoneName: 'South Stand', density: 0.3, trend: 'decreasing' as const, location: { lat: 28.61, lng: 77.23 }, lastUpdated: Date.now() },
    ];

    const insight = await generateCrowdInsight(mockData);
    expect(insight).toContain('75%');
  });

  it('provides the "Crowd Insight" heading in the output', async () => {
    const mockData = [
      { zoneId: 'z1', zoneName: 'Area A', density: 0.6, trend: 'stable' as const, location: { lat: 28.61, lng: 77.22 }, lastUpdated: Date.now() },
      { zoneId: 'z2', zoneName: 'Area B', density: 0.4, trend: 'stable' as const, location: { lat: 28.61, lng: 77.23 }, lastUpdated: Date.now() },
    ];

    const insight = await generateCrowdInsight(mockData);
    expect(insight).toContain('🔮');
    expect(insight).toContain('Crowd Insight');
  });
});
