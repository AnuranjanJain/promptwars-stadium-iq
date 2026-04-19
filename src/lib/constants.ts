// ============================================================
// StadiumIQ — Application Constants
// Centralized configuration values, thresholds, and magic
// numbers used across the application.
// ============================================================

// --- Simulation Intervals (milliseconds) ---

/** How often crowd density data refreshes (ms) */
export const CROWD_UPDATE_INTERVAL_MS = 5_000;

/** How often queue wait times refresh (ms) */
export const QUEUE_UPDATE_INTERVAL_MS = 8_000;

/** How often the game clock advances (ms) */
export const GAME_UPDATE_INTERVAL_MS = 15_000;

// --- Crowd Density Thresholds ---

/** Minimum density value (prevents unrealistic empty zones) */
export const DENSITY_MIN = 0.05;

/** Maximum density value (prevents unrealistic full zones) */
export const DENSITY_MAX = 0.98;

/** Density below this is considered "Low" */
export const DENSITY_LOW_THRESHOLD = 0.3;

/** Density below this is considered "Moderate" (above Low) */
export const DENSITY_MODERATE_THRESHOLD = 0.6;

/** Density below this is considered "Busy" (above Moderate) */
export const DENSITY_BUSY_THRESHOLD = 0.8;

// --- Queue Wait Time Thresholds (minutes) ---

/** Wait time considered "No Wait" */
export const WAIT_NO_WAIT_MAX = 3;

/** Wait time considered "Short Wait" */
export const WAIT_SHORT_MAX = 8;

/** Wait time considered "Moderate Wait" */
export const WAIT_MODERATE_MAX = 15;

/** Minimum queue wait time (minutes) */
export const QUEUE_WAIT_MIN = 1;

/** Maximum queue wait time (minutes) */
export const QUEUE_WAIT_MAX = 30;

// --- Simulation Parameters ---

/** Crowd density random walk delta multiplier */
export const CROWD_DELTA_MULTIPLIER = 0.08;

/** Crowd density upward bias (slightly above 0.5 = upward bias) */
export const CROWD_BIAS = 0.48;

/** Minutes between periodic crowd surges (e.g., halftime) */
export const SURGE_INTERVAL_MINUTES = 15;

/** Duration of surge window (minutes) */
export const SURGE_WINDOW_MINUTES = 3;

/** Additional density during surge events */
export const SURGE_DENSITY_BOOST = 0.05;

/** Trend detection threshold (delta above this = "increasing") */
export const TREND_CHANGE_THRESHOLD = 0.02;

/** Game clock advance per tick (seconds) */
export const GAME_TICK_SECONDS = 15;

/** Random goal probability per tick */
export const GOAL_PROBABILITY = 0.002;

/** Period transition minute (end of half) */
export const HALF_DURATION_MINUTES = 45;

// --- Predictions ---

/** 15-minute prediction confidence */
export const PREDICTION_CONFIDENCE_15MIN = 0.85;

/** 30-minute prediction confidence */
export const PREDICTION_CONFIDENCE_30MIN = 0.72;

/** 60-minute prediction confidence */
export const PREDICTION_CONFIDENCE_60MIN = 0.55;

// --- API Limits ---

/** Maximum chat message length (characters) */
export const MAX_CHAT_MESSAGE_LENGTH = 2000;

/** Maximum number of analytics events per batch request */
export const MAX_ANALYTICS_BATCH_SIZE = 100;

/** Maximum analytics event metadata keys */
export const MAX_METADATA_KEYS = 20;

/** Maximum image base64 size (bytes, ~5MB) */
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

// --- Session ---

/** Session storage key for session ID */
export const SESSION_STORAGE_KEY = 'stadium-iq-session';

/** Local storage key for theme preference */
export const THEME_STORAGE_KEY = 'theme';

// --- Analytics Event Types ---

/** Allowed analytics event types */
export const VALID_EVENT_TYPES = [
  'page_view',
  'chat_message',
  'map_interaction',
  'queue_view',
  'navigation_request',
  'trivia_answer',
  'image_upload',
  'theme_toggle',
  'accessibility_change',
  'performance_metric',
  'error_log',
  'tts_request',
  'geocode_request',
  'places_search',
] as const;

// --- Google Service Identifiers ---

/** All Google services used by StadiumIQ */
export const GOOGLE_SERVICES = [
  { id: 'gemini-text', name: 'Gemini AI (Text)', description: 'AI chatbot & crowd insights' },
  { id: 'gemini-vision', name: 'Gemini AI (Vision)', description: 'Visual location detection' },
  { id: 'gemini-translate', name: 'Gemini AI (Translation)', description: 'Multi-language support' },
  { id: 'maps-js', name: 'Google Maps JS API', description: 'Interactive venue mapping' },
  { id: 'firebase-auth', name: 'Firebase Auth', description: 'Anonymous authentication' },
  { id: 'firebase-firestore', name: 'Firebase Firestore', description: 'Real-time data persistence' },
  { id: 'firebase-analytics', name: 'Firebase Analytics', description: 'Event tracking pipeline' },
  { id: 'cloud-tts', name: 'Cloud Text-to-Speech', description: 'Accessible audio alerts' },
  { id: 'geocoding', name: 'Geocoding API', description: 'Address resolution' },
  { id: 'places', name: 'Places API', description: 'Nearby transit & parking' },
] as const;

// --- Colors (Design Tokens) ---

/** Crowd density level colors */
export const DENSITY_COLORS = {
  low: '#22c55e',
  moderate: '#f59e0b',
  busy: '#f97316',
  crowded: '#ef4444',
} as const;

/** Wait severity colors */
export const WAIT_COLORS = {
  none: '#22c55e',
  short: '#84cc16',
  moderate: '#f59e0b',
  long: '#ef4444',
} as const;
