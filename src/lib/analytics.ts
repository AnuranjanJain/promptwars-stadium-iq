// ============================================================
// StadiumIQ — Firebase Analytics Helper
// Tracks user interactions and page views via Firestore
// ============================================================

import { getFirestoreDb } from './firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';

/** Supported analytics event types */
export type AnalyticsEventType =
  | 'page_view'
  | 'chat_message'
  | 'map_interaction'
  | 'queue_view'
  | 'navigation_request'
  | 'trivia_answer'
  | 'image_upload'
  | 'theme_toggle'
  | 'accessibility_change';

/** Structure for an analytics event document */
export interface AnalyticsEvent {
  /** The type of event being tracked */
  eventType: AnalyticsEventType;
  /** The page or component that triggered the event */
  source: string;
  /** Additional event-specific metadata */
  metadata?: Record<string, string | number | boolean>;
  /** ISO timestamp of when the event occurred on the client */
  clientTimestamp: string;
  /** Firestore server timestamp (set automatically) */
  serverTimestamp?: ReturnType<typeof serverTimestamp>;
  /** Anonymous session identifier */
  sessionId: string;
}

// Generate a persistent session ID for the browser session
let _sessionId: string | null = null;

/**
 * Retrieves or generates a unique session ID for the current browser session.
 * Uses sessionStorage for persistence across page navigations within the same tab.
 *
 * @returns A unique session identifier string
 */
function getSessionId(): string {
  if (_sessionId) return _sessionId;

  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem('stadium-iq-session');
    if (stored) {
      _sessionId = stored;
      return stored;
    }
  }

  _sessionId = 'session-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 9);

  if (typeof window !== 'undefined') {
    sessionStorage.setItem('stadium-iq-session', _sessionId);
  }

  return _sessionId;
}

/**
 * Logs an analytics event to the Firestore `analytics` collection.
 * Events are written with both client-side and server-side timestamps
 * for accurate event ordering and latency analysis.
 *
 * @param eventType - The category of event (e.g., 'page_view', 'chat_message')
 * @param source - The page or component name triggering the event
 * @param metadata - Optional key-value pairs with event-specific data
 *
 * @example
 * ```ts
 * logEvent('chat_message', 'ChatPage', { queryType: 'food', responseTime: 1200 });
 * ```
 */
export async function logEvent(
  eventType: AnalyticsEventType,
  source: string,
  metadata?: Record<string, string | number | boolean>
): Promise<void> {
  try {
    const db = getFirestoreDb();
    const analyticsRef = collection(db, 'analytics');

    const event: AnalyticsEvent = {
      eventType,
      source,
      metadata,
      clientTimestamp: new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
      sessionId: getSessionId(),
    };

    await addDoc(analyticsRef, event);
  } catch (error) {
    // Analytics should never break the app — fail silently
    console.warn('[StadiumIQ Analytics] Failed to log event:', error);
  }
}

/**
 * Convenience function to log a page view event.
 * Automatically captures the page path and referrer.
 *
 * @param pageName - Human-readable page name (e.g., 'Home', 'Chat', 'Map')
 */
export async function logPageView(pageName: string): Promise<void> {
  await logEvent('page_view', pageName, {
    path: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
    referrer: typeof document !== 'undefined' ? document.referrer || 'direct' : 'server',
  });
}

/**
 * Convenience function to log user interactions with specific features.
 *
 * @param feature - The feature being interacted with (e.g., 'HeatmapZone', 'QueueSort')
 * @param action - The action performed (e.g., 'click', 'filter', 'sort')
 * @param details - Optional additional details about the interaction
 */
export async function logInteraction(
  feature: string,
  action: string,
  details?: Record<string, string | number | boolean>
): Promise<void> {
  await logEvent('map_interaction', feature, {
    action,
    ...details,
  });
}

/**
 * Retrieves the most recent analytics events from Firestore.
 * Useful for admin dashboards and event monitoring.
 *
 * @param maxEvents - Maximum number of events to retrieve (default: 50)
 * @returns Array of recent analytics events
 */
export async function getRecentEvents(maxEvents: number = 50): Promise<AnalyticsEvent[]> {
  try {
    const db = getFirestoreDb();
    const analyticsRef = collection(db, 'analytics');
    const q = query(analyticsRef, orderBy('clientTimestamp', 'desc'), limit(maxEvents));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => doc.data() as AnalyticsEvent);
  } catch (error) {
    console.warn('[StadiumIQ Analytics] Failed to fetch events:', error);
    return [];
  }
}

/**
 * Logs a Core Web Vital or custom performance metric to analytics.
 * Tracks rendering performance, API response times, and interaction
 * latency for optimization insights.
 *
 * @param metricName - Name of the performance metric (e.g., 'LCP', 'FID', 'CLS')
 * @param value - Metric value in milliseconds (or unitless for CLS)
 * @param context - Additional context about the metric measurement
 *
 * @example
 * ```ts
 * logPerformanceMetric('api_response_time', 245, { endpoint: '/api/chat' });
 * ```
 */
export async function logPerformanceMetric(
  metricName: string,
  value: number,
  context?: Record<string, string | number | boolean>
): Promise<void> {
  await logEvent('performance_metric' as AnalyticsEventType, 'PerformanceMonitor', {
    metricName,
    value,
    ...context,
  });
}

/**
 * Logs a structured error event to the analytics pipeline.
 * Captures error category, severity, and context for debugging
 * and reliability monitoring.
 *
 * @param category - Error category (e.g., 'api', 'render', 'network')
 * @param message - Human-readable error description
 * @param severity - Error severity level
 * @param context - Additional error context metadata
 *
 * @example
 * ```ts
 * logError('api', 'Gemini API timeout after 30s', 'warning', { endpoint: '/api/chat' });
 * ```
 */
export async function logError(
  category: string,
  message: string,
  severity: 'info' | 'warning' | 'error' | 'critical' = 'error',
  context?: Record<string, string | number | boolean>
): Promise<void> {
  await logEvent('error_log' as AnalyticsEventType, 'ErrorTracker', {
    category,
    message: message.substring(0, 500), // Limit message length
    severity,
    ...context,
  });
}

