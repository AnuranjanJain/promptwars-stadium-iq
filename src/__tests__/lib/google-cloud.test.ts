// ============================================================
// StadiumIQ — Unit Tests: Google Cloud Services
// Tests TTS, Geocoding, and Places API fallback behavior.
// ============================================================

import {
  synthesizeSpeech,
  reverseGeocode,
  searchNearbyPlaces,
} from '@/lib/google-cloud';

// All tests run WITHOUT real API keys — they exercise the fallback system.

describe('synthesizeSpeech — Fallback Mode', () => {
  it('returns a valid TTS result', async () => {
    const result = await synthesizeSpeech({ text: 'Hello' });
    expect(result).toBeDefined();
    expect(result.audioContent).toBeDefined();
    expect(typeof result.audioContent).toBe('string');
  });

  it('returns source as fallback when no API key', async () => {
    const result = await synthesizeSpeech({ text: 'Test message' });
    expect(result.source).toBe('fallback');
  });

  it('handles long text input', async () => {
    const longText = 'This is a long crowd alert. '.repeat(20);
    const result = await synthesizeSpeech({ text: longText });
    expect(result).toBeDefined();
    expect(result.source).toBe('fallback');
  });

  it('respects language code parameter', async () => {
    const result = await synthesizeSpeech({
      text: 'Test',
      languageCode: 'hi-IN',
    });
    expect(result).toBeDefined();
    expect(result.audioContent.length).toBeGreaterThan(0);
  });

  it('fallback contains the original text reference', async () => {
    const result = await synthesizeSpeech({ text: 'Crowd alert test' });
    // Decode base64 to check the fallback payload
    const decoded = Buffer.from(result.audioContent, 'base64').toString();
    const payload = JSON.parse(decoded);
    expect(payload.fallback).toBe(true);
    expect(payload.engine).toBe('web-speech-api');
  });

  it('handles empty-like text gracefully', async () => {
    const result = await synthesizeSpeech({ text: 'x' });
    expect(result).toBeDefined();
    expect(result.source).toBe('fallback');
  });
});

describe('reverseGeocode — Fallback Mode', () => {
  it('returns a valid geocoding result', async () => {
    const result = await reverseGeocode(28.6129, 77.2295);
    expect(result).toBeDefined();
    expect(result.formattedAddress).toBeDefined();
    expect(result.formattedAddress.length).toBeGreaterThan(0);
  });

  it('returns source as fallback when no API key', async () => {
    const result = await reverseGeocode(28.6129, 77.2295);
    expect(result.source).toBe('fallback');
  });

  it('returns structured address components', async () => {
    const result = await reverseGeocode(28.6129, 77.2295);
    expect(result.components).toBeDefined();
    expect(result.components.city).toBe('New Delhi');
    expect(result.components.country).toBe('India');
    expect(result.components.state).toBe('Delhi');
  });

  it('includes coordinates in the formatted address', async () => {
    const result = await reverseGeocode(28.6129, 77.2295);
    expect(result.formattedAddress).toContain('28.6129');
  });

  it('returns a location type', async () => {
    const result = await reverseGeocode(28.6129, 77.2295);
    expect(result.locationType).toBeDefined();
    expect(typeof result.locationType).toBe('string');
  });

  it('handles different coordinates gracefully', async () => {
    const result = await reverseGeocode(40.7128, -74.0060);
    expect(result).toBeDefined();
    expect(result.source).toBe('fallback');
    // Still returns the venue fallback data
    expect(result.components.city).toBe('New Delhi');
  });
});

describe('searchNearbyPlaces — Fallback Mode', () => {
  it('returns transit stations', async () => {
    const places = await searchNearbyPlaces(28.6129, 77.2295, 'transit_station');
    expect(places).toBeDefined();
    expect(Array.isArray(places)).toBe(true);
    expect(places.length).toBeGreaterThan(0);
  });

  it('transit results contain metro stations', async () => {
    const places = await searchNearbyPlaces(28.6129, 77.2295, 'transit_station');
    const hasMetro = places.some(p => p.name.toLowerCase().includes('metro'));
    expect(hasMetro).toBe(true);
  });

  it('returns parking options', async () => {
    const places = await searchNearbyPlaces(28.6129, 77.2295, 'parking');
    expect(places.length).toBeGreaterThan(0);
    expect(places[0].type).toBe('parking');
  });

  it('returns restaurant options', async () => {
    const places = await searchNearbyPlaces(28.6129, 77.2295, 'restaurant');
    expect(places.length).toBeGreaterThan(0);
  });

  it('returns hospital options', async () => {
    const places = await searchNearbyPlaces(28.6129, 77.2295, 'hospital');
    expect(places.length).toBeGreaterThan(0);
  });

  it('all places have source as fallback', async () => {
    const places = await searchNearbyPlaces(28.6129, 77.2295, 'transit_station');
    places.forEach(place => {
      expect(place.source).toBe('fallback');
    });
  });

  it('all places have valid distance data', async () => {
    const places = await searchNearbyPlaces(28.6129, 77.2295, 'parking');
    places.forEach(place => {
      expect(place.distanceMeters).toBeGreaterThan(0);
      expect(place.distanceFormatted).toBeDefined();
      expect(typeof place.distanceFormatted).toBe('string');
    });
  });

  it('all places have rating and isOpen when available', async () => {
    const places = await searchNearbyPlaces(28.6129, 77.2295, 'transit_station');
    places.forEach(place => {
      if (place.rating !== undefined) {
        expect(place.rating).toBeGreaterThan(0);
        expect(place.rating).toBeLessThanOrEqual(5);
      }
      expect(typeof place.isOpen).toBe('boolean');
    });
  });

  it('returns fallback for unknown type', async () => {
    const places = await searchNearbyPlaces(28.6129, 77.2295, 'unknown_type');
    expect(places.length).toBeGreaterThan(0);
    expect(places[0].source).toBe('fallback');
  });

  it('respects default radius parameter', async () => {
    const places = await searchNearbyPlaces(28.6129, 77.2295, 'transit_station', 500);
    expect(places).toBeDefined();
    expect(Array.isArray(places)).toBe(true);
  });
});
