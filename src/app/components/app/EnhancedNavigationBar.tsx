import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Menu, X, Monitor, Activity, Zap, Terminal, Globe, ChevronDown, 
  Search, Command, Palette, Settings, Share2, Bell, Accessibility
} from 'lucide-react';
import { useLanguage } from '../language/LanguageContext';
import { LanguageToggle } from '../language/LanguageToggle';
import SmartSearch from '../shared/SmartSearch';
import ThemeManager from '../shared/ThemeManager';
import SocialShare from '../shared/SocialShare';
import AccessibilityEnhancer from '../shared/AccessibilityEnhancer';

interface EnhancedNavigationBarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  sections: Array<{
    id: string;
    title: string;
    icon: string;
  }>;
  isMobileMenuOpen: boolean;
  onOpenAdminPanel?: () => void;
  showQuickActions?: boolean;
  enableSearch?: boolean;
  enableThemeToggle?: boolean;
  enableShare?: boolean;
}

interface QuickAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  labelZh: string;
  action: () => void;
  color: string;
  shortcut?: string;
}

const EnhancedNavigationBar: React.FC<EnhancedNavigationBarProps> = ({
  activeSection,
  onSectionChange,
  sections = [],
  isMobileMenuOpen,
  onOpenAdminPanel,
  showQuickActions = true,
  enableSearch = true,
  enableThemeToggle = true,
  enableShare = true
}) => {
  const { isZh, currentLanguage, setLanguage } = useLanguage();
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showThemeManager, setShowThemeManager] = useState(false);
  const [showQuickActionsMenu, setShowQuickActionsMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);

  const mobileNavRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);

  // 快捷操作配置
  const quickActions: QuickAction[] = [
    {
      id: 'language',
      icon: <Globe className="w-4 h-4" />,
      label: 'Language',
      labelZh: '语言',
      action: () => {
        const newLanguage = currentLanguage === 'zh' ? 'en' : 'zh';
        setLanguage(newLanguage);
      },
      color: 'cyan',
      shortcut: 'Ctrl+L'
    },
    {
      id: 'search',
      icon: <Search className="w-4 h-4" />,
      label: 'Search',
      labelZh: '搜索',
      action: () => setShowSearch(true),
      color: 'blue',
      shortcut: 'Ctrl+K'
    },
    {
      id: 'theme',
      icon: <Palette className="w-4 h-4" />,
      label: 'Theme',
      labelZh: '主题',
      action: () => setShowThemeManager(true),
      color: 'purple',
      shortcut: 'Ctrl+T'
    },
    {
      id: 'accessibility',
      icon: <Accessibility className="w-4 h-4" />,
      label: 'Accessibility',
      labelZh: '无障碍',
      action: () => setShowAccessibility(true),
      color: 'green',
      shortcut: 'Alt+A'
    },
    {
      id: 'admin',
      icon: <Settings className="w-4 h-4" />,
      label: 'Admin',
      labelZh: '管理',
      action: () => onOpenAdminPanel?.(),
      color: 'orange',
      shortcut: 'Ctrl+A'
    }
  ];

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 语言切换快捷键 Ctrl+L 或 Cmd+L
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        const newLanguage = currentLanguage === 'zh' ? 'en' : 'zh';
        setLanguage(newLanguage);
      }
      
      // 搜索快捷键 Ctrl+K 或 Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
      
      // 主题快捷键 Ctrl+T 或 Cmd+T
      if ((e.ctrlKey || e.metaKey) && e.key === 't' && e.shiftKey) {
        e.preventDefault();
        setShowThemeManager(true);
      }
      
      // 无障碍设置快捷键 Alt+A
      if (e.altKey && e.key === 'a') {
        e.preventDefault();
        setShowAccessibility(true);
      }
      
      // 管理员快捷键 Ctrl+A 或 Cmd+A
      if ((e.ctrlKey || e.metaKey) && e.key === 'a' && e.shiftKey) {
        e.preventDefault();
        onOpenAdminPanel?.();
      }
      
      // ESC 关闭所有弹窗
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowThemeManager(false);
        setShowAccessibility(false);
        setShowQuickActionsMenu(false);
        setShowMobileNav(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onOpenAdminPanel, currentLanguage, setLanguage]);

  // 关闭移动端导航
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileNavRef.current && !mobileNavRef.current.contains(event.target as Node)) {
        setShowMobileNav(false);
      }
      
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target as Node)) {
        setShowQuickActionsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 路由变化时关闭移动端导航
  useEffect(() => {
    setShowMobileNav(false);
  }, [activeSection]);

  // 获取图标组件
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

  // 搜索导航处理
  const handleSearchNavigate = useCallback((type: string, id: string) => {
    // 根据类型导航到相应页面
    const sectionMap: Record<string, string> = {
      project: 'projects',
      blog: 'blog',
      interest: 'interests',
      'ai-explore': 'ai-explore'
    };
    
    const targetSection = sectionMap[type];
    if (targetSection && sections.find(s => s.id === targetSection)) {
      onSectionChange(targetSection);
      
      // 可以在这里添加滚动到特定项目的逻辑
      setTimeout(() => {
        const element = document.getElementById(`${type}-${id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
    
    setShowSearch(false);
  }, [sections, onSectionChange]);

  // 获取快捷操作按钮颜色
  const getQuickActionColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'btn-glass-blue',
      purple: 'btn-glass-purple',
      orange: 'btn-glass-orange',
      green: 'btn-glass-green',
      cyan: 'btn-glass-cyan'
    };
    return colors[color] || 'btn-glass-blue';
  };

  // 加载状态处理
  if (!sections || sections.length === 0) {
    return (
      <nav className="glass-header border-b border-blue-400/20">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-blue-200 text-small font-terminal animate-pulse">
              {isZh ? '加载导航中...' : 'Loading navigation...'}
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      {/* 桌面端导航 */}
      <nav className="glass-header border-b border-blue-400/20 hidden md:block relative">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* 主导航 */}
            <div className="flex items-center space-x-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => onSectionChange(section.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-terminal text-small transition-all duration-200 ${ 
                    activeSection === section.id
                      ? 'btn-glass-blue text-white shadow-lg'
                      : 'text-blue-200 hover:text-white hover:bg-blue-500/20'
                  }`}
                >
                  {getIcon(section.icon)}
                  <span>&gt; {section.title}</span>
                </button>
              ))}
            </div>

            {/* 快捷搜索 */}
            {enableSearch && (
              <div className="hidden lg:flex items-center mx-4 flex-1 max-w-md">
                <div className="relative w-full">
                  <button
                    onClick={() => setShowSearch(true)}
                    className="w-full px-4 py-2 bg-blue-900/30 border border-blue-400/30 rounded-lg text-left text-blue-300/70 hover:border-blue-400/50 transition-all duration-200 flex items-center space-x-2"
                  >
                    <Search className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 truncate">
                      {isZh ? '搜索项目、博客、兴趣...' : 'Search projects, blogs, interests...'}
                    </span>
                    <div className="hidden sm:flex items-center space-x-1 text-blue-400/50 text-xs">
                      <kbd className="px-1.5 py-0.5 bg-blue-800/30 rounded border border-blue-600/30">
                        {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}
                      </kbd>
                      <kbd className="px-1.5 py-0.5 bg-blue-800/30 rounded border border-blue-600/30">K</kbd>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* 快捷操作 */}
            {showQuickActions && (
              <div className="flex items-center space-x-2">
                {/* 语言切换按钮 */}
                <LanguageToggle 
                  variant="glass"
                />

                {/* 搜索按钮（小屏幕） */}
                {enableSearch && (
                  <button
                    onClick={() => setShowSearch(true)}
                    className="lg:hidden btn-glass-blue p-2 rounded-lg"
                    title={isZh ? '搜索' : 'Search'}
                  >
                    <Search className="w-4 h-4" />
                  </button>
                )}

                {/* 主题切换 */}
                {enableThemeToggle && (
                  <button
                    onClick={() => setShowThemeManager(true)}
                    className="btn-glass-purple p-2 rounded-lg"
                    title={isZh ? '主题' : 'Theme'}
                  >
                    <Palette className="w-4 h-4" />
                  </button>
                )}

                {/* 无障碍设置 */}
                <button
                  onClick={() => setShowAccessibility(true)}
                  className="btn-glass-green p-2 rounded-lg"
                  title={isZh ? '无障碍设置 (Alt+A)' : 'Accessibility Settings (Alt+A)'}
                >
                  <Accessibility className="w-4 h-4" />
                </button>

                {/* 分享 */}
                {enableShare && (
                  <SocialShare 
                    title={sections.find(s => s.id === activeSection)?.title}
                    description={isZh ? '个人作品集网站' : 'Personal Portfolio Website'}
                  />
                )}

                {/* 管理员 */}
                {onOpenAdminPanel && (
                  <button
                    onClick={onOpenAdminPanel}
                    className="btn-glass-orange p-2 rounded-lg"
                    title={isZh ? '管理' : 'Admin'}
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* 终端扫描线效果 */}
        <div className="absolute inset-0 pointer-events-none terminal-scanlines opacity-20"></div>
      </nav>

      {/* 移动端导航 */}
      <nav className="glass-header border-b border-blue-400/20 md:hidden">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* 当前页面信息 */}
            <div className="flex items-center space-x-2 flex-1">
              <div className="text-blue-200 text-small font-terminal">
                [NAV] {sections.find(s => s.id === activeSection)?.title || activeSection.toUpperCase()}
              </div>
            </div>

            {/* 移动端快捷操作 */}
            <div className="flex items-center space-x-2">
              {/* 语言切换按钮 - 移动端 */}
              <LanguageToggle 
                variant="glass"
              />

              {/* 搜索按钮 */}
              {enableSearch && (
                <button
                  onClick={() => setShowSearch(true)}
                  className="btn-glass-blue p-2 rounded-lg"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}

              {/* 无障碍设置 - 移动端 */}
              <button
                onClick={() => setShowAccessibility(true)}
                className="btn-glass-green p-2 rounded-lg"
                title={isZh ? '无障碍设置 (Alt+A)' : 'Accessibility Settings (Alt+A)'}
              >
                <Accessibility className="w-4 h-4" />
              </button>

              {/* 分享按钮 - 移动端专用 */}
              {enableShare && (
                <SocialShare 
                  title={sections.find(s => s.id === activeSection)?.title}
                  description={isZh ? '个人作品集网站' : 'Personal Portfolio Website'}
                />
              )}

              {/* 快捷操作菜单 */}
              <div className="relative" ref={quickActionsRef}>
                <button
                  onClick={() => setShowQuickActionsMenu(!showQuickActionsMenu)}
                  className="btn-glass-purple p-2 rounded-lg"
                >
                  <Command className="w-4 h-4" />
                </button>

                {/* 快捷操作下拉菜单 */}
                {showQuickActionsMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 glass-blue rounded-xl shadow-lg border border-blue-400/30 py-2 z-20">
                    {quickActions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => {
                          action.action();
                          setShowQuickActionsMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-blue-500/20 transition-colors flex items-center space-x-3"
                      >
                        {action.icon}
                        <span className="text-white text-small">
                          {isZh ? action.labelZh : action.label}
                        </span>
                        {action.shortcut && (
                          <span className="text-blue-400/60 text-xs ml-auto">
                            {action.shortcut.replace('Ctrl', navigator.platform.includes('Mac') ? '⌘' : 'Ctrl')}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 菜单按钮 */}
              <button
                onClick={() => setShowMobileNav(!showMobileNav)}
                className="btn-glass-blue p-2 rounded-lg flex items-center space-x-1"
                aria-label={showMobileNav ? 'Close navigation' : 'Open navigation'}
              >
                {showMobileNav ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showMobileNav ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* 移动端导航菜单 */}
          {showMobileNav && (
            <div 
              ref={mobileNavRef}
              className="mt-3 pt-3 border-t border-blue-400/20 animate-in slide-in-from-top-2 duration-200"
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
        
        {/* 终端扫描线效果 */}
        <div className="absolute inset-0 pointer-events-none terminal-scanlines opacity-20"></div>
      </nav>

      {/* 智能搜索组件 */}
      {enableSearch && (
        <SmartSearch
          isOpen={showSearch}
          onClose={() => setShowSearch(false)}
          onNavigate={handleSearchNavigate}
          enableFuzzySearch={true}
          enableContentSearch={true}
          maxResults={8}
        />
      )}

      {/* 主题管理器 */}
      {enableThemeToggle && (
        <ThemeManager
          isOpen={showThemeManager}
          onClose={() => setShowThemeManager(false)}
          showQuickToggle={false}
          enableAutoTheme={true}
          onThemeChange={(theme) => {
            console.log('[Navigation] Theme changed to:', theme.name);
          }}
        />
      )}

      {/* 无障碍设置 */}
      <AccessibilityEnhancer
        showControls={true}
        autoDetect={true}
        isOpen={showAccessibility}
        onClose={() => setShowAccessibility(false)}
        onSettingsChange={(settings) => {
          console.log('[Navigation] Accessibility settings changed:', settings);
        }}
      />

    </>
  );
};

export default EnhancedNavigationBar;