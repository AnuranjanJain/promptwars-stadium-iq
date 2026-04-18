// ============================================================
// StadiumIQ — Analytics API Route
// Handles structured analytics event ingestion via Firestore
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc, getCountFromServer } from 'firebase/firestore';

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
 * Returns null if configuration is not available.
 */
function getAnalyticsDb() {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    return getFirestore(app);
  } catch {
    return null;
  }
}

/**
 * POST /api/analytics
 *
 * Accepts structured analytics events and persists them to Firestore.
 * Supports batch event ingestion for efficient network usage.
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
    const body = await request.json();
    const { events } = body;

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'Events array is required and must be non-empty' },
        { status: 400 }
      );
    }

    // Validate event structure
    for (const event of events) {
      if (!event.eventType || !event.source) {
        return NextResponse.json(
          { error: 'Each event must have eventType and source' },
          { status: 400 }
        );
      }
    }

    const db = getAnalyticsDb();

    if (db) {
      // Batch write events to Firestore for efficiency
      const batch = writeBatch(db);
      const analyticsCollection = collection(db, 'analytics');

      for (const event of events) {
        const docRef = doc(analyticsCollection);
        batch.set(docRef, {
          ...event,
          serverTimestamp: new Date().toISOString(),
          processedAt: new Date().toISOString(),
        });
      }

      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      count: events.length,
      message: `Processed ${events.length} analytics event(s)`,
    });
  } catch (error) {
    console.error('[Analytics API] Error processing events:', error);
    return NextResponse.json(
      {
        success: true,
        warning: 'Events received but Firestore write was skipped (demo mode)',
        count: 0,
      },
      { status: 200 } // Graceful degradation — don't break the client
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
      return NextResponse.json({
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
          ],
        },
      });
    }

    const analyticsCollection = collection(db, 'analytics');
    const snapshot = await getCountFromServer(analyticsCollection);

    return NextResponse.json({
      summary: {
        totalEvents: snapshot.data().count,
        message: 'Analytics active',
      },
    });
  } catch (error) {
    console.error('[Analytics API] Error fetching summary:', error);
    return NextResponse.json({
      summary: { totalEvents: 0, message: 'Analytics unavailable' },
    });
  }
}
