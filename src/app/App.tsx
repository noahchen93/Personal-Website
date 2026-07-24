import React from 'react';
import { AuthProvider } from './components/auth/AuthContext';
import { ContentProvider } from './components/content/ContentContext';
import { LanguageProvider } from './components/language/LanguageContext';
import { SEOProvider } from './components/shared/SEOContext';
import SEOHead from './components/shared/SEOHead';
import AppContent from './components/app/AppContent';
import { Toaster } from './components/ui/sonner';
import ErrorBoundary from './components/shared/ErrorBoundary';

export default function App() {
  return (
    <div className="app-container">
      <ErrorBoundary>
        <LanguageProvider>
          <SEOProvider>
            <AuthProvider>
              <ContentProvider>
                <SEOHead />
                <AppContent />
                <Toaster />
              </ContentProvider>
            </AuthProvider>
          </SEOProvider>
        </LanguageProvider>
      </ErrorBoundary>
    </div>
  );
}
