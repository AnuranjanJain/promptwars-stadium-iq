// ============================================================
// StadiumIQ — Places API Route
// Searches for nearby places (transit, parking, etc.) using
// Google Maps Places API.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { searchNearbyPlaces } from '@/lib/google-cloud';
import { validateCoordinates } from '@/lib/validators';

/** Allowed place types for the search */
const ALLOWED_PLACE_TYPES = [
  'transit_station',
  'parking',
  'restaurant',
  'hospital',
  'pharmacy',
  'atm',
  'taxi_stand',
  'bus_station',
] as const;

/**
 * POST /api/places
 *
 * Searches for nearby places around the venue using Google Places API.
 * Used to help fans find transit options, parking, and services near the stadium.
 *
 * Request body:
 * - lat: number (required) — Center latitude
 * - lng: number (required) — Center longitude
 * - type: string (required) — Place type filter
 * - radius: number (optional, default: 1000, max: 5000)
 *
 * Response:
 * - 200: { places: NearbyPlace[], count: number }
 * - 400: { error: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lat, lng, type, radius } = body;

    // Validate coordinates
    const coordValidation = validateCoordinates(lat, lng);
    if (!coordValidation.valid) {
      return NextResponse.json(
        { error: coordValidation.error },
        { status: 400 }
      );
    }

    // Validate place type
    if (!type || typeof type !== 'string') {
      return NextResponse.json(
        { error: 'Place type is required' },
        { status: 400 }
      );
    }

    if (!ALLOWED_PLACE_TYPES.includes(type as typeof ALLOWED_PLACE_TYPES[number])) {
      return NextResponse.json(
        { error: `Invalid place type. Allowed: ${ALLOWED_PLACE_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate radius
    const searchRadius = typeof radius === 'number' ? Math.min(Math.max(100, radius), 5000) : 1000;

    const places = await searchNearbyPlaces(lat, lng, type, searchRadius);

    return NextResponse.json({
      places,
      count: places.length,
      searchRadius,
      type,
    });
  } catch (error) {
    console.error('[Places API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to search nearby places' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/places
 *
 * Returns nearby transit stations for the venue (convenience endpoint).
 */
export async function GET() {
  const transit = await searchNearbyPlaces(28.6129, 77.2295, 'transit_station', 1500);
  const parking = await searchNearbyPlaces(28.6129, 77.2295, 'parking', 1000);

  return NextResponse.json({
    venue: 'National Arena',
    nearby: {
      transit,
      parking,
    },
  });
}
