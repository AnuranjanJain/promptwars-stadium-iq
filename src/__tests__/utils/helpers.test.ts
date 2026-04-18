// ============================================================
// StadiumIQ — Unit Tests: Utility Helpers
// ============================================================

import {
  getDistance,
  formatDistance,
  getDensityLevel,
  getWaitSeverity,
  timeAgo,
  generateId,
  getCategoryIcon,
  getCategoryLabel,
  clamp,
} from '@/utils/helpers';

describe('getDistance (Haversine)', () => {
  it('returns 0 for the same point', () => {
    const point = { lat: 28.6129, lng: 77.2295 };
    expect(getDistance(point, point)).toBe(0);
  });

  it('returns correct distance between two known points', () => {
    const delhi = { lat: 28.6139, lng: 77.2090 };
    const nearby = { lat: 28.6140, lng: 77.2295 };
    const distance = getDistance(delhi, nearby);
    // Should be roughly 1.9 km
    expect(distance).toBeGreaterThan(1500);
    expect(distance).toBeLessThan(2500);
  });

  it('handles points on opposite sides of the globe', () => {
    const north = { lat: 90, lng: 0 };
    const south = { lat: -90, lng: 0 };
    const distance = getDistance(north, south);
    // Half the earth circumference ≈ 20,015 km
    expect(distance).toBeGreaterThan(19_000_000);
    expect(distance).toBeLessThan(21_000_000);
  });

  it('handles zero-longitude crossing', () => {
    const a = { lat: 0, lng: -1 };
    const b = { lat: 0, lng: 1 };
    const distance = getDistance(a, b);
    expect(distance).toBeGreaterThan(200_000);
    expect(distance).toBeLessThan(250_000);
  });
});

describe('formatDistance', () => {
  it('formats distances under 100m as exact meters', () => {
    expect(formatDistance(42)).toBe('42m');
    expect(formatDistance(99.6)).toBe('100m'); // rounds
  });

  it('formats distances 100-999m rounded to nearest 10m', () => {
    expect(formatDistance(123)).toBe('120m');
    expect(formatDistance(456)).toBe('460m');
    expect(formatDistance(999)).toBe('1000m');
  });

  it('formats distances >= 1000m as km with one decimal', () => {
    expect(formatDistance(1000)).toBe('1.0km');
    expect(formatDistance(1500)).toBe('1.5km');
    expect(formatDistance(12345)).toBe('12.3km');
  });
});

describe('getDensityLevel', () => {
  it('returns Low for density < 0.3', () => {
    const result = getDensityLevel(0.1);
    expect(result.label).toBe('Low');
    expect(result.emoji).toBe('🟢');
    expect(result.color).toBe('#22c55e');
  });

  it('returns Moderate for density 0.3–0.59', () => {
    const result = getDensityLevel(0.5);
    expect(result.label).toBe('Moderate');
    expect(result.emoji).toBe('🟡');
  });

  it('returns Busy for density 0.6–0.79', () => {
    const result = getDensityLevel(0.7);
    expect(result.label).toBe('Busy');
    expect(result.emoji).toBe('🟠');
  });

  it('returns Very Crowded for density >= 0.8', () => {
    const result = getDensityLevel(0.95);
    expect(result.label).toBe('Very Crowded');
    expect(result.emoji).toBe('🔴');
    expect(result.color).toBe('#ef4444');
  });

  it('handles boundary value 0.3 as Moderate', () => {
    expect(getDensityLevel(0.3).label).toBe('Moderate');
  });

  it('handles boundary value 0.6 as Busy', () => {
    expect(getDensityLevel(0.6).label).toBe('Busy');
  });

  it('handles boundary value 0.8 as Very Crowded', () => {
    expect(getDensityLevel(0.8).label).toBe('Very Crowded');
  });
});

describe('getWaitSeverity', () => {
  it('returns No Wait for <= 3 minutes', () => {
    expect(getWaitSeverity(0).label).toBe('No Wait');
    expect(getWaitSeverity(3).label).toBe('No Wait');
    expect(getWaitSeverity(3).color).toBe('#22c55e');
  });

  it('returns Short Wait for 4–8 minutes', () => {
    expect(getWaitSeverity(5).label).toBe('Short Wait');
    expect(getWaitSeverity(8).label).toBe('Short Wait');
  });

  it('returns Moderate Wait for 9–15 minutes', () => {
    expect(getWaitSeverity(10).label).toBe('Moderate Wait');
    expect(getWaitSeverity(15).label).toBe('Moderate Wait');
  });

  it('returns Long Wait for > 15 minutes', () => {
    expect(getWaitSeverity(16).label).toBe('Long Wait');
    expect(getWaitSeverity(30).label).toBe('Long Wait');
    expect(getWaitSeverity(30).color).toBe('#ef4444');
  });
});

describe('timeAgo', () => {
  it('returns "Just now" for < 60 seconds', () => {
    expect(timeAgo(Date.now() - 30_000)).toBe('Just now');
  });

  it('returns minutes for < 60 minutes', () => {
    expect(timeAgo(Date.now() - 5 * 60_000)).toBe('5m ago');
  });

  it('returns hours for < 24 hours', () => {
    expect(timeAgo(Date.now() - 3 * 3_600_000)).toBe('3h ago');
  });

  it('returns days for >= 24 hours', () => {
    expect(timeAgo(Date.now() - 2 * 86_400_000)).toBe('2d ago');
  });
});

describe('generateId', () => {
  it('returns a non-empty string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(5);
  });

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

describe('getCategoryIcon', () => {
  it('returns correct icons for known categories', () => {
    expect(getCategoryIcon('food')).toBe('🍔');
    expect(getCategoryIcon('restroom')).toBe('🚻');
    expect(getCategoryIcon('merchandise')).toBe('🛍️');
    expect(getCategoryIcon('gate')).toBe('🚪');
    expect(getCategoryIcon('medical')).toBe('🏥');
    expect(getCategoryIcon('info')).toBe('ℹ️');
    expect(getCategoryIcon('atm')).toBe('🏧');
    expect(getCategoryIcon('parking')).toBe('🅿️');
  });

  it('returns fallback for unknown categories', () => {
    expect(getCategoryIcon('unknown')).toBe('📍');
    expect(getCategoryIcon('')).toBe('📍');
  });
});

describe('getCategoryLabel', () => {
  it('returns correct labels for known categories', () => {
    expect(getCategoryLabel('food')).toBe('Food & Beverage');
    expect(getCategoryLabel('restroom')).toBe('Restrooms');
    expect(getCategoryLabel('merchandise')).toBe('Merchandise');
    expect(getCategoryLabel('gate')).toBe('Gates');
    expect(getCategoryLabel('medical')).toBe('First Aid');
    expect(getCategoryLabel('info')).toBe('Information');
    expect(getCategoryLabel('atm')).toBe('ATM');
    expect(getCategoryLabel('parking')).toBe('Parking');
  });

  it('returns the raw category string for unknowns', () => {
    expect(getCategoryLabel('vip')).toBe('vip');
  });
});

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('returns min when value is below range', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('returns max when value is above range', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('handles min === max', () => {
    expect(clamp(5, 3, 3)).toBe(3);
  });

  it('handles negative ranges', () => {
    expect(clamp(-5, -10, -1)).toBe(-5);
    expect(clamp(-15, -10, -1)).toBe(-10);
  });
});
