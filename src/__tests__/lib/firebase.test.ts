// ============================================================
// StadiumIQ — Unit Tests: Firebase Client
// Tests initialization, singletons, and function signatures.
// Firestore write/read operations are mocked to prevent
// hanging connections with demo credentials.
// ============================================================

import {
  getFirestoreDb,
  getFirebaseAuth,
  signInAnon,
  writeCrowdSnapshot,
  getCrowdHistory,
} from '@/lib/firebase';
import { CrowdDensity } from '@/types';

// Mock Firestore operations to prevent hanging connections
jest.mock('firebase/firestore', () => {
  const actual = jest.requireActual('firebase/firestore');
  return {
    ...actual,
    addDoc: jest.fn().mockResolvedValue({ id: 'mock-doc-id' }),
    getDocs: jest.fn().mockResolvedValue({
      docs: [
        {
          id: 'snap-1',
          data: () => ({
            zones: [{ zoneId: 'z1', zoneName: 'North', density: 0.5, trend: 'stable' }],
            avgDensity: 0.5,
            clientTimestamp: new Date().toISOString(),
          }),
        },
      ],
    }),
  };
});

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
  it('returns a string ID (either real or fallback)', async () => {
    const uid = await signInAnon();
    expect(typeof uid).toBe('string');
    expect(uid.length).toBeGreaterThan(0);
  });

  it('fallback ID has valid format', async () => {
    const uid = await signInAnon();
    // Should either be a Firebase UID or fallback "anonymous-xxx"
    expect(uid.startsWith('anonymous-') || uid.length > 10).toBe(true);
  });
});

describe('writeCrowdSnapshot', () => {
  const mockCrowdData: CrowdDensity[] = [
    {
      zoneId: 'zone-1',
      zoneName: 'North Concourse',
      density: 0.72,
      trend: 'increasing',
      location: { lat: 28.6142, lng: 77.2295 },
      lastUpdated: Date.now(),
    },
    {
      zoneId: 'zone-2',
      zoneName: 'South Concourse',
      density: 0.45,
      trend: 'stable',
      location: { lat: 28.6116, lng: 77.2295 },
      lastUpdated: Date.now(),
    },
  ];

  it('writes a snapshot without throwing', async () => {
    await expect(writeCrowdSnapshot(mockCrowdData)).resolves.not.toThrow();
  });

  it('handles empty crowd data array', async () => {
    await expect(writeCrowdSnapshot([])).resolves.not.toThrow();
  });

  it('handles single zone crowd data', async () => {
    const singleZone: CrowdDensity[] = [{
      zoneId: 'zone-1',
      zoneName: 'Test Zone',
      density: 0.5,
      trend: 'stable',
      location: { lat: 28.61, lng: 77.22 },
      lastUpdated: Date.now(),
    }];
    await expect(writeCrowdSnapshot(singleZone)).resolves.not.toThrow();
  });

  it('handles extreme density values', async () => {
    const extremeData: CrowdDensity[] = [
      {
        zoneId: 'zone-1',
        zoneName: 'Max Zone',
        density: 0.98,
        trend: 'increasing',
        location: { lat: 28.61, lng: 77.22 },
        lastUpdated: Date.now(),
      },
      {
        zoneId: 'zone-2',
        zoneName: 'Min Zone',
        density: 0.05,
        trend: 'decreasing',
        location: { lat: 28.61, lng: 77.23 },
        lastUpdated: Date.now(),
      },
    ];
    await expect(writeCrowdSnapshot(extremeData)).resolves.not.toThrow();
  });
});

describe('getCrowdHistory', () => {
  it('returns an array', async () => {
    const history = await getCrowdHistory();
    expect(Array.isArray(history)).toBe(true);
  });

  it('returns snapshot objects with expected fields', async () => {
    const history = await getCrowdHistory();
    if (history.length > 0) {
      expect(history[0]).toHaveProperty('id');
    }
  });

  it('accepts custom maxSnapshots parameter', async () => {
    const history = await getCrowdHistory(5);
    expect(Array.isArray(history)).toBe(true);
  });

  it('accepts default maxSnapshots parameter', async () => {
    const history = await getCrowdHistory();
    expect(Array.isArray(history)).toBe(true);
  });
});
