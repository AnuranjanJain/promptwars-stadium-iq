// ============================================================
// StadiumIQ — Firebase Client Setup
// Provides Firestore database, authentication, and real-time
// crowd data persistence through Google Firebase services.
// ============================================================

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInAnonymously, Auth } from 'firebase/auth';
import { CrowdDensity } from '@/types';

/** Firebase project configuration loaded from environment variables */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:000:web:000',
};

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

/**
 * Returns the Firebase App singleton instance.
 * Initializes the app on first call, reuses existing app on subsequent calls.
 *
 * @returns The initialized Firebase App instance
 */
function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }
  return app;
}

/**
 * Returns the Firestore database instance (singleton).
 * Used across the application for real-time data sync, analytics logging,
 * and crowd state persistence.
 *
 * @returns The Firestore database instance
 *
 * @example
 * ```ts
 * const db = getFirestoreDb();
 * const crowdRef = collection(db, 'crowd_snapshots');
 * ```
 */
export function getFirestoreDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }
  return db;
}

/**
 * Returns the Firebase Auth instance (singleton).
 * Used for anonymous authentication so users can interact
 * with the app without creating an account.
 *
 * @returns The Firebase Auth instance
 */
export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

/**
 * Signs in the user anonymously using Firebase Authentication.
 * Returns a Firebase UID on success, or generates a local fallback ID
 * if authentication fails (e.g., no internet or demo mode).
 *
 * @returns The user's unique identifier string
 *
 * @example
 * ```ts
 * const userId = await signInAnon();
 * console.log('User ID:', userId); // "abc123..." or "anonymous-xyz"
 * ```
 */
export async function signInAnon(): Promise<string> {
  const authInstance = getFirebaseAuth();
  try {
    const result = await signInAnonymously(authInstance);
    return result.user.uid;
  } catch (error) {
    console.error('Anonymous sign-in failed:', error);
    return 'anonymous-' + Math.random().toString(36).substring(2, 9);
  }
}

/**
 * Persists a crowd density snapshot to Firestore for historical analysis.
 * Snapshots are stored in the `crowd_snapshots` collection with server timestamps,
 * enabling trend analysis and prediction model training.
 *
 * @param crowdData - Array of current crowd density readings for all zones
 *
 * @example
 * ```ts
 * await writeCrowdSnapshot(currentCrowdData);
 * ```
 */
export async function writeCrowdSnapshot(crowdData: CrowdDensity[]): Promise<void> {
  try {
    const firestore = getFirestoreDb();
    const snapshotRef = collection(firestore, 'crowd_snapshots');

    await addDoc(snapshotRef, {
      zones: crowdData.map(zone => ({
        zoneId: zone.zoneId,
        zoneName: zone.zoneName,
        density: zone.density,
        trend: zone.trend,
      })),
      timestamp: serverTimestamp(),
      clientTimestamp: new Date().toISOString(),
      zoneCount: crowdData.length,
      avgDensity: Math.round(
        (crowdData.reduce((sum, z) => sum + z.density, 0) / crowdData.length) * 100
      ) / 100,
    });
  } catch (error) {
    // Firestore writes should never break the app
    console.warn('[StadiumIQ] Failed to write crowd snapshot:', error);
  }
}

/**
 * Retrieves historical crowd density snapshots from Firestore.
 * Returns the most recent snapshots ordered by timestamp.
 * Used for trend visualization and prediction model inputs.
 *
 * @param maxSnapshots - Maximum number of snapshots to retrieve (default: 20)
 * @returns Array of historical crowd snapshot objects
 *
 * @example
 * ```ts
 * const history = await getCrowdHistory(10);
 * history.forEach(snap => console.log(snap.avgDensity));
 * ```
 */
export async function getCrowdHistory(maxSnapshots: number = 20): Promise<Record<string, unknown>[]> {
  try {
    const firestore = getFirestoreDb();
    const snapshotRef = collection(firestore, 'crowd_snapshots');
    const q = query(snapshotRef, orderBy('clientTimestamp', 'desc'), limit(maxSnapshots));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.warn('[StadiumIQ] Failed to read crowd history:', error);
    return [];
  }
}
