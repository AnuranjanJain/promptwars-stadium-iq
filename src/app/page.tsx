'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowUpRight,
  Bot,
  Check,
  ChevronRight,
  CircleAlert,
  CloudLightning,
  Gauge,
  Headphones,
  Languages,
  Leaf,
  MapPin,
  Navigation,
  Radio,
  RefreshCw,
  Route,
  ShieldCheck,
  Sparkles,
  TrainFront,
  UserRoundCheck,
  Users,
  Waves,
  Wifi,
  Zap,
} from 'lucide-react';
import { useAppContext } from '@/components/AppProvider';
import {
  buildFallbackOperationsBrief,
  buildSectorSnapshots,
  calculateReadiness,
  INITIAL_OPERATIONS_INCIDENTS,
  OperationsIncident,
  OperationsScenarioId,
  OPERATIONS_SCENARIOS,
} from '@/lib/operations';
import styles from './page.module.css';

interface OperationsBrief {
  summary: string;
  actions: string[];
  confidence: number;
  source: string;
}

const formatter = new Intl.NumberFormat('en-US');

function riskLabel(risk: number) {
  if (risk >= 86) return 'Critical';
  if (risk >= 72) return 'High';
  if (risk >= 54) return 'Watch';
  return 'Clear';
}

export default function HomePage() {
  const { crowdData, gameState } = useAppContext();
  const [scenarioId, setScenarioId] = useState<OperationsScenarioId>('halftime');
  const [selectedSectorId, setSelectedSectorId] = useState('food');
  const [incidents, setIncidents] = useState<OperationsIncident[]>(INITIAL_OPERATIONS_INCIDENTS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [approvedActions, setApprovedActions] = useState<number[]>([]);

  const scenario = OPERATIONS_SCENARIOS.find(item => item.id === scenarioId) ?? OPERATIONS_SCENARIOS[0];
  const sectors = useMemo(() => buildSectorSnapshots(crowdData, scenarioId), [crowdData, scenarioId]);
  const selectedSector = sectors.find(sector => sector.id === selectedSectorId) ?? sectors[0];
  const metrics = useMemo(() => calculateReadiness(sectors, incidents, scenario), [sectors, incidents, scenario]);
  const fallbackBrief = useMemo(
    () => buildFallbackOperationsBrief(sectors, scenario, incidents),
    [sectors, scenario, incidents],
  );
  const [generatedBrief, setGeneratedBrief] = useState<OperationsBrief | null>(null);
  const brief = generatedBrief ?? fallbackBrief;

  async function generateBrief() {
    setIsGenerating(true);
    setApprovedActions([]);

    try {
      const response = await fetch('/api/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Assess ${scenario.label} and recommend the safest next three interventions.`,
          scenarioId,
          sectors,
          incidents,
        }),
      });

      if (!response.ok) throw new Error('Unable to generate operations brief.');
      setGeneratedBrief(await response.json());
    } catch {
      setGeneratedBrief(fallbackBrief);
    } finally {
      setIsGenerating(false);
    }
  }

  function dispatchIncident(id: string) {
    setIncidents(current => current.map(incident => (
      incident.id === id
        ? { ...incident, status: 'dispatched', owner: incident.owner === 'Unassigned' ? 'Response unit 4' : incident.owner }
        : incident
    )));
  }

  return (
    <div className={styles.commandPage}>
      <div className={styles.ambientOne} />
      <div className={styles.ambientTwo} />

      <section className={styles.commandShell} aria-label="StadiumIQ tournament command center">
        <header className={styles.commandHeader}>
          <div className={styles.identity}>
            <div className={styles.eyebrow}>
              <span className={styles.livePulse} />
              Matchday operations · NYNJ venue 01
            </div>
            <div className={styles.titleRow}>
              <h1>StadiumIQ <span>NEXUS</span></h1>
              <span className={styles.version}>C4 / 2026</span>
            </div>
            <p>One shared intelligence layer for every fan, gate, crew, and decision.</p>
          </div>

          <div className={styles.headerActions}>
            <div className={styles.syncBadge} title="Live simulation updates every five seconds">
              <Wifi size={15} aria-hidden="true" />
              <span>Digital twin synced</span>
              <strong>5s</strong>
            </div>
            <Link href="/map" className={styles.fanViewButton}>
              Fan experience
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </header>

        <div className={styles.scenarioBar}>
          <div className={styles.scenarioLabel}>
            <Zap size={15} aria-hidden="true" />
            Live scenario
          </div>
          <div className={styles.scenarioControls} role="group" aria-label="Operations scenario">
            {OPERATIONS_SCENARIOS.map(item => (
              <button
                key={item.id}
                type="button"
                className={`${styles.scenarioButton} ${scenarioId === item.id ? styles.scenarioActive : ''}`}
                onClick={() => {
                  setScenarioId(item.id);
                  setGeneratedBrief(null);
                  setApprovedActions([]);
                }}
                aria-pressed={scenarioId === item.id}
              >
                {item.shortLabel}
              </button>
            ))}
          </div>
          <div className={`${styles.scenarioSignal} ${styles[scenario.accent]}`}>
            {scenario.id === 'weather' ? <CloudLightning size={16} /> : <Radio size={16} />}
            <span>{scenario.note}</span>
          </div>
        </div>

        <section className={styles.kpiGrid} aria-label="Live tournament KPIs">
          <article className={styles.kpiCard}>
            <div className={styles.kpiIcon}><Gauge size={18} /></div>
            <div><span>Venue readiness</span><strong>{metrics.readiness}%</strong></div>
            <small className={metrics.readiness > 75 ? styles.good : styles.warn}>+3.2% vs plan</small>
          </article>
          <article className={styles.kpiCard}>
            <div className={styles.kpiIcon}><Users size={18} /></div>
            <div><span>Fans on site</span><strong>{formatter.format(metrics.attendance)}</strong></div>
            <small>{Math.round(metrics.attendance / 825)} arrivals/min</small>
          </article>
          <article className={styles.kpiCard}>
            <div className={styles.kpiIcon}><CircleAlert size={18} /></div>
            <div><span>Open incidents</span><strong>{incidents.filter(item => item.status === 'open').length}</strong></div>
            <small className={styles.warn}>{metrics.criticalSectors} critical sector{metrics.criticalSectors === 1 ? '' : 's'}</small>
          </article>
          <article className={styles.kpiCard}>
            <div className={styles.kpiIcon}><UserRoundCheck size={18} /></div>
            <div><span>Access SLA</span><strong>{metrics.accessibilitySla}%</strong></div>
            <small>Step-free routes online</small>
          </article>
          <article className={styles.kpiCard}>
            <div className={styles.kpiIcon}><TrainFront size={18} /></div>
            <div><span>Transit load</span><strong>{metrics.transitLoad}%</strong></div>
            <small>Rail + shuttle network</small>
          </article>
        </section>

        <div className={styles.workspaceGrid}>
          <section className={styles.digitalTwinPanel} aria-label="Live venue digital twin">
            <div className={styles.panelHeader}>
              <div>
                <span className={styles.panelKicker}><Activity size={14} /> Live spatial intelligence</span>
                <h2>Venue digital twin</h2>
              </div>
              <div className={styles.legend} aria-label="Risk legend">
                <span><i className={styles.clearDot} />Clear</span>
                <span><i className={styles.watchDot} />Watch</span>
                <span><i className={styles.criticalDot} />Critical</span>
              </div>
            </div>

            <div className={styles.twinCanvas}>
              <div className={styles.mapCoordinates}>40.8135°N · 74.0745°W</div>
              <div className={styles.sensorCount}><Waves size={13} /> 184 sensor streams</div>

              <svg className={styles.stadiumSvg} viewBox="0 0 600 420" role="img" aria-label="Interactive stadium risk map">
                <defs>
                  <linearGradient id="bowl" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="rgba(42, 255, 167, 0.13)" />
                    <stop offset="1" stopColor="rgba(31, 188, 255, 0.03)" />
                  </linearGradient>
                  <filter id="glow"><feGaussianBlur stdDeviation="5" result="blur" /></filter>
                </defs>
                <ellipse cx="300" cy="210" rx="236" ry="158" fill="url(#bowl)" stroke="rgba(145, 194, 181, .18)" strokeWidth="26" />
                <ellipse cx="300" cy="210" rx="190" ry="116" fill="rgba(3, 11, 14, .92)" stroke="rgba(145, 194, 181, .12)" strokeWidth="2" strokeDasharray="5 8" />
                <rect x="210" y="137" width="180" height="146" rx="5" fill="rgba(40, 184, 118, .12)" stroke="rgba(53, 231, 151, .36)" />
                <path d="M300 137v146M210 210h180" stroke="rgba(53, 231, 151, .23)" />
                <circle cx="300" cy="210" r="28" fill="none" stroke="rgba(53, 231, 151, .23)" />
                <path d="M184 94 Q300 18 416 94" fill="none" stroke="rgba(31,188,255,.32)" strokeWidth="2" strokeDasharray="3 7" />
                <path d="M184 326 Q300 402 416 326" fill="none" stroke="rgba(246,167,42,.25)" strokeWidth="2" strokeDasharray="3 7" />
                <path d="M68 210H24M576 210H532" stroke="rgba(145,194,181,.25)" strokeDasharray="4 5" />
              </svg>

              {sectors.map(sector => (
                <button
                  key={sector.id}
                  type="button"
                  className={`${styles.sectorNode} ${styles[sector.status]} ${selectedSector.id === sector.id ? styles.sectorSelected : ''}`}
                  style={{ left: `${sector.x}%`, top: `${sector.y}%` }}
                  onClick={() => setSelectedSectorId(sector.id)}
                  aria-label={`${sector.name}, risk ${sector.risk}`}
                  aria-pressed={selectedSector.id === sector.id}
                >
                  <span className={styles.nodePing} />
                  <span className={styles.nodeCode}>{sector.code}</span>
                  <strong>{sector.risk}</strong>
                </button>
              ))}

              <div className={styles.selectedInspector}>
                <div className={styles.inspectorTop}>
                  <div>
                    <span>{selectedSector.code} · {selectedSector.gate}</span>
                    <h3>{selectedSector.name}</h3>
                  </div>
                  <span className={`${styles.riskPill} ${styles[selectedSector.status]}`}>
                    {riskLabel(selectedSector.risk)} {selectedSector.risk}
                  </span>
                </div>
                <div className={styles.inspectorMetrics}>
                  <div><span>Now</span><strong>{Math.round(selectedSector.density * 100)}%</strong></div>
                  <div><span>+15 min</span><strong>{Math.round(selectedSector.predictedDensity * 100)}%</strong></div>
                  <div><span>Trend</span><strong>{selectedSector.trend === 'increasing' ? '↑' : selectedSector.trend === 'decreasing' ? '↓' : '→'}</strong></div>
                </div>
                <p>{selectedSector.recommendation}</p>
                <Link href="/navigate">Open route layer <ChevronRight size={14} /></Link>
              </div>
            </div>
          </section>

          <aside className={styles.copilotPanel} aria-label="AI operations copilot">
            <div className={styles.copilotHeader}>
              <div className={styles.botMark}><Bot size={20} /></div>
              <div><span>Gemini operations copilot</span><h2>Mission brief</h2></div>
              <div className={styles.confidence}>{brief.confidence}%<span>confidence</span></div>
            </div>

            <div className={styles.aiSummary}>
              <Sparkles size={16} aria-hidden="true" />
              <p>{brief.summary}</p>
            </div>

            <div className={styles.actionList}>
              {brief.actions.map((action, index) => {
                const approved = approvedActions.includes(index);
                return (
                  <article key={`${action}-${index}`} className={approved ? styles.actionApproved : ''}>
                    <span className={styles.actionNumber}>0{index + 1}</span>
                    <p>{action}</p>
                    <button
                      type="button"
                      onClick={() => setApprovedActions(current => approved ? current.filter(item => item !== index) : [...current, index])}
                      aria-label={approved ? 'Remove action approval' : 'Approve recommended action'}
                    >
                      {approved ? <Check size={15} /> : <ChevronRight size={15} />}
                    </button>
                  </article>
                );
              })}
            </div>

            <button type="button" className={styles.generateButton} onClick={generateBrief} disabled={isGenerating}>
              {isGenerating ? <RefreshCw className={styles.spin} size={16} /> : <Sparkles size={16} />}
              {isGenerating ? 'Analyzing live context…' : 'Generate fresh AI brief'}
            </button>
            <p className={styles.aiDisclosure}>
              {brief.source === 'gemini-2.5-flash' ? 'Generated with Gemini 2.5 Flash' : 'Demo-safe local intelligence'} · Human approval required
            </p>
          </aside>
        </div>

        <div className={styles.lowerGrid}>
          <section className={styles.incidentPanel}>
            <div className={styles.panelHeaderCompact}>
              <div><span>Live response</span><h2>Incident queue</h2></div>
              <strong>{incidents.filter(item => item.status === 'open').length} need action</strong>
            </div>
            <div className={styles.incidentList}>
              {incidents.map(incident => (
                <article key={incident.id}>
                  <span className={`${styles.incidentDot} ${styles[incident.priority]}`} />
                  <div className={styles.incidentCopy}>
                    <span>{incident.id} · {incident.ageMinutes}m ago</span>
                    <strong>{incident.title}</strong>
                    <small>{incident.owner}</small>
                  </div>
                  <button type="button" onClick={() => dispatchIncident(incident.id)} disabled={incident.status === 'dispatched'}>
                    {incident.status === 'dispatched' ? <><Check size={13} /> Dispatched</> : 'Assign'}
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.flowPanel}>
            <div className={styles.panelHeaderCompact}>
              <div><span>Predictive demand</span><h2>Next 30 minutes</h2></div>
              <Route size={18} />
            </div>
            <div className={styles.forecastChart} aria-label="Thirty minute demand forecast">
              {[44, 51, 55, 64, 74, 92, 86, 78, 69, 58, 51, 46].map((height, index) => (
                <span key={index} style={{ height: `${height}%` }} className={height > 85 ? styles.forecastPeak : ''} />
              ))}
              <i className={styles.nowMarker}>NOW</i>
            </div>
            <div className={styles.forecastNotes}>
              <span>+8m concourse rise</span><strong>+16m projected peak</strong><span>+29m recovery</span>
            </div>
          </section>

          <section className={styles.impactPanel}>
            <div className={styles.panelHeaderCompact}>
              <div><span>Whole-venue outcomes</span><h2>Inclusive & sustainable</h2></div>
              <Leaf size={18} />
            </div>
            <div className={styles.impactRows}>
              <div><span className={styles.impactIcon}><Headphones size={15} /></span><p><strong>14 languages</strong><small>Live guidance ready</small></p><Languages size={16} /></div>
              <div><span className={styles.impactIcon}><Navigation size={15} /></span><p><strong>4 step-free paths</strong><small>All verified 2m ago</small></p><ShieldCheck size={16} /></div>
              <div><span className={styles.impactIcon}><Leaf size={15} /></span><p><strong>{formatter.format(metrics.carbonSavedKg)} kg CO₂e</strong><small>Saved through transit nudges</small></p><ArrowUpRight size={16} /></div>
            </div>
          </section>
        </div>

        <footer className={styles.commandFooter}>
          <span><span className={styles.livePulse} /> Simulation live · {gameState.homeTeam} {gameState.homeScore}–{gameState.awayScore} {gameState.awayTeam}</span>
          <nav aria-label="Fan experience shortcuts">
            <Link href="/chat">Multilingual AI</Link>
            <Link href="/queues">Queue intelligence</Link>
            <Link href="/navigate">Accessible routing</Link>
          </nav>
          <span><MapPin size={13} /> World Cup 2026 readiness prototype</span>
        </footer>
      </section>
    </div>
  );
}
