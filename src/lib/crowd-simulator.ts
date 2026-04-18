// ============================================================
// StadiumIQ — Crowd Simulator
// Generates realistic crowd density fluctuations, queue changes,
// and game state progression for live demo environments.
// ============================================================

import { CrowdDensity, QueueInfo, GameState } from '@/types';

/**
 * Simulates crowd density changes across all venue zones using
 * a bounded random walk with periodic rush patterns.
 *
 * The simulation models realistic crowd behavior:
 * - Slight upward bias during active game periods
 * - Periodic surges at food and restroom zones (mimicking halftime rushes)
 * - Density is clamped to [0.05, 0.98] to prevent extreme values
 *
 * @param currentData - Current crowd density readings for all zones
 * @returns Updated crowd density array with new values and trends
 */
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

/**
 * Simulates queue wait time fluctuations for concessions,
 * restrooms, and merchandise stalls.
 *
 * Queue behavior characteristics:
 * - Wait times bounded to [1, 30] minutes
 * - Queue length derived from wait time (2.5x multiplier)
 * - Serve time calculated as wait / 3
 * - Trend detection based on wait time direction
 *
 * @param currentQueues - Current queue information for all tracked POIs
 * @returns Updated queue data with new wait times and trends
 */
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

/**
 * Simulates game state progression, advancing the match clock
 * and handling period transitions.
 *
 * Game simulation features:
 * - Clock advances by 15 seconds per tick
 * - Very rare random goal events (0.2% chance per tick)
 * - Automatic period transitions (1st Half → Halftime, 2nd Half → Finished)
 *
 * @param state - Current game state
 * @returns Updated game state with advanced clock and possible score changes
 */
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

/**
 * Generates crowd density predictions for 15, 30, and 60 minutes
 * into the future based on current density levels and trend directions.
 *
 * Prediction characteristics:
 * - Confidence decreases for longer timeframes (85% → 72% → 55%)
 * - Trend-aware: increasing zones project higher future density
 * - Post-match 60-min prediction accounts for typical crowd dispersal
 * - Provides actionable natural-language recommendations per zone
 *
 * @param currentData - Current crowd density data for all zones
 * @returns Array of prediction objects with forecasts and recommendations
 */
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
