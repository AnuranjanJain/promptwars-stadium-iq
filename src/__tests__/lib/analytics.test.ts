// ============================================================
// StadiumIQ — Unit Tests: Analytics & Crowd Insights
// Extended to cover logEvent, logPageView, logInteraction,
// logPerformanceMetric, logError, and getRecentEvents.
// ============================================================

// Mock Firestore operations to prevent hanging connections
jest.mock('firebase/firestore', () => {
  const actual = jest.requireActual('firebase/firestore');
  return {
    ...actual,
    addDoc: jest.fn().mockResolvedValue({ id: 'mock-doc-id' }),
    getDocs: jest.fn().mockResolvedValue({ docs: [] }),
  };
});

import { generateCrowdInsight } from '@/lib/gemini';
import {
  logEvent,
  logPageView,
  logInteraction,
  logPerformanceMetric,
  logError,
  getRecentEvents,
} from '@/lib/analytics';


// --- Crowd Insight Tests (Gemini Fallback) ---

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

// --- Analytics Functions - Direct Tests ---

describe('logEvent', () => {
  it('does not throw when logging a valid event', async () => {
    await expect(logEvent('page_view', 'TestPage')).resolves.not.toThrow();
  });

  it('handles optional metadata', async () => {
    await expect(
      logEvent('chat_message', 'ChatPage', { queryType: 'food', responseTime: 200 })
    ).resolves.not.toThrow();
  });

  it('handles undefined metadata', async () => {
    await expect(logEvent('map_interaction', 'MapPage', undefined)).resolves.not.toThrow();
  });
});

describe('logPageView', () => {
  it('does not throw when logging a page view', async () => {
    await expect(logPageView('Home')).resolves.not.toThrow();
  });

  it('handles various page names', async () => {
    const pages = ['Home', 'Chat', 'Map', 'Queues', 'Navigate', 'Feed'];
    for (const page of pages) {
      await expect(logPageView(page)).resolves.not.toThrow();
    }
  });
});

describe('logInteraction', () => {
  it('does not throw when logging an interaction', async () => {
    await expect(logInteraction('HeatmapZone', 'click')).resolves.not.toThrow();
  });

  it('handles interaction with details', async () => {
    await expect(
      logInteraction('QueueSort', 'sort', { sortBy: 'waitTime', direction: 'asc' })
    ).resolves.not.toThrow();
  });
});

describe('logPerformanceMetric', () => {
  it('does not throw when logging a metric', async () => {
    await expect(
      logPerformanceMetric('LCP', 1200, { page: 'Home' })
    ).resolves.not.toThrow();
  });

  it('handles metric without context', async () => {
    await expect(logPerformanceMetric('FID', 50)).resolves.not.toThrow();
  });
});

describe('logError', () => {
  it('does not throw when logging an error', async () => {
    await expect(
      logError('api', 'Test error message', 'error')
    ).resolves.not.toThrow();
  });

  it('handles default severity', async () => {
    await expect(logError('render', 'Test')).resolves.not.toThrow();
  });

  it('handles error with context', async () => {
    await expect(
      logError('network', 'Timeout', 'warning', { endpoint: '/api/chat', duration: 30000 })
    ).resolves.not.toThrow();
  });
});

describe('getRecentEvents', () => {
  it('returns an array', async () => {
    const events = await getRecentEvents();
    expect(Array.isArray(events)).toBe(true);
  });

  it('handles custom maxEvents parameter', async () => {
    const events = await getRecentEvents(10);
    expect(Array.isArray(events)).toBe(true);
  });

  it('returns empty array when Firestore is unavailable', async () => {
    // Without real Firebase credentials, should gracefully return []
    const events = await getRecentEvents();
    expect(events).toEqual([]);
  });
});
