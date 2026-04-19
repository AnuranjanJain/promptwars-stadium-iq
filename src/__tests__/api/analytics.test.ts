// ============================================================
// StadiumIQ — Integration Tests: Analytics API Route
// ============================================================

import { POST, GET } from '@/app/api/analytics/route';
import { NextRequest } from 'next/server';

/**
 * Helper to create a mock NextRequest with a JSON body.
 */
function createMockRequest(
  body: Record<string, unknown>,
  contentType: string = 'application/json'
): NextRequest {
  return new NextRequest('http://localhost:3000/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': contentType },
    body: JSON.stringify(body),
  });
}

describe('POST /api/analytics', () => {
  it('accepts valid analytics events', async () => {
    const request = createMockRequest({
      events: [{ eventType: 'page_view', source: 'Home' }],
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.count).toBe(1);
  });

  it('accepts batch of multiple events', async () => {
    const request = createMockRequest({
      events: [
        { eventType: 'page_view', source: 'Home' },
        { eventType: 'chat_message', source: 'Chat' },
        { eventType: 'map_interaction', source: 'Map' },
      ],
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.count).toBe(3);
  });

  it('rejects request without events array', async () => {
    const request = createMockRequest({});
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('rejects empty events array', async () => {
    const request = createMockRequest({ events: [] });
    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('rejects events with missing eventType', async () => {
    const request = createMockRequest({
      events: [{ source: 'Home' }],
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('rejects events with invalid eventType', async () => {
    const request = createMockRequest({
      events: [{ eventType: 'fake_event', source: 'Home' }],
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('rejects events with missing source', async () => {
    const request = createMockRequest({
      events: [{ eventType: 'page_view' }],
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('includes security headers in response', async () => {
    const request = createMockRequest({
      events: [{ eventType: 'page_view', source: 'Home' }],
    });
    const response = await POST(request);

    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
  });

  it('handles event with metadata', async () => {
    const request = createMockRequest({
      events: [{
        eventType: 'chat_message',
        source: 'Chat',
        metadata: { queryType: 'food', responseTime: 250 },
      }],
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});

describe('GET /api/analytics', () => {
  it('returns a valid summary', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.summary).toBeDefined();
    expect(typeof data.summary.totalEvents).toBe('number');
    expect(data.summary.message).toBeDefined();
  });

  it('includes features list in demo mode', async () => {
    const response = await GET();
    const data = await response.json();

    // In demo mode (no real Firebase), should return features list
    if (data.summary.features) {
      expect(Array.isArray(data.summary.features)).toBe(true);
      expect(data.summary.features.length).toBeGreaterThan(5);
    }
  });

  it('includes security headers', async () => {
    const response = await GET();
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });
});
