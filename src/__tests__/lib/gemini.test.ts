// ============================================================
// StadiumIQ — Unit Tests: Gemini AI Client
// Extended to cover generateSafetyBriefing and translateMessage.
// ============================================================

import {
  chatWithGemini,
  analyzeImage,
  generateSafetyBriefing,
  translateMessage,
} from '@/lib/gemini';

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

describe('generateSafetyBriefing — Fallback', () => {
  it('returns a safety briefing for North section', async () => {
    const briefing = await generateSafetyBriefing('North Stand - Lower');
    expect(briefing).toContain('Safety Briefing');
    expect(briefing).toContain('Gate A (North)');
    expect(briefing).toContain('First Aid - North');
  });

  it('returns a safety briefing for South section', async () => {
    const briefing = await generateSafetyBriefing('South Stand - Upper');
    expect(briefing).toContain('Gate B (South)');
    expect(briefing).toContain('First Aid - South');
  });

  it('returns VIP tip for VIP section', async () => {
    const briefing = await generateSafetyBriefing('VIP Lounge - East');
    expect(briefing).toContain('VIP Tip');
    expect(briefing).toContain('dedicated emergency exit');
  });

  it('returns a default exit for non-directional sections', async () => {
    const briefing = await generateSafetyBriefing('General Area');
    expect(briefing).toContain('Gate D (West)');
  });

  it('always contains safety tip', async () => {
    const briefing = await generateSafetyBriefing('Any Section');
    expect(briefing).toContain('Safety Tip');
    expect(briefing).toContain('hydrated');
  });

  it('returns a non-empty string', async () => {
    const briefing = await generateSafetyBriefing('Test');
    expect(typeof briefing).toBe('string');
    expect(briefing.length).toBeGreaterThan(50);
  });
});

describe('translateMessage — Fallback', () => {
  it('translates "Where is the restroom?" to Hindi', async () => {
    const result = await translateMessage('Where is the restroom?', 'Hindi');
    expect(result).toContain('शौचालय');
  });

  it('translates "Help" to Spanish', async () => {
    const result = await translateMessage('Help', 'Spanish');
    expect(result).toBe('Ayuda');
  });

  it('translates "Emergency" to Hindi', async () => {
    const result = await translateMessage('Emergency', 'Hindi');
    expect(result).toContain('आपातकाल');
  });

  it('returns fallback format for unsupported language', async () => {
    const result = await translateMessage('Hello', 'Klingon');
    expect(result).toContain('[Klingon]');
    expect(result).toContain('Hello');
    expect(result).toContain('Translation requires Gemini API key');
  });

  it('returns fallback format for unknown phrase', async () => {
    const result = await translateMessage('Something random', 'Hindi');
    expect(result).toContain('[Hindi]');
    expect(result).toContain('Something random');
  });

  it('always returns a non-empty string', async () => {
    const result = await translateMessage('Test', 'French');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
