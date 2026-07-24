import React from 'react';
import { Globe, Languages } from 'lucide-react';
import { useLanguage } from './LanguageContext';

interface LanguageToggleProps {
  variant?: 'default' | 'terminal' | 'glass';
}

export function LanguageToggle({ variant = 'default' }: LanguageToggleProps) {
  const { currentLanguage, setLanguage, isZh } = useLanguage();

  const handleToggle = () => {
    const newLanguage = currentLanguage === 'zh' ? 'en' : 'zh';
    setLanguage(newLanguage);
  };

  const getButtonClass = () => {
    switch (variant) {
      case 'terminal':
        return "text-cyan-400 hover:text-cyan-300 transition-colors rounded px-2 py-1 flex items-center space-x-1 text-xs border border-cyan-400/30 hover:bg-cyan-400/10";
      case 'glass':
        return "btn-glass-cyan p-2 rounded-lg transition-all duration-200 flex items-center space-x-1";
      default:
        return "btn-glass-cyan p-2 rounded-lg transition-all duration-200 flex items-center space-x-1";
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'terminal':
        return <Languages className="w-3 h-3" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={getButtonClass()}
      title={isZh ? '切换到English' : 'Switch to 中文'}
      aria-label={isZh ? '切换到English' : 'Switch to 中文'}
    >
      {getIcon()}
      <span className="text-small">
        {currentLanguage === 'zh' ? 'EN' : '中'}
      </span>
    </button>
  );
}

export default LanguageToggle;