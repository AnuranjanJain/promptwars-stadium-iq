// ============================================================
// StadiumIQ — Unit Tests: Venue Data Integrity
// ============================================================

import {
  venue,
  initialGameState,
  initialCrowdData,
  initialFeedItems,
  triviaQuestions,
  getQueueData,
  GEMINI_SYSTEM_PROMPT,
} from '@/lib/venue-data';

describe('Venue Data', () => {
  it('has a valid venue ID and name', () => {
    expect(venue.id).toBe('national-arena');
    expect(venue.name).toBe('National Arena');
    expect(venue.capacity).toBe(60000);
  });

  it('has valid location coordinates', () => {
    expect(venue.location.lat).toBeCloseTo(28.6129, 3);
    expect(venue.location.lng).toBeCloseTo(77.2295, 3);
  });

  it('has a valid map zoom level', () => {
    expect(venue.mapZoom).toBeGreaterThanOrEqual(1);
    expect(venue.mapZoom).toBeLessThanOrEqual(22);
  });
});

describe('Venue Sections', () => {
  it('has at least 5 sections', () => {
    expect(venue.sections.length).toBeGreaterThanOrEqual(5);
  });

  it('all section IDs are unique', () => {
    const ids = venue.sections.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all sections have valid capacity and occupancy', () => {
    venue.sections.forEach(section => {
      expect(section.capacity).toBeGreaterThan(0);
      expect(section.currentOccupancy).toBeGreaterThanOrEqual(0);
      expect(section.currentOccupancy).toBeLessThanOrEqual(section.capacity);
    });
  });

  it('all sections have valid levels', () => {
    const validLevels = ['ground', 'lower', 'upper', 'vip'];
    venue.sections.forEach(section => {
      expect(validLevels).toContain(section.level);
    });
  });

  it('total section capacity roughly matches venue capacity', () => {
    const totalCapacity = venue.sections.reduce((sum, s) => sum + s.capacity, 0);
    // Sections don't need to exactly match venue capacity (field, corridors, etc.)
    expect(totalCapacity).toBeGreaterThan(0);
    expect(totalCapacity).toBeLessThanOrEqual(venue.capacity);
  });
});

describe('Venue POIs', () => {
  it('has at least 10 points of interest', () => {
    expect(venue.pois.length).toBeGreaterThanOrEqual(10);
  });

  it('all POI IDs are unique', () => {
    const ids = venue.pois.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all POIs have valid categories', () => {
    const validCategories = ['food', 'restroom', 'merchandise', 'gate', 'medical', 'info', 'atm', 'parking'];
    venue.pois.forEach(poi => {
      expect(validCategories).toContain(poi.category);
    });
  });

  it('all POIs have valid location coordinates', () => {
    venue.pois.forEach(poi => {
      expect(poi.location.lat).toBeDefined();
      expect(poi.location.lng).toBeDefined();
      expect(typeof poi.location.lat).toBe('number');
      expect(typeof poi.location.lng).toBe('number');
    });
  });

  it('all POIs have non-negative wait times', () => {
    venue.pois.forEach(poi => {
      expect(poi.currentWaitMinutes).toBeGreaterThanOrEqual(0);
    });
  });

  it('all POIs have load between 0 and 1', () => {
    venue.pois.forEach(poi => {
      expect(poi.currentLoad).toBeGreaterThanOrEqual(0);
      expect(poi.currentLoad).toBeLessThanOrEqual(1);
    });
  });

  it('food POIs have menu items', () => {
    const foodPois = venue.pois.filter(p => p.category === 'food');
    foodPois.forEach(poi => {
      expect(poi.menuItems).toBeDefined();
      expect(poi.menuItems!.length).toBeGreaterThan(0);
    });
  });

  it('menu items have valid prices', () => {
    venue.pois
      .filter(p => p.menuItems)
      .flatMap(p => p.menuItems!)
      .forEach(item => {
        expect(item.price).toBeGreaterThan(0);
        expect(typeof item.name).toBe('string');
        expect(typeof item.isVeg).toBe('boolean');
      });
  });

  it('has at least one accessible restroom', () => {
    const accessibleRestrooms = venue.pois.filter(
      p => p.category === 'restroom' && p.accessibleRoute === true
    );
    expect(accessibleRestrooms.length).toBeGreaterThan(0);
  });
});

describe('Initial Game State', () => {
  it('has valid team names', () => {
    expect(initialGameState.homeTeam.length).toBeGreaterThan(0);
    expect(initialGameState.awayTeam.length).toBeGreaterThan(0);
  });

  it('has non-negative scores', () => {
    expect(initialGameState.homeScore).toBeGreaterThanOrEqual(0);
    expect(initialGameState.awayScore).toBeGreaterThanOrEqual(0);
  });

  it('has valid status', () => {
    expect(['upcoming', 'live', 'halftime', 'finished']).toContain(initialGameState.status);
  });

  it('has valid time format (MM:SS)', () => {
    expect(initialGameState.timeRemaining).toMatch(/^\d{2}:\d{2}$/);
  });

  it('has a sport defined', () => {
    expect(initialGameState.sport.length).toBeGreaterThan(0);
  });
});

describe('Initial Crowd Data', () => {
  it('has at least 5 zones', () => {
    expect(initialCrowdData.length).toBeGreaterThanOrEqual(5);
  });

  it('all zone IDs are unique', () => {
    const ids = initialCrowdData.map(z => z.zoneId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all densities are between 0 and 1', () => {
    initialCrowdData.forEach(zone => {
      expect(zone.density).toBeGreaterThanOrEqual(0);
      expect(zone.density).toBeLessThanOrEqual(1);
    });
  });

  it('all zones have valid trends', () => {
    initialCrowdData.forEach(zone => {
      expect(['increasing', 'decreasing', 'stable']).toContain(zone.trend);
    });
  });
});

describe('getQueueData', () => {
  it('returns only open food, restroom, and merchandise POIs', () => {
    const queues = getQueueData();
    queues.forEach(q => {
      expect(['food', 'restroom', 'merchandise']).toContain(q.category);
    });
  });

  it('excludes closed POIs', () => {
    const queues = getQueueData();
    // Restroom West Wing is closed — should not appear
    const closedRestroom = queues.find(q => q.poiId === 'restroom-4');
    expect(closedRestroom).toBeUndefined();
  });

  it('returns valid queue info objects', () => {
    const queues = getQueueData();
    queues.forEach(queue => {
      expect(queue.poiId).toBeDefined();
      expect(queue.poiName).toBeDefined();
      expect(queue.currentWaitMinutes).toBeGreaterThanOrEqual(0);
      expect(queue.queueLength).toBeGreaterThanOrEqual(0);
      expect(queue.estimatedServeTime).toBeGreaterThanOrEqual(0);
      expect(typeof queue.bestTimeToVisit).toBe('string');
    });
  });
});

describe('Feed Items', () => {
  it('has at least 3 feed items', () => {
    expect(initialFeedItems.length).toBeGreaterThanOrEqual(3);
  });

  it('all items have unique IDs', () => {
    const ids = initialFeedItems.map(f => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all items have valid types', () => {
    const validTypes = ['announcement', 'score', 'alert', 'trivia', 'promo', 'emergency'];
    initialFeedItems.forEach(item => {
      expect(validTypes).toContain(item.type);
    });
  });

  it('all items have valid priority levels', () => {
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    initialFeedItems.forEach(item => {
      expect(validPriorities).toContain(item.priority);
    });
  });
});

describe('Trivia Questions', () => {
  it('has at least 2 questions', () => {
    expect(triviaQuestions.length).toBeGreaterThanOrEqual(2);
  });

  it('all questions have valid correct answer indices', () => {
    triviaQuestions.forEach(q => {
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(q.options.length);
    });
  });

  it('all questions have 4 options', () => {
    triviaQuestions.forEach(q => {
      expect(q.options).toHaveLength(4);
    });
  });

  it('all questions have positive points and time limits', () => {
    triviaQuestions.forEach(q => {
      expect(q.points).toBeGreaterThan(0);
      expect(q.timeLimit).toBeGreaterThan(0);
    });
  });
});

describe('Gemini System Prompt', () => {
  it('is a non-empty string', () => {
    expect(typeof GEMINI_SYSTEM_PROMPT).toBe('string');
    expect(GEMINI_SYSTEM_PROMPT.length).toBeGreaterThan(100);
  });

  it('contains venue name', () => {
    expect(GEMINI_SYSTEM_PROMPT).toContain('National Arena');
  });

  it('contains food option details', () => {
    expect(GEMINI_SYSTEM_PROMPT).toContain('Grand Grill');
    expect(GEMINI_SYSTEM_PROMPT).toContain('Pizza Corner');
  });

  it('contains behavior instructions', () => {
    expect(GEMINI_SYSTEM_PROMPT).toContain('friendly');
    expect(GEMINI_SYSTEM_PROMPT).toContain('FASTEST');
  });
});
