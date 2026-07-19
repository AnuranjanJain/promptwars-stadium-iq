// ============================================================
// StadiumIQ NEXUS — FIFA World Cup 2026 venue simulation
// ============================================================

import { Venue, GameState, EventFeedItem, CrowdDensity, QueueInfo, TriviaQuestion } from '@/types';

// New York New Jersey Stadium area; all operational data remains synthetic.
const VENUE_CENTER = { lat: 40.8135, lng: -74.0745 };

export const venue: Venue = {
  id: 'world-cup-2026-nynj',
  name: 'New York New Jersey Stadium',
  location: VENUE_CENTER,
  capacity: 82500,
  description: 'A World Cup 2026 matchday digital twin for crowd, accessibility, transport, and fan operations',
  mapZoom: 17,
  sections: [
    { id: 'sec-north-lower', name: 'North Stand - Lower', level: 'lower', capacity: 9000, currentOccupancy: 7600, location: { lat: 40.8146, lng: -74.0745 } },
    { id: 'sec-north-upper', name: 'North Stand - Upper', level: 'upper', capacity: 8500, currentOccupancy: 6500, location: { lat: 40.8151, lng: -74.0745 } },
    { id: 'sec-south-lower', name: 'South Stand - Lower', level: 'lower', capacity: 9000, currentOccupancy: 8200, location: { lat: 40.8121, lng: -74.0745 } },
    { id: 'sec-south-upper', name: 'South Stand - Upper', level: 'upper', capacity: 8500, currentOccupancy: 7000, location: { lat: 40.8116, lng: -74.0745 } },
    { id: 'sec-east-lower', name: 'East Stand - Lower', level: 'lower', capacity: 9000, currentOccupancy: 8600, location: { lat: 40.8135, lng: -74.0725 } },
    { id: 'sec-east-upper', name: 'East Stand - Upper', level: 'upper', capacity: 8500, currentOccupancy: 6100, location: { lat: 40.8135, lng: -74.0720 } },
    { id: 'sec-west-lower', name: 'West Stand - Lower', level: 'lower', capacity: 9000, currentOccupancy: 7900, location: { lat: 40.8135, lng: -74.0765 } },
    { id: 'sec-west-upper', name: 'West Stand - Upper', level: 'upper', capacity: 8500, currentOccupancy: 5800, location: { lat: 40.8135, lng: -74.0770 } },
    { id: 'sec-vip-east', name: 'Hospitality - East', level: 'vip', capacity: 4000, currentOccupancy: 3500, location: { lat: 40.8141, lng: -74.0730 } },
    { id: 'sec-vip-west', name: 'Hospitality - West', level: 'vip', capacity: 4000, currentOccupancy: 3200, location: { lat: 40.8141, lng: -74.0760 } },
  ],
  pois: [
    // Food & Beverage
    {
      id: 'food-1', name: 'The Grand Grill', category: 'food',
      location: { lat: 40.8148, lng: -74.0755 }, level: 'Ground',
      description: 'Premium burgers, hot dogs, and grilled favorites',
      icon: '🍔', isOpen: true, currentWaitMinutes: 12, maxCapacity: 50, currentLoad: 0.78,
      accessibleRoute: true,
      menuItems: [
        { name: 'Stadium Burger', price: 15, isVeg: false, isPopular: true },
        { name: 'Veggie Wrap', price: 12, isVeg: true, isPopular: false },
        { name: 'Loaded Fries', price: 9, isVeg: true, isPopular: true },
        { name: 'Chicken Wings (6pc)', price: 16, isVeg: false, isPopular: true },
      ]
    },
    {
      id: 'food-2', name: 'Pizza Corner', category: 'food',
      location: { lat: 40.8126, lng: -74.0735 }, level: 'Ground',
      description: 'Fresh pizzas and pasta',
      icon: '🍕', isOpen: true, currentWaitMinutes: 8, maxCapacity: 40, currentLoad: 0.55,
      accessibleRoute: true,
      menuItems: [
        { name: 'Margherita Pizza', price: 13, isVeg: true, isPopular: true },
        { name: 'Pepperoni Pizza', price: 15, isVeg: false, isPopular: true },
        { name: 'Garlic Bread', price: 7, isVeg: true, isPopular: false },
      ]
    },
    {
      id: 'food-3', name: 'Global Bites', category: 'food',
      location: { lat: 40.8141, lng: -74.0730 }, level: 'Level 1',
      description: 'Fast international snacks and beverages',
      icon: '☕', isOpen: true, currentWaitMinutes: 5, maxCapacity: 30, currentLoad: 0.40,
      accessibleRoute: true,
      menuItems: [
        { name: 'Iced Tea', price: 6, isVeg: true, isPopular: true },
        { name: 'Empanadas (2pc)', price: 9, isVeg: true, isPopular: true },
        { name: 'Falafel Pocket', price: 11, isVeg: true, isPopular: true },
        { name: 'Cold Coffee', price: 7, isVeg: true, isPopular: false },
      ]
    },
    {
      id: 'food-4', name: 'Hydration Station', category: 'food',
      location: { lat: 40.8131, lng: -74.0760 }, level: 'Ground',
      description: 'Water, juices, and energy drinks',
      icon: '🥤', isOpen: true, currentWaitMinutes: 3, maxCapacity: 20, currentLoad: 0.30,
      accessibleRoute: true,
      menuItems: [
        { name: 'Water Bottle', price: 4, isVeg: true, isPopular: true },
        { name: 'Fresh Juice', price: 7, isVeg: true, isPopular: false },
        { name: 'Energy Drink', price: 8, isVeg: true, isPopular: false },
      ]
    },
    {
      id: 'food-5', name: 'World Flavors', category: 'food',
      location: { lat: 40.8124, lng: -74.0752 }, level: 'Level 1',
      description: 'Rotating dishes from participating nations',
      icon: '🍛', isOpen: true, currentWaitMinutes: 18, maxCapacity: 35, currentLoad: 0.92,
      accessibleRoute: false,
      menuItems: [
        { name: 'Chicken Rice Bowl', price: 15, isVeg: false, isPopular: true },
        { name: 'Vegetable Rice Bowl', price: 13, isVeg: true, isPopular: false },
        { name: 'Grilled Skewers', price: 12, isVeg: false, isPopular: true },
      ]
    },

    // Restrooms
    {
      id: 'restroom-1', name: 'Restroom - North Gate', category: 'restroom',
      location: { lat: 40.8149, lng: -74.0750 }, level: 'Ground',
      description: 'Near North Gate entrance', icon: '🚻',
      isOpen: true, currentWaitMinutes: 6, maxCapacity: 20, currentLoad: 0.65, accessibleRoute: true,
    },
    {
      id: 'restroom-2', name: 'Restroom - South Gate', category: 'restroom',
      location: { lat: 40.8122, lng: -74.0740 }, level: 'Ground',
      description: 'Near South Gate entrance', icon: '🚻',
      isOpen: true, currentWaitMinutes: 2, maxCapacity: 20, currentLoad: 0.25, accessibleRoute: true,
    },
    {
      id: 'restroom-3', name: 'Restroom - East Wing', category: 'restroom',
      location: { lat: 40.8136, lng: -74.0722 }, level: 'Level 1',
      description: 'East wing facilities', icon: '🚻',
      isOpen: true, currentWaitMinutes: 10, maxCapacity: 15, currentLoad: 0.85, accessibleRoute: true,
    },
    {
      id: 'restroom-4', name: 'Restroom - West Wing', category: 'restroom',
      location: { lat: 40.8136, lng: -74.0768 }, level: 'Ground',
      description: 'West wing facilities', icon: '🚻',
      isOpen: false, currentWaitMinutes: 0, maxCapacity: 15, currentLoad: 0, accessibleRoute: true,
    },

    // Merchandise
    {
      id: 'merch-1', name: 'Fan Zone Store', category: 'merchandise',
      location: { lat: 40.8144, lng: -74.0762 }, level: 'Ground',
      description: 'Official World Cup 2026 jerseys, caps, and memorabilia',
      icon: '🏪', isOpen: true, currentWaitMinutes: 15, maxCapacity: 30, currentLoad: 0.82, accessibleRoute: true,
    },
    {
      id: 'merch-2', name: 'Quick Merch Kiosk', category: 'merchandise',
      location: { lat: 40.8128, lng: -74.0732 }, level: 'Ground',
      description: 'Quick-buy scarves, flags, and accessories',
      icon: '🏪', isOpen: true, currentWaitMinutes: 4, maxCapacity: 15, currentLoad: 0.35, accessibleRoute: true,
    },

    // Gates
    {
      id: 'gate-north', name: 'North Gate (Gate A)', category: 'gate',
      location: { lat: 40.8154, lng: -74.0745 }, level: 'Ground',
      description: 'Main entrance - North', icon: '🚪',
      isOpen: true, currentWaitMinutes: 0, maxCapacity: 500, currentLoad: 0.20, accessibleRoute: true,
    },
    {
      id: 'gate-south', name: 'South Gate (Gate B)', category: 'gate',
      location: { lat: 40.8116, lng: -74.0745 }, level: 'Ground',
      description: 'Main entrance - South', icon: '🚪',
      isOpen: true, currentWaitMinutes: 0, maxCapacity: 500, currentLoad: 0.15, accessibleRoute: true,
    },
    {
      id: 'gate-east', name: 'East Gate (Gate C)', category: 'gate',
      location: { lat: 40.8135, lng: -74.0715 }, level: 'Ground',
      description: 'VIP & Premium entrance', icon: '🚪',
      isOpen: true, currentWaitMinutes: 0, maxCapacity: 300, currentLoad: 0.10, accessibleRoute: true,
    },
    {
      id: 'gate-west', name: 'West Gate (Gate D)', category: 'gate',
      location: { lat: 40.8135, lng: -74.0775 }, level: 'Ground',
      description: 'Family & Accessible entrance', icon: '🚪',
      isOpen: true, currentWaitMinutes: 0, maxCapacity: 300, currentLoad: 0.12, accessibleRoute: true,
    },

    // Medical
    {
      id: 'medical-1', name: 'First Aid - North', category: 'medical',
      location: { lat: 40.8151, lng: -74.0740 }, level: 'Ground',
      description: '24/7 medical assistance', icon: '🏥',
      isOpen: true, currentWaitMinutes: 0, maxCapacity: 10, currentLoad: 0.10, accessibleRoute: true,
    },
    {
      id: 'medical-2', name: 'First Aid - South', category: 'medical',
      location: { lat: 40.8118, lng: -74.0750 }, level: 'Ground',
      description: '24/7 medical assistance', icon: '🏥',
      isOpen: true, currentWaitMinutes: 0, maxCapacity: 10, currentLoad: 0.05, accessibleRoute: true,
    },

    // Info
    {
      id: 'info-1', name: 'Information Desk', category: 'info',
      location: { lat: 40.8146, lng: -74.0745 }, level: 'Ground',
      description: 'Lost & found, assistance, directions', icon: 'ℹ️',
      isOpen: true, currentWaitMinutes: 5, maxCapacity: 10, currentLoad: 0.50, accessibleRoute: true,
    },

    // ATM
    {
      id: 'atm-1', name: 'ATM - North Lobby', category: 'atm',
      location: { lat: 40.8150, lng: -74.0752 }, level: 'Ground',
      description: 'Cash withdrawal', icon: '🏧',
      isOpen: true, currentWaitMinutes: 3, maxCapacity: 3, currentLoad: 0.33, accessibleRoute: true,
    },

    // Parking
    {
      id: 'parking-1', name: 'Parking Lot A (North)', category: 'parking',
      location: { lat: 40.8161, lng: -74.0745 }, level: 'Ground',
      description: 'Closest to North Gate', icon: '🅿️',
      isOpen: true, currentWaitMinutes: 0, maxCapacity: 2000, currentLoad: 0.88, accessibleRoute: true,
    },
    {
      id: 'parking-2', name: 'Parking Lot B (South)', category: 'parking',
      location: { lat: 40.8106, lng: -74.0745 }, level: 'Ground',
      description: 'Closest to South Gate', icon: '🅿️',
      isOpen: true, currentWaitMinutes: 0, maxCapacity: 2000, currentLoad: 0.62, accessibleRoute: true,
    },
  ]
};

// --- Live Game State ---
export const initialGameState: GameState = {
  homeTeam: 'Brazil',
  awayTeam: 'Japan',
  homeScore: 2,
  awayScore: 1,
  period: '2nd Half',
  timeRemaining: '67:23',
  status: 'live',
  sport: 'Football',
};

// --- Initial Crowd Density ---
export const initialCrowdData: CrowdDensity[] = [
  { zoneId: 'zone-north', zoneName: 'North Concourse', density: 0.72, trend: 'increasing', location: { lat: 40.8148, lng: -74.0745 }, lastUpdated: Date.now() },
  { zoneId: 'zone-south', zoneName: 'South Concourse', density: 0.45, trend: 'stable', location: { lat: 40.8122, lng: -74.0745 }, lastUpdated: Date.now() },
  { zoneId: 'zone-east', zoneName: 'East Concourse', density: 0.85, trend: 'increasing', location: { lat: 40.8135, lng: -74.0725 }, lastUpdated: Date.now() },
  { zoneId: 'zone-west', zoneName: 'West Concourse', density: 0.38, trend: 'decreasing', location: { lat: 40.8135, lng: -74.0765 }, lastUpdated: Date.now() },
  { zoneId: 'zone-food-court', zoneName: 'Food Hall', density: 0.91, trend: 'increasing', location: { lat: 40.8141, lng: -74.0750 }, lastUpdated: Date.now() },
  { zoneId: 'zone-main-entrance', zoneName: 'North Plaza', density: 0.25, trend: 'decreasing', location: { lat: 40.8154, lng: -74.0745 }, lastUpdated: Date.now() },
  { zoneId: 'zone-vip', zoneName: 'Hospitality', density: 0.55, trend: 'stable', location: { lat: 40.8141, lng: -74.0730 }, lastUpdated: Date.now() },
  { zoneId: 'zone-merch', zoneName: 'Fan Market', density: 0.68, trend: 'stable', location: { lat: 40.8144, lng: -74.0762 }, lastUpdated: Date.now() },
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
    message: 'Brazil take the lead with a brilliant volley in the 62nd minute!',
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
    message: 'East Concourse is currently very busy. Consider Global Bites on Level 1 for a shorter wait.',
    timestamp: Date.now() - 15 * 60 * 1000, priority: 'medium', icon: '⚠️',
  },
  {
    id: 'feed-5', type: 'trivia', title: '🧠 Fan Trivia',
    message: 'Answer correctly to earn 50 points! Question: Which nation has won the most FIFA World Cup titles?',
    timestamp: Date.now() - 20 * 60 * 1000, priority: 'low', icon: '🧠',
    actionLabel: 'Play Now', actionUrl: '/feed#trivia',
  },
  {
    id: 'feed-6', type: 'score', title: '⚽ GOAL!',
    message: 'Japan equalize with a fantastic header from a corner kick.',
    timestamp: Date.now() - 30 * 60 * 1000, priority: 'high', icon: '⚽',
  },
  {
    id: 'feed-7', type: 'announcement', title: '🏟️ Welcome!',
    message: 'Welcome to the New York New Jersey Stadium! Today\'s simulated match is Brazil vs Japan.',
    timestamp: Date.now() - 90 * 60 * 1000, priority: 'low', icon: '🏟️',
  },
];

// --- Trivia ---
export const triviaQuestions: TriviaQuestion[] = [
  {
    id: 'trivia-1',
    question: 'Which nation has won the most FIFA World Cup titles?',
    options: ['Brazil', 'Germany', 'Italy', 'Argentina'],
    correctIndex: 0,
    points: 50,
    timeLimit: 15,
  },
  {
    id: 'trivia-2',
    question: 'How many host countries stage the FIFA World Cup 2026?',
    options: ['One', 'Two', 'Three', 'Four'],
    correctIndex: 2,
    points: 30,
    timeLimit: 10,
  },
  {
    id: 'trivia-3',
    question: 'Which StadiumIQ feature protects step-free travel during crowd surges?',
    options: ['Queue pricing', 'Accessible routing', 'Fan trivia', 'Merch alerts'],
    correctIndex: 1,
    points: 40,
    timeLimit: 10,
  },
];

// --- Gemini System Prompt ---
export const GEMINI_SYSTEM_PROMPT = `You are "Stadium Buddy", the multilingual fan assistant inside StadiumIQ NEXUS for a FIFA World Cup 2026 matchday simulation at New York New Jersey Stadium. You help fans navigate, find services, use accessible routes, understand transport options, and stay calm during live operational changes.

VENUE KNOWLEDGE:
- New York New Jersey Stadium is hosting a simulated Brazil vs Japan match
- Current score: Brazil 2 - Japan 1 (2nd Half, 67th minute)
- Stadium has 4 main gates: North (A), South (B), East (C - VIP), West (D - Family/Accessible)
- 2 levels: Ground and Level 1
- Hospitality sections are on the East and West sides

FOOD OPTIONS:
1. The Grand Grill (Ground, North) - Burgers, hot dogs, wings. Wait: ~12 min
2. Pizza Corner (Ground, South) - Fresh pizza. Wait: ~8 min
3. Global Bites (Level 1, East) - International snacks. Wait: ~5 min ⭐ SHORTEST WAIT
4. Hydration Station (Ground, West) - Water, juices. Wait: ~3 min
5. World Flavors (Level 1, South) - Rotating dishes. Wait: ~18 min ⚠️ LONGEST WAIT

RESTROOMS:
1. North Gate - Wait: ~6 min
2. South Gate - Wait: ~2 min ⭐ SHORTEST WAIT
3. East Wing (Level 1) - Wait: ~10 min
4. West Wing - CLOSED for maintenance

CURRENT CONDITIONS:
- East Concourse and Food Hall are very crowded (85%+ density)
- West Concourse and South area have low crowd density
- North Concourse is moderately busy
- Merchandise: Fan Zone Store (15 min wait), Quick Merch Kiosk (4 min wait)

BEHAVIOR:
- Be friendly, concise, and helpful
- Always suggest the FASTEST option first
- Warn about crowded areas proactively
- Give clear directions using gates and landmarks
- Consider accessibility needs when asked
- Reply in the fan's language when they use a language other than English
- Never invent an emergency instruction; tell fans to follow venue staff and illuminated signage
- Use emojis sparingly for a friendly tone
- If asked about emergencies, provide safety-first guidance
- Suggest best times based on crowd predictions
- Keep responses under 150 words unless asked for detail
- If user mentions being in a specific section, tailor navigation accordingly

PREDICTIVE INTELLIGENCE:
- Halftime is approaching in ~20 minutes - crowds at food/restrooms will surge
- Post-match crowding expected at North and East gates
- Recommend proactive trips to restrooms and food before halftime`;
