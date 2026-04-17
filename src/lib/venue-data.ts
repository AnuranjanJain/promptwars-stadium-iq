// ============================================================
// StadiumIQ — Venue Data (National Arena - Fictitious Venue)
// ============================================================

import { Venue, GameState, EventFeedItem, CrowdDensity, QueueInfo, TriviaQuestion } from '@/types';

// Center coordinates for our National Arena (placed near a real area for Maps realism)
const VENUE_CENTER = { lat: 28.6129, lng: 77.2295 }; // Near India Gate, Delhi

export const venue: Venue = {
  id: 'national-arena',
  name: 'National Arena',
  location: VENUE_CENTER,
  capacity: 60000,
  description: 'A world-class 60,000-seat multi-sport stadium featuring state-of-the-art facilities',
  mapZoom: 17,
  sections: [
    { id: 'sec-north-lower', name: 'North Stand - Lower', level: 'lower', capacity: 5000, currentOccupancy: 4200, location: { lat: 28.6140, lng: 77.2295 } },
    { id: 'sec-north-upper', name: 'North Stand - Upper', level: 'upper', capacity: 5000, currentOccupancy: 3800, location: { lat: 28.6145, lng: 77.2295 } },
    { id: 'sec-south-lower', name: 'South Stand - Lower', level: 'lower', capacity: 5000, currentOccupancy: 4600, location: { lat: 28.6115, lng: 77.2295 } },
    { id: 'sec-south-upper', name: 'South Stand - Upper', level: 'upper', capacity: 5000, currentOccupancy: 4100, location: { lat: 28.6110, lng: 77.2295 } },
    { id: 'sec-east-lower', name: 'East Stand - Lower', level: 'lower', capacity: 5000, currentOccupancy: 4800, location: { lat: 28.6129, lng: 77.2315 } },
    { id: 'sec-east-upper', name: 'East Stand - Upper', level: 'upper', capacity: 5000, currentOccupancy: 3500, location: { lat: 28.6129, lng: 77.2320 } },
    { id: 'sec-west-lower', name: 'West Stand - Lower', level: 'lower', capacity: 5000, currentOccupancy: 4400, location: { lat: 28.6129, lng: 77.2275 } },
    { id: 'sec-west-upper', name: 'West Stand - Upper', level: 'upper', capacity: 5000, currentOccupancy: 3200, location: { lat: 28.6129, lng: 77.2270 } },
    { id: 'sec-vip-east', name: 'VIP Lounge - East', level: 'vip', capacity: 2000, currentOccupancy: 1800, location: { lat: 28.6135, lng: 77.2310 } },
    { id: 'sec-vip-west', name: 'VIP Lounge - West', level: 'vip', capacity: 2000, currentOccupancy: 1500, location: { lat: 28.6135, lng: 77.2280 } },
  ],
  pois: [
    // Food & Beverage
    {
      id: 'food-1', name: 'The Grand Grill', category: 'food',
      location: { lat: 28.6142, lng: 77.2285 }, level: 'Ground',
      description: 'Premium burgers, hot dogs, and grilled favorites',
      icon: '🍔', isOpen: true, currentWaitMinutes: 12, maxCapacity: 50, currentLoad: 0.78,
      accessibleRoute: true,
      menuItems: [
        { name: 'Stadium Burger', price: 350, isVeg: false, isPopular: true },
        { name: 'Veggie Wrap', price: 250, isVeg: true, isPopular: false },
        { name: 'Loaded Fries', price: 200, isVeg: true, isPopular: true },
        { name: 'Chicken Wings (6pc)', price: 400, isVeg: false, isPopular: true },
      ]
    },
    {
      id: 'food-2', name: 'Pizza Corner', category: 'food',
      location: { lat: 28.6120, lng: 77.2305 }, level: 'Ground',
      description: 'Fresh pizzas and pasta',
      icon: '🍕', isOpen: true, currentWaitMinutes: 8, maxCapacity: 40, currentLoad: 0.55,
      accessibleRoute: true,
      menuItems: [
        { name: 'Margherita Pizza', price: 300, isVeg: true, isPopular: true },
        { name: 'Pepperoni Pizza', price: 400, isVeg: false, isPopular: true },
        { name: 'Garlic Bread', price: 150, isVeg: true, isPopular: false },
      ]
    },
    {
      id: 'food-3', name: 'Chai & Snacks', category: 'food',
      location: { lat: 28.6135, lng: 77.2310 }, level: 'Level 1',
      description: 'Indian snacks, chai, and beverages',
      icon: '☕', isOpen: true, currentWaitMinutes: 5, maxCapacity: 30, currentLoad: 0.40,
      accessibleRoute: true,
      menuItems: [
        { name: 'Masala Chai', price: 80, isVeg: true, isPopular: true },
        { name: 'Samosa (2pc)', price: 100, isVeg: true, isPopular: true },
        { name: 'Vada Pav', price: 80, isVeg: true, isPopular: true },
        { name: 'Cold Coffee', price: 150, isVeg: true, isPopular: false },
      ]
    },
    {
      id: 'food-4', name: 'Hydration Station', category: 'food',
      location: { lat: 28.6125, lng: 77.2280 }, level: 'Ground',
      description: 'Water, juices, and energy drinks',
      icon: '🥤', isOpen: true, currentWaitMinutes: 3, maxCapacity: 20, currentLoad: 0.30,
      accessibleRoute: true,
      menuItems: [
        { name: 'Water Bottle', price: 40, isVeg: true, isPopular: true },
        { name: 'Fresh Juice', price: 120, isVeg: true, isPopular: false },
        { name: 'Energy Drink', price: 180, isVeg: true, isPopular: false },
      ]
    },
    {
      id: 'food-5', name: 'Biryani Bowl', category: 'food',
      location: { lat: 28.6118, lng: 77.2288 }, level: 'Level 1',
      description: 'Authentic Hyderabadi biryani and kebabs',
      icon: '🍛', isOpen: true, currentWaitMinutes: 18, maxCapacity: 35, currentLoad: 0.92,
      accessibleRoute: false,
      menuItems: [
        { name: 'Chicken Biryani', price: 350, isVeg: false, isPopular: true },
        { name: 'Veg Biryani', price: 280, isVeg: true, isPopular: false },
        { name: 'Seekh Kebab', price: 250, isVeg: false, isPopular: true },
      ]
    },

    // Restrooms
    {
      id: 'restroom-1', name: 'Restroom - North Gate', category: 'restroom',
      location: { lat: 28.6143, lng: 77.2290 }, level: 'Ground',
      description: 'Near North Gate entrance', icon: '🚻',
      isOpen: true, currentWaitMinutes: 6, maxCapacity: 20, currentLoad: 0.65, accessibleRoute: true,
    },
    {
      id: 'restroom-2', name: 'Restroom - South Gate', category: 'restroom',
      location: { lat: 28.6116, lng: 77.2300 }, level: 'Ground',
      description: 'Near South Gate entrance', icon: '🚻',
      isOpen: true, currentWaitMinutes: 2, maxCapacity: 20, currentLoad: 0.25, accessibleRoute: true,
    },
    {
      id: 'restroom-3', name: 'Restroom - East Wing', category: 'restroom',
      location: { lat: 28.6130, lng: 77.2318 }, level: 'Level 1',
      description: 'East wing facilities', icon: '🚻',
      isOpen: true, currentWaitMinutes: 10, maxCapacity: 15, currentLoad: 0.85, accessibleRoute: true,
    },
    {
      id: 'restroom-4', name: 'Restroom - West Wing', category: 'restroom',
      location: { lat: 28.6130, lng: 77.2272 }, level: 'Ground',
      description: 'West wing facilities', icon: '🚻',
      isOpen: false, currentWaitMinutes: 0, maxCapacity: 15, currentLoad: 0, accessibleRoute: true,
    },

    // Merchandise
    {
      id: 'merch-1', name: 'Fan Zone Store', category: 'merchandise',
      location: { lat: 28.6138, lng: 77.2278 }, level: 'Ground',
      description: 'Official team jerseys, caps, and memorabilia',
      icon: '🏪', isOpen: true, currentWaitMinutes: 15, maxCapacity: 30, currentLoad: 0.82, accessibleRoute: true,
    },
    {
      id: 'merch-2', name: 'Quick Merch Kiosk', category: 'merchandise',
      location: { lat: 28.6122, lng: 77.2308 }, level: 'Ground',
      description: 'Quick-buy scarves, flags, and accessories',
      icon: '🏪', isOpen: true, currentWaitMinutes: 4, maxCapacity: 15, currentLoad: 0.35, accessibleRoute: true,
    },

    // Gates
    {
      id: 'gate-north', name: 'North Gate (Gate A)', category: 'gate',
      location: { lat: 28.6148, lng: 77.2295 }, level: 'Ground',
      description: 'Main entrance - North', icon: '🚪',
      isOpen: true, currentWaitMinutes: 0, maxCapacity: 500, currentLoad: 0.20, accessibleRoute: true,
    },
    {
      id: 'gate-south', name: 'South Gate (Gate B)', category: 'gate',
      location: { lat: 28.6110, lng: 77.2295 }, level: 'Ground',
      description: 'Main entrance - South', icon: '🚪',
      isOpen: true, currentWaitMinutes: 0, maxCapacity: 500, currentLoad: 0.15, accessibleRoute: true,
    },
    {
      id: 'gate-east', name: 'East Gate (Gate C)', category: 'gate',
      location: { lat: 28.6129, lng: 77.2325 }, level: 'Ground',
      description: 'VIP & Premium entrance', icon: '🚪',
      isOpen: true, currentWaitMinutes: 0, maxCapacity: 300, currentLoad: 0.10, accessibleRoute: true,
    },
    {
      id: 'gate-west', name: 'West Gate (Gate D)', category: 'gate',
      location: { lat: 28.6129, lng: 77.2265 }, level: 'Ground',
      description: 'Family & Accessible entrance', icon: '🚪',
      isOpen: true, currentWaitMinutes: 0, maxCapacity: 300, currentLoad: 0.12, accessibleRoute: true,
    },

    // Medical
    {
      id: 'medical-1', name: 'First Aid - North', category: 'medical',
      location: { lat: 28.6145, lng: 77.2300 }, level: 'Ground',
      description: '24/7 medical assistance', icon: '🏥',
      isOpen: true, currentWaitMinutes: 0, maxCapacity: 10, currentLoad: 0.10, accessibleRoute: true,
    },
    {
      id: 'medical-2', name: 'First Aid - South', category: 'medical',
      location: { lat: 28.6112, lng: 77.2290 }, level: 'Ground',
      description: '24/7 medical assistance', icon: '🏥',
      isOpen: true, currentWaitMinutes: 0, maxCapacity: 10, currentLoad: 0.05, accessibleRoute: true,
    },

    // Info
    {
      id: 'info-1', name: 'Information Desk', category: 'info',
      location: { lat: 28.6140, lng: 77.2295 }, level: 'Ground',
      description: 'Lost & found, assistance, directions', icon: 'ℹ️',
      isOpen: true, currentWaitMinutes: 5, maxCapacity: 10, currentLoad: 0.50, accessibleRoute: true,
    },

    // ATM
    {
      id: 'atm-1', name: 'ATM - North Lobby', category: 'atm',
      location: { lat: 28.6144, lng: 77.2288 }, level: 'Ground',
      description: 'Cash withdrawal', icon: '🏧',
      isOpen: true, currentWaitMinutes: 3, maxCapacity: 3, currentLoad: 0.33, accessibleRoute: true,
    },

    // Parking
    {
      id: 'parking-1', name: 'Parking Lot A (North)', category: 'parking',
      location: { lat: 28.6155, lng: 77.2295 }, level: 'Ground',
      description: 'Closest to North Gate', icon: '🅿️',
      isOpen: true, currentWaitMinutes: 0, maxCapacity: 2000, currentLoad: 0.88, accessibleRoute: true,
    },
    {
      id: 'parking-2', name: 'Parking Lot B (South)', category: 'parking',
      location: { lat: 28.6100, lng: 77.2295 }, level: 'Ground',
      description: 'Closest to South Gate', icon: '🅿️',
      isOpen: true, currentWaitMinutes: 0, maxCapacity: 2000, currentLoad: 0.62, accessibleRoute: true,
    },
  ]
};

// --- Live Game State ---
export const initialGameState: GameState = {
  homeTeam: 'Delhi Titans',
  awayTeam: 'Mumbai Warriors',
  homeScore: 2,
  awayScore: 1,
  period: '2nd Half',
  timeRemaining: '67:23',
  status: 'live',
  sport: 'Football',
};

// --- Initial Crowd Density ---
export const initialCrowdData: CrowdDensity[] = [
  { zoneId: 'zone-north', zoneName: 'North Concourse', density: 0.72, trend: 'increasing', location: { lat: 28.6142, lng: 77.2295 }, lastUpdated: Date.now() },
  { zoneId: 'zone-south', zoneName: 'South Concourse', density: 0.45, trend: 'stable', location: { lat: 28.6116, lng: 77.2295 }, lastUpdated: Date.now() },
  { zoneId: 'zone-east', zoneName: 'East Wing', density: 0.85, trend: 'increasing', location: { lat: 28.6129, lng: 77.2315 }, lastUpdated: Date.now() },
  { zoneId: 'zone-west', zoneName: 'West Wing', density: 0.38, trend: 'decreasing', location: { lat: 28.6129, lng: 77.2275 }, lastUpdated: Date.now() },
  { zoneId: 'zone-food-court', zoneName: 'Food Court', density: 0.91, trend: 'increasing', location: { lat: 28.6135, lng: 77.2290 }, lastUpdated: Date.now() },
  { zoneId: 'zone-main-entrance', zoneName: 'Main Entrance', density: 0.25, trend: 'decreasing', location: { lat: 28.6148, lng: 77.2295 }, lastUpdated: Date.now() },
  { zoneId: 'zone-vip', zoneName: 'VIP Area', density: 0.55, trend: 'stable', location: { lat: 28.6135, lng: 77.2310 }, lastUpdated: Date.now() },
  { zoneId: 'zone-merch', zoneName: 'Merchandise Zone', density: 0.68, trend: 'stable', location: { lat: 28.6138, lng: 77.2278 }, lastUpdated: Date.now() },
];

// --- Queue Data (derived from POIs) ---
export function getQueueData(): QueueInfo[] {
  return venue.pois
    .filter(poi => ['food', 'restroom', 'merchandise'].includes(poi.category) && poi.isOpen)
    .map(poi => ({
      poiId: poi.id,
      poiName: poi.name,
      category: poi.category,
      currentWaitMinutes: poi.currentWaitMinutes,
      estimatedServeTime: Math.ceil(poi.currentWaitMinutes / 3),
      queueLength: Math.ceil(poi.currentLoad * poi.maxCapacity),
      trend: poi.currentLoad > 0.7 ? 'increasing' as const : poi.currentLoad < 0.4 ? 'decreasing' as const : 'stable' as const,
      bestTimeToVisit: poi.currentLoad > 0.7 ? 'Try in 15-20 minutes' : 'Good time to visit!',
      location: poi.location,
    }));
}

// --- Event Feed ---
export const initialFeedItems: EventFeedItem[] = [
  {
    id: 'feed-1', type: 'score', title: '⚽ GOAL!',
    message: 'Delhi Titans take the lead! Rahul Singh scores a brilliant volley in the 62nd minute!',
    timestamp: Date.now() - 5 * 60 * 1000, priority: 'high', icon: '⚽',
  },
  {
    id: 'feed-2', type: 'announcement', title: '📢 Halftime Show',
    message: 'Don\'t miss the spectacular halftime drone show starting in 25 minutes!',
    timestamp: Date.now() - 10 * 60 * 1000, priority: 'medium', icon: '🎭',
  },
  {
    id: 'feed-3', type: 'promo', title: '🎉 Flash Sale!',
    message: '20% off all merchandise at Fan Zone Store for the next 15 minutes!',
    timestamp: Date.now() - 12 * 60 * 1000, priority: 'medium', icon: '🛍️',
    actionLabel: 'Get Directions', actionUrl: '/navigate?to=merch-1',
  },
  {
    id: 'feed-4', type: 'alert', title: '⚠️ Crowd Advisory',
    message: 'East Wing food court is currently very busy. Consider visiting Chai & Snacks on Level 1 for shorter wait times.',
    timestamp: Date.now() - 15 * 60 * 1000, priority: 'medium', icon: '⚠️',
  },
  {
    id: 'feed-5', type: 'trivia', title: '🧠 Fan Trivia',
    message: 'Answer correctly to earn 50 points! Question: Who holds the record for most goals at National Arena?',
    timestamp: Date.now() - 20 * 60 * 1000, priority: 'low', icon: '🧠',
    actionLabel: 'Play Now', actionUrl: '/feed#trivia',
  },
  {
    id: 'feed-6', type: 'score', title: '⚽ GOAL!',
    message: 'Mumbai Warriors equalize! Fantastic header by Arjun Patel from a corner kick.',
    timestamp: Date.now() - 30 * 60 * 1000, priority: 'high', icon: '⚽',
  },
  {
    id: 'feed-7', type: 'announcement', title: '🏟️ Welcome!',
    message: 'Welcome to National Arena! Today\'s match: Delhi Titans vs Mumbai Warriors. Enjoy the game!',
    timestamp: Date.now() - 90 * 60 * 1000, priority: 'low', icon: '🏟️',
  },
];

// --- Trivia ---
export const triviaQuestions: TriviaQuestion[] = [
  {
    id: 'trivia-1',
    question: 'Who holds the record for most goals scored at National Arena?',
    options: ['Rahul Singh', 'Vikram Kapoor', 'Arjun Patel', 'Suresh Kumar'],
    correctIndex: 1,
    points: 50,
    timeLimit: 15,
  },
  {
    id: 'trivia-2',
    question: 'What year was National Arena inaugurated?',
    options: ['2018', '2019', '2020', '2021'],
    correctIndex: 2,
    points: 30,
    timeLimit: 10,
  },
  {
    id: 'trivia-3',
    question: 'What is the seating capacity of National Arena?',
    options: ['45,000', '50,000', '55,000', '60,000'],
    correctIndex: 3,
    points: 40,
    timeLimit: 10,
  },
];

// --- Gemini System Prompt ---
export const GEMINI_SYSTEM_PROMPT = `You are "Stadium Buddy", an AI-powered concierge assistant for National Arena, a 60,000-seat multi-sport stadium. You help fans navigate the venue, find food, check queue times, and enjoy their experience.

VENUE KNOWLEDGE:
- National Arena is hosting Delhi Titans vs Mumbai Warriors (Football)
- Current score: Delhi Titans 2 - Mumbai Warriors 1 (2nd Half, 67th minute)
- Stadium has 4 main gates: North (A), South (B), East (C - VIP), West (D - Family/Accessible)
- 2 levels: Ground and Level 1
- VIP sections on East and West sides

FOOD OPTIONS:
1. The Grand Grill (Ground, North) - Burgers, hot dogs, wings. Wait: ~12 min
2. Pizza Corner (Ground, South) - Fresh pizza. Wait: ~8 min
3. Chai & Snacks (Level 1, East) - Indian snacks, chai. Wait: ~5 min ⭐ SHORTEST WAIT
4. Hydration Station (Ground, West) - Water, juices. Wait: ~3 min
5. Biryani Bowl (Level 1, South) - Biryani, kebabs. Wait: ~18 min ⚠️ LONGEST WAIT

RESTROOMS:
1. North Gate - Wait: ~6 min
2. South Gate - Wait: ~2 min ⭐ SHORTEST WAIT
3. East Wing (Level 1) - Wait: ~10 min
4. West Wing - CLOSED for maintenance

CURRENT CONDITIONS:
- East Wing and Food Court are very crowded (85%+ density)
- West Wing and South area have low crowd density
- North Concourse is moderately busy
- Merchandise: Fan Zone Store (15 min wait), Quick Merch Kiosk (4 min wait)

BEHAVIOR:
- Be friendly, concise, and helpful
- Always suggest the FASTEST option first
- Warn about crowded areas proactively
- Give clear directions using gates and landmarks
- Consider accessibility needs when asked
- Use emojis sparingly for a friendly tone
- If asked about emergencies, provide safety-first guidance
- Suggest best times based on crowd predictions
- Keep responses under 150 words unless asked for detail
- If user mentions being in a specific section, tailor navigation accordingly

PREDICTIVE INTELLIGENCE:
- Halftime is approaching in ~20 minutes - crowds at food/restrooms will surge
- Post-match crowding expected at North and East gates
- Recommend proactive trips to restrooms and food before halftime`;
