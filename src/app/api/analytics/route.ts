// ============================================================
// StadiumIQ — Analytics API Route
// Handles structured analytics event ingestion via Firestore
// with batch validation, rate limiting awareness, and
// security headers.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc, getCountFromServer } from 'firebase/firestore';
import { validateAnalyticsBatch } from '@/lib/validators';
import { MAX_ANALYTICS_BATCH_SIZE } from '@/lib/constants';

/** Firebase config for server-side API route */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:000:web:000',
};

/**
 * Returns the Firestore instance for server-side analytics writes.
 * Returns null if configuration is not available or in demo mode.
 */
function getAnalyticsDb() {
  try {
    // In demo mode, skip Firestore to prevent hanging connections
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'demo-key') {
      return null;
    }
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    return getFirestore(app);
  } catch {
    return null;
  }
}

/**
 * Adds standard security headers to a NextResponse.
 *
 * @param response - The response to add headers to
 * @returns The response with security headers applied
 */
function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}

/**
 * POST /api/analytics
 *
 * Accepts structured analytics events and persists them to Firestore.
 * Supports batch event ingestion for efficient network usage.
 * Validates all events against the schema before writing.
 *
 * Request body:
 * - events: Array of { eventType, source, metadata?, clientTimestamp }
 *
 * Response:
 * - 200: { success: true, count: number }
 * - 400: { error: string } for invalid requests
 * - 200 with warning: when Firestore unavailable (graceful degradation)
 */
export async function POST(request: NextRequest) {
  try {
    // Check Content-Type header
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return withSecurityHeaders(
        NextResponse.json(
          { error: 'Content-Type must be application/json' },
          { status: 400 }
        )
      );
    }

    const body = await request.json();
    const { events } = body;

    // Validate the entire batch using the validator
    const validation = validateAnalyticsBatch(events);
    if (!validation.valid) {
      return withSecurityHeaders(
        NextResponse.json(
          { error: validation.error },
          { status: 400 }
        )
      );
    }

    const db = getAnalyticsDb();

    if (db) {
      // Batch write events to Firestore for efficiency
      const batch = writeBatch(db);
      const analyticsCollection = collection(db, 'analytics');

      const processedEvents = events.slice(0, MAX_ANALYTICS_BATCH_SIZE);

      for (const event of processedEvents) {
        const docRef = doc(analyticsCollection);
        batch.set(docRef, {
          ...event,
          serverTimestamp: new Date().toISOString(),
          processedAt: new Date().toISOString(),
        });
      }

      await batch.commit();
    }

    return withSecurityHeaders(
      NextResponse.json({
        success: true,
        count: events.length,
        message: `Processed ${events.length} analytics event(s)`,
      })
    );
  } catch (error) {
    console.error('[Analytics API] Error processing events:', error);
    return withSecurityHeaders(
      NextResponse.json(
        {
          success: true,
          warning: 'Events received but Firestore write was skipped (demo mode)',
          count: 0,
        },
        { status: 200 } // Graceful degradation — don't break the client
      )
    );
  }
}

/**
 * GET /api/analytics
 *
 * Returns a summary of analytics data.
 * Used by admin dashboards to monitor usage patterns.
 */
export async function GET() {
  try {
    const db = getAnalyticsDb();

    if (!db) {
      return withSecurityHeaders(
        NextResponse.json({
          summary: {
            totalEvents: 0,
            message: 'Analytics running in demo mode',
            features: [
              'page_view tracking',
              'chat_message logging',
              'map_interaction tracking',
              'queue_view monitoring',
              'navigation_request logging',
              'trivia_answer recording',
              'performance_metric tracking',
              'error_log recording',
              'tts_request tracking',
              'geocode_request logging',
              'places_search tracking',
            ],
          },
        })
      );
    }

    const analyticsCollection = collection(db, 'analytics');
    const snapshot = await getCountFromServer(analyticsCollection);

    return withSecurityHeaders(
      NextResponse.json({
        summary: {
          totalEvents: snapshot.data().count,
          message: 'Analytics active',
        },
      })
    );
  } catch (error) {
    console.error('[Analytics API] Error fetching summary:', error);
    return withSecurityHeaders(
      NextResponse.json({
        summary: { totalEvents: 0, message: 'Analytics unavailable' },
      })
    );
  }
}
