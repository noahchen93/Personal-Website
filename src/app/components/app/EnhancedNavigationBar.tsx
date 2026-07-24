import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Accessibility,
  Activity,
  Globe,
  Menu,
  Monitor,
  Palette,
  Search,
  Terminal,
  X,
  Zap,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useLanguage } from '../language/LanguageContext';
import SmartSearch from '../shared/SmartSearch';
import ThemeManager from '../shared/ThemeManager';
import AccessibilityEnhancer from '../shared/AccessibilityEnhancer';

interface NavigationSection {
  id: string;
  title: string;
  icon: string;
}

interface EnhancedNavigationBarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  sections: NavigationSection[];
  showQuickActions?: boolean;
  enableSearch?: boolean;
  enableThemeToggle?: boolean;
}

const iconMap: Record<string, React.ElementType> = {
  monitor: Monitor,
  activity: Activity,
  zap: Zap,
  terminal: Terminal,
  globe: Globe,
};

export default function EnhancedNavigationBar({
  activeSection,
  onSectionChange,
  sections,
  showQuickActions = true,
  enableSearch = true,
  enableThemeToggle = true,
}: EnhancedNavigationBarProps) {
  const { isZh, currentLanguage, setLanguage } = useLanguage();
  const reduceMotion = useReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showThemeManager, setShowThemeManager] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const toggleLanguage = useCallback(() => {
    setLanguage(currentLanguage === 'zh' ? 'en' : 'zh');
  }, [currentLanguage, setLanguage]);

  const selectSection = useCallback((section: string) => {
    onSectionChange(section);
    setMobileOpen(false);
  }, [onSectionChange]);

  const handleSearchNavigate = useCallback((type: string, id: string) => {
    const sectionMap: Record<string, string> = {
      project: 'projects',
      blog: 'blog',
      interest: 'interests',
      'ai-explore': 'ai-explore',
    };
    const target = sectionMap[type];

    if (target) {
      selectSection(target);
      window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 420);
    }
    setShowSearch(false);
  }, [selectSection]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setShowSearch(true);
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'l') {
        event.preventDefault();
        toggleLanguage();
      }
      if (event.altKey && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        setShowAccessibility(true);
      }
      if (event.key === 'Escape') {
        setMobileOpen(false);
        setShowSearch(false);
        setShowThemeManager(false);
        setShowAccessibility(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleLanguage]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <>
      <nav className="portfolio-nav" aria-label={isZh ? '主导航' : 'Primary navigation'}>
        <div className="portfolio-nav__inner">
          <div className="portfolio-nav__desktop">
            <div className="portfolio-nav__links">
              {sections.map((section) => {
                const Icon = iconMap[section.icon] || Monitor;
                const active = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    className={`portfolio-nav__link ${active ? 'is-active' : ''}`}
                    onClick={() => selectSection(section.id)}
                    aria-current={active ? 'page' : undefined}
                  >
                    {active && (
                      <motion.span
                        layoutId="portfolio-active-nav"
                        className="portfolio-nav__active-pill"
                        transition={{ type: 'spring', stiffness: 460, damping: 38 }}
                      />
                    )}
                    <Icon aria-hidden="true" />
                    <span>{section.title}</span>
                  </button>
                );
              })}
            </div>

            <div className="portfolio-nav__actions">
              {enableSearch && (
                <button
                  type="button"
                  className="portfolio-search-trigger"
                  onClick={() => setShowSearch(true)}
                  aria-label={isZh ? '搜索内容' : 'Search content'}
                >
                  <Search aria-hidden="true" />
                  <span>{isZh ? '搜索' : 'Search'}</span>
                  <kbd>{navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} K</kbd>
                </button>
              )}

              <button
                type="button"
                className="portfolio-icon-button portfolio-language-button"
                onClick={toggleLanguage}
                aria-label={isZh ? 'Switch to English' : '切换至中文'}
              >
                <Globe aria-hidden="true" />
                <span>{isZh ? 'EN' : '中文'}</span>
              </button>

              {showQuickActions && enableThemeToggle && (
                <button
                  type="button"
                  className="portfolio-icon-button"
                  onClick={() => setShowThemeManager(true)}
                  aria-label={isZh ? '界面主题' : 'Interface theme'}
                >
                  <Palette aria-hidden="true" />
                </button>
              )}

              {showQuickActions && (
                <button
                  type="button"
                  className="portfolio-icon-button"
                  onClick={() => setShowAccessibility(true)}
                  aria-label={isZh ? '无障碍设置' : 'Accessibility settings'}
                >
                  <Accessibility aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          <div className="portfolio-nav__mobile" ref={mobileMenuRef}>
            <button
              type="button"
              className="portfolio-nav__current"
              onClick={() => setMobileOpen((open) => !open)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-portfolio-navigation"
            >
              <span className="portfolio-nav__eyebrow">{isZh ? '浏览' : 'Explore'}</span>
              <span>{sections.find((section) => section.id === activeSection)?.title}</span>
            </button>

            <div className="portfolio-nav__mobile-actions">
              {enableSearch && (
                <button
                  type="button"
                  className="portfolio-icon-button"
                  onClick={() => setShowSearch(true)}
                  aria-label={isZh ? '搜索内容' : 'Search content'}
                >
                  <Search aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                className="portfolio-icon-button portfolio-language-button"
                onClick={toggleLanguage}
                aria-label={isZh ? 'Switch to English' : '切换至中文'}
              >
                <span>{isZh ? 'EN' : '中'}</span>
              </button>
              <button
                type="button"
                className="portfolio-menu-button"
                onClick={() => setMobileOpen((open) => !open)}
                aria-label={mobileOpen ? (isZh ? '关闭导航' : 'Close navigation') : (isZh ? '打开导航' : 'Open navigation')}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
              </button>
            </div>

            <AnimatePresence>
              {mobileOpen && (
                <motion.div
                  id="mobile-portfolio-navigation"
                  className="portfolio-mobile-menu"
                  initial={reduceMotion ? false : { opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: reduceMotion ? 0 : 0.2 }}
                >
                  <div className="portfolio-mobile-menu__links">
                    {sections.map((section, index) => {
                      const Icon = iconMap[section.icon] || Monitor;
                      const active = activeSection === section.id;
                      return (
                        <button
                          key={section.id}
                          type="button"
                          className={active ? 'is-active' : ''}
                          onClick={() => selectSection(section.id)}
                          aria-current={active ? 'page' : undefined}
                        >
                          <span className="portfolio-mobile-menu__index">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <Icon aria-hidden="true" />
                          <span>{section.title}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="portfolio-mobile-menu__tools">
                    {enableThemeToggle && (
                      <button type="button" onClick={() => setShowThemeManager(true)}>
                        <Palette aria-hidden="true" />
                        {isZh ? '主题' : 'Theme'}
                      </button>
                    )}
                    <button type="button" onClick={() => setShowAccessibility(true)}>
                      <Accessibility aria-hidden="true" />
                      {isZh ? '无障碍' : 'Accessibility'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {enableSearch && (
        <SmartSearch
          isOpen={showSearch}
          onClose={() => setShowSearch(false)}
          onNavigate={handleSearchNavigate}
          enableFuzzySearch
          enableContentSearch
          maxResults={8}
        />
      )}

      {enableThemeToggle && (
        <ThemeManager
          isOpen={showThemeManager}
          onClose={() => setShowThemeManager(false)}
          showQuickToggle={false}
          enableAutoTheme
        />
      )}

      <AccessibilityEnhancer
        showControls
        autoDetect
        isOpen={showAccessibility}
        onClose={() => setShowAccessibility(false)}
        onSettingsChange={(settings) => {
          localStorage.setItem('accessibility-settings', JSON.stringify(settings));
        }}
      />
    </>
  );
}
