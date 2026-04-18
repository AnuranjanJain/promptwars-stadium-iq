// ============================================================
// StadiumIQ — Unit Tests: Gemini AI Client
// ============================================================

import { chatWithGemini, analyzeImage } from '@/lib/gemini';

// Tests run WITHOUT a real API key, so they exercise the fallback system.
// This is by design — the fallback engine is a critical feature.

describe('chatWithGemini — Fallback Responses', () => {
  it('returns food recommendations for food-related queries', async () => {
    const response = await chatWithGemini('Where can I get food?');
    expect(response).toContain('Chai & Snacks');
    expect(response).toContain('Pizza Corner');
  });

  it('returns food recommendations for "hungry" queries', async () => {
    const response = await chatWithGemini("I'm hungry");
    expect(response).toContain('🍽️');
  });

  it('returns restroom info for restroom queries', async () => {
    const response = await chatWithGemini('Where is the nearest restroom?');
    expect(response).toContain('South Gate');
    expect(response).toContain('🚻');
  });

  it('returns restroom info for "bathroom" queries', async () => {
    const response = await chatWithGemini('bathroom');
    expect(response).toContain('South Gate');
  });

  it('returns restroom info for "toilet" queries', async () => {
    const response = await chatWithGemini('toilet');
    expect(response).toContain('🚻');
  });

  it('returns score info for game queries', async () => {
    const response = await chatWithGemini("What's the score?");
    expect(response).toContain('Delhi Titans');
    expect(response).toContain('Mumbai Warriors');
  });

  it('returns gate info for exit queries', async () => {
    const response = await chatWithGemini('How do I exit?');
    expect(response).toContain('Gate');
    expect(response).toContain('🚪');
  });

  it('returns help info for help queries', async () => {
    const response = await chatWithGemini('What can you do?');
    expect(response).toContain('Stadium Buddy');
    expect(response).toContain('Navigation');
  });

  it('returns merchandise info for shopping queries', async () => {
    const response = await chatWithGemini('I want to buy a jersey');
    expect(response).toContain('Fan Zone Store');
    expect(response).toContain('🛍️');
  });

  it('returns merchandise info for "merch" queries', async () => {
    const response = await chatWithGemini('merch');
    expect(response).toContain('Kiosk');
  });

  it('returns default greeting for unrecognized queries', async () => {
    const response = await chatWithGemini('asdfhjkl random text');
    expect(response).toContain('Stadium Buddy');
  });

  it('accepts an optional history parameter', async () => {
    const history = [
      { role: 'user', parts: [{ text: 'Hello' }] },
      { role: 'model', parts: [{ text: 'Hi there!' }] },
    ];
    const response = await chatWithGemini('Where is food?', history);
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(0);
  });
});

describe('analyzeImage — Fallback', () => {
  it('returns a helpful message when no API key is set', async () => {
    const response = await analyzeImage('base64data', 'Where am I?');
    expect(response).toContain('Image analysis');
    expect(response).toContain('Gemini API key');
  });

  it('returns a non-empty string', async () => {
    const response = await analyzeImage('base64data', 'test prompt');
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(0);
  });
});
