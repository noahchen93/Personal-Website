import React from 'react';
import { AuthProvider } from '../components/auth/AuthContext';
import { ContentProvider } from '../components/content/ContentContext';
import { LanguageProvider } from '../components/language/LanguageContext';
import AppContent from '../components/app/AppContent';
import { Toaster } from '../components/ui/sonner';

function App() {
  return (
    <div className="app-container">
      <LanguageProvider>
        <AuthProvider>
          <ContentProvider>
            <AppContent />
            <Toaster />
          </ContentProvider>
        </AuthProvider>
      </LanguageProvider>
    </div>
  );
}

export default App;