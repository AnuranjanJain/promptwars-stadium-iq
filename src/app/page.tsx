'use client';

import Link from 'next/link';
import { useAppContext } from '@/components/AppProvider';
import styles from './page.module.css';

const features = [
  {
    icon: '🗺️',
    title: 'Live Crowd Heatmap',
    desc: 'Real-time crowd density visualization across the entire venue. See which areas are packed and which are clear — updated every 5 seconds.',
    href: '/map',
    tag: 'Google Maps',
  },
  {
    icon: '🤖',
    title: 'Stadium Buddy AI',
    desc: 'Your personal AI concierge powered by Gemini. Ask about food, restrooms, directions, or snap a photo and it tells you where you are!',
    href: '/chat',
    tag: 'Gemini AI',
  },
  {
    icon: '⏱️',
    title: 'Smart Queue Estimator',
    desc: 'Real-time wait times for every concession, restroom, and merch shop. Predictive alerts warn you before the rush hits.',
    href: '/queues',
    tag: 'Real-Time',
  },
  {
    icon: '🔮',
    title: 'Predictive Intelligence',
    desc: 'AI predicts crowd surges 15, 30, and 60 minutes ahead. Get proactive notifications: "Halftime in 8 min — grab food NOW!"',
    href: '/queues',
    tag: 'AI-Powered',
  },
  {
    icon: '🧭',
    title: 'Smart Navigation',
    desc: 'Crowd-aware indoor routing to any destination. Finds the fastest path avoiding congested zones. Accessible route options included.',
    href: '/navigate',
    tag: 'Wayfinding',
  },
  {
    icon: '📢',
    title: 'Live Event Feed',
    desc: 'Real-time scores, announcements, fan trivia, and promotions. Stay connected to everything happening at the event.',
    href: '/feed',
    tag: 'Live Updates',
  },
];

const googleServices = [
  { icon: '🧠', name: 'Gemini AI (Text)', desc: 'Smart chatbot & crowd insights' },
  { icon: '👁️', name: 'Gemini AI (Vision)', desc: 'Visual location detection' },
  { icon: '🌐', name: 'Gemini AI (Translation)', desc: 'Multi-language support' },
  { icon: '🗺️', name: 'Google Maps JS API', desc: 'Interactive venue mapping' },
  { icon: '📍', name: 'Geocoding API', desc: 'Address resolution' },
  { icon: '🏪', name: 'Places API', desc: 'Nearby transit & parking' },
  { icon: '🔊', name: 'Cloud Text-to-Speech', desc: 'Accessible audio alerts' },
  { icon: '🔥', name: 'Firebase Firestore', desc: 'Real-time data persistence' },
  { icon: '🔐', name: 'Firebase Auth', desc: 'Anonymous authentication' },
  { icon: '📊', name: 'Firebase Analytics', desc: 'Event tracking pipeline' },
];

export default function HomePage() {
  const { gameState } = useAppContext();

  return (
    <div className="page-content">
      {/* Live Game Banner */}
      {gameState.status === 'live' && (
        <div className={styles.liveBanner}>
          <div className={styles.liveBannerLeft}>
            <div className={styles.liveDot} />
            <span className={styles.liveText}>Match Live</span>
          </div>
          <div className={styles.liveScore}>
            {gameState.homeTeam} {gameState.homeScore} — {gameState.awayScore} {gameState.awayTeam}
          </div>
          <div className={styles.liveTime}>
            {gameState.period} · {gameState.timeRemaining}
          </div>
        </div>
      )}

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <div className={styles.heroEmoji}>🏟️</div>
          <h1 className={styles.heroTitle}>
            Your AI-Powered{' '}
            <span className={styles.heroTitleGradient}>Stadium Experience</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Skip the queues. Dodge the crowds. Never miss a moment. StadiumIQ is your
            personal AI concierge for the ultimate sporting event experience.
          </p>
          <div className={styles.heroCTAs}>
            <Link href="/chat" className="btn btn-primary btn-lg">
              🤖 Talk to Stadium Buddy
            </Link>
            <Link href="/map" className="btn btn-secondary btn-lg">
              🗺️ View Live Map
            </Link>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <div className={styles.statValue}>60K</div>
              <div className={styles.statLabel}>Venue Capacity</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>22</div>
              <div className={styles.statLabel}>POIs Tracked</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>5s</div>
              <div className={styles.statLabel}>Update Speed</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>AI</div>
              <div className={styles.statLabel}>Powered by Gemini</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className={styles.features} id="features">
        <h2 className={styles.featuresTitle}>Everything You Need, In Real-Time</h2>
        <div className={styles.featuresGrid}>
          {features.map((feature, i) => (
            <Link
              key={feature.title}
              href={feature.href}
              className={`${styles.featureCard} animate-fade-in-up stagger-${i + 1}`}
            >
              <span className={styles.featureIcon}>{feature.icon}</span>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDesc}>{feature.desc}</p>
              <span className={styles.featureTag}>{feature.tag}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Google Services */}
      <section className={styles.services}>
        <h2 className={styles.featuresTitle}>Powered by Google Services</h2>
        <div className={styles.servicesGrid}>
          {googleServices.map((service) => (
            <div key={service.name} className={styles.serviceCard}>
              <div className={styles.serviceIcon}>{service.icon}</div>
              <div className={styles.serviceName}>{service.name}</div>
              <div className={styles.serviceDesc}>{service.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
