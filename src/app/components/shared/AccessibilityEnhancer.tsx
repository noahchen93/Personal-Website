import React, { useEffect, useState, useCallback } from 'react';
import { Keyboard, Eye, MousePointer, Accessibility } from 'lucide-react';
import { useLanguage } from '../language/LanguageContext';

interface AccessibilitySettings {
  keyboardNavigation: boolean;
  focusVisible: boolean;
  screenReaderSupport: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

interface AccessibilityEnhancerProps {
  showControls?: boolean;
  autoDetect?: boolean;
  onSettingsChange?: (settings: AccessibilitySettings) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const AccessibilityEnhancer: React.FC<AccessibilityEnhancerProps> = ({
  showControls = false,
  autoDetect = true,
  onSettingsChange,
  isOpen = false,
  onClose
}) => {
  const { isZh } = useLanguage();
  const [settings, setSettings] = useState<AccessibilitySettings>({
    keyboardNavigation: false,
    focusVisible: false,
    screenReaderSupport: false,
    highContrast: false,
    reducedMotion: false,
    fontSize: 'medium'
  });
  const [isVisible, setIsVisible] = useState(isOpen);
  const [keyboardUser, setKeyboardUser] = useState(false);
  const [announcements, setAnnouncements] = useState<string[]>([]);

  // 检测键盘用户
  const detectKeyboardUsage = useCallback(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key === 'Enter' || e.key === ' ') {
        setKeyboardUser(true);
        setSettings(prev => ({ ...prev, keyboardNavigation: true, focusVisible: true }));
      }
    };

    const handleMousedown = () => {
      setKeyboardUser(false);
    };

    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('mousedown', handleMousedown);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('mousedown', handleMousedown);
    };
  }, []);

  // 检测屏幕阅读器
  const detectScreenReader = useCallback(() => {
    // 检测常见的屏幕阅读器
    const userAgent = navigator.userAgent.toLowerCase();
    const hasScreenReader = 
      userAgent.includes('nvda') ||
      userAgent.includes('jaws') ||
      userAgent.includes('narrator') ||
      userAgent.includes('voiceover') ||
      window.speechSynthesis;

    if (hasScreenReader) {
      setSettings(prev => ({ ...prev, screenReaderSupport: true }));
      announceToScreenReader(isZh ? '欢迎使用个人作品集网站，已启用无障碍支持' : 'Welcome to the portfolio website, accessibility support enabled');
    }
  }, [isZh]);

  // 检测系统偏好设置
  const detectSystemPreferences = useCallback(() => {
    // 检测高对比度偏好
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      setSettings(prev => ({ ...prev, highContrast: true }));
    }

    // 检测减少动画偏好
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSettings(prev => ({ ...prev, reducedMotion: true }));
    }
  }, []);

  // 自动检测功能
  useEffect(() => {
    if (!autoDetect) return;

    detectKeyboardUsage();
    detectScreenReader();
    detectSystemPreferences();
  }, [autoDetect, detectKeyboardUsage, detectScreenReader, detectSystemPreferences]);

  // 屏幕阅读器公告
  const announceToScreenReader = useCallback((message: string) => {
    setAnnouncements(prev => [...prev, message]);
    
    // 自动清理旧公告
    setTimeout(() => {
      setAnnouncements(prev => prev.slice(1));
    }, 3000);
  }, []);

  // 键盘导航增强
  useEffect(() => {
    if (!settings.keyboardNavigation) return;

    const handleKeydown = (e: KeyboardEvent) => {
      // Escape 键关闭弹窗
      if (e.key === 'Escape') {
        const dialogs = document.querySelectorAll('[role="dialog"], .modal, [data-radix-dialog-content]');
        dialogs.forEach(dialog => {
          if (dialog instanceof HTMLElement && dialog.style.display !== 'none') {
            const closeButton = dialog.querySelector('[data-close], .close, button[aria-label*="close"], button[aria-label*="关闭"]');
            if (closeButton instanceof HTMLElement) {
              closeButton.click();
            }
          }
        });
      }

      // 快捷键导航
      if (e.altKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('navigate', { detail: 'home' }));
            announceToScreenReader(isZh ? '导航到首页' : 'Navigated to home');
            break;
          case '2':
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('navigate', { detail: 'projects' }));
            announceToScreenReader(isZh ? '导航到项目页面' : 'Navigated to projects');
            break;
          case '3':
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('navigate', { detail: 'blog' }));
            announceToScreenReader(isZh ? '导航到博客页面' : 'Navigated to blog');
            break;
          case '4':
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('navigate', { detail: 'interests' }));
            announceToScreenReader(isZh ? '导航到兴趣页面' : 'Navigated to interests');
            break;
          case '5':
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('navigate', { detail: 'ai_explore' }));
            announceToScreenReader(isZh ? '导航到AI探索页面' : 'Navigated to AI explore');
            break;
          case '6':
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('navigate', { detail: 'contact' }));
            announceToScreenReader(isZh ? '导航到联系页面' : 'Navigated to contact');
            break;
          case 'a':
            e.preventDefault();
            if (onClose && isVisible) {
              onClose();
              setIsVisible(false);
            } else {
              setIsVisible(true);
            }
            announceToScreenReader(isZh ? '切换无障碍设置' : 'Accessibility settings toggled');
            break;
        }
      }

      // 快速跳转到主要区域
      if (e.ctrlKey && e.shiftKey) {
        switch (e.key) {
          case 'H':
            e.preventDefault();
            const header = document.querySelector('header, [role="banner"], nav');
            if (header instanceof HTMLElement) {
              header.focus();
              announceToScreenReader(isZh ? '跳转到导航区域' : 'Jumped to navigation');
            }
            break;
          case 'M':
            e.preventDefault();
            const main = document.querySelector('main, [role="main"], .main-content');
            if (main instanceof HTMLElement) {
              main.focus();
              announceToScreenReader(isZh ? '跳转到主要内容' : 'Jumped to main content');
            }
            break;
          case 'F':
            e.preventDefault();
            const footer = document.querySelector('footer, [role="contentinfo"]');
            if (footer instanceof HTMLElement) {
              footer.focus();
              announceToScreenReader(isZh ? '跳转到页脚' : 'Jumped to footer');
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [settings.keyboardNavigation, isZh, announceToScreenReader]);

  // 焦点可视化增强
  useEffect(() => {
    if (!settings.focusVisible) return;

    const style = document.createElement('style');
    style.textContent = `
      *:focus {
        outline: 3px solid #3b82f6 !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3) !important;
        border-radius: 4px !important;
      }
      
      *:focus:not(:focus-visible) {
        outline: none !important;
        box-shadow: none !important;
      }
      
      button:focus,
      a:focus,
      input:focus,
      textarea:focus,
      select:focus,
      [tabindex]:focus {
        background-color: rgba(59, 130, 246, 0.1) !important;
        transition: all 0.2s ease !important;
      }
    `;
    
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, [settings.focusVisible]);

  // 高对比度模式
  useEffect(() => {
    if (!settings.highContrast) return;

    document.documentElement.classList.add('high-contrast');
    
    const style = document.createElement('style');
    style.textContent = `
      .high-contrast {
        filter: contrast(150%) brightness(1.2);
      }
      
      .high-contrast .glass-blue,
      .high-contrast .glass-orange,
      .high-contrast .glass-purple,
      .high-contrast .glass-green,
      .high-contrast .glass-cyan,
      .high-contrast .glass-amber {
        background: rgba(0, 0, 0, 0.8) !important;
        border: 2px solid #ffffff !important;
        color: #ffffff !important;
      }
      
      .high-contrast .terminal-text,
      .high-contrast .terminal-text-white,
      .high-contrast .terminal-text-cyan,
      .high-contrast .terminal-text-yellow {
        color: #ffffff !important;
        text-shadow: 1px 1px 2px #000000 !important;
      }
    `;
    
    document.head.appendChild(style);
    return () => {
      document.documentElement.classList.remove('high-contrast');
      document.head.removeChild(style);
    };
  }, [settings.highContrast]);

  // 减少动画
  useEffect(() => {
    if (!settings.reducedMotion) return;

    const style = document.createElement('style');
    style.textContent = `
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    `;
    
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, [settings.reducedMotion]);

  // 字体大小调整
  useEffect(() => {
    const fontSizes = {
      small: '0.9em',
      medium: '1em',
      large: '1.2em'
    };

    document.documentElement.style.fontSize = fontSizes[settings.fontSize];
  }, [settings.fontSize]);

  // 通知父组件设置变化
  useEffect(() => {
    if (onSettingsChange) {
      onSettingsChange(settings);
    }
  }, [settings, onSettingsChange]);

  // 同步外部状态
  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  // 设置更新函数
  const updateSetting = useCallback((key: keyof AccessibilitySettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    const messages = {
      keyboardNavigation: isZh ? '键盘导航已' : 'Keyboard navigation ',
      focusVisible: isZh ? '焦点可视化已' : 'Focus visibility ',
      screenReaderSupport: isZh ? '屏幕阅读器支持已' : 'Screen reader support ',
      highContrast: isZh ? '高对比度模式已' : 'High contrast mode ',
      reducedMotion: isZh ? '减少动画已' : 'Reduced motion ',
      fontSize: isZh ? '字体大小已调整为' : 'Font size changed to '
    };

    const status = typeof value === 'boolean' 
      ? (value ? (isZh ? '启用' : 'enabled') : (isZh ? '禁用' : 'disabled'))
      : value;

    announceToScreenReader(`${messages[key]}${status}`);
  }, [isZh, announceToScreenReader]);

  if (!showControls) {
    return (
      <>
        {/* 键盘导航指示器 */}
        {keyboardUser && (
          <div className="fixed top-4 left-4 z-50">
            <div className="glass-blue rounded-xl px-3 py-2 border border-blue-400/30">
              <div className="flex items-center space-x-2">
                <Keyboard className="w-4 h-4 text-blue-400" />
                <span className="text-small text-blue-200">
                  {isZh ? '键盘模式' : 'Keyboard Mode'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 屏幕阅读器公告区域 */}
        <div 
          aria-live="polite" 
          aria-atomic="true" 
          className="sr-only"
          role="status"
        >
          {announcements.map((announcement, index) => (
            <div key={index}>{announcement}</div>
          ))}
        </div>

        {/* 跳转链接 */}
        <a 
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-xl"
        >
          {isZh ? '跳转到主要内容' : 'Skip to main content'}
        </a>
      </>
    );
  }

  return (
    <>
      {/* 无障碍控制面板 */}
      {isVisible && (
        <div className="fixed bottom-20 left-4 z-50 w-80">
          <div className="glass-blue rounded-xl p-6 border border-blue-400/30 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-medium text-white flex items-center space-x-2">
                <Accessibility className="w-5 h-5 text-blue-400" />
                <span>{isZh ? '无障碍设置' : 'Accessibility'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsVisible(false);
                  onClose?.();
                }}
                className="text-blue-400 hover:text-blue-300 transition-colors"
                aria-label={isZh ? '关闭设置' : 'Close settings'}
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* 键盘导航 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Keyboard className="w-4 h-4 text-blue-300" />
                  <span className="text-small text-blue-200">
                    {isZh ? '键盘导航' : 'Keyboard Navigation'}
                  </span>
                </div>
                <button
                  onClick={() => updateSetting('keyboardNavigation', !settings.keyboardNavigation)}
                  className={`w-12 h-6 rounded-full transition-all ${
                    settings.keyboardNavigation ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                  aria-pressed={settings.keyboardNavigation}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                    settings.keyboardNavigation ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* 焦点可视化 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-blue-300" />
                  <span className="text-small text-blue-200">
                    {isZh ? '焦点可视化' : 'Focus Visible'}
                  </span>
                </div>
                <button
                  onClick={() => updateSetting('focusVisible', !settings.focusVisible)}
                  className={`w-12 h-6 rounded-full transition-all ${
                    settings.focusVisible ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                  aria-pressed={settings.focusVisible}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                    settings.focusVisible ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* 高对比度 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-white border-2 border-black rounded-sm" />
                  <span className="text-small text-blue-200">
                    {isZh ? '高对比度' : 'High Contrast'}
                  </span>
                </div>
                <button
                  onClick={() => updateSetting('highContrast', !settings.highContrast)}
                  className={`w-12 h-6 rounded-full transition-all ${
                    settings.highContrast ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                  aria-pressed={settings.highContrast}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                    settings.highContrast ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* 减少动画 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MousePointer className="w-4 h-4 text-blue-300" />
                  <span className="text-small text-blue-200">
                    {isZh ? '减少动画' : 'Reduce Motion'}
                  </span>
                </div>
                <button
                  onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
                  className={`w-12 h-6 rounded-full transition-all ${
                    settings.reducedMotion ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                  aria-pressed={settings.reducedMotion}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                    settings.reducedMotion ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* 字体大小 */}
              <div className="space-y-2">
                <span className="text-small text-blue-200">
                  {isZh ? '字体大小' : 'Font Size'}
                </span>
                <div className="flex space-x-2">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => updateSetting('fontSize', size)}
                      className={`px-3 py-1 rounded-xl text-small transition-all ${
                        settings.fontSize === size
                          ? 'bg-blue-500 text-white'
                          : 'bg-blue-500/20 text-blue-200 hover:bg-blue-500/30'
                      }`}
                    >
                      {size === 'small' ? (isZh ? '小' : 'S') :
                       size === 'medium' ? (isZh ? '中' : 'M') :
                       (isZh ? '大' : 'L')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 快捷键提示 */}
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-400/30 rounded-xl">
              <p className="text-small text-blue-300 mb-2">
                {isZh ? '快捷键：' : 'Shortcuts:'}
              </p>
              <div className="text-small text-blue-200 space-y-1">
                <div>Alt+1-6: {isZh ? '页面导航' : 'Page navigation'}</div>
                <div>Alt+A: {isZh ? '无障碍设置' : 'Accessibility'}</div>
                <div>Ctrl+Shift+H/M/F: {isZh ? '区域跳转' : 'Jump to sections'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 屏幕阅读器公告区域 */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        role="status"
      >
        {announcements.map((announcement, index) => (
          <div key={index}>{announcement}</div>
        ))}
      </div>

      {/* 跳转链接 */}
      <a 
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-1/2 focus:transform focus:-translate-x-1/2 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-6 focus:py-3 focus:rounded-xl focus:shadow-lg"
      >
        {isZh ? '跳转到主要内容' : 'Skip to main content'}
      </a>
    </>
  );
};

export default AccessibilityEnhancer;