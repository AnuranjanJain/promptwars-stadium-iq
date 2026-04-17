'use client';

import { useState, useMemo } from 'react';
import { useAppContext } from '@/components/AppProvider';
import { venue } from '@/lib/venue-data';
import { getDensityLevel, getWaitSeverity } from '@/utils/helpers';
import { POI, POICategory } from '@/types';
import styles from './page.module.css';

type FilterType = 'all' | POICategory;

const FILTERS: { value: FilterType; label: string; icon: string }[] = [
  { value: 'all', label: 'All', icon: '📍' },
  { value: 'food', label: 'Food', icon: '🍔' },
  { value: 'restroom', label: 'Restrooms', icon: '🚻' },
  { value: 'merchandise', label: 'Merch', icon: '🛍️' },
  { value: 'gate', label: 'Gates', icon: '🚪' },
  { value: 'medical', label: 'Medical', icon: '🏥' },
  { value: 'parking', label: 'Parking', icon: '🅿️' },
];

// Map crowd zones to visual positions on our fallback venue grid
const ZONE_POSITIONS: Record<string, { top: string; left: string; width: string; height: string }> = {
  'zone-north': { top: '2%', left: '25%', width: '50%', height: '14%' },
  'zone-south': { top: '84%', left: '25%', width: '50%', height: '14%' },
  'zone-east': { top: '25%', left: '80%', width: '18%', height: '50%' },
  'zone-west': { top: '25%', left: '2%', width: '18%', height: '50%' },
  'zone-food-court': { top: '6%', left: '65%', width: '20%', height: '16%' },
  'zone-main-entrance': { top: '0%', left: '35%', width: '30%', height: '6%' },
  'zone-vip': { top: '30%', left: '78%', width: '20%', height: '20%' },
  'zone-merch': { top: '6%', left: '5%', width: '18%', height: '16%' },
};

// Map POIs to visual positions
function getPoiPosition(poi: POI): { top: string; left: string } {
  const positions: Record<string, { top: string; left: string }> = {
    'food-1': { top: '10%', left: '30%' },
    'food-2': { top: '88%', left: '60%' },
    'food-3': { top: '15%', left: '75%' },
    'food-4': { top: '60%', left: '8%' },
    'food-5': { top: '80%', left: '35%' },
    'restroom-1': { top: '8%', left: '42%' },
    'restroom-2': { top: '90%', left: '48%' },
    'restroom-3': { top: '45%', left: '90%' },
    'restroom-4': { top: '45%', left: '5%' },
    'merch-1': { top: '12%', left: '12%' },
    'merch-2': { top: '82%', left: '72%' },
    'gate-north': { top: '1%', left: '50%' },
    'gate-south': { top: '97%', left: '50%' },
    'gate-east': { top: '50%', left: '97%' },
    'gate-west': { top: '50%', left: '1%' },
    'medical-1': { top: '5%', left: '58%' },
    'medical-2': { top: '92%', left: '38%' },
    'info-1': { top: '15%', left: '50%' },
    'atm-1': { top: '10%', left: '38%' },
    'parking-1': { top: '-3%', left: '50%' },
    'parking-2': { top: '103%', left: '50%' },
  };
  return positions[poi.id] || { top: '50%', left: '50%' };
}

export default function MapPage() {
  const { crowdData } = useAppContext();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);

  const filteredPois = useMemo(() => {
    if (activeFilter === 'all') return venue.pois;
    return venue.pois.filter(p => p.category === activeFilter);
  }, [activeFilter]);

  return (
    <div className={styles.mapPage}>
      {/* Header */}
      <div className={styles.mapHeader}>
        <h1 className={styles.mapTitle}>
          🗺️ Live Venue Map
        </h1>
        <div className={styles.filters}>
          {FILTERS.map(f => (
            <button
              key={f.value}
              className={`${styles.filterBtn} ${activeFilter === f.value ? styles.filterBtnActive : ''}`}
              onClick={() => setActiveFilter(f.value)}
              aria-pressed={activeFilter === f.value}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className={styles.mapContainer}>
        <div className={styles.mapFallback}>
          <div className={styles.venueGrid}>
            {/* Playing Field */}
            <div className={styles.fieldCenter}>
              <div className={styles.centerCircle} />
              ⚽ Playing Field
            </div>

            {/* Crowd Density Zones */}
            {crowdData.map(zone => {
              const pos = ZONE_POSITIONS[zone.zoneId];
              if (!pos) return null;
              const level = getDensityLevel(zone.density);
              return (
                <div
                  key={zone.zoneId}
                  className={styles.zoneOverlay}
                  style={{
                    ...pos,
                    background: `${level.color}22`,
                    borderColor: `${level.color}44`,
                  }}
                  title={`${zone.zoneName}: ${Math.round(zone.density * 100)}% - ${level.label}`}
                >
                  <span className={styles.zoneDensity}>{Math.round(zone.density * 100)}%</span>
                  <span className={styles.zoneName}>{zone.zoneName}</span>
                </div>
              );
            })}

            {/* POI Markers */}
            {filteredPois.map(poi => {
              const pos = getPoiPosition(poi);
              return (
                <div
                  key={poi.id}
                  className={styles.poiMarker}
                  style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -50%)' }}
                  onClick={() => setSelectedPoi(poi)}
                  title={`${poi.name} — ${poi.isOpen ? `${poi.currentWaitMinutes} min wait` : 'Closed'}`}
                  role="button"
                  aria-label={`${poi.name}: ${poi.isOpen ? `${poi.currentWaitMinutes} minute wait` : 'Closed'}`}
                  tabIndex={0}
                >
                  {poi.icon}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className={styles.legend}>
          <div className={styles.legendTitle}>Crowd Density</div>
          <div className={styles.legendItems}>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#22c55e' }} /> Low (&lt;30%)
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#f59e0b' }} /> Moderate (30-60%)
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#f97316' }} /> Busy (60-80%)
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#ef4444' }} /> Crowded (&gt;80%)
            </div>
          </div>
        </div>

        {/* POI Detail Panel */}
        {selectedPoi && (
          <div className={styles.poiPanel} role="dialog" aria-label={`Details for ${selectedPoi.name}`}>
            <div className={styles.poiPanelHeader}>
              <div className={styles.poiPanelTitle}>
                {selectedPoi.icon} {selectedPoi.name}
              </div>
              <button
                className={styles.poiPanelClose}
                onClick={() => setSelectedPoi(null)}
                aria-label="Close panel"
              >
                ✕
              </button>
            </div>
            <div className={styles.poiPanelInfo}>
              <div className={styles.poiInfoRow}>
                <span className={styles.poiInfoLabel}>Status</span>
                <span className={`badge ${selectedPoi.isOpen ? 'badge-success' : 'badge-danger'}`}>
                  {selectedPoi.isOpen ? 'Open' : 'Closed'}
                </span>
              </div>
              {selectedPoi.isOpen && (
                <>
                  <div className={styles.poiInfoRow}>
                    <span className={styles.poiInfoLabel}>Wait Time</span>
                    <span className={styles.poiInfoValue} style={{ color: getWaitSeverity(selectedPoi.currentWaitMinutes).color }}>
                      ~{selectedPoi.currentWaitMinutes} min
                    </span>
                  </div>
                  <div className={styles.poiInfoRow}>
                    <span className={styles.poiInfoLabel}>Occupancy</span>
                    <span className={styles.poiInfoValue}>
                      {Math.round(selectedPoi.currentLoad * 100)}%
                    </span>
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${selectedPoi.currentLoad * 100}%`,
                          background: getDensityLevel(selectedPoi.currentLoad).color,
                        }}
                      />
                    </div>
                  </div>
                </>
              )}
              <div className={styles.poiInfoRow}>
                <span className={styles.poiInfoLabel}>Level</span>
                <span className={styles.poiInfoValue}>{selectedPoi.level}</span>
              </div>
              <div className={styles.poiInfoRow}>
                <span className={styles.poiInfoLabel}>Accessible</span>
                <span className={styles.poiInfoValue}>{selectedPoi.accessibleRoute ? '♿ Yes' : 'No'}</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                {selectedPoi.description}
              </p>
            </div>

            {/* Menu items for food POIs */}
            {selectedPoi.menuItems && selectedPoi.menuItems.length > 0 && (
              <>
                <div className={styles.poiMenuTitle}>Menu</div>
                {selectedPoi.menuItems.map(item => (
                  <div key={item.name} className={styles.menuItem}>
                    <span className={styles.menuItemName}>
                      <span
                        className={styles.vegDot}
                        style={{
                          background: item.isVeg ? '#22c55e' : '#ef4444',
                          borderColor: item.isVeg ? '#22c55e' : '#ef4444',
                        }}
                      />
                      {item.name}
                      {item.isPopular && <span className={styles.popularTag}>🔥 Popular</span>}
                    </span>
                    <span style={{ fontWeight: 600 }}>₹{item.price}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
