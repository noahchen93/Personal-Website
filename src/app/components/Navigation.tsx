import React from 'react';
import { Home, FileText, Heart, MessageSquare, Mail, Bot } from 'lucide-react';
import { useTexts } from './language/LanguageContext';

type Section = 'home' | 'projects' | 'ai-explore' | 'blog' | 'interests' | 'contact';

interface NavigationProps {
  currentSection: Section;
  onNavigate: (section: Section) => void;
  className?: string;
  mobile?: boolean;
  variant?: 'default' | 'terminal';
}

export default function Navigation({ currentSection, onNavigate, className = '', mobile = false, variant = 'default' }: NavigationProps) {
  const texts = useTexts();
  
  const navItems = [
    { id: 'home' as Section, label: texts.nav.home, icon: Home, cmd: 'home' },
    { id: 'projects' as Section, label: texts.nav.projects, icon: FileText, cmd: 'projects' },
    { id: 'ai-explore' as Section, label: texts.nav.aiExplore, icon: Bot, cmd: 'ai-explore' },
    { id: 'blog' as Section, label: texts.nav.blog, icon: MessageSquare, cmd: 'blog' },
    { id: 'interests' as Section, label: texts.nav.interests, icon: Heart, cmd: 'interests' },
    { id: 'contact' as Section, label: texts.nav.contact, icon: Mail, cmd: 'contact' },
  ];

  if (variant === 'terminal') {
    return (
      <div className={className}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`group flex items-center space-x-2 px-4 py-2 transition-all duration-300 font-terminal border-l-2 ${
                isActive
                  ? 'border-green-400 bg-gray-800 text-green-400 shadow-lg shadow-green-400/20'
                  : 'border-transparent text-gray-400 hover:border-cyan-400 hover:bg-gray-900 hover:text-cyan-400'
              } ${mobile ? 'w-full justify-start' : ''}`}
              aria-label={item.label}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-green-400' : 'text-gray-500 group-hover:text-cyan-400'} transition-colors`} />
              <span className={`${mobile ? 'block' : 'hidden sm:block'} tracking-wide`}>
{isActive ? `> ${item.label}` : item.label}
              </span>
              {isActive && (
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-auto"></div>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={className}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentSection === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            } ${mobile ? 'w-full justify-start' : ''}`}
            aria-label={item.label}
          >
            <Icon className="w-5 h-5" />
            <span className={mobile ? 'block' : 'hidden sm:block'}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}