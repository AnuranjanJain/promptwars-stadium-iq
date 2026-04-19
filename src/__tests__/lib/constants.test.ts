// ============================================================
// StadiumIQ — Unit Tests: Application Constants
// Verifies that all constants are valid and within expected ranges.
// ============================================================

import {
  CROWD_UPDATE_INTERVAL_MS,
  QUEUE_UPDATE_INTERVAL_MS,
  GAME_UPDATE_INTERVAL_MS,
  DENSITY_MIN,
  DENSITY_MAX,
  DENSITY_LOW_THRESHOLD,
  DENSITY_MODERATE_THRESHOLD,
  DENSITY_BUSY_THRESHOLD,
  WAIT_NO_WAIT_MAX,
  WAIT_SHORT_MAX,
  WAIT_MODERATE_MAX,
  QUEUE_WAIT_MIN,
  QUEUE_WAIT_MAX,
  CROWD_DELTA_MULTIPLIER,
  CROWD_BIAS,
  SURGE_INTERVAL_MINUTES,
  SURGE_WINDOW_MINUTES,
  SURGE_DENSITY_BOOST,
  TREND_CHANGE_THRESHOLD,
  GAME_TICK_SECONDS,
  GOAL_PROBABILITY,
  HALF_DURATION_MINUTES,
  PREDICTION_CONFIDENCE_15MIN,
  PREDICTION_CONFIDENCE_30MIN,
  PREDICTION_CONFIDENCE_60MIN,
  MAX_CHAT_MESSAGE_LENGTH,
  MAX_ANALYTICS_BATCH_SIZE,
  MAX_METADATA_KEYS,
  MAX_IMAGE_SIZE_BYTES,
  SESSION_STORAGE_KEY,
  THEME_STORAGE_KEY,
  VALID_EVENT_TYPES,
  GOOGLE_SERVICES,
  DENSITY_COLORS,
  WAIT_COLORS,
} from '@/lib/constants';

describe('Simulation Interval Constants', () => {
  it('crowd update interval is positive and reasonable', () => {
    expect(CROWD_UPDATE_INTERVAL_MS).toBeGreaterThan(1000);
    expect(CROWD_UPDATE_INTERVAL_MS).toBeLessThan(60000);
  });

  it('queue update interval is positive and reasonable', () => {
    expect(QUEUE_UPDATE_INTERVAL_MS).toBeGreaterThan(1000);
    expect(QUEUE_UPDATE_INTERVAL_MS).toBeLessThan(60000);
  });

  it('game update interval is positive and reasonable', () => {
    expect(GAME_UPDATE_INTERVAL_MS).toBeGreaterThan(1000);
    expect(GAME_UPDATE_INTERVAL_MS).toBeLessThan(120000);
  });

  it('intervals are ordered: crowd < queue < game', () => {
    expect(CROWD_UPDATE_INTERVAL_MS).toBeLessThan(QUEUE_UPDATE_INTERVAL_MS);
    expect(QUEUE_UPDATE_INTERVAL_MS).toBeLessThan(GAME_UPDATE_INTERVAL_MS);
  });
});

describe('Density Threshold Constants', () => {
  it('density bounds are valid (min < max)', () => {
    expect(DENSITY_MIN).toBeGreaterThan(0);
    expect(DENSITY_MAX).toBeLessThan(1);
    expect(DENSITY_MIN).toBeLessThan(DENSITY_MAX);
  });

  it('density thresholds are ordered correctly', () => {
    expect(DENSITY_LOW_THRESHOLD).toBeLessThan(DENSITY_MODERATE_THRESHOLD);
    expect(DENSITY_MODERATE_THRESHOLD).toBeLessThan(DENSITY_BUSY_THRESHOLD);
    expect(DENSITY_BUSY_THRESHOLD).toBeLessThanOrEqual(1);
  });

  it('all thresholds are between 0 and 1', () => {
    [DENSITY_LOW_THRESHOLD, DENSITY_MODERATE_THRESHOLD, DENSITY_BUSY_THRESHOLD].forEach(t => {
      expect(t).toBeGreaterThan(0);
      expect(t).toBeLessThan(1);
    });
  });
});

describe('Queue Wait Time Constants', () => {
  it('wait thresholds are ordered correctly', () => {
    expect(WAIT_NO_WAIT_MAX).toBeLessThan(WAIT_SHORT_MAX);
    expect(WAIT_SHORT_MAX).toBeLessThan(WAIT_MODERATE_MAX);
  });

  it('queue wait bounds are valid', () => {
    expect(QUEUE_WAIT_MIN).toBeGreaterThanOrEqual(0);
    expect(QUEUE_WAIT_MAX).toBeGreaterThan(QUEUE_WAIT_MIN);
  });
});

describe('Simulation Parameters', () => {
  it('crowd delta multiplier is small and positive', () => {
    expect(CROWD_DELTA_MULTIPLIER).toBeGreaterThan(0);
    expect(CROWD_DELTA_MULTIPLIER).toBeLessThan(0.5);
  });

  it('crowd bias is close to 0.5', () => {
    expect(CROWD_BIAS).toBeGreaterThan(0.3);
    expect(CROWD_BIAS).toBeLessThan(0.7);
  });

  it('surge parameters are reasonable', () => {
    expect(SURGE_INTERVAL_MINUTES).toBeGreaterThan(0);
    expect(SURGE_WINDOW_MINUTES).toBeGreaterThan(0);
    expect(SURGE_WINDOW_MINUTES).toBeLessThan(SURGE_INTERVAL_MINUTES);
    expect(SURGE_DENSITY_BOOST).toBeGreaterThan(0);
    expect(SURGE_DENSITY_BOOST).toBeLessThan(0.5);
  });

  it('trend threshold is positive and small', () => {
    expect(TREND_CHANGE_THRESHOLD).toBeGreaterThan(0);
    expect(TREND_CHANGE_THRESHOLD).toBeLessThan(0.2);
  });

  it('game tick is positive', () => {
    expect(GAME_TICK_SECONDS).toBeGreaterThan(0);
    expect(GAME_TICK_SECONDS).toBeLessThanOrEqual(60);
  });

  it('goal probability is very small', () => {
    expect(GOAL_PROBABILITY).toBeGreaterThan(0);
    expect(GOAL_PROBABILITY).toBeLessThan(0.05);
  });

  it('half duration is standard', () => {
    expect(HALF_DURATION_MINUTES).toBe(45);
  });
});

describe('Prediction Confidence Constants', () => {
  it('confidence decreases over time', () => {
    expect(PREDICTION_CONFIDENCE_15MIN).toBeGreaterThan(PREDICTION_CONFIDENCE_30MIN);
    expect(PREDICTION_CONFIDENCE_30MIN).toBeGreaterThan(PREDICTION_CONFIDENCE_60MIN);
  });

  it('all confidences are between 0 and 1', () => {
    [PREDICTION_CONFIDENCE_15MIN, PREDICTION_CONFIDENCE_30MIN, PREDICTION_CONFIDENCE_60MIN].forEach(c => {
      expect(c).toBeGreaterThan(0);
      expect(c).toBeLessThanOrEqual(1);
    });
  });
});

describe('API Limit Constants', () => {
  it('chat message length is reasonable', () => {
    expect(MAX_CHAT_MESSAGE_LENGTH).toBeGreaterThan(100);
    expect(MAX_CHAT_MESSAGE_LENGTH).toBeLessThan(10000);
  });

  it('analytics batch size is reasonable', () => {
    expect(MAX_ANALYTICS_BATCH_SIZE).toBeGreaterThan(1);
    expect(MAX_ANALYTICS_BATCH_SIZE).toBeLessThan(1000);
  });

  it('metadata keys limit is reasonable', () => {
    expect(MAX_METADATA_KEYS).toBeGreaterThan(5);
    expect(MAX_METADATA_KEYS).toBeLessThan(100);
  });

  it('image size limit is reasonable (1-10MB range)', () => {
    expect(MAX_IMAGE_SIZE_BYTES).toBeGreaterThanOrEqual(1024 * 1024);
    expect(MAX_IMAGE_SIZE_BYTES).toBeLessThanOrEqual(10 * 1024 * 1024);
  });
});

describe('Storage Keys', () => {
  it('session storage key is a non-empty string', () => {
    expect(SESSION_STORAGE_KEY.length).toBeGreaterThan(0);
  });

  it('theme storage key is a non-empty string', () => {
    expect(THEME_STORAGE_KEY.length).toBeGreaterThan(0);
  });
});

describe('Valid Event Types', () => {
  it('has at least 9 event types', () => {
    expect(VALID_EVENT_TYPES.length).toBeGreaterThanOrEqual(9);
  });

  it('includes core event types', () => {
    expect(VALID_EVENT_TYPES).toContain('page_view');
    expect(VALID_EVENT_TYPES).toContain('chat_message');
    expect(VALID_EVENT_TYPES).toContain('map_interaction');
    expect(VALID_EVENT_TYPES).toContain('performance_metric');
    expect(VALID_EVENT_TYPES).toContain('error_log');
  });

  it('all event types are non-empty strings', () => {
    VALID_EVENT_TYPES.forEach(type => {
      expect(typeof type).toBe('string');
      expect(type.length).toBeGreaterThan(0);
    });
  });
});

describe('Google Services Registry', () => {
  it('lists at least 8 Google services', () => {
    expect(GOOGLE_SERVICES.length).toBeGreaterThanOrEqual(8);
  });

  it('all services have unique IDs', () => {
    const ids = GOOGLE_SERVICES.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all services have name and description', () => {
    GOOGLE_SERVICES.forEach(service => {
      expect(service.name.length).toBeGreaterThan(0);
      expect(service.description.length).toBeGreaterThan(0);
    });
  });
});

describe('Color Constants', () => {
  it('density colors are valid hex colors', () => {
    Object.values(DENSITY_COLORS).forEach(color => {
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  it('wait colors are valid hex colors', () => {
    Object.values(WAIT_COLORS).forEach(color => {
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });
});
