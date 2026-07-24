import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useContent } from '../content/ContentContext';
import { useLanguage } from '../language/LanguageContext';
import TerminalHeader from './TerminalHeader';
import PageRenderer from './PageRenderer';
import EnhancedNavigationBar from './EnhancedNavigationBar';
import AmbientBackdrop from './AmbientBackdrop';
import {
  type Section,
  NAVIGATION_EVENT_NAME,
} from './constants';
import {
  getInitialSection,
  isValidSection,
  updateBrowserHistory,
  setLanguageAttribute,
} from './helpers';

export default function AppContent() {
  const [currentSection, setCurrentSection] = useState<Section>(() => getInitialSection());
  const { isOnline } = useContent();
  const { currentLanguage, isZh } = useLanguage();

  const sections = useMemo(() => [
    { id: 'home' as Section, title: isZh ? '首页' : 'Home', icon: 'monitor' },
    { id: 'projects' as Section, title: isZh ? '项目' : 'Projects', icon: 'activity' },
    { id: 'ai-explore' as Section, title: isZh ? 'AI 探索' : 'AI Explore', icon: 'zap' },
    { id: 'blog' as Section, title: isZh ? '博客' : 'Blog', icon: 'terminal' },
    { id: 'interests' as Section, title: isZh ? '兴趣' : 'Interests', icon: 'globe' },
    { id: 'contact' as Section, title: isZh ? '联系' : 'Contact', icon: 'globe' },
  ], [isZh]);

  const navigateToSection = useCallback((section: Section) => {
    setCurrentSection(section);
    updateBrowserHistory(section);
  }, []);

  useEffect(() => {
    setLanguageAttribute(currentLanguage);

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
  }, [currentLanguage, navigateToSection]);

  return (
    <div className="portfolio-shell">
      <AmbientBackdrop />
      <div className="portfolio-shell__frame">
        <TerminalHeader isZh={isZh} isOnline={isOnline} />

        <EnhancedNavigationBar
          activeSection={currentSection}
          onSectionChange={navigateToSection}
          sections={sections}
          showQuickActions
          enableSearch
          enableThemeToggle
        />

        <main id="main-content" role="main" tabIndex={-1} className="portfolio-main">
          <PageRenderer currentSection={currentSection} />
        </main>
      </div>
    </div>
  );
}
