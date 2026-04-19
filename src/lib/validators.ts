// ============================================================
// StadiumIQ — Input Validators & Sanitizers
// Provides validation and sanitization utilities for API inputs,
// user messages, and analytics events.
// ============================================================

import {
  MAX_CHAT_MESSAGE_LENGTH,
  MAX_ANALYTICS_BATCH_SIZE,
  MAX_METADATA_KEYS,
  MAX_IMAGE_SIZE_BYTES,
  VALID_EVENT_TYPES,
} from './constants';

/** Result of a validation check */
export interface ValidationResult {
  /** Whether the input passed validation */
  valid: boolean;
  /** Human-readable error message (if invalid) */
  error?: string;
}

/**
 * Validates a chat message for length, content, and safety.
 * Ensures messages are non-empty, within length limits, and
 * don't contain potentially harmful content.
 *
 * @param message - The raw user message string
 * @returns Validation result with error details if invalid
 *
 * @example
 * ```ts
 * const result = validateChatMessage("Where can I eat?");
 * // { valid: true }
 * ```
 */
export function validateChatMessage(message: unknown): ValidationResult {
  if (typeof message !== 'string') {
    return { valid: false, error: 'Message must be a string' };
  }

  const trimmed = message.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }

  if (trimmed.length > MAX_CHAT_MESSAGE_LENGTH) {
    return {
      valid: false,
      error: `Message exceeds maximum length of ${MAX_CHAT_MESSAGE_LENGTH} characters`,
    };
  }

  return { valid: true };
}

/**
 * Validates an analytics event object for required fields and type safety.
 *
 * @param event - The analytics event to validate
 * @returns Validation result
 *
 * @example
 * ```ts
 * const result = validateAnalyticsEvent({ eventType: 'page_view', source: 'Home' });
 * // { valid: true }
 * ```
 */
export function validateAnalyticsEvent(event: unknown): ValidationResult {
  if (!event || typeof event !== 'object') {
    return { valid: false, error: 'Event must be a non-null object' };
  }

  const e = event as Record<string, unknown>;

  if (!e.eventType || typeof e.eventType !== 'string') {
    return { valid: false, error: 'Event must have a string eventType' };
  }

  if (!VALID_EVENT_TYPES.includes(e.eventType as typeof VALID_EVENT_TYPES[number])) {
    return { valid: false, error: `Invalid eventType: ${e.eventType}` };
  }

  if (!e.source || typeof e.source !== 'string') {
    return { valid: false, error: 'Event must have a string source' };
  }

  if (e.source.length > 100) {
    return { valid: false, error: 'Event source exceeds 100 characters' };
  }

  if (e.metadata !== undefined) {
    if (typeof e.metadata !== 'object' || e.metadata === null) {
      return { valid: false, error: 'Metadata must be an object' };
    }
    const keys = Object.keys(e.metadata as object);
    if (keys.length > MAX_METADATA_KEYS) {
      return { valid: false, error: `Metadata exceeds ${MAX_METADATA_KEYS} keys` };
    }
  }

  return { valid: true };
}

/**
 * Validates a batch of analytics events.
 *
 * @param events - Array of events to validate
 * @returns Validation result
 */
export function validateAnalyticsBatch(events: unknown): ValidationResult {
  if (!Array.isArray(events)) {
    return { valid: false, error: 'Events must be an array' };
  }

  if (events.length === 0) {
    return { valid: false, error: 'Events array cannot be empty' };
  }

  if (events.length > MAX_ANALYTICS_BATCH_SIZE) {
    return {
      valid: false,
      error: `Batch exceeds maximum size of ${MAX_ANALYTICS_BATCH_SIZE} events`,
    };
  }

  for (let i = 0; i < events.length; i++) {
    const result = validateAnalyticsEvent(events[i]);
    if (!result.valid) {
      return { valid: false, error: `Event at index ${i}: ${result.error}` };
    }
  }

  return { valid: true };
}

/**
 * Validates geographic coordinates are within valid bounds.
 *
 * @param lat - Latitude value (-90 to 90)
 * @param lng - Longitude value (-180 to 180)
 * @returns Validation result
 *
 * @example
 * ```ts
 * validateCoordinates(28.6129, 77.2295); // { valid: true }
 * validateCoordinates(100, 200);         // { valid: false, error: '...' }
 * ```
 */
export function validateCoordinates(lat: unknown, lng: unknown): ValidationResult {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return { valid: false, error: 'Latitude and longitude must be numbers' };
  }

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return { valid: false, error: 'Coordinates cannot be NaN' };
  }

  if (lat < -90 || lat > 90) {
    return { valid: false, error: `Latitude ${lat} is out of range [-90, 90]` };
  }

  if (lng < -180 || lng > 180) {
    return { valid: false, error: `Longitude ${lng} is out of range [-180, 180]` };
  }

  return { valid: true };
}

/**
 * Validates a base64-encoded image string for size limits.
 *
 * @param imageBase64 - The base64-encoded image data
 * @returns Validation result
 */
export function validateImageData(imageBase64: unknown): ValidationResult {
  if (typeof imageBase64 !== 'string') {
    return { valid: false, error: 'Image data must be a string' };
  }

  if (imageBase64.length === 0) {
    return { valid: false, error: 'Image data cannot be empty' };
  }

  // Base64 is ~4/3 the size of the raw data
  const estimatedBytes = Math.ceil(imageBase64.length * 0.75);
  if (estimatedBytes > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Image exceeds maximum size of ${Math.round(MAX_IMAGE_SIZE_BYTES / 1024 / 1024)}MB`,
    };
  }

  return { valid: true };
}

/**
 * Strips potentially dangerous HTML/script content from user input.
 * Used as a defense-in-depth measure for any user-provided strings
 * that might be rendered in the UI.
 *
 * @param input - Raw user input string
 * @returns Sanitized string with HTML entities escaped
 *
 * @example
 * ```ts
 * sanitizeInput('<script>alert("xss")</script>');
 * // '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 * ```
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
