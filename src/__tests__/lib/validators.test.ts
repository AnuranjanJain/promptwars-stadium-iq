// ============================================================
// StadiumIQ — Unit Tests: Input Validators
// ============================================================

import {
  validateChatMessage,
  validateAnalyticsEvent,
  validateAnalyticsBatch,
  validateCoordinates,
  validateImageData,
  sanitizeInput,
} from '@/lib/validators';

describe('validateChatMessage', () => {
  it('accepts a valid message', () => {
    expect(validateChatMessage('Where can I eat?')).toEqual({ valid: true });
  });

  it('rejects non-string input', () => {
    expect(validateChatMessage(123).valid).toBe(false);
    expect(validateChatMessage(null).valid).toBe(false);
    expect(validateChatMessage(undefined).valid).toBe(false);
    expect(validateChatMessage({}).valid).toBe(false);
  });

  it('rejects empty string', () => {
    const result = validateChatMessage('');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('empty');
  });

  it('rejects whitespace-only string', () => {
    const result = validateChatMessage('   ');
    expect(result.valid).toBe(false);
  });

  it('rejects overly long messages', () => {
    const longMessage = 'x'.repeat(3000);
    const result = validateChatMessage(longMessage);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('maximum length');
  });

  it('accepts message at the edge of max length', () => {
    const maxMessage = 'x'.repeat(2000);
    expect(validateChatMessage(maxMessage).valid).toBe(true);
  });
});

describe('validateAnalyticsEvent', () => {
  it('accepts a valid event', () => {
    const event = { eventType: 'page_view', source: 'Home' };
    expect(validateAnalyticsEvent(event)).toEqual({ valid: true });
  });

  it('accepts event with metadata', () => {
    const event = { eventType: 'chat_message', source: 'Chat', metadata: { key: 'value' } };
    expect(validateAnalyticsEvent(event)).toEqual({ valid: true });
  });

  it('rejects null', () => {
    expect(validateAnalyticsEvent(null).valid).toBe(false);
  });

  it('rejects non-object', () => {
    expect(validateAnalyticsEvent('string').valid).toBe(false);
    expect(validateAnalyticsEvent(123).valid).toBe(false);
  });

  it('rejects missing eventType', () => {
    const result = validateAnalyticsEvent({ source: 'Home' });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('eventType');
  });

  it('rejects invalid eventType', () => {
    const result = validateAnalyticsEvent({ eventType: 'invalid_type', source: 'Home' });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid eventType');
  });

  it('rejects missing source', () => {
    const result = validateAnalyticsEvent({ eventType: 'page_view' });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('source');
  });

  it('rejects overly long source', () => {
    const result = validateAnalyticsEvent({
      eventType: 'page_view',
      source: 'x'.repeat(101),
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('100 characters');
  });

  it('rejects non-object metadata', () => {
    const result = validateAnalyticsEvent({
      eventType: 'page_view',
      source: 'Home',
      metadata: 'string',
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Metadata');
  });

  it('rejects metadata with too many keys', () => {
    const metadata: Record<string, string> = {};
    for (let i = 0; i < 25; i++) {
      metadata[`key${i}`] = `value${i}`;
    }
    const result = validateAnalyticsEvent({
      eventType: 'page_view',
      source: 'Home',
      metadata,
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('keys');
  });
});

describe('validateAnalyticsBatch', () => {
  it('accepts a valid batch', () => {
    const events = [
      { eventType: 'page_view', source: 'Home' },
      { eventType: 'chat_message', source: 'Chat' },
    ];
    expect(validateAnalyticsBatch(events)).toEqual({ valid: true });
  });

  it('rejects non-array input', () => {
    expect(validateAnalyticsBatch('not-array').valid).toBe(false);
    expect(validateAnalyticsBatch({}).valid).toBe(false);
  });

  it('rejects empty array', () => {
    const result = validateAnalyticsBatch([]);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('empty');
  });

  it('rejects batch exceeding max size', () => {
    const events = Array.from({ length: 101 }, (_, i) => ({
      eventType: 'page_view',
      source: `Source${i}`,
    }));
    const result = validateAnalyticsBatch(events);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('maximum size');
  });

  it('rejects batch with invalid event', () => {
    const events = [
      { eventType: 'page_view', source: 'Home' },
      { eventType: 'invalid', source: 'Bad' },
    ];
    const result = validateAnalyticsBatch(events);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('index 1');
  });
});

describe('validateCoordinates', () => {
  it('accepts valid coordinates', () => {
    expect(validateCoordinates(28.6129, 77.2295)).toEqual({ valid: true });
    expect(validateCoordinates(0, 0)).toEqual({ valid: true });
    expect(validateCoordinates(-90, -180)).toEqual({ valid: true });
    expect(validateCoordinates(90, 180)).toEqual({ valid: true });
  });

  it('rejects non-number inputs', () => {
    expect(validateCoordinates('28', '77').valid).toBe(false);
    expect(validateCoordinates(null, null).valid).toBe(false);
  });

  it('rejects NaN values', () => {
    expect(validateCoordinates(NaN, 77).valid).toBe(false);
    expect(validateCoordinates(28, NaN).valid).toBe(false);
  });

  it('rejects out-of-range latitude', () => {
    expect(validateCoordinates(91, 77).valid).toBe(false);
    expect(validateCoordinates(-91, 77).valid).toBe(false);
  });

  it('rejects out-of-range longitude', () => {
    expect(validateCoordinates(28, 181).valid).toBe(false);
    expect(validateCoordinates(28, -181).valid).toBe(false);
  });
});

describe('validateImageData', () => {
  it('accepts valid base64 image data', () => {
    expect(validateImageData('base64encodeddata').valid).toBe(true);
  });

  it('rejects non-string input', () => {
    expect(validateImageData(123).valid).toBe(false);
    expect(validateImageData(null).valid).toBe(false);
  });

  it('rejects empty string', () => {
    expect(validateImageData('').valid).toBe(false);
  });

  it('rejects oversized image (>5MB)', () => {
    const largeData = 'x'.repeat(8 * 1024 * 1024); // ~8MB in base64
    const result = validateImageData(largeData);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('maximum size');
  });
});

describe('sanitizeInput', () => {
  it('escapes HTML angle brackets', () => {
    expect(sanitizeInput('<script>')).toBe('&lt;script&gt;');
  });

  it('escapes ampersands', () => {
    expect(sanitizeInput('A & B')).toBe('A &amp; B');
  });

  it('escapes double quotes', () => {
    expect(sanitizeInput('say "hello"')).toBe('say &quot;hello&quot;');
  });

  it('escapes single quotes', () => {
    expect(sanitizeInput("it's")).toBe("it&#x27;s");
  });

  it('handles combined XSS attempt', () => {
    const xss = '<script>alert("xss")</script>';
    const sanitized = sanitizeInput(xss);
    expect(sanitized).not.toContain('<');
    expect(sanitized).not.toContain('>');
    expect(sanitized).toContain('&lt;');
    expect(sanitized).toContain('&gt;');
  });

  it('leaves safe text unchanged', () => {
    expect(sanitizeInput('Hello world 123')).toBe('Hello world 123');
  });
});
