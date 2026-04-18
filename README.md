<div align="center">
  <h1>🏟️ StadiumIQ</h1>
  <p><strong>Your AI-Powered Personal Stadium Concierge</strong></p>
  <p><em>Built for the Google PromptWars Hackathon 2026</em></p>

  <p>
    <a href="#-the-problem"><img src="https://img.shields.io/badge/Problem-Solving-blue?style=for-the-badge&color=6366f1"></a>
    <a href="#-architecture"><img src="https://img.shields.io/badge/Architecture-Diagram-brightgreen?style=for-the-badge&color=8b5cf6"></a>
    <a href="#-evaluation-criteria"><img src="https://img.shields.io/badge/Hackathon-Criteria-orange?style=for-the-badge&color=ec4899"></a>
    <a href="#-tech-stack"><img src="https://img.shields.io/badge/Tech-Stack-lightgrey?style=for-the-badge&color=14b8a6"></a>
    <a href="#-testing"><img src="https://img.shields.io/badge/Tests-138_Passing-success?style=for-the-badge&color=22c55e"></a>
  </p>
</div>

---

## 🎯 Chosen Vertical

**Physical Event Experience** — Building a smart, dynamic AI assistant for live sporting venue management that helps fans navigate, find services, and avoid crowds in real-time.

---

## 🛑 The Problem

Large-scale physical events and sporting venues struggle with **crowd bottlenecks**, **long queue times**, and **disorientation**. Fans often miss critical moments of the game while blindly searching for the shortest restroom line or wandering huge corridors looking for their seat or food.

## 💡 Approach & Logic

Our approach combines three core strategies:

1. **Context-Aware AI**: Gemini 2.0 Flash is injected with live venue state (crowd density, queue times, game score, POI data) via a structured system prompt — making every AI response spatially and temporally aware.
2. **Real-Time Simulation Engine**: A deterministic crowd simulator generates realistic density fluctuations, queue changes, and game progression, enabling live demo without backend infrastructure.
3. **Predictive Intelligence**: By analyzing crowd trends (increasing/decreasing/stable), the system proactively warns users before congestion peaks — e.g., alerting fans to eat before halftime.
4. **Graceful Degradation**: Every external service (Gemini, Firebase, Maps) has a local fallback, ensuring 100% uptime even without API keys.
5. **Multi-Modal AI**: Text chat + image-based location detection (Gemini Vision) + AI crowd insights provide three distinct AI/ML touchpoints.

## 🚀 Our Solution: StadiumIQ

**StadiumIQ** solves venue friction by putting an omniscient, AI-powered stadium concierge in every attendee's pocket. It eliminates guesswork by providing real-time crowd heatmaps, smart navigation, and predictive queue AI. 

<details>
<summary><strong>✨ Click to view key features</strong></summary>

- **🤖 Stadium Buddy (Gemini AI)**: A chatbot that knows exactly what's happening. Ask it, *"Where is the closest restroom?"* and it analyzes 22 live queues to give you the fastest option.
- **👁️ "Where Am I?" (Gemini Vision)**: Lost? Snap a photo of your surroundings, and Gemini Vision analyzes it against the stadium model to tell you where you are and how to navigate.
- **🗺️ Live Heatmaps (Maps JS API)**: Custom vector map overlays showing current crowd density in 8 different venue zones, updating every 5 seconds.
- **⏱️ Predictive Queues**: Simulated real-time queue synchronization that warns fans *before* the rush hits (e.g., *"Halftime in 10 mins. Food lines will 3x. Go now!"*).
- **🔮 AI Crowd Insights (Gemini)**: AI-powered natural-language crowd analysis that summarizes venue conditions and provides actionable intelligence beyond raw data.
- **📊 Firebase Analytics Pipeline**: Structured event tracking and crowd snapshot persistence via Firestore for historical analysis and trend prediction.
- **♿ Accessible Navigation**: Smart wayfinding algorithm that actively calculates paths **around** dense crowds, or strictly routes via elevators/ramps for accessibility.
</details>

---

## 🧠 System Architecture

```mermaid
graph TD
    Client[📱 Client App<br/>Next.js Server Components]
    
    subgraph Google Services
        Gemini[🧠 Gemini 2.0 Flash<br/>Text, Vision & Crowd Insight APIs]
        Maps[🗺️ Google Maps JS API<br/>Vector & Custom Layers]
        Firebase[🔥 Firebase<br/>Auth, Firestore & Analytics]
    end

    subgraph Backend Logic
        API[⚡ Next.js API Routes]
        Sim[⚙️ Crowd & Queue Simulator Engine]
        Analytics[📊 Analytics Pipeline]
    end

    Client <-->|Live Updates| Sim
    Client <-->|Interacts| Maps
    Client <-->|Chat & Images| API
    
    API <-->|Context & Prompts| Gemini
    API <-->|Auth & DB| Firebase
    Analytics <-->|Events & Snapshots| Firebase
    
    Sim -.->|Feeds data to| Client
```

---

## 📂 Project Structure

```text
stadium-iq/
├── public/                 # Static assets (icons, manifests)
├── src/
│   ├── __tests__/          # Comprehensive test suites (138 tests)
│   │   ├── api/            # API route integration tests
│   │   ├── lib/            # Core library unit tests
│   │   └── utils/          # Utility function tests
│   ├── app/                # Next.js 14 App Router
│   │   ├── api/            # Serverless backend routes
│   │   │   ├── chat/       # Gemini AI endpoint handler
│   │   │   └── analytics/  # Firebase analytics pipeline
│   │   ├── chat/           # Chatbot UI & logic
│   │   ├── feed/           # Gamified events & live feed
│   │   ├── map/            # Google Maps heatmap interface
│   │   ├── navigate/       # Smart wayfinding UI
│   │   ├── queues/         # Wait time dashboard
│   │   ├── globals.css     # Bespoke Design System & Tokens
│   │   ├── layout.tsx      # Root provider & standard layout
│   │   └── page.tsx        # Homepage dashboard
│   ├── components/         # Reusable atomic UI elements
│   │   ├── ErrorBoundary.tsx   # Graceful error handling
│   │   ├── AppProvider.tsx     # Global state & theme provider
│   │   └── layout/            # Navigation components
│   ├── lib/                # Core service integrations
│   │   ├── analytics.ts    # Firebase event tracking & page views
│   │   ├── crowd-simulator.ts  # Generates realistic live crowd fluctuations
│   │   ├── firebase.ts     # Firebase client + Firestore persistence
│   │   ├── gemini.ts       # Gemini API client, prompts & crowd insights
│   │   └── venue-data.ts   # Core venue Graph (Nodes & POIs)
│   ├── types/              # strict TypeScript interfaces
│   └── utils/              # Calculation helpers (Haversine, etc.)
├── jest.config.ts          # Test configuration
└── package.json            # Dependencies
```

---

## 🏆 Meeting the Hackathon Evaluation Criteria

### 1. Meaningful Google Services Integration
We didn't just drop an iframe of a map. We deeply integrated five core Google tools:
- **Gemini API (Text Mode)**: Acts as the brain of the "Stadium Buddy", injected structurally with the live `GameState`, `VenueGraph`, and `CrowdDensity` states.
- **Gemini API (Vision Mode)**: Used as a spatial fallback; users upload photos so the AI can act as a visual GPS.
- **Gemini API (Crowd Intelligence)**: `generateCrowdInsight()` analyzes live crowd density data to produce natural-language summaries and actionable recommendations — demonstrating AI/ML integration beyond simple chat.
- **Google Maps Platform**: Used to render a live, zone-based spatial heat grid directly over the venue.
- **Firebase (Auth + Firestore + Analytics)**:
  - **Anonymous Auth**: Seamless user identification without friction.
  - **Firestore Writes**: `writeCrowdSnapshot()` persists crowd state for historical analysis.
  - **Firestore Reads**: `getCrowdHistory()` retrieves trend data for prediction models.
  - **Analytics Pipeline**: Structured event logging (`logEvent`, `logPageView`, `logInteraction`) tracks user behavior across all features, with server-side batch processing via the `/api/analytics` route.

### 2. Code Quality & Clean Architecture
- **Strictly Typed**: Built top-to-bottom in TypeScript ensuring stable component props and predictive API responses (`/src/types/index.ts`).
- **JSDoc Documentation**: Every exported function across `lib/`, `utils/`, and API routes has comprehensive JSDoc documentation with examples.
- **Error Boundaries**: Application-level `ErrorBoundary` component ensures graceful failure handling — fans never see a blank screen.
- **Separation of Concerns**: Extracted simulation engines (`crowd-simulator`), SDK inits (`lib/xyz`), and UI components (`app/xyz`) into isolated modules.
- **No Reliance on CSS Frameworks**: Avoided Tailwind block-bloat by utilizing clean, scoped Vanilla CSS Modules with a custom `--css-var` tokenized design system.

### 3. Efficiency & Optimal Resource Use
- Relies heavily on **Server-Side API Routes** to obscure API keys, format requests securely, and handle the heavy lifting.
- Components are heavily memoized using React's `useMemo` hooks (e.g., sorting the Queue table instantly on the client side without refetching data).
- Custom debounce hooks handle map zooms to prevent over-pinging map tile APIs.
- Firebase batch writes in the analytics pipeline minimize network overhead.

### 4. Testing Strategy
- **138 automated tests** across **7 test suites** covering:
  - **Utility functions** (9 functions, 100% coverage): Distance calculations, formatting, density levels, wait severity, time formatting
  - **Simulation engine** (4 functions, 87% coverage): Crowd updates, queue changes, game progression, predictions
  - **Venue data integrity** (25+ assertions): POI uniqueness, valid categories, correct data bounds, trivia validity
  - **Gemini AI client** (13 tests): Fallback response system, all 6 keyword categories, vision fallback, crowd insights
  - **Firebase client** (4 tests): Singleton behavior, graceful auth fallback
  - **Chat API route** (6 tests): Validation, text/vision handling, history support, error recovery
  - **Analytics & Insights** (7 tests): Crowd insight generation, busiest/quietest zone detection
- Test command: `npm test` (with coverage report)

### 5. Accessibility (A11y) Focus
- The `AppProvider` includes dedicated **Screen Reader**, **Reduced Motion**, and **High Contrast** state toggles.
- Deep focus on **Accessible Wayfinding**: The navigation algorithm dynamically flags and drops staircases from nodes when `accessibleRoute = true`.
- Forms utilize HTML native ARIA labels for seamless e-reader navigation.
- Skip-to-content link and semantic `role` attributes on all major sections.

### 6. Security & Safety
- **Safe Keys**: All API keys are stored server-side via Next.js `/api/` proxy routes (`.env.local`), ensuring `process.env` secrets never leak into client bundles.
- **Input Validation**: API routes validate request bodies and return proper HTTP status codes.
- **Error Boundaries**: Application-level error catching prevents crash exposure.
- **Fallback Simulation**: If API limits are hit during demos, the system gracefully falls back to a deterministic local engine rather than crashing, ensuring 100% demo uptime.

---

## 🧪 Testing

StadiumIQ has a comprehensive automated test suite built with **Jest** and designed for CI/CD pipelines.

```bash
# Run all tests with coverage report
npm test

# Watch mode for development
npm run test:watch

# CI mode with machine-readable output
npm run test:ci
```

**Test Coverage Summary:**

| Module | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| `utils/helpers.ts` | 100% | 100% | 100% | 100% |
| `lib/venue-data.ts` | 100% | 100% | 100% | 100% |
| `lib/crowd-simulator.ts` | 85% | 79% | 100% | 88% |
| `app/api/chat/route.ts` | 87% | 100% | 100% | 87% |
| `lib/gemini.ts` | 65% | 80% | 91% | 64% |
| `lib/firebase.ts` | 58% | 90% | 44% | 59% |

---

## 💻 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router format for fast SSR)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **AI Tools**: [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai) (Gemini 2.0 Flash — Text, Vision & Insights)
- **Mapping**: [@googlemaps/js-api-loader](https://www.npmjs.com/package/@googlemaps/js-api-loader)
- **Realtime / Auth / Analytics**: [Firebase](https://firebase.google.com/) (Firestore, Auth, Analytics pipeline)
- **Testing**: [Jest](https://jestjs.io/) + [ts-jest](https://kulshekhar.github.io/ts-jest/)
- **Deployment**: [Vercel](https://vercel.com)

---

## 🛠️ Quick Start

**1. Clone the repository**
```bash
git clone https://github.com/AnuranjanJain/promptwars-stadium-iq.git
cd promptwars-stadium-iq
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure Environment**
Copy `.env.example` to `.env.local` and add your **Gemini API Key**:
```env
GEMINI_API_KEY=your_gemini_key_here
```
*(Note: If no API key is provided, the application will cleverly use a fallback offline engine so it is always presentable!)*

**4. Run Tests**
```bash
npm test
```

**5. Start the Application**
```bash
npm run dev
```

Browse to `http://localhost:3000` and enjoy the smart venue experience!

---

## 📝 Assumptions Made

1. **Simulated Environment**: Since we don't have a real stadium deployment, crowd density, queue times, and game state are generated by a deterministic simulation engine that mimics realistic patterns.
2. **Offline-First**: The application is designed to work fully without API keys by using intelligent fallback responses — this ensures judges can evaluate the complete experience without configuring credentials.
3. **Single Venue**: The solution is architected around a single venue (National Arena, 60,000 seats) but the modular design allows easy extension to multiple venues.
4. **Mobile-First**: The UI is optimized for mobile-first usage (fans at a stadium) with responsive desktop support.
5. **Anonymous Users**: Firebase Anonymous Auth is used for frictionless user identification — no sign-up required to use the app.
6. **Demo Data**: Menu prices, team names, and trivia questions use fictional but realistic data to demonstrate the full feature set.
