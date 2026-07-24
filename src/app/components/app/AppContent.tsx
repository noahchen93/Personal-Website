import React, { useEffect, useState } from 'react';
import { useContent } from '../content/ContentContext';
import { useLanguage, useTexts } from '../language/LanguageContext';
import TerminalHeader from './TerminalHeader';
import PageRenderer from './PageRenderer';
import CRTEffects from './CRTEffects';
import LoadingScreen from './LoadingScreen';
import AccessibilityEnhancer from '../shared/AccessibilityEnhancer';
import EnhancedNavigationBar from './EnhancedNavigationBar';
import {
  type Section,
  NAVIGATION_EVENT_NAME,
  LOADING_DELAY,
  TIME_UPDATE_INTERVAL,
} from './constants';
import {
  getInitialSection,
  isValidSection,
  updateBrowserHistory,
  setLanguageAttribute,
} from './helpers';

export default function AppContent() {
  const [currentSection, setCurrentSection] = useState<Section>('home');
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const { isOnline } = useContent();
  const { currentLanguage, isZh } = useLanguage();
  const texts = useTexts();

  const sections = [
    { id: 'home' as Section, title: isZh ? '首页' : 'Home', icon: 'monitor' },
    { id: 'projects' as Section, title: isZh ? '项目' : 'Projects', icon: 'activity' },
    { id: 'ai-explore' as Section, title: isZh ? 'AI探索' : 'AI Explore', icon: 'zap' },
    { id: 'blog' as Section, title: isZh ? '博客' : 'Blog', icon: 'terminal' },
    { id: 'interests' as Section, title: isZh ? '兴趣' : 'Interests', icon: 'globe' },
    { id: 'contact' as Section, title: isZh ? '联系' : 'Contact', icon: 'globe' },
  ];

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), TIME_UPDATE_INTERVAL);
    return () => window.clearInterval(timer);
  }, []);

  const navigateToSection = (section: Section) => {
    setCurrentSection(section);
    setIsMobileMenuOpen(false);
    updateBrowserHistory(section);
  };

  useEffect(() => {
    setLanguageAttribute(currentLanguage);

    const initializeApp = async () => {
      try {
        setCurrentSection(getInitialSection());
        await new Promise((resolve) => window.setTimeout(resolve, LOADING_DELAY));
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();

    const handleNavigate = (event: Event) => {
      const section = (event as CustomEvent<string>).detail;
      if (isValidSection(section)) navigateToSection(section);
    };

    const handlePopState = (event: PopStateEvent) => {
      const section = (event.state?.section || 'home') as string;
      if (isValidSection(section)) setCurrentSection(section);
    };

    window.addEventListener(NAVIGATION_EVENT_NAME, handleNavigate);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener(NAVIGATION_EVENT_NAME, handleNavigate);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentLanguage]);

  if (isLoading) {
    return <LoadingScreen loadingText={texts.common.loading} />;
  }

  return (
    <div className="min-h-screen text-green-400 font-terminal">
      <div className="h-screen flex flex-col">
        <TerminalHeader isZh={isZh} isOnline={isOnline} />

        <EnhancedNavigationBar
          activeSection={currentSection}
          onSectionChange={navigateToSection}
          sections={sections}
          isMobileMenuOpen={isMobileMenuOpen}
          showQuickActions
          enableSearch
          enableThemeToggle
          enableShare
        />

        <main id="main-content" role="main" tabIndex={-1}>
          <PageRenderer currentSection={currentSection} />
        </main>

        <CRTEffects />
      </div>

      <AccessibilityEnhancer
        showControls
        autoDetect
        onSettingsChange={(settings) => {
          localStorage.setItem('accessibility-settings', JSON.stringify(settings));
        }}
      />
    </div>
  );
}
