// ============================================================
// StadiumIQ — Integration Tests: TTS API Route
// ============================================================

import { POST } from '@/app/api/tts/route';
import { NextRequest } from 'next/server';

function createMockRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/tts', () => {
  it('returns audio content for valid text', async () => {
    const request = createMockRequest({ text: 'The east wing is crowded.' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.audioContent).toBeDefined();
    expect(typeof data.audioContent).toBe('string');
  });

  it('returns fallback source without API key', async () => {
    const request = createMockRequest({ text: 'Test message' });
    const response = await POST(request);
    const data = await response.json();

    expect(data.source).toBe('fallback');
  });

  it('rejects empty text', async () => {
    const request = createMockRequest({ text: '' });
    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('rejects missing text', async () => {
    const request = createMockRequest({});
    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('rejects overly long text', async () => {
    const request = createMockRequest({ text: 'x'.repeat(6000) });
    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('accepts language code parameter', async () => {
    const request = createMockRequest({
      text: 'Hello',
      languageCode: 'hi-IN',
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.audioContent).toBeDefined();
  });

  it('clamps speaking rate to valid range', async () => {
    const request = createMockRequest({
      text: 'Fast speech',
      speakingRate: 10, // Should be clamped to 4.0
    });
    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  it('accepts gender parameter', async () => {
    const request = createMockRequest({
      text: 'Test',
      gender: 'FEMALE',
    });
    const response = await POST(request);

    expect(response.status).toBe(200);
  });
});
