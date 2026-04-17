import { NextRequest, NextResponse } from 'next/server';
import { chatWithGemini, analyzeImage } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history, image } = body;

    if (!message && !image) {
      return NextResponse.json(
        { error: 'Message or image is required' },
        { status: 400 }
      );
    }

    let response: string;

    if (image) {
      // Vision-based "Where Am I?" feature
      const prompt = message || 'Where am I in the stadium? Help me navigate to my seat.';
      response = await analyzeImage(image, prompt);
    } else {
      // Standard text chat
      response = await chatWithGemini(message, history || []);
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { response: "I'm having trouble right now. Please try again in a moment! 🏟️" },
      { status: 200 } // Return 200 so frontend doesn't break
    );
  }
}
