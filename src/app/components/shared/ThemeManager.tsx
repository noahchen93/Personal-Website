import React, { useState, useEffect, useCallback } from 'react';
import { Palette, Monitor, Sun, Moon, Zap, Settings, Check, RefreshCw } from 'lucide-react';
import { useLanguage } from '../language/LanguageContext';

interface Theme {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  preview: string[];
  className: string;
}

interface ThemeManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeChange?: (theme: Theme) => void;
  showQuickToggle?: boolean;
  enableAutoTheme?: boolean;
}

const themes: Theme[] = [
  {
    id: 'default',
    name: 'Cyber Blue',
    nameZh: '赛博蓝',
    description: 'Classic terminal blue theme',
    descriptionZh: '经典终端蓝色主题',
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af',
    accentColor: '#60a5fa',
    backgroundColor: '#0a0e1a',
    textColor: '#e2e8f0',
    preview: ['#3b82f6', '#1e40af', '#60a5fa'],
    className: 'theme-cyber-blue'
  },
  {
    id: 'matrix-green',
    name: 'Matrix Green',
    nameZh: '矩阵绿',
    description: 'Classic matrix green terminal',
    descriptionZh: '经典矩阵绿色终端',
    primaryColor: '#22c55e',
    secondaryColor: '#15803d',
    accentColor: '#4ade80',
    backgroundColor: '#0a0e0a',
    textColor: '#dcfce7',
    preview: ['#22c55e', '#15803d', '#4ade80'],
    className: 'theme-matrix-green'
  },
  {
    id: 'neon-purple',
    name: 'Neon Purple',
    nameZh: '霓虹紫',
    description: 'Futuristic neon purple theme',
    descriptionZh: '未来霓虹紫色主题',
    primaryColor: '#8b5cf6',
    secondaryColor: '#7c3aed',
    accentColor: '#a78bfa',
    backgroundColor: '#0f0a1a',
    textColor: '#f3e8ff',
    preview: ['#8b5cf6', '#7c3aed', '#a78bfa'],
    className: 'theme-neon-purple'
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    nameZh: '夕阳橙',
    description: 'Warm sunset orange theme',
    descriptionZh: '温暖夕阳橙色主题',
    primaryColor: '#f97316',
    secondaryColor: '#ea580c',
    accentColor: '#fb923c',
    backgroundColor: '#1a0f0a',
    textColor: '#fed7aa',
    preview: ['#f97316', '#ea580c', '#fb923c'],
    className: 'theme-sunset-orange'
  },
  {
    id: 'arctic-cyan',
    name: 'Arctic Cyan',
    nameZh: '极地青',
    description: 'Cool arctic cyan theme',
    descriptionZh: '冷调极地青色主题',
    primaryColor: '#06b6d4',
    secondaryColor: '#0891b2',
    accentColor: '#22d3ee',
    backgroundColor: '#0a1419',
    textColor: '#cffafe',
    preview: ['#06b6d4', '#0891b2', '#22d3ee'],
    className: 'theme-arctic-cyan'
  },
  {
    id: 'crimson-red',
    name: 'Crimson Red',
    nameZh: '深红',
    description: 'Bold crimson red theme',
    descriptionZh: '大胆深红色主题',
    primaryColor: '#dc2626',
    secondaryColor: '#b91c1c',
    accentColor: '#ef4444',
    backgroundColor: '#1a0a0a',
    textColor: '#fecaca',
    preview: ['#dc2626', '#b91c1c', '#ef4444'],
    className: 'theme-crimson-red'
  }
];

const ThemeManager: React.FC<ThemeManagerProps> = ({
  isOpen,
  onClose,
  onThemeChange,
  showQuickToggle = true,
  enableAutoTheme = true
}) => {
  const { isZh } = useLanguage();
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [favoriteThemes, setFavoriteThemes] = useState<string[]>([]);
  const [transitionDuration, setTransitionDuration] = useState(300);

  // 加载保存的主题设置
  useEffect(() => {
    const savedThemeId = localStorage.getItem('terminal-theme');
    const savedAutoMode = localStorage.getItem('auto-theme-mode') === 'true';
    const savedFavorites = JSON.parse(localStorage.getItem('favorite-themes') || '[]');
    const savedTransition = parseInt(localStorage.getItem('theme-transition-duration') || '300');

    if (savedThemeId) {
      const theme = themes.find(t => t.id === savedThemeId) || themes[0];
      setCurrentTheme(theme);
      applyTheme(theme);
    }

    setIsAutoMode(savedAutoMode);
    setFavoriteThemes(savedFavorites);
    setTransitionDuration(savedTransition);
  }, []);

  // 应用主题到DOM
  const applyTheme = useCallback((theme: Theme) => {
    const root = document.documentElement;
    
    // 设置过渡动画
    const originalTransition = root.style.transition;
    root.style.transition = `all ${transitionDuration}ms ease-in-out`;
    
    // 应用主题色彩变量
    root.style.setProperty('--theme-primary', theme.primaryColor);
    root.style.setProperty('--theme-secondary', theme.secondaryColor);
    root.style.setProperty('--theme-accent', theme.accentColor);
    root.style.setProperty('--theme-background', theme.backgroundColor);
    root.style.setProperty('--theme-text', theme.textColor);
    
    // 更新主题类名
    document.body.className = document.body.className.replace(/theme-\w+(-\w+)*/g, '');
    document.body.classList.add(theme.className);
    
    // 恢复原始过渡设置
    setTimeout(() => {
      root.style.transition = originalTransition;
    }, transitionDuration);
    
    // 调用回调
    onThemeChange?.(theme);
  }, [transitionDuration, onThemeChange]);

  // 主题切换处理
  const handleThemeChange = useCallback((theme: Theme) => {
    setCurrentTheme(theme);
    applyTheme(theme);
    localStorage.setItem('terminal-theme', theme.id);
    
    // 创建主题切换事件
    const event = new CustomEvent('theme-changed', { 
      detail: { theme, timestamp: Date.now() } 
    });
    window.dispatchEvent(event);
  }, [applyTheme]);

  // 自动主题模式
  useEffect(() => {
    if (!isAutoMode || !enableAutoTheme) return;

    const updateAutoTheme = () => {
      const hour = new Date().getHours();
      let autoTheme: Theme;

      if (hour >= 6 && hour < 12) {
        // 早晨 - 温暖色调
        autoTheme = themes.find(t => t.id === 'sunset-orange') || themes[0];
      } else if (hour >= 12 && hour < 18) {
        // 下午 - 清爽色调
        autoTheme = themes.find(t => t.id === 'arctic-cyan') || themes[0];
      } else if (hour >= 18 && hour < 22) {
        // 晚上 - 紫色霓虹
        autoTheme = themes.find(t => t.id === 'neon-purple') || themes[0];
      } else {
        // 深夜 - 默认蓝色
        autoTheme = themes.find(t => t.id === 'default') || themes[0];
      }

      if (autoTheme.id !== currentTheme.id) {
        handleThemeChange(autoTheme);
      }
    };

    updateAutoTheme();
    const interval = setInterval(updateAutoTheme, 30 * 60 * 1000); // 每30分钟检查一次

    return () => clearInterval(interval);
  }, [isAutoMode, enableAutoTheme, currentTheme.id, handleThemeChange]);

  // 自动模式切换
  const toggleAutoMode = () => {
    const newAutoMode = !isAutoMode;
    setIsAutoMode(newAutoMode);
    localStorage.setItem('auto-theme-mode', newAutoMode.toString());
  };

  // 收藏主题切换
  const toggleFavorite = (themeId: string) => {
    const newFavorites = favoriteThemes.includes(themeId)
      ? favoriteThemes.filter(id => id !== themeId)
      : [...favoriteThemes, themeId];
    
    setFavoriteThemes(newFavorites);
    localStorage.setItem('favorite-themes', JSON.stringify(newFavorites));
  };

  // 随机主题
  const selectRandomTheme = () => {
    const availableThemes = themes.filter(t => t.id !== currentTheme.id);
    const randomTheme = availableThemes[Math.floor(Math.random() * availableThemes.length)];
    handleThemeChange(randomTheme);
  };

  // 重置主题
  const resetTheme = () => {
    handleThemeChange(themes[0]);
    setIsAutoMode(false);
    localStorage.removeItem('auto-theme-mode');
  };

  // 快速切换组件
  const QuickToggle = () => (
    <div className="fixed top-20 right-4 z-40">
      <button
        onClick={() => selectRandomTheme()}
        className="btn-glass-blue p-3 rounded-full shadow-lg hover:scale-110 transition-all duration-300"
        title={isZh ? '随机主题' : 'Random Theme'}
      >
        <Palette className="w-5 h-5" />
      </button>
    </div>
  );

  if (!isOpen && !showQuickToggle) return null;
  if (!isOpen) return <QuickToggle />;

  return (
    <>
      {showQuickToggle && <QuickToggle />}
      
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="glass-blue rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
          {/* 头部 */}
          <div className="p-6 border-b border-blue-400/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Palette className="w-6 h-6 text-blue-400" />
                <div>
                  <h2 className="text-large text-white font-terminal">
                    {isZh ? '主题管理器' : 'Theme Manager'}
                  </h2>
                  <p className="text-small text-blue-300 mt-1">
                    {isZh ? '自定义您的终端外观' : 'Customize your terminal appearance'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={selectRandomTheme}
                  className="btn-glass-purple p-2 rounded-lg"
                  title={isZh ? '随机主题' : 'Random Theme'}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="btn-glass-orange p-2 rounded-lg"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 主题选择区域 */}
          <div className="p-6 max-h-96 overflow-y-auto custom-scrollbar">
            {/* 当前主题信息 */}
            <div className="mb-6 p-4 glass-cyan rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-medium text-white font-terminal">
                  {isZh ? '当前主题' : 'Current Theme'}
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {currentTheme.preview.map((color, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <h4 className="text-white font-medium">
                {isZh ? currentTheme.nameZh : currentTheme.name}
              </h4>
              <p className="text-blue-200 text-small mt-1">
                {isZh ? currentTheme.descriptionZh : currentTheme.description}
              </p>
            </div>

            {/* 自动模式控制 */}
            {enableAutoTheme && (
              <div className="mb-6 p-4 glass-amber rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Sun className="w-5 h-5 text-amber-400" />
                    <div>
                      <h3 className="text-white font-medium">
                        {isZh ? '自动主题' : 'Auto Theme'}
                      </h3>
                      <p className="text-amber-200 text-small">
                        {isZh ? '根据时间自动切换主题' : 'Auto switch theme by time'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={toggleAutoMode}
                    className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                      isAutoMode ? 'bg-amber-500' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                        isAutoMode ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* 主题网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {themes.map((theme) => (
                <div
                  key={theme.id}
                  className={`relative p-4 rounded-xl cursor-pointer transition-all duration-300 border ${
                    currentTheme.id === theme.id
                      ? 'border-blue-400 bg-blue-500/20'
                      : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/30'
                  }`}
                  onClick={() => handleThemeChange(theme)}
                >
                  {/* 主题预览 */}
                  <div className="mb-3">
                    <div className="flex space-x-1 mb-2">
                      {theme.preview.map((color, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 rounded-full border border-white/20"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* 主题信息 */}
                  <div className="mb-3">
                    <h4 className="text-white font-medium">
                      {isZh ? theme.nameZh : theme.name}
                    </h4>
                    <p className="text-gray-300 text-small mt-1">
                      {isZh ? theme.descriptionZh : theme.description}
                    </p>
                  </div>

                  {/* 控制按钮 */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(theme.id);
                      }}
                      className={`p-1 rounded transition-colors ${
                        favoriteThemes.includes(theme.id)
                          ? 'text-yellow-400 hover:text-yellow-300'
                          : 'text-gray-500 hover:text-yellow-400'
                      }`}
                    >
                      <Zap className="w-4 h-4" />
                    </button>
                    
                    {currentTheme.id === theme.id && (
                      <div className="flex items-center space-x-1 text-blue-400">
                        <Check className="w-4 h-4" />
                        <span className="text-small">
                          {isZh ? '使用中' : 'Active'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 底部控制 */}
          <div className="p-6 border-t border-blue-400/20 bg-black/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Monitor className="w-4 h-4 text-blue-400" />
                  <span className="text-small text-blue-300">
                    {themes.length} {isZh ? '个主题' : 'themes'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-small text-blue-300">
                    {favoriteThemes.length} {isZh ? '个收藏' : 'favorites'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={resetTheme}
                  className="btn-glass-orange px-4 py-2 rounded-lg text-small"
                >
                  {isZh ? '重置' : 'Reset'}
                </button>
                <button
                  onClick={onClose}
                  className="btn-glass-blue px-4 py-2 rounded-lg text-small"
                >
                  {isZh ? '完成' : 'Done'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ThemeManager;