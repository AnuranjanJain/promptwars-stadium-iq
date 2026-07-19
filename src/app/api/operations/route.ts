import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  buildFallbackOperationsBrief,
  OperationsIncident,
  OperationsScenarioId,
  OPERATIONS_SCENARIOS,
  SectorSnapshot,
} from '@/lib/operations';

interface OperationsRequest {
  prompt?: string;
  scenarioId?: OperationsScenarioId;
  sectors?: SectorSnapshot[];
  incidents?: OperationsIncident[];
}

const securityHeaders = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

export async function POST(request: NextRequest) {
  let body: OperationsRequest;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400, headers: securityHeaders });
  }

  const scenario = OPERATIONS_SCENARIOS.find(item => item.id === body.scenarioId) ?? OPERATIONS_SCENARIOS[0];
  const sectors = Array.isArray(body.sectors) ? body.sectors.slice(0, 8) : [];
  const incidents = Array.isArray(body.incidents) ? body.incidents.slice(0, 12) : [];

  if (sectors.length === 0) {
    return NextResponse.json({ error: 'Live sector context is required.' }, { status: 400, headers: securityHeaders });
  }

  const fallback = buildFallbackOperationsBrief(sectors, scenario, incidents);
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your-gemini-api-key') {
    return NextResponse.json(fallback, { headers: securityHeaders });
  }

  const operatorPrompt = typeof body.prompt === 'string'
    ? body.prompt.trim().slice(0, 600)
    : 'Generate the next best operational actions.';

  try {
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
      systemInstruction: `You are the StadiumIQ NEXUS operations copilot for a FIFA World Cup 2026 venue command team.
Use only the supplied live digital-twin context. Prioritize life safety, accessibility, calm multilingual communication,
and reversible actions. Never claim an action has been dispatched. Return valid JSON with exactly these fields:
summary (string under 55 words), actions (array of exactly 3 concise strings), confidence (integer 0-100).`,
    });

    const result = await model.generateContent(JSON.stringify({
      operatorPrompt,
      scenario,
      sectors: sectors.map(sector => ({
        name: sector.name,
        gate: sector.gate,
        densityPercent: Math.round(sector.density * 100),
        predicted15mPercent: Math.round(sector.predictedDensity * 100),
        risk: sector.risk,
        trend: sector.trend,
        accessible: sector.accessible,
      })),
      incidents,
    }));

    const parsed = JSON.parse(result.response.text()) as { summary?: string; actions?: string[]; confidence?: number };

    if (!parsed.summary || !Array.isArray(parsed.actions) || parsed.actions.length < 3) {
      throw new Error('Gemini returned an incomplete operations brief.');
    }

    return NextResponse.json({
      summary: parsed.summary,
      actions: parsed.actions.slice(0, 3),
      confidence: Math.max(0, Math.min(100, Math.round(parsed.confidence ?? 85))),
      source: 'gemini-2.5-flash',
    }, { headers: securityHeaders });
  } catch (error) {
    console.error('Operations copilot error:', error);
    return NextResponse.json(fallback, { headers: securityHeaders });
  }
}
