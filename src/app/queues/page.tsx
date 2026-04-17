'use client';

import { useState, useMemo } from 'react';
import { useAppContext } from '@/components/AppProvider';
import { getWaitSeverity, getCategoryLabel } from '@/utils/helpers';
import { QueueInfo, POICategory } from '@/types';
import styles from './page.module.css';

type SortType = 'wait' | 'name' | 'trend';

export default function QueuesPage() {
  const { queueData, gameState } = useAppContext();
  const [sortBy, setSortBy] = useState<SortType>('wait');

  const sortedQueues = useMemo(() => {
    const sorted = [...queueData];
    switch (sortBy) {
      case 'wait':
        return sorted.sort((a, b) => a.currentWaitMinutes - b.currentWaitMinutes);
      case 'name':
        return sorted.sort((a, b) => a.poiName.localeCompare(b.poiName));
      case 'trend':
        const order = { increasing: 2, stable: 1, decreasing: 0 };
        return sorted.sort((a, b) => order[b.trend] - order[a.trend]);
      default:
        return sorted;
    }
  }, [queueData, sortBy]);

  const groupedQueues = useMemo(() => {
    const groups: Record<string, QueueInfo[]> = {};
    sortedQueues.forEach(q => {
      if (!groups[q.category]) groups[q.category] = [];
      groups[q.category].push(q);
    });
    return groups;
  }, [sortedQueues]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return '↑';
      case 'decreasing': return '↓';
      default: return '→';
    }
  };

  const getTrendClass = (trend: string) => {
    switch (trend) {
      case 'increasing': return styles.trendUp;
      case 'decreasing': return styles.trendDown;
      default: return styles.trendStable;
    }
  };

  // Check if halftime approaching
  const isHalftimeApproaching = gameState.status === 'live' && parseInt(gameState.timeRemaining) > 35;

  return (
    <div className={styles.queuesPage}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>⏱️ Live Queue Times</h1>
          <div className={styles.sortBtns}>
            <button
              className={`${styles.sortBtn} ${sortBy === 'wait' ? styles.sortBtnActive : ''}`}
              onClick={() => setSortBy('wait')}
            >
              Shortest Wait
            </button>
            <button
              className={`${styles.sortBtn} ${sortBy === 'trend' ? styles.sortBtnActive : ''}`}
              onClick={() => setSortBy('trend')}
            >
              By Trend
            </button>
            <button
              className={`${styles.sortBtn} ${sortBy === 'name' ? styles.sortBtnActive : ''}`}
              onClick={() => setSortBy('name')}
            >
              A-Z
            </button>
          </div>
        </div>
      </div>

      {/* Predictive Alert */}
      {isHalftimeApproaching && (
        <div className={styles.predictionBanner} role="alert">
          <span className={styles.predictionIcon}>🔮</span>
          <div className={styles.predictionText}>
            <div className={styles.predictionTitle}>Halftime Rush Predicted</div>
            <div className={styles.predictionDesc}>
              Wait times at food stalls are expected to increase 2-3x in the next 15 minutes.
              We recommend visiting now for the shortest wait!
            </div>
          </div>
        </div>
      )}

      {/* Queue Cards by Category */}
      {Object.entries(groupedQueues).map(([category, queues]) => (
        <section key={category} className={styles.categorySection}>
          <h2 className={styles.categoryTitle}>
            {getCategoryLabel(category)} ({queues.length})
          </h2>
          <div className={styles.queueGrid}>
            {queues.map((queue, i) => {
              const severity = getWaitSeverity(queue.currentWaitMinutes);
              return (
                <div
                  key={queue.poiId}
                  className={styles.queueCard}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitle}>
                      <span className={styles.cardIcon}>
                        {category === 'food' ? '🍔' : category === 'restroom' ? '🚻' : '🛍️'}
                      </span>
                      <div>
                        <div className={styles.cardName}>{queue.poiName}</div>
                        <div className={styles.cardCategory}>{getCategoryLabel(category)}</div>
                      </div>
                    </div>
                    <span className={`${styles.trendBadge} ${getTrendClass(queue.trend)}`}>
                      {getTrendIcon(queue.trend)} {queue.trend}
                    </span>
                  </div>

                  <div className={styles.waitDisplay}>
                    <span className={styles.waitTime} style={{ color: severity.color }}>
                      {queue.currentWaitMinutes}
                      <span className={styles.waitUnit}>min</span>
                    </span>
                    <div className={styles.waitLabel}>Estimated Wait</div>
                  </div>

                  <div className={styles.statsRow}>
                    <div className={styles.statItem}>
                      <div className={styles.statValue}>{queue.queueLength}</div>
                      <div className={styles.statLabel}>In Queue</div>
                    </div>
                    <div className={styles.statItem}>
                      <div className={styles.statValue}>{queue.estimatedServeTime} min</div>
                      <div className={styles.statLabel}>Avg Serve</div>
                    </div>
                  </div>

                  <div className={`${styles.bestTime} ${queue.currentWaitMinutes <= 8 ? styles.bestTimeGood : ''}`}>
                    {queue.bestTimeToVisit}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
