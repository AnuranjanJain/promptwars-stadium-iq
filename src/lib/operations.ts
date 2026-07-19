import { CrowdDensity } from '@/types';

export type OperationsScenarioId =
  | 'steady'
  | 'ingress'
  | 'halftime'
  | 'weather'
  | 'egress';

export interface OperationsScenario {
  id: OperationsScenarioId;
  label: string;
  shortLabel: string;
  note: string;
  densityMultiplier: number;
  transitLoad: number;
  weatherRisk: number;
  accent: 'green' | 'blue' | 'amber' | 'red';
}

export interface StadiumSector {
  id: string;
  code: string;
  name: string;
  zoneId: string;
  gate: string;
  capacity: number;
  accessible: boolean;
  x: number;
  y: number;
}

export interface SectorSnapshot extends StadiumSector {
  density: number;
  predictedDensity: number;
  risk: number;
  trend: CrowdDensity['trend'];
  status: 'clear' | 'watch' | 'high' | 'critical';
  recommendation: string;
}

export interface OperationsIncident {
  id: string;
  title: string;
  sectorId: string;
  type: 'crowd' | 'medical' | 'accessibility' | 'transport' | 'weather';
  priority: 'medium' | 'high' | 'critical';
  ageMinutes: number;
  status: 'open' | 'dispatched' | 'monitoring';
  owner: string;
}

export const OPERATIONS_SCENARIOS: OperationsScenario[] = [
  {
    id: 'steady',
    label: 'Steady state',
    shortLabel: 'Steady',
    note: 'Normal match operations. Maintain current staffing and keep the west accessibility corridor protected.',
    densityMultiplier: 0.88,
    transitLoad: 42,
    weatherRisk: 8,
    accent: 'green',
  },
  {
    id: 'ingress',
    label: 'Ingress surge',
    shortLabel: 'Ingress',
    note: 'Turnstile arrivals are peaking. Shift stewards toward Gates A and C and hold a clear family lane at Gate D.',
    densityMultiplier: 1.12,
    transitLoad: 86,
    weatherRisk: 10,
    accent: 'blue',
  },
  {
    id: 'halftime',
    label: 'Halftime rush',
    shortLabel: 'Halftime',
    note: 'Concourse demand is forecast to spike. Open pop-up hydration points and split food queues before the whistle.',
    densityMultiplier: 1.18,
    transitLoad: 38,
    weatherRisk: 8,
    accent: 'amber',
  },
  {
    id: 'weather',
    label: 'Weather hold',
    shortLabel: 'Weather',
    note: 'Lightning is inside the operational watch radius. Prepare covered shelter routes and multilingual instructions.',
    densityMultiplier: 1.24,
    transitLoad: 64,
    weatherRisk: 91,
    accent: 'red',
  },
  {
    id: 'egress',
    label: 'Full-time egress',
    shortLabel: 'Egress',
    note: 'Stagger gate releases against rail capacity. Keep Gate D open for step-free travel and divert rideshare to Lot P3.',
    densityMultiplier: 1.28,
    transitLoad: 94,
    weatherRisk: 12,
    accent: 'amber',
  },
];

export const STADIUM_SECTORS: StadiumSector[] = [
  { id: 'north', code: 'N-01', name: 'North Bowl', zoneId: 'zone-north', gate: 'Gate A', capacity: 10800, accessible: true, x: 50, y: 17 },
  { id: 'east', code: 'E-12', name: 'East Concourse', zoneId: 'zone-east', gate: 'Gate C', capacity: 12400, accessible: false, x: 79, y: 42 },
  { id: 'south', code: 'S-07', name: 'South Bowl', zoneId: 'zone-south', gate: 'Gate B', capacity: 11200, accessible: true, x: 50, y: 76 },
  { id: 'west', code: 'W-04', name: 'West Concourse', zoneId: 'zone-west', gate: 'Gate D', capacity: 11800, accessible: true, x: 21, y: 42 },
  { id: 'food', code: 'F-20', name: 'Food Hall', zoneId: 'zone-food-court', gate: 'Level 1', capacity: 4200, accessible: true, x: 67, y: 67 },
  { id: 'merch', code: 'M-16', name: 'Fan Market', zoneId: 'zone-merch', gate: 'West plaza', capacity: 3600, accessible: true, x: 30, y: 68 },
];

export const INITIAL_OPERATIONS_INCIDENTS: OperationsIncident[] = [
  {
    id: 'INC-2048',
    title: 'Queue spillover near Food Hall',
    sectorId: 'food',
    type: 'crowd',
    priority: 'high',
    ageMinutes: 4,
    status: 'open',
    owner: 'Unassigned',
  },
  {
    id: 'INC-2046',
    title: 'Lift 3 intermittent telemetry',
    sectorId: 'west',
    type: 'accessibility',
    priority: 'critical',
    ageMinutes: 7,
    status: 'dispatched',
    owner: 'Mobility team 2',
  },
  {
    id: 'INC-2041',
    title: 'Rail platform approaching limit',
    sectorId: 'south',
    type: 'transport',
    priority: 'medium',
    ageMinutes: 11,
    status: 'monitoring',
    owner: 'Transit liaison',
  },
];

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function getStatus(risk: number): SectorSnapshot['status'] {
  if (risk >= 86) return 'critical';
  if (risk >= 72) return 'high';
  if (risk >= 54) return 'watch';
  return 'clear';
}

function scenarioBias(sector: StadiumSector, scenarioId: OperationsScenarioId) {
  if (scenarioId === 'ingress' && ['north', 'east'].includes(sector.id)) return 0.12;
  if (scenarioId === 'halftime' && ['food', 'merch', 'east'].includes(sector.id)) return 0.16;
  if (scenarioId === 'weather' && ['west', 'south'].includes(sector.id)) return 0.1;
  if (scenarioId === 'egress' && ['north', 'south', 'west'].includes(sector.id)) return 0.16;
  return 0;
}

function recommendationFor(sector: StadiumSector, scenario: OperationsScenario, status: SectorSnapshot['status']) {
  if (scenario.id === 'weather') return `Hold ${sector.gate} flow and guide guests to the nearest covered concourse.`;
  if (sector.id === 'food' && status !== 'clear') return 'Open the express kiosk and deploy 4 queue marshals before the next demand wave.';
  if (sector.accessible && status === 'critical') return `Protect the step-free lane at ${sector.gate} and dispatch accessibility support.`;
  if (status === 'critical') return `Meter entry at ${sector.gate}; redirect arrivals to the lowest-risk adjacent sector.`;
  if (status === 'high') return `Move 6 stewards toward ${sector.gate} and activate multilingual wayfinding.`;
  if (status === 'watch') return 'Monitor the 15-minute forecast and prepare a soft diversion message.';
  return 'No intervention required. Maintain staffing and continue sensor watch.';
}

export function buildSectorSnapshots(
  crowdData: CrowdDensity[],
  scenarioId: OperationsScenarioId,
): SectorSnapshot[] {
  const scenario = OPERATIONS_SCENARIOS.find(item => item.id === scenarioId) ?? OPERATIONS_SCENARIOS[0];

  return STADIUM_SECTORS.map(sector => {
    const live = crowdData.find(zone => zone.zoneId === sector.zoneId);
    const rawDensity = live?.density ?? 0.45;
    const bias = scenarioBias(sector, scenario.id);
    const density = clamp(rawDensity * scenario.densityMultiplier + bias, 0.08, 0.98);
    const trend = live?.trend ?? 'stable';
    const trendDelta = trend === 'increasing' ? 0.11 : trend === 'decreasing' ? -0.06 : 0.03;
    const predictedDensity = clamp(density + trendDelta + bias * 0.35, 0.08, 0.99);
    const risk = Math.round(clamp(density * 0.72 + predictedDensity * 0.22 + scenario.weatherRisk / 100 * 0.06) * 100);
    const status = getStatus(risk);

    return {
      ...sector,
      density,
      predictedDensity,
      risk,
      trend,
      status,
      recommendation: recommendationFor(sector, scenario, status),
    };
  }).sort((a, b) => b.risk - a.risk);
}

export function calculateReadiness(
  sectors: SectorSnapshot[],
  incidents: OperationsIncident[],
  scenario: OperationsScenario,
) {
  const averageRisk = sectors.reduce((sum, sector) => sum + sector.risk, 0) / Math.max(sectors.length, 1);
  const unresolvedPenalty = incidents.filter(incident => incident.status === 'open').length * 4;
  const readiness = Math.round(clamp(1 - averageRisk / 175 - unresolvedPenalty / 100, 0.42, 0.98) * 100);
  const attendance = Math.round(sectors.reduce((sum, sector) => sum + sector.capacity * sector.density, 0));
  const criticalSectors = sectors.filter(sector => sector.status === 'critical').length;
  const accessibilitySla = Math.max(72, 98 - incidents.filter(incident => incident.type === 'accessibility' && incident.status !== 'monitoring').length * 8 - criticalSectors * 2);

  return {
    readiness,
    attendance,
    criticalSectors,
    accessibilitySla,
    transitLoad: scenario.transitLoad,
    carbonSavedKg: Math.round(attendance * 0.18 + scenario.transitLoad * 21),
  };
}

export function buildFallbackOperationsBrief(
  sectors: SectorSnapshot[],
  scenario: OperationsScenario,
  incidents: OperationsIncident[],
) {
  const top = sectors[0];
  const openIncidents = incidents.filter(incident => incident.status === 'open');
  const accessibleIssue = incidents.find(incident => incident.type === 'accessibility' && incident.status !== 'monitoring');

  const actions = [
    top.recommendation,
    openIncidents.length > 0
      ? `Assign a response lead to ${openIncidents[0].id} and request an acknowledgement within 2 minutes.`
      : 'Keep the incident reserve on standby; all current response tickets are owned.',
    accessibleIssue
      ? 'Keep the Gate D step-free route open until Lift 3 telemetry is verified stable.'
      : 'Run a proactive accessibility route check before the next crowd phase.',
  ];

  return {
    summary: `${scenario.label}: ${top.name} is the priority sector at risk ${top.risk}/100. The digital twin forecasts ${Math.round(top.predictedDensity * 100)}% density within 15 minutes.`,
    actions,
    confidence: 91,
    source: 'deterministic-fallback' as const,
  };
}
