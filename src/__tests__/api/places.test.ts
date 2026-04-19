// ============================================================
// StadiumIQ — Integration Tests: Places API Route
// ============================================================

import { POST, GET } from '@/app/api/places/route';
import { NextRequest } from 'next/server';

function createMockRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/places', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/places', () => {
  it('returns nearby transit stations', async () => {
    const request = createMockRequest({
      lat: 28.6129,
      lng: 77.2295,
      type: 'transit_station',
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.places).toBeDefined();
    expect(Array.isArray(data.places)).toBe(true);
    expect(data.places.length).toBeGreaterThan(0);
  });

  it('returns count and type in response', async () => {
    const request = createMockRequest({
      lat: 28.6129,
      lng: 77.2295,
      type: 'parking',
    });
    const response = await POST(request);
    const data = await response.json();

    expect(data.count).toBeGreaterThan(0);
    expect(data.type).toBe('parking');
  });

  it('rejects invalid coordinates', async () => {
    const request = createMockRequest({
      lat: 999,
      lng: 999,
      type: 'transit_station',
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('rejects missing place type', async () => {
    const request = createMockRequest({
      lat: 28.6129,
      lng: 77.2295,
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('rejects invalid place type', async () => {
    const request = createMockRequest({
      lat: 28.6129,
      lng: 77.2295,
      type: 'invalid_type',
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('accepts custom radius', async () => {
    const request = createMockRequest({
      lat: 28.6129,
      lng: 77.2295,
      type: 'restaurant',
      radius: 2000,
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.searchRadius).toBe(2000);
  });

  it('clamps radius to valid range', async () => {
    const request = createMockRequest({
      lat: 28.6129,
      lng: 77.2295,
      type: 'hospital',
      radius: 50000, // Should be clamped to 5000
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.searchRadius).toBeLessThanOrEqual(5000);
  });
});

describe('GET /api/places', () => {
  it('returns nearby transit and parking', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.venue).toBe('National Arena');
    expect(data.nearby).toBeDefined();
    expect(data.nearby.transit).toBeDefined();
    expect(data.nearby.parking).toBeDefined();
  });

  it('transit results are non-empty arrays', async () => {
    const response = await GET();
    const data = await response.json();

    expect(Array.isArray(data.nearby.transit)).toBe(true);
    expect(data.nearby.transit.length).toBeGreaterThan(0);
  });
});
