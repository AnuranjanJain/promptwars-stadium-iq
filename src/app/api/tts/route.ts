// ============================================================
// StadiumIQ — Text-to-Speech API Route
// Synthesizes speech from text using Google Cloud TTS API
// for accessible crowd alerts and navigation instructions.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { synthesizeSpeech } from '@/lib/google-cloud';
import { sanitizeInput } from '@/lib/validators';

/**
 * POST /api/tts
 *
 * Converts text to speech audio using Google Cloud Text-to-Speech API.
 * Used for accessibility features — reading crowd alerts and navigation
 * steps aloud for visually impaired attendees.
 *
 * Request body:
 * - text: string (required) — The text to synthesize
 * - languageCode: string (optional, default: 'en-US')
 * - gender: 'NEUTRAL' | 'MALE' | 'FEMALE' (optional)
 * - speakingRate: number (optional, 0.25-4.0)
 *
 * Response:
 * - 200: { audioContent: string, source: string }
 * - 400: { error: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, languageCode, gender, speakingRate } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text exceeds maximum length of 5000 characters' },
        { status: 400 }
      );
    }

    // Sanitize input before processing
    const sanitizedText = sanitizeInput(text.trim());

    const result = await synthesizeSpeech({
      text: sanitizedText,
      languageCode: languageCode || 'en-US',
      gender: gender || 'NEUTRAL',
      speakingRate: typeof speakingRate === 'number' ? Math.max(0.25, Math.min(4.0, speakingRate)) : 1.0,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[TTS API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to synthesize speech', source: 'error' },
      { status: 500 }
    );
  }
}
