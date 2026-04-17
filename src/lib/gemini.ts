// ============================================================
// StadiumIQ — Gemini AI Client
// ============================================================

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { GEMINI_SYSTEM_PROMPT } from './venue-data';

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

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
