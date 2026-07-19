import { POST } from '@/app/api/operations/route';
import { buildSectorSnapshots, INITIAL_OPERATIONS_INCIDENTS } from '@/lib/operations';
import { initialCrowdData } from '@/lib/venue-data';
import { NextRequest } from 'next/server';

function createRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost:3000/api/operations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/operations', () => {
  const originalKey = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  afterAll(() => {
    if (originalKey) process.env.GEMINI_API_KEY = originalKey;
    else delete process.env.GEMINI_API_KEY;
  });

  it('returns a demo-safe operations brief without an API key', async () => {
    const sectors = buildSectorSnapshots(initialCrowdData, 'halftime');
    const response = await POST(createRequest({
      scenarioId: 'halftime',
      sectors,
      incidents: INITIAL_OPERATIONS_INCIDENTS,
    }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.actions).toHaveLength(3);
    expect(data.source).toBe('deterministic-fallback');
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('rejects requests without live sector context', async () => {
    const response = await POST(createRequest({ scenarioId: 'steady', sectors: [] }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('sector context');
  });

  it('rejects malformed JSON', async () => {
    const request = new NextRequest('http://localhost:3000/api/operations', {
      method: 'POST',
      body: '{not-json',
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
  });

  it('falls back to steady state for an unknown scenario', async () => {
    const sectors = buildSectorSnapshots(initialCrowdData, 'steady');
    const response = await POST(createRequest({ scenarioId: 'unknown', sectors, incidents: [] }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.summary).toContain('Steady state');
  });
});
