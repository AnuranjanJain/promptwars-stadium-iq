// ============================================================
// StadiumIQ — Integration Tests: Geocode API Route
// ============================================================

import { POST, GET } from '@/app/api/geocode/route';
import { NextRequest } from 'next/server';

function createMockRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/geocode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/geocode', () => {
  it('returns geocoded address for valid coordinates', async () => {
    const request = createMockRequest({ lat: 28.6129, lng: 77.2295 });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.formattedAddress).toBeDefined();
    expect(data.formattedAddress.length).toBeGreaterThan(0);
  });

  it('returns structured address components', async () => {
    const request = createMockRequest({ lat: 28.6129, lng: 77.2295 });
    const response = await POST(request);
    const data = await response.json();

    expect(data.components).toBeDefined();
    expect(data.components.city).toBeDefined();
    expect(data.components.country).toBeDefined();
  });

  it('rejects invalid coordinates (out of range)', async () => {
    const request = createMockRequest({ lat: 100, lng: 200 });
    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('rejects non-numeric coordinates', async () => {
    const request = createMockRequest({ lat: 'abc', lng: 'def' });
    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('rejects missing coordinates', async () => {
    const request = createMockRequest({});
    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('returns source field in response', async () => {
    const request = createMockRequest({ lat: 28.6129, lng: 77.2295 });
    const response = await POST(request);
    const data = await response.json();

    expect(data.source).toBeDefined();
  });
});

describe('GET /api/geocode', () => {
  it('returns venue geocode data', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.venue).toBe('National Arena');
    expect(data.address).toBeDefined();
    expect(data.address.formattedAddress).toBeDefined();
  });
});
