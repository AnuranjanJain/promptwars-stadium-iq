// ============================================================
// StadiumIQ — Chat API Route
// Handles AI-powered chat via Gemini with input validation,
// rate limit awareness, and security headers.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { chatWithGemini, analyzeImage } from '@/lib/gemini';
import { validateChatMessage, validateImageData } from '@/lib/validators';
import { MAX_CHAT_MESSAGE_LENGTH } from '@/lib/constants';

/** Maximum allowed chat history entries per request */
const MAX_HISTORY_LENGTH = 50;

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
 * POST /api/chat
 *
 * Sends a message or image to the Gemini AI model and returns
 * the assistant's response. Supports text chat with conversation
 * history and image-based location detection (Gemini Vision).
 *
 * Request body:
 * - message: string (required unless image provided)
 * - history: ChatMessage[] (optional conversation history)
 * - image: string (optional base64 image for Vision mode)
 *
 * Response:
 * - 200: { response: string }
 * - 400: { error: string } for invalid requests
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history, image } = body;

    // Validate that at least one input is provided
    if (!message && !image) {
      return withSecurityHeaders(
        NextResponse.json(
          { error: 'Message or image is required' },
          { status: 400 }
        )
      );
    }

    // Validate text message if provided
    if (message) {
      const messageValidation = validateChatMessage(message);
      if (!messageValidation.valid) {
        return withSecurityHeaders(
          NextResponse.json(
            { error: messageValidation.error },
            { status: 400 }
          )
        );
      }
    }

    // Validate image data if provided
    if (image) {
      const imageValidation = validateImageData(image);
      if (!imageValidation.valid) {
        return withSecurityHeaders(
          NextResponse.json(
            { error: imageValidation.error },
            { status: 400 }
          )
        );
      }
    }

    // Validate and truncate history to prevent abuse
    const safeHistory = Array.isArray(history)
      ? history.slice(-MAX_HISTORY_LENGTH)
      : [];

    let response: string;

    if (image) {
      // Vision-based "Where Am I?" feature
      const prompt = (typeof message === 'string' && message.trim())
        ? message.trim().substring(0, MAX_CHAT_MESSAGE_LENGTH)
        : 'Where am I in the stadium? Help me navigate to my seat.';
      response = await analyzeImage(image, prompt);
    } else {
      // Standard text chat
      response = await chatWithGemini(message, safeHistory);
    }

    return withSecurityHeaders(
      NextResponse.json({ response })
    );
  } catch (error) {
    console.error('Chat API error:', error);
    return withSecurityHeaders(
      NextResponse.json(
        { response: "I'm having trouble right now. Please try again in a moment! 🏟️" },
        { status: 200 } // Return 200 so frontend doesn't break
      )
    );
  }
}
