// ============================================================
// StadiumIQ — Crowd Simulator
// Generates realistic crowd density fluctuations for demo
// ============================================================

import { CrowdDensity, QueueInfo, GameState, EventFeedItem } from '@/types';
import { initialCrowdData, venue, initialGameState, initialFeedItems } from './venue-data';

// Simulate crowd density changes
export function simulateCrowdUpdate(currentData: CrowdDensity[]): CrowdDensity[] {
  return currentData.map(zone => {
    // Random walk with bounds
    const delta = (Math.random() - 0.48) * 0.08; // Slight upward bias during game
    let newDensity = Math.max(0.05, Math.min(0.98, zone.density + delta));

    // Add periodic patterns (simulate halftime rush)
    const minuteOfHour = new Date().getMinutes();
    if (minuteOfHour % 15 < 3) {
      // Every 15 minutes, simulate a mini-rush (like halftime scaled down)
      if (zone.zoneName.includes('Food') || zone.zoneName.includes('Restroom')) {
        newDensity = Math.min(0.95, newDensity + 0.05);
      }
    }

    const trend = newDensity > zone.density + 0.02
      ? 'increasing' as const
      : newDensity < zone.density - 0.02
        ? 'decreasing' as const
        : 'stable' as const;

    return {
      ...zone,
      density: Math.round(newDensity * 100) / 100,
      trend,
      lastUpdated: Date.now(),
    };
  });
}

// Simulate queue wait time changes
export function simulateQueueUpdate(currentQueues: QueueInfo[]): QueueInfo[] {
  return currentQueues.map(queue => {
    const delta = Math.floor((Math.random() - 0.45) * 4);
    const newWait = Math.max(1, Math.min(30, queue.currentWaitMinutes + delta));
    const newLength = Math.max(1, Math.ceil(newWait * 2.5));

    const trend = newWait > queue.currentWaitMinutes
      ? 'increasing' as const
      : newWait < queue.currentWaitMinutes
        ? 'decreasing' as const
        : 'stable' as const;

    return {
      ...queue,
      currentWaitMinutes: newWait,
      queueLength: newLength,
      estimatedServeTime: Math.ceil(newWait / 3),
      trend,
      bestTimeToVisit: newWait > 12 ? 'Try again in 10-15 minutes' : 'Good time to visit!',
    };
  });
}

// Simulate game state progression
export function simulateGameUpdate(state: GameState): GameState {
  const [mins, secs] = state.timeRemaining.split(':').map(Number);
  let newSecs = secs + 15; // Advance 15 seconds
  let newMins = mins;

  if (newSecs >= 60) {
    newSecs -= 60;
    newMins += 1;
  }

  // Random goal chance  (very rare)
  let { homeScore, awayScore } = state;
  if (Math.random() < 0.002) {
    if (Math.random() < 0.5) homeScore++;
    else awayScore++;
  }

  const status = newMins >= 45 && state.period === '2nd Half'
    ? 'finished' as const
    : newMins >= 45 && state.period === '1st Half'
      ? 'halftime' as const
      : state.status;

  return {
    ...state,
    homeScore,
    awayScore,
    timeRemaining: `${String(newMins).padStart(2, '0')}:${String(newSecs).padStart(2, '0')}`,
    status,
  };
}

// Generate crowd predictions
export function generatePredictions(currentData: CrowdDensity[]) {
  return currentData.map(zone => ({
    zoneId: zone.zoneId,
    currentDensity: zone.density,
    predictions: [
      {
        minutes: 15,
        predictedDensity: Math.min(0.98, zone.density + (zone.trend === 'increasing' ? 0.12 : zone.trend === 'decreasing' ? -0.08 : 0.03)),
        confidence: 0.85,
      },
      {
        minutes: 30,
        predictedDensity: Math.min(0.98, zone.density + (zone.trend === 'increasing' ? 0.20 : zone.trend === 'decreasing' ? -0.15 : 0.05)),
        confidence: 0.72,
      },
      {
        minutes: 60,
        predictedDensity: Math.max(0.1, zone.density - 0.15), // Post-match, density typically drops
        confidence: 0.55,
      },
    ],
    recommendation: zone.density > 0.8
      ? `⚠️ ${zone.zoneName} is very crowded. Consider alternatives.`
      : zone.density > 0.6
        ? `${zone.zoneName} is moderately busy. Expect slight increase.`
        : `✅ ${zone.zoneName} is currently clear — great time to visit!`,
  }));
}
