// ============================================================
// StadiumIQ — Unit Tests: Crowd Simulator Engine
// ============================================================

import {
  simulateCrowdUpdate,
  simulateQueueUpdate,
  simulateGameUpdate,
  generatePredictions,
} from '@/lib/crowd-simulator';
import { CrowdDensity, QueueInfo, GameState } from '@/types';

// --- Test Fixtures ---

const mockCrowdData: CrowdDensity[] = [
  { zoneId: 'zone-1', zoneName: 'North Concourse', density: 0.5, trend: 'stable', location: { lat: 28.6142, lng: 77.2295 }, lastUpdated: Date.now() - 10_000 },
  { zoneId: 'zone-2', zoneName: 'Food Court', density: 0.9, trend: 'increasing', location: { lat: 28.6135, lng: 77.2290 }, lastUpdated: Date.now() - 10_000 },
  { zoneId: 'zone-3', zoneName: 'South Wing', density: 0.1, trend: 'decreasing', location: { lat: 28.6116, lng: 77.2295 }, lastUpdated: Date.now() - 10_000 },
];

const mockQueueData: QueueInfo[] = [
  { poiId: 'q-1', poiName: 'Pizza Corner', category: 'food', currentWaitMinutes: 8, estimatedServeTime: 3, queueLength: 20, trend: 'stable', bestTimeToVisit: 'Good time!', location: { lat: 28.6120, lng: 77.2305 } },
  { poiId: 'q-2', poiName: 'Restroom South', category: 'restroom', currentWaitMinutes: 2, estimatedServeTime: 1, queueLength: 5, trend: 'decreasing', bestTimeToVisit: 'Good time!', location: { lat: 28.6116, lng: 77.2300 } },
  { poiId: 'q-3', poiName: 'Biryani Bowl', category: 'food', currentWaitMinutes: 18, estimatedServeTime: 6, queueLength: 45, trend: 'increasing', bestTimeToVisit: 'Try later', location: { lat: 28.6118, lng: 77.2288 } },
];

const mockGameState: GameState = {
  homeTeam: 'Delhi Titans',
  awayTeam: 'Mumbai Warriors',
  homeScore: 2,
  awayScore: 1,
  period: '2nd Half',
  timeRemaining: '67:23',
  status: 'live',
  sport: 'Football',
};

// --- simulateCrowdUpdate ---

describe('simulateCrowdUpdate', () => {
  it('returns the same number of zones', () => {
    const result = simulateCrowdUpdate(mockCrowdData);
    expect(result).toHaveLength(mockCrowdData.length);
  });

  it('preserves zone IDs and names', () => {
    const result = simulateCrowdUpdate(mockCrowdData);
    result.forEach((zone, i) => {
      expect(zone.zoneId).toBe(mockCrowdData[i].zoneId);
      expect(zone.zoneName).toBe(mockCrowdData[i].zoneName);
    });
  });

  it('keeps density within bounds [0.05, 0.98]', () => {
    // Run multiple iterations to test bounds
    let data = mockCrowdData;
    for (let i = 0; i < 100; i++) {
      data = simulateCrowdUpdate(data);
    }
    data.forEach(zone => {
      expect(zone.density).toBeGreaterThanOrEqual(0.05);
      expect(zone.density).toBeLessThanOrEqual(0.98);
    });
  });

  it('sets a valid trend value', () => {
    const result = simulateCrowdUpdate(mockCrowdData);
    result.forEach(zone => {
      expect(['increasing', 'decreasing', 'stable']).toContain(zone.trend);
    });
  });

  it('updates the lastUpdated timestamp', () => {
    const result = simulateCrowdUpdate(mockCrowdData);
    result.forEach(zone => {
      expect(zone.lastUpdated).toBeGreaterThanOrEqual(mockCrowdData[0].lastUpdated);
    });
  });

  it('produces rounded density values (2 decimal places)', () => {
    const result = simulateCrowdUpdate(mockCrowdData);
    result.forEach(zone => {
      const decimals = zone.density.toString().split('.')[1]?.length || 0;
      expect(decimals).toBeLessThanOrEqual(2);
    });
  });

  it('preserves location data', () => {
    const result = simulateCrowdUpdate(mockCrowdData);
    result.forEach((zone, i) => {
      expect(zone.location).toEqual(mockCrowdData[i].location);
    });
  });
});

// --- simulateQueueUpdate ---

describe('simulateQueueUpdate', () => {
  it('returns the same number of queues', () => {
    const result = simulateQueueUpdate(mockQueueData);
    expect(result).toHaveLength(mockQueueData.length);
  });

  it('keeps wait time within bounds [1, 30]', () => {
    let data = mockQueueData;
    for (let i = 0; i < 100; i++) {
      data = simulateQueueUpdate(data);
    }
    data.forEach(queue => {
      expect(queue.currentWaitMinutes).toBeGreaterThanOrEqual(1);
      expect(queue.currentWaitMinutes).toBeLessThanOrEqual(30);
    });
  });

  it('ensures queue length is always >= 1', () => {
    const result = simulateQueueUpdate(mockQueueData);
    result.forEach(queue => {
      expect(queue.queueLength).toBeGreaterThanOrEqual(1);
    });
  });

  it('calculates estimated serve time correctly', () => {
    const result = simulateQueueUpdate(mockQueueData);
    result.forEach(queue => {
      expect(queue.estimatedServeTime).toBe(Math.ceil(queue.currentWaitMinutes / 3));
    });
  });

  it('sets valid trend values', () => {
    const result = simulateQueueUpdate(mockQueueData);
    result.forEach(queue => {
      expect(['increasing', 'decreasing', 'stable']).toContain(queue.trend);
    });
  });

  it('provides relevant bestTimeToVisit advice', () => {
    const result = simulateQueueUpdate(mockQueueData);
    result.forEach(queue => {
      expect(typeof queue.bestTimeToVisit).toBe('string');
      expect(queue.bestTimeToVisit.length).toBeGreaterThan(0);
    });
  });

  it('preserves POI identity fields', () => {
    const result = simulateQueueUpdate(mockQueueData);
    result.forEach((queue, i) => {
      expect(queue.poiId).toBe(mockQueueData[i].poiId);
      expect(queue.poiName).toBe(mockQueueData[i].poiName);
      expect(queue.category).toBe(mockQueueData[i].category);
    });
  });
});

// --- simulateGameUpdate ---

describe('simulateGameUpdate', () => {
  it('advances game time by 15 seconds', () => {
    const result = simulateGameUpdate(mockGameState);
    expect(result.timeRemaining).toBe('67:38');
  });

  it('rolls over seconds correctly at 60', () => {
    const state: GameState = { ...mockGameState, timeRemaining: '44:50' };
    const result = simulateGameUpdate(state);
    expect(result.timeRemaining).toBe('45:05');
  });

  it('preserves team names', () => {
    const result = simulateGameUpdate(mockGameState);
    expect(result.homeTeam).toBe('Delhi Titans');
    expect(result.awayTeam).toBe('Mumbai Warriors');
  });

  it('preserves sport field', () => {
    const result = simulateGameUpdate(mockGameState);
    expect(result.sport).toBe('Football');
  });

  it('scores never decrease', () => {
    const result = simulateGameUpdate(mockGameState);
    expect(result.homeScore).toBeGreaterThanOrEqual(mockGameState.homeScore);
    expect(result.awayScore).toBeGreaterThanOrEqual(mockGameState.awayScore);
  });

  it('transitions to halftime at 45 min in 1st Half', () => {
    const firstHalfState: GameState = { ...mockGameState, period: '1st Half', timeRemaining: '44:50' };
    const result = simulateGameUpdate(firstHalfState);
    expect(result.status).toBe('halftime');
  });

  it('transitions to finished at 45 min in 2nd Half', () => {
    const secondHalfState: GameState = { ...mockGameState, period: '2nd Half', timeRemaining: '44:50' };
    const result = simulateGameUpdate(secondHalfState);
    expect(result.status).toBe('finished');
  });

  it('keeps live status before 45 minutes', () => {
    const earlyState: GameState = { ...mockGameState, timeRemaining: '30:00' };
    const result = simulateGameUpdate(earlyState);
    expect(result.status).toBe('live');
  });
});

// --- generatePredictions ---

describe('generatePredictions', () => {
  it('returns predictions for each zone', () => {
    const result = generatePredictions(mockCrowdData);
    expect(result).toHaveLength(mockCrowdData.length);
  });

  it('includes 15min, 30min, and 60min predictions', () => {
    const result = generatePredictions(mockCrowdData);
    result.forEach(prediction => {
      expect(prediction.predictions).toHaveLength(3);
      expect(prediction.predictions[0].minutes).toBe(15);
      expect(prediction.predictions[1].minutes).toBe(30);
      expect(prediction.predictions[2].minutes).toBe(60);
    });
  });

  it('includes confidence values between 0 and 1', () => {
    const result = generatePredictions(mockCrowdData);
    result.forEach(prediction => {
      prediction.predictions.forEach(p => {
        expect(p.confidence).toBeGreaterThan(0);
        expect(p.confidence).toBeLessThanOrEqual(1);
      });
    });
  });

  it('confidence decreases for further predictions', () => {
    const result = generatePredictions(mockCrowdData);
    result.forEach(prediction => {
      expect(prediction.predictions[0].confidence).toBeGreaterThan(prediction.predictions[1].confidence);
      expect(prediction.predictions[1].confidence).toBeGreaterThan(prediction.predictions[2].confidence);
    });
  });

  it('keeps predicted density within [0, 0.98]', () => {
    const result = generatePredictions(mockCrowdData);
    result.forEach(prediction => {
      prediction.predictions.forEach(p => {
        expect(p.predictedDensity).toBeLessThanOrEqual(0.98);
      });
    });
  });

  it('provides a recommendation string for each zone', () => {
    const result = generatePredictions(mockCrowdData);
    result.forEach(prediction => {
      expect(typeof prediction.recommendation).toBe('string');
      expect(prediction.recommendation.length).toBeGreaterThan(0);
    });
  });

  it('warns about very crowded zones', () => {
    const result = generatePredictions(mockCrowdData);
    // zone-2 has density 0.9 → should warn
    const crowdedPrediction = result.find(p => p.zoneId === 'zone-2');
    expect(crowdedPrediction?.recommendation).toContain('⚠️');
  });

  it('gives positive feedback for clear zones', () => {
    const result = generatePredictions(mockCrowdData);
    // zone-3 has density 0.1 → should be positive
    const clearPrediction = result.find(p => p.zoneId === 'zone-3');
    expect(clearPrediction?.recommendation).toContain('✅');
  });
});
