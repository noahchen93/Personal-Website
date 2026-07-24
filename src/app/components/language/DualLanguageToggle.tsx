import React from 'react';
import { Globe, Languages } from 'lucide-react';
import { useLanguage } from './LanguageContext';

interface DualLanguageToggleProps {
  variant?: 'default' | 'terminal' | 'glass';
  className?: string;
}

export function DualLanguageToggle({ variant = 'glass', className = '' }: DualLanguageToggleProps) {
  const { currentLanguage, setLanguage, isZh } = useLanguage();

  const getButtonClass = (isActive: boolean) => {
    const baseClass = "transition-all duration-200 flex items-center space-x-1 font-terminal";
    
    switch (variant) {
      case 'terminal':
        return `${baseClass} px-2 py-1 text-xs border rounded ${
          isActive 
            ? 'text-cyan-300 border-cyan-400/50 bg-cyan-400/20' 
            : 'text-cyan-400/60 border-cyan-400/30 hover:text-cyan-300 hover:bg-cyan-400/10'
        }`;
      
      case 'glass':
        return `${baseClass} px-3 py-1.5 rounded-lg ${
          isActive
            ? 'btn-glass-blue text-white border-blue-400/60'
            : 'text-blue-200/60 border border-blue-400/30 hover:text-blue-200 hover:bg-blue-500/20 backdrop-blur-sm'
        }`;
      
      default:
        return `${baseClass} px-3 py-1.5 rounded-lg ${
          isActive
            ? 'btn-glass-cyan text-white'
            : 'text-cyan-200/60 border border-cyan-400/30 hover:text-cyan-200 hover:bg-cyan-500/20 backdrop-blur-sm'
        }`;
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

  const handleLanguageChange = (language: 'zh' | 'en') => {
    console.log('Switching language to:', language);
    setLanguage(language);
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Chinese Button */}
      <button
        onClick={() => handleLanguageChange('zh')}
        className={getButtonClass(currentLanguage === 'zh')}
        title="切换到中文"
      >
        {getIcon()}
        <span className={`${variant === 'terminal' ? 'text-xs' : 'text-small'}`}>
          中文
        </span>
      </button>

      {/* Separator */}
      <div className="w-px h-4 bg-blue-400/30"></div>

      {/* English Button */}
      <button
        onClick={() => handleLanguageChange('en')}
        className={getButtonClass(currentLanguage === 'en')}
        title="Switch to English"
      >
        {getIcon()}
        <span className={`${variant === 'terminal' ? 'text-xs' : 'text-small'}`}>
          ENG
        </span>
      </button>
    </div>
  );
}

export default DualLanguageToggle;