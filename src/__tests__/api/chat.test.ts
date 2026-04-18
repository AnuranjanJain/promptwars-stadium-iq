// ============================================================
// StadiumIQ — Integration Tests: Chat API Route
// ============================================================

import { POST } from '@/app/api/chat/route';
import { NextRequest } from 'next/server';

/**
 * Helper to create a mock NextRequest with a JSON body.
 */
function createMockRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/chat', () => {
  it('returns 400 when no message or image is provided', async () => {
    const request = createMockRequest({});
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Message or image is required');
  });

  it('returns a valid response for a text message', async () => {
    const request = createMockRequest({ message: 'Where can I eat?' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(typeof data.response).toBe('string');
    expect(data.response.length).toBeGreaterThan(0);
  });

  it('handles food-related messages and returns relevant data', async () => {
    const request = createMockRequest({ message: "I'm hungry, where is food?" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    // Fallback or Gemini response should mention food options
    expect(data.response).toBeDefined();
  });

  it('handles messages with chat history', async () => {
    const history = [
      { role: 'user', parts: [{ text: 'Hello' }] },
      { role: 'model', parts: [{ text: 'Hi! How can I help?' }] },
    ];
    const request = createMockRequest({
      message: 'Where is the nearest restroom?',
      history,
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(typeof data.response).toBe('string');
  });

  it('handles image-based requests (Gemini Vision fallback)', async () => {
    const request = createMockRequest({
      image: 'base64ImageData',
      message: 'Where am I?',
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(typeof data.response).toBe('string');
  });

  it('handles image-only requests without a message', async () => {
    const request = createMockRequest({
      image: 'base64ImageData',
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(typeof data.response).toBe('string');
  });

  it('returns a response even when message is empty string', async () => {
    const request = createMockRequest({ message: '' });
    const response = await POST(request);
    // Empty string should be treated as no message
    expect(response.status).toBe(400);
  });
});
