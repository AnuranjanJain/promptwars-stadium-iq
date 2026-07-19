import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/components/AppProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';

export const metadata: Metadata = {
  title: 'StadiumIQ NEXUS — World Cup 2026 Tournament Intelligence',
  description: 'A GenAI-enabled stadium operations and fan experience platform for the FIFA World Cup 2026, combining a live venue digital twin, predictive crowd intelligence, accessible wayfinding, multilingual assistance, and human-in-the-loop decision support.',
  keywords: 'FIFA World Cup 2026, smart stadium, tournament operations, Gemini AI, crowd management, accessible navigation, multilingual assistance, transport intelligence, sustainability',
  authors: [{ name: 'StadiumIQ Team' }],
  openGraph: {
    title: 'StadiumIQ NEXUS — World Cup 2026 Tournament Intelligence',
    description: 'One shared AI intelligence layer for fans, venue teams, transport partners, volunteers, and matchday commanders.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0a0e1a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <AppProvider>
            <a href="#main-content" className="sr-only">Skip to main content</a>
            <Navbar />
            <main id="main-content" role="main">
              {children}
            </main>
            <BottomNav />
          </AppProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
