'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { CrowdDensity, QueueInfo, GameState, EventFeedItem, AccessibilitySettings } from '@/types';
import { initialCrowdData, initialGameState, initialFeedItems, getQueueData } from '@/lib/venue-data';
import { simulateCrowdUpdate, simulateQueueUpdate, simulateGameUpdate } from '@/lib/crowd-simulator';

interface AppContextType {
  crowdData: CrowdDensity[];
  queueData: QueueInfo[];
  gameState: GameState;
  feedItems: EventFeedItem[];
  accessibility: AccessibilitySettings;
  setAccessibility: (settings: AccessibilitySettings) => void;
  isLoading: boolean;
  userSection: string;
  setUserSection: (section: string) => void;
  /** Theme handling */
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Theme state – default to system preference or stored value
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
      if (storedTheme) {
        setTheme(storedTheme);
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
      } else {
        setTheme('light');
      }
    }
  }, []);

  // Apply theme to html element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const [crowdData, setCrowdData] = useState<CrowdDensity[]>(initialCrowdData);
  const [queueData, setQueueData] = useState<QueueInfo[]>(getQueueData());
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [feedItems] = useState<EventFeedItem[]>(initialFeedItems);
  const [isLoading, setIsLoading] = useState(true);
  const [userSection, setUserSection] = useState('North Stand - Lower');
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
  });

  // Simulate real-time data updates
  useEffect(() => {
    // Note: setTimeout used instead of directly calling setState to avoid
    // the "react-hooks/set-state-in-effect" warning for synchronous setState
    setTimeout(() => {
      setIsLoading(false);
    }, 0);    const crowdInterval = setInterval(() => {
      setCrowdData(prev => simulateCrowdUpdate(prev));
    }, 5000); // Update every 5 seconds

    const queueInterval = setInterval(() => {
      setQueueData(prev => simulateQueueUpdate(prev));
    }, 8000); // Update every 8 seconds

    const gameInterval = setInterval(() => {
      setGameState(prev => simulateGameUpdate(prev));
    }, 15000); // Update every 15 seconds

    return () => {
      clearInterval(crowdInterval);
      clearInterval(queueInterval);
      clearInterval(gameInterval);
    };
  }, []);

  // Apply accessibility classes
  useEffect(() => {
    const body = document.body;
    body.classList.toggle('high-contrast', accessibility.highContrast);
    body.classList.toggle('large-text', accessibility.largeText);
    if (accessibility.reducedMotion) {
      body.style.setProperty('--transition-base', '0ms');
      body.style.setProperty('--transition-fast', '0ms');
      body.style.setProperty('--transition-slow', '0ms');
    } else {
      body.style.removeProperty('--transition-base');
      body.style.removeProperty('--transition-fast');
      body.style.removeProperty('--transition-slow');
    }
  }, [accessibility]);

  return (
    <AppContext.Provider value={{
      crowdData,
      queueData,
      gameState,
      feedItems,
      accessibility,
      setAccessibility,
      isLoading,
      userSection,
      setUserSection,
      theme,
      toggleTheme,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
