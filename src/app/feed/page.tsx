'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAppContext } from '@/components/AppProvider';
import { triviaQuestions } from '@/lib/venue-data';
import { timeAgo } from '@/utils/helpers';
import { EventFeedItem } from '@/types';
import styles from './page.module.css';

type FeedTab = 'all' | 'score' | 'announcement' | 'alert' | 'trivia' | 'promo';

const TABS: { value: FeedTab; label: string; icon: string }[] = [
  { value: 'all', label: 'All', icon: '📋' },
  { value: 'score', label: 'Scores', icon: '⚽' },
  { value: 'announcement', label: 'Announcements', icon: '📢' },
  { value: 'alert', label: 'Alerts', icon: '⚠️' },
  { value: 'trivia', label: 'Trivia', icon: '🧠' },
  { value: 'promo', label: 'Promos', icon: '🎉' },
];

export default function FeedPage() {
  const { feedItems, gameState } = useAppContext();
  const [activeTab, setActiveTab] = useState<FeedTab>('all');
  const [points, setPoints] = useState(120);
  const [currentTrivia, setCurrentTrivia] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [triviaRevealed, setTriviaRevealed] = useState(false);

  const filteredItems = useMemo(() => {
    if (activeTab === 'all') return feedItems;
    return feedItems.filter(item => item.type === activeTab);
  }, [feedItems, activeTab]);

  const handleTriviaAnswer = (index: number) => {
    if (triviaRevealed) return;
    setSelectedAnswer(index);
    setTriviaRevealed(true);

    const question = triviaQuestions[currentTrivia];
    if (index === question.correctIndex) {
      setPoints(prev => prev + question.points);
    }
  };

  const nextTrivia = () => {
    if (currentTrivia < triviaQuestions.length - 1) {
      setCurrentTrivia(prev => prev + 1);
      setSelectedAnswer(null);
      setTriviaRevealed(false);
    }
  };

  const currentQuestion = triviaQuestions[currentTrivia];

  return (
    <div className={styles.feedPage}>
      <h1 className={styles.title}>📢 Live Event Feed</h1>

      {/* Points */}
      <div className={styles.points}>
        <span className={styles.pointsIcon}>🏆</span>
        <div>
          <div className={styles.pointsValue}>{points} pts</div>
          <div className={styles.pointsLabel}>Fan Score</div>
        </div>
      </div>

      {/* Live Score Banner */}
      <div className={styles.scoreBanner}>
        <div className={styles.scoreTeams}>
          <div className={styles.team}>
            <div className={styles.teamName}>{gameState.homeTeam}</div>
            <div className={styles.teamScore}>{gameState.homeScore}</div>
          </div>
          <div className={styles.scoreVs}>vs</div>
          <div className={styles.team}>
            <div className={styles.teamName}>{gameState.awayTeam}</div>
            <div className={styles.teamScore}>{gameState.awayScore}</div>
          </div>
        </div>
        <div className={styles.scoreMeta}>
          <span className="badge badge-live">
            <span className="status-dot live" style={{ marginRight: 4 }} /> LIVE
          </span>
          <span>{gameState.period} · {gameState.timeRemaining}</span>
          <span>{gameState.sport}</span>
        </div>
      </div>

      {/* Trivia */}
      <div className={styles.triviaCard} id="trivia">
        <div className={styles.triviaTitle}>
          🧠 Fan Trivia — Earn Points!
        </div>
        <div className={styles.triviaQuestion}>{currentQuestion.question}</div>
        <div className={styles.triviaOptions}>
          {currentQuestion.options.map((option, i) => {
            let className = styles.triviaOption;
            if (triviaRevealed) {
              if (i === currentQuestion.correctIndex) className += ` ${styles.correct}`;
              else if (i === selectedAnswer) className += ` ${styles.wrong}`;
            } else if (i === selectedAnswer) {
              className += ` ${styles.selected}`;
            }
            return (
              <button
                key={i}
                className={className}
                onClick={() => handleTriviaAnswer(i)}
                disabled={triviaRevealed}
              >
                {String.fromCharCode(65 + i)}. {option}
              </button>
            );
          })}
        </div>
        {triviaRevealed && (
          <div className={`${styles.triviaResult} ${selectedAnswer === currentQuestion.correctIndex ? styles.correct : styles.wrong}`}>
            {selectedAnswer === currentQuestion.correctIndex
              ? `🎉 Correct! +${currentQuestion.points} points`
              : `❌ Wrong! The answer was: ${currentQuestion.options[currentQuestion.correctIndex]}`
            }
            {currentTrivia < triviaQuestions.length - 1 && (
              <button
                className="btn btn-sm btn-primary"
                style={{ marginLeft: '12px' }}
                onClick={nextTrivia}
              >
                Next Question →
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className={styles.tabs} role="tablist">
        {TABS.map(tab => (
          <button
            key={tab.value}
            className={`${styles.tab} ${activeTab === tab.value ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.value)}
            role="tab"
            aria-selected={activeTab === tab.value}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Feed Items */}
      <div className={styles.feedList} role="feed" aria-label="Event feed">
        {filteredItems.map((item, i) => (
          <article
            key={item.id}
            className={`${styles.feedItem} ${item.priority === 'high' || item.priority === 'critical' ? styles[item.priority] : item.priority === 'medium' ? styles.medium : ''}`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className={styles.feedItemHeader}>
              <span className={styles.feedItemIcon}>{item.icon}</span>
              <span className={styles.feedItemTitle}>{item.title}</span>
              <span className={styles.feedItemTime}>{timeAgo(item.timestamp)}</span>
            </div>
            <p className={styles.feedItemMessage}>{item.message}</p>
            {item.actionLabel && item.actionUrl && (
              <Link href={item.actionUrl} className={styles.feedItemAction}>
                {item.actionLabel} →
              </Link>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
