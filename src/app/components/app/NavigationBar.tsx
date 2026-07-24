import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, Monitor, Activity, Zap, Terminal, Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '../language/LanguageContext';

interface NavigationBarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  sections: Array<{
    id: string;
    title: string;
    icon: string;
  }>;
  isMobileMenuOpen: boolean;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  activeSection,
  onSectionChange,
  sections = [],
  isMobileMenuOpen
}) => {
  const { isZh } = useLanguage();
  const [showMobileNav, setShowMobileNav] = useState(false);
  const mobileNavRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileNavRef.current && !mobileNavRef.current.contains(event.target as Node)) {
        setShowMobileNav(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  useEffect(() => {
    setShowMobileNav(false);
  }, [activeSection]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'monitor': return <Monitor className="w-4 h-4" />;
      case 'activity': return <Activity className="w-4 h-4" />;
      case 'zap': return <Zap className="w-4 h-4" />;
      case 'terminal': return <Terminal className="w-4 h-4" />;
      case 'globe': return <Globe className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  // Early return if sections is not properly loaded
  if (!sections || sections.length === 0) {
    return (
      <nav className="glass-header border-b border-blue-400/20">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-blue-200 text-small font-terminal">
              {isZh ? '加载导航中...' : 'Loading navigation...'}
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>

      <nav className="glass-header border-b border-blue-400/20 hidden md:block">
        <div className="px-4 py-3">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => onSectionChange(section.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-terminal text-small transition-all duration-200 ${
                    activeSection === section.id
                      ? 'btn-glass-blue text-white'
                      : 'text-blue-200 hover:text-white hover:bg-blue-500/20'
                  }`}
                >
                  {getIcon(section.icon)}
                  <span>&gt; {section.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Terminal Scanlines Effect */}
        <div className="absolute inset-0 pointer-events-none terminal-scanlines opacity-20"></div>
      </nav>


      <nav className="glass-header border-b border-blue-400/20 md:hidden">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-blue-200 text-small font-terminal">
              [NAV] {sections.find(s => s.id === activeSection)?.title || activeSection.toUpperCase()}
            </div>
            
            <button
              onClick={() => setShowMobileNav(!showMobileNav)}
              className="btn-glass-blue p-2 rounded-lg flex items-center space-x-1"
              aria-label={showMobileNav ? 'Close navigation' : 'Open navigation'}
            >
              {showMobileNav ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showMobileNav ? 'rotate-180' : ''}`} />
            </button>
          </div>


          {showMobileNav && (
            <div 
              ref={mobileNavRef}
              className="mt-3 pt-3 border-t border-blue-400/20"
            >
              <div className="grid grid-cols-2 gap-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => onSectionChange(section.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-terminal text-small transition-all duration-200 text-left ${
                      activeSection === section.id
                        ? 'btn-glass-blue text-white'
                        : 'text-blue-200 hover:text-white hover:bg-blue-500/20'
                    }`}
                  >
                    {getIcon(section.icon)}
                    <span>{section.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Terminal Scanlines Effect */}
        <div className="absolute inset-0 pointer-events-none terminal-scanlines opacity-20"></div>
      </nav>
    </>
  );
};

export default NavigationBar;