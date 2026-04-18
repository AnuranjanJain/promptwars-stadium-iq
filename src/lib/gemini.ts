// ============================================================
// StadiumIQ — Gemini AI Client
// Provides text chat, image analysis, and crowd intelligence
// using Google's Gemini 2.0 Flash model.
// ============================================================

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { GEMINI_SYSTEM_PROMPT } from './venue-data';
import { CrowdDensity } from '@/types';

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

/**
 * Retrieves or initializes the Gemini GenerativeModel singleton.
 * Returns null if no valid API key is configured, enabling
 * graceful fallback to the offline response engine.
 *
 * @returns The Gemini model instance, or null if unavailable
 */
function getModel(): GenerativeModel | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your-gemini-api-key') {
    return null;
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
  if (!model) {
    model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: GEMINI_SYSTEM_PROMPT,
    });
  }
  return model;
}

/**
 * Sends a text message to the Gemini AI chat model and returns the response.
 * Maintains conversation context through the provided chat history.
 * Falls back to the deterministic offline response engine if the API is unavailable.
 *
 * @param message - The user's text message to send
 * @param history - Previous chat messages for conversation context
 * @returns The AI-generated response text
 *
 * @example
 * ```ts
 * const response = await chatWithGemini("Where can I eat?", chatHistory);
 * ```
 */
export async function chatWithGemini(
  message: string,
  history: { role: string; parts: { text: string }[] }[] = []
): Promise<string> {
  const geminiModel = getModel();

  if (!geminiModel) {
    return getFallbackResponse(message);
  }

  try {
    const chat = geminiModel.startChat({
      history: history.map(h => ({
        role: h.role as 'user' | 'model',
        parts: h.parts,
      })),
    });

    const result = await chat.sendMessage(message);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return getFallbackResponse(message);
  }
}

/**
 * Analyzes an uploaded image using Gemini Vision to determine
 * the user's location within the stadium and provide navigation help.
 * This is the "Where Am I?" feature — a visual GPS for the venue.
 *
 * @param imageBase64 - Base64-encoded image data (JPEG format expected)
 * @param prompt - User's question or context about the image
 * @returns AI-generated location analysis and navigation guidance
 *
 * @example
 * ```ts
 * const location = await analyzeImage(base64Photo, "Where am I?");
 * ```
 */
export async function analyzeImage(
  imageBase64: string,
  prompt: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your-gemini-api-key') {
    return "📸 Image analysis requires a Gemini API key. In the meantime, I can help you navigate using text — just describe what you see around you!";
  }

  try {
    const ai = new GoogleGenerativeAI(apiKey);
    const visionModel = ai.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await visionModel.generateContent([
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64,
        },
      },
      prompt + '\n\nContext: You are Stadium Buddy, an AI assistant at National Arena. Based on this image, help the user identify where they are in the stadium and provide navigation assistance.',
    ]);

    return result.response.text();
  } catch (error) {
    console.error('Gemini Vision error:', error);
    return "I couldn't analyze that image right now. Can you describe what you see? I'll help you navigate!";
  }
}

/**
 * Uses Gemini AI to generate a natural-language crowd insight summary
 * from real-time crowd density data. This provides actionable intelligence
 * beyond raw numbers — e.g., "The food court is peaking, but the west wing
 * is clearing up fast."
 *
 * Falls back to a deterministic summary when the API is unavailable.
 *
 * @param crowdData - Current crowd density readings for all venue zones
 * @returns Natural-language crowd insight summary
 *
 * @example
 * ```ts
 * const insight = await generateCrowdInsight(currentCrowdData);
 * // "🔮 The East Wing is very crowded (85%). Consider the West Wing instead."
 * ```
 */
export async function generateCrowdInsight(
  crowdData: CrowdDensity[]
): Promise<string> {
  const geminiModel = getModel();

  const crowdSummary = crowdData
    .map(z => `${z.zoneName}: ${Math.round(z.density * 100)}% (${z.trend})`)
    .join(', ');

  if (!geminiModel) {
    return generateFallbackCrowdInsight(crowdData);
  }

  try {
    const result = await geminiModel.generateContent(
      `As Stadium Buddy, analyze this live crowd data and provide a brief 2-3 sentence actionable insight for fans. Data: ${crowdSummary}. Focus on: which areas to avoid, which are good to visit now, and any notable trends.`
    );
    return result.response.text();
  } catch (error) {
    console.error('Gemini crowd insight error:', error);
    return generateFallbackCrowdInsight(crowdData);
  }
}

/**
 * Generates a deterministic crowd insight from density data
 * when the Gemini API is unavailable.
 *
 * @param crowdData - Current crowd density readings
 * @returns Formatted crowd insight string
 */
function generateFallbackCrowdInsight(crowdData: CrowdDensity[]): string {
  const sorted = [...crowdData].sort((a, b) => b.density - a.density);
  const busiest = sorted[0];
  const quietest = sorted[sorted.length - 1];
  const increasing = sorted.filter(z => z.trend === 'increasing');

  let insight = `🔮 **Crowd Insight:** ${busiest.zoneName} is the busiest area right now at ${Math.round(busiest.density * 100)}%.`;
  insight += ` ${quietest.zoneName} is your best bet at only ${Math.round(quietest.density * 100)}% capacity.`;

  if (increasing.length > 0) {
    insight += ` ⚠️ Watch out — ${increasing.map(z => z.zoneName).join(' and ')} ${increasing.length === 1 ? 'is' : 'are'} getting more crowded.`;
  }

  return insight;
}

/**
 * Deterministic fallback response engine for when the Gemini API
 * is unavailable. Provides keyword-matched responses using
 * pre-configured venue data to ensure 100% demo uptime.
 *
 * @param message - The user's input message
 * @returns A contextually relevant response string
 */
function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('food') || lower.includes('eat') || lower.includes('hungry')) {
    return "🍽️ Great timing! Here are your best options right now:\n\n1. **Chai & Snacks** (Level 1, East) — Only ~5 min wait! ⭐\n2. **Pizza Corner** (Ground, South) — ~8 min wait\n3. **The Grand Grill** (Ground, North) — ~12 min wait\n\n⚠️ Avoid Biryani Bowl right now (18 min wait). Pro tip: Halftime rush is coming in ~20 min — grab food NOW!";
  }
  if (lower.includes('restroom') || lower.includes('bathroom') || lower.includes('toilet') || lower.includes('washroom')) {
    return "🚻 Here are the restroom wait times:\n\n1. **South Gate** — ~2 min wait ⭐ Best option!\n2. **North Gate** — ~6 min wait\n3. **East Wing (L1)** — ~10 min wait\n4. **West Wing** — ❌ Closed for maintenance\n\nI recommend the South Gate restroom — shortest wait!";
  }
  if (lower.includes('score') || lower.includes('game') || lower.includes('match')) {
    return "⚽ **Live Score:**\n\n🏠 Delhi Titans **2** - **1** Mumbai Warriors 🏢\n\n⏱️ 2nd Half — 67:23\n\nRahul Singh scored a brilliant volley in the 62nd minute to give Delhi the lead! 🔥";
  }
  if (lower.includes('gate') || lower.includes('exit') || lower.includes('leave')) {
    return "🚪 Here are the exits:\n\n- **Gate A (North)** — Low crowd\n- **Gate B (South)** — Low crowd ⭐\n- **Gate C (East)** — VIP entrance\n- **Gate D (West)** — Family/Accessible ♿\n\nGate B (South) currently has the least congestion!";
  }
  if (lower.includes('help') || lower.includes('what can you do')) {
    return "👋 I'm **Stadium Buddy**, your AI concierge! I can help with:\n\n🗺️ **Navigation** — Find your seat, food, restrooms\n⏱️ **Queue Times** — Real-time wait estimates\n🍔 **Food Recs** — Best options based on wait times\n📊 **Crowd Info** — Avoid busy areas\n⚽ **Game Updates** — Live score and highlights\n🚨 **Emergency** — Nearest exits and first aid\n\nJust ask me anything!";
  }
  if (lower.includes('merch') || lower.includes('shop') || lower.includes('jersey') || lower.includes('buy')) {
    return "🛍️ Merchandise options:\n\n1. **Fan Zone Store** (Ground, West) — Full range, 15 min wait\n2. **Quick Merch Kiosk** (Ground, East) — Scarves & flags, 4 min wait ⭐\n\n🎉 Flash sale: 20% off at Fan Zone Store for the next 15 minutes!";
  }

  return "👋 I'm **Stadium Buddy**! I can help you with:\n\n- 🍔 Finding the best food with shortest waits\n- 🚻 Nearest restrooms and wait times\n- 🗺️ Navigation within the stadium\n- ⚽ Live game updates\n- 👥 Group coordination\n\nWhat do you need help with?";
}
