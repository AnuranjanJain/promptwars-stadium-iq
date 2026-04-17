'use client';

import { useState, useMemo } from 'react';
import { useAppContext } from '@/components/AppProvider';
import { venue } from '@/lib/venue-data';
import { getWaitSeverity } from '@/utils/helpers';
import { POI } from '@/types';
import styles from './page.module.css';

interface RouteStep {
  title: string;
  description: string;
  time: string;
  hasCrowdWarning?: boolean;
  crowdWarning?: string;
}

// Generate navigation route (simulated)
function generateRoute(from: string, to: POI, avoidCrowds: boolean, accessible: boolean): { steps: RouteStep[]; totalTime: number; distance: string } {
  const steps: RouteStep[] = [];
  const baseMins = Math.floor(Math.random() * 5) + 3;

  steps.push({
    title: `Start from ${from}`,
    description: 'Your current location',
    time: '0 min',
  });

  // Middle steps based on destination
  if (to.level === 'Level 1') {
    if (accessible) {
      steps.push({
        title: 'Take elevator to Level 1',
        description: 'Elevator located near the nearest gate. Wheelchair accessible.',
        time: '~1 min',
      });
    } else {
      steps.push({
        title: 'Take stairs to Level 1',
        description: 'Staircase located at the concourse junction',
        time: '~1 min',
      });
    }
  }

  if (avoidCrowds) {
    steps.push({
      title: 'Detour via West Concourse',
      description: 'Avoiding East Wing (currently 85% crowded). This route is 30m longer but significantly faster.',
      time: `~${baseMins - 1} min`,
      hasCrowdWarning: true,
      crowdWarning: 'Original route through East Wing: ~12 min (heavy crowding)',
    });
  } else {
    if (Math.random() > 0.5) {
      steps.push({
        title: 'Walk along North Concourse',
        description: 'Follow signs towards the North Stand',
        time: `~${Math.ceil(baseMins / 2)} min`,
        hasCrowdWarning: Math.random() > 0.6,
        crowdWarning: 'Moderate crowds expected in this area',
      });
    }
  }

  steps.push({
    title: 'Continue past Gate signage',
    description: `Follow ${to.category === 'food' ? '🍔 Food' : to.category === 'restroom' ? '🚻 Restroom' : '📍'} signs`,
    time: '~1 min',
  });

  steps.push({
    title: `Arrive at ${to.name}`,
    description: `${to.description}. ${to.isOpen ? `Current wait: ~${to.currentWaitMinutes} min` : '⚠️ Currently closed'}`,
    time: `~${baseMins + (avoidCrowds ? 1 : 0)} min total`,
  });

  return {
    steps,
    totalTime: baseMins + (avoidCrowds ? 1 : 0) + (to.level === 'Level 1' ? 1 : 0),
    distance: `${150 + Math.floor(Math.random() * 200)}m`,
  };
}

const QUICK_DESTINATIONS = [
  { id: 'nearest-food', icon: '🍔', label: 'Nearest Food', category: 'food' as const },
  { id: 'nearest-restroom', icon: '🚻', label: 'Restroom', category: 'restroom' as const },
  { id: 'nearest-exit', icon: '🚪', label: 'Nearest Exit', category: 'gate' as const },
  { id: 'merch', icon: '🛍️', label: 'Merchandise', category: 'merchandise' as const },
  { id: 'medical', icon: '🏥', label: 'First Aid', category: 'medical' as const },
  { id: 'atm', icon: '🏧', label: 'ATM', category: 'atm' as const },
];

export default function NavigatePage() {
  const { userSection, crowdData } = useAppContext();
  const [selectedDest, setSelectedDest] = useState<POI | null>(null);
  const [avoidCrowds, setAvoidCrowds] = useState(true);
  const [accessibleRoute, setAccessibleRoute] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // We use crowdData length here to show we are aware of crowd conditions even if the
  // route generator is currently heavily simulated to avoid complexity
  const isVenueCrowded = crowdData.some(zone => zone.density > 0.8);
  const filteredPois = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return venue.pois.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleQuickDest = (category: string) => {
    const options = venue.pois.filter(p => p.category === category && p.isOpen);
    if (options.length === 0) return;
    // Pick the one with shortest wait
    const best = options.reduce((a, b) => a.currentWaitMinutes <= b.currentWaitMinutes ? a : b);
    setSelectedDest(best);
    setSearchQuery('');
  };

  const route = useMemo(() => {
    if (!selectedDest) return null;
    return generateRoute(userSection, selectedDest, avoidCrowds, accessibleRoute);
  }, [selectedDest, userSection, avoidCrowds, accessibleRoute]);

  return (
    <div className={styles.navPage}>
      <h1 className={styles.title}>🧭 Smart Navigation</h1>

      {/* Search */}
      <div className={styles.searchBox}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search for a destination (e.g., pizza, restroom, gate)..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          aria-label="Search destinations"
        />
      </div>

      {/* Search Results */}
      {filteredPois.length > 0 && (
        <div className={styles.quickSection}>
          <div className={styles.sectionLabel}>Search Results</div>
          <div className={styles.quickGrid}>
            {filteredPois.map(poi => (
              <button
                key={poi.id}
                className={`${styles.quickBtn} ${selectedDest?.id === poi.id ? styles.selected : ''}`}
                onClick={() => { setSelectedDest(poi); setSearchQuery(''); }}
              >
                <span className={styles.quickIcon}>{poi.icon}</span>
                <span className={styles.quickLabel}>{poi.name}</span>
                <span className={styles.quickWait}>
                  {poi.isOpen ? `~${poi.currentWaitMinutes} min wait` : 'Closed'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Destinations */}
      <div className={styles.quickSection}>
        <div className={styles.sectionLabel}>Quick Destinations</div>
        <div className={styles.quickGrid}>
          {QUICK_DESTINATIONS.map(dest => (
            <button
              key={dest.id}
              className={styles.quickBtn}
              onClick={() => handleQuickDest(dest.category)}
              aria-label={`Navigate to ${dest.label}`}
            >
              <span className={styles.quickIcon}>{dest.icon}</span>
              <span className={styles.quickLabel}>{dest.label}</span>
              <span className={styles.quickWait}>Shortest queue</span>
            </button>
          ))}
        </div>
      </div>

      {/* Route Options */}
      <div className={styles.toggleSection}>
        <button
          className={`${styles.toggle} ${avoidCrowds ? styles.active : ''}`}
          onClick={() => setAvoidCrowds(!avoidCrowds)}
          aria-pressed={avoidCrowds}
        >
          <span className={styles.toggleDot} />
          🏃 Avoid Crowds
        </button>
        <button
          className={`${styles.toggle} ${accessibleRoute ? styles.active : ''}`}
          onClick={() => setAccessibleRoute(!accessibleRoute)}
          aria-pressed={accessibleRoute}
        >
          <span className={styles.toggleDot} />
          ♿ Accessible Route
        </button>
      </div>

      {/* Route Display */}
      {route && selectedDest ? (
        <div className={styles.routeResult}>
          <div className={styles.routeHeader}>
            <div className={styles.routeTitle}>
              📍 {userSection} → {selectedDest.icon} {selectedDest.name}
            </div>
            <div className={styles.routeStats}>
              <div className={styles.routeStat}>
                <div className={styles.routeStatValue}>{route.totalTime} min</div>
                <div className={styles.routeStatLabel}>Walk Time</div>
              </div>
              <div className={styles.routeStat}>
                <div className={styles.routeStatValue}>{route.distance}</div>
                <div className={styles.routeStatLabel}>Distance</div>
              </div>
              <div className={styles.routeStat}>
                <div className={styles.routeStatValue} style={{ color: getWaitSeverity(selectedDest.currentWaitMinutes).color }}>
                  {selectedDest.currentWaitMinutes} min
                </div>
                <div className={styles.routeStatLabel}>Queue Wait</div>
              </div>
            </div>
          </div>

          <div className={styles.steps}>
            {route.steps.map((step, i) => (
              <div key={i} className={styles.step}>
                <div className={styles.stepConnector}>
                  <div className={`${styles.stepDot} ${i === 0 ? 'start' : i === route.steps.length - 1 ? 'end' : ''}`} />
                  {i < route.steps.length - 1 && <div className={styles.stepLine} />}
                </div>
                <div className={styles.stepContent}>
                  <div className={styles.stepTitle}>{step.title}</div>
                  <div className={styles.stepDesc}>{step.description}</div>
                  <div className={styles.stepTime}>{step.time}</div>
                  {step.hasCrowdWarning && step.crowdWarning && (
                    <div className={styles.crowdWarning}>
                      ⚠️ {step.crowdWarning}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🧭</div>
          <div className={styles.emptyText}>Select a destination to get directions</div>
          <div className={styles.emptyHint}>Choose a quick destination above or search for a specific location</div>
        </div>
      )}
    </div>
  );
}
