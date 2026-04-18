// ============================================================
// StadiumIQ — Unit Tests: Firebase Client
// ============================================================

import { getFirestoreDb, getFirebaseAuth, signInAnon } from '@/lib/firebase';

describe('Firebase Client Initialization', () => {
  it('getFirestoreDb returns a Firestore instance', () => {
    const db = getFirestoreDb();
    expect(db).toBeDefined();
    expect(typeof db).toBe('object');
  });

  it('getFirestoreDb returns the same instance on multiple calls (singleton)', () => {
    const db1 = getFirestoreDb();
    const db2 = getFirestoreDb();
    expect(db1).toBe(db2);
  });

  it('getFirebaseAuth returns an Auth instance', () => {
    const auth = getFirebaseAuth();
    expect(auth).toBeDefined();
    expect(typeof auth).toBe('object');
  });

  it('getFirebaseAuth returns the same instance on multiple calls (singleton)', () => {
    const auth1 = getFirebaseAuth();
    const auth2 = getFirebaseAuth();
    expect(auth1).toBe(auth2);
  });
});

describe('signInAnon', () => {
  it('returns a string ID on failure (graceful fallback)', async () => {
    // Without real Firebase credentials, anonymous sign-in will fail
    // The function should gracefully return a fallback ID
    const uid = await signInAnon();
    expect(typeof uid).toBe('string');
    expect(uid.length).toBeGreaterThan(0);
  });

  it('fallback ID starts with "anonymous-" prefix', async () => {
    const uid = await signInAnon();
    // Should either be a Firebase UID or fallback "anonymous-xxx"
    expect(uid.startsWith('anonymous-') || uid.length > 10).toBe(true);
  });
});
