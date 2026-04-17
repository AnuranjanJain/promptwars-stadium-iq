import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/components/AppProvider';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';

export const metadata: Metadata = {
  title: 'StadiumIQ — AI-Powered Smart Venue Assistant',
  description: 'Your personal AI concierge for sporting events. Real-time crowd intelligence, smart navigation, queue estimates, and an AI chatbot to make your stadium experience seamless.',
  keywords: 'stadium, AI assistant, crowd management, queue times, smart venue, sporting events',
  authors: [{ name: 'StadiumIQ Team' }],
  openGraph: {
    title: 'StadiumIQ — AI-Powered Smart Venue Assistant',
    description: 'Real-time crowd intelligence and AI-powered assistance for sporting venues.',
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
        <AppProvider>
          <a href="#main-content" className="sr-only">Skip to main content</a>
          <Navbar />
          <main id="main-content">
            {children}
          </main>
          <BottomNav />
        </AppProvider>
      </body>
    </html>
  );
}
