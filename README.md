# StadiumIQ

**PromptWars 2026 Hackathon Submission by Google**  
**Challenge**: Improve the physical event experience at large-scale sporting venues.

StadiumIQ is a smart, dynamic progressive web application designed to act as a personal "stadium concierge." It solves pain points like crowd bottlenecks, long queue times, and poor navigation through deep integration with Google Services.

## ✨ Features (What makes it unique?)

1. **Stadium Buddy (AI Chatbot)**: A Gemini 2.0-powered assistant that knows your seat, real-time venue status, and ongoing game stats.
2. **"Where Am I?" AI Vision**: Lost in the stadium? Upload a photo and Stadium Buddy analyzes it using Gemini Vision to tell you exactly where you are and how to navigate.
3. **Predictive Crowd Intelligence**: Anticipates rushes (like halftime) and proactively alerts users to grab food early.
4. **Live Venue Map**: An overlay on Google Maps showcasing zones painted by current density (Green/Yellow/Red) updating in real time.
5. **Smart Queue Estimator**: Live metrics and wait times for every POI (Food, Restroom, Merch).
6. **Smart Navigation**: Crowd-aware routing that suggests alternative paths to avoid dense zones or strictly selects accessible routes.
7. **Live Event Feed & Gamification**: A live unified timeline with game scores, alerts, and trivia to keep fans engaged.

## 🛠️ Tech Stack & Google Services

- **Frontend**: Next.js 14, React, Vanilla CSS Modules
- **Design Mode**: Glassmorphism, Premium Dark UI, fully responsive
- **AI Backend**: **Google Gemini API** (Conversational AI + Vision Model)
- **Maps**: **Google Maps JS API**
- **Architecture**: Simulated Real-time Data processing simulating Firebase Firestore real-time web listeners.

## 🚀 Getting Started

1. Clone the repository.
   ```bash
   git clone <your-repo-link>
   cd stadium-iq
   ```

2. Install dependencies.
   ```bash
   npm install
   ```

3. Set up environment variables.
   Rename `.env.example` to `.env.local` and add your Google Gemini API Key. The app falls back to a simulated demo mode if no key is provided.

4. Run the development server.
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Evaluation Focus Highlights

- **Code Quality**: Built cleanly using TypeScript, proper React patterns, and atomic styling.
- **Efficiency**: State logic is optimized, components memoized where necessary, and animations strictly hardware-accelerated.
- **Accessibility**: Includes features like "Accessible Routes" in navigation, logical DOM outline, and visual indicators.
- **Google Services**: Integration goes beyond trivial mapping to leverage Gemini's context-aware and image-understanding capabilities.
