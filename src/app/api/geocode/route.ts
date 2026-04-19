// ============================================================
// StadiumIQ — Geocoding API Route
// Reverse geocodes venue coordinates to structured addresses
// using Google Maps Geocoding API.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { reverseGeocode } from '@/lib/google-cloud';
import { validateCoordinates } from '@/lib/validators';

/**
 * POST /api/geocode
 *
 * Performs reverse geocoding of geographic coordinates to
 * structured address data using Google Maps Geocoding API.
 *
 * Request body:
 * - lat: number (required) — Latitude
 * - lng: number (required) — Longitude
 *
 * Response:
 * - 200: GeocodingResult object
 * - 400: { error: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lat, lng } = body;

    const validation = validateCoordinates(lat, lng);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const result = await reverseGeocode(lat, lng);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[Geocode API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to geocode coordinates' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/geocode
 *
 * Returns the venue's geocoded address (convenience endpoint).
 */
export async function GET() {
  // Default to venue center coordinates
  const venueResult = await reverseGeocode(28.6129, 77.2295);
  return NextResponse.json({
    venue: 'National Arena',
    address: venueResult,
  });
}
