import React from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { ContentProvider } from './components/content/ContentContext';
import { LanguageProvider } from './components/language/LanguageContext';
import AppContent from './components/app/AppContent';
import { Toaster } from './components/ui/sonner';
import ErrorBoundary from './components/shared/ErrorBoundary';

export default function App() {
  return (
    <div className="app-container">
      <ErrorBoundary>
        <LanguageProvider>
          <ContentProvider>
            <AppContent />
            <Toaster />
            <SpeedInsights />
          </ContentProvider>
        </LanguageProvider>
      </ErrorBoundary>
    </div>
  );
}
