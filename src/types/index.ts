// ============================================================
// StadiumIQ — Type Definitions
// ============================================================

// --- Venue & Map ---

export interface Venue {
  id: string;
  name: string;
  location: LatLng;
  capacity: number;
  description: string;
  mapZoom: number;
  sections: Section[];
  pois: POI[];
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Section {
  id: string;
  name: string;
  level: 'ground' | 'lower' | 'upper' | 'vip';
  capacity: number;
  currentOccupancy: number;
  location: LatLng;
}

export type POICategory =
  | 'food'
  | 'restroom'
  | 'merchandise'
  | 'gate'
  | 'medical'
  | 'info'
  | 'atm'
  | 'parking';

export interface POI {
  id: string;
  name: string;
  category: POICategory;
  location: LatLng;
  level: string;
  description: string;
  icon: string;
  isOpen: boolean;
  currentWaitMinutes: number;
  maxCapacity: number;
  currentLoad: number; // 0-1 percentage
  menuItems?: MenuItem[];
  accessibleRoute?: boolean;
}

export interface MenuItem {
  name: string;
  price: number;
  isVeg: boolean;
  isPopular: boolean;
}

// --- Crowd Data ---

export interface CrowdDensity {
  zoneId: string;
  zoneName: string;
  density: number; // 0-1
  trend: 'increasing' | 'decreasing' | 'stable';
  location: LatLng;
  lastUpdated: number;
}

export interface CrowdPrediction {
  zoneId: string;
  currentDensity: number;
  predictions: {
    minutes: number;
    predictedDensity: number;
    confidence: number;
  }[];
  recommendation: string;
}

// --- Queue Data ---

export interface QueueInfo {
  poiId: string;
  poiName: string;
  category: POICategory;
  currentWaitMinutes: number;
  estimatedServeTime: number;
  queueLength: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  bestTimeToVisit: string;
  location: LatLng;
}

// --- Chat ---

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isLoading?: boolean;
  imageUrl?: string;
}

export interface ChatContext {
  userSection?: string;
  gameState: GameState;
  crowdData: CrowdDensity[];
  queueData: QueueInfo[];
  venueInfo: Venue;
}

// --- Game / Event ---

export interface GameState {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  period: string;
  timeRemaining: string;
  status: 'upcoming' | 'live' | 'halftime' | 'finished';
  sport: string;
}

export interface EventFeedItem {
  id: string;
  type: 'announcement' | 'score' | 'alert' | 'trivia' | 'promo' | 'emergency';
  title: string;
  message: string;
  timestamp: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  icon: string;
  actionUrl?: string;
  actionLabel?: string;
}

// --- Group Coordination ---

export interface Group {
  id: string;
  code: string;
  members: GroupMember[];
  createdAt: number;
  meetupPoint?: LatLng;
  meetupPOI?: string;
}

export interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  location?: LatLng;
  section?: string;
  lastSeen: number;
  status: 'active' | 'away' | 'offline';
}

// --- Emergency ---

export interface EmergencyAlert {
  id: string;
  type: 'evacuation' | 'medical' | 'weather' | 'security';
  message: string;
  affectedZones: string[];
  nearestExit: string;
  instructions: string[];
  timestamp: number;
  isActive: boolean;
}

// --- Fan Engagement ---

export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  points: number;
  timeLimit: number;
}

export interface FanProfile {
  id: string;
  name: string;
  points: number;
  badges: string[];
  checkins: string[];
  rank: number;
}

// --- Accessibility ---

export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
}
