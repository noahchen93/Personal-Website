import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Menu, X, Home, User, GraduationCap, Briefcase, 
  FolderOpen, Heart, Mail, Settings, Globe, Languages
} from 'lucide-react';

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isAdmin?: boolean;
  onAdminToggle?: () => void;
}

export function Navigation({ 
  activeSection, 
  onSectionChange, 
  isAdmin = false, 
  onAdminToggle 
}: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { language, toggleLanguage } = useLanguage();

  const navItems = [
    { id: 'home', label: language === 'zh' ? '首页' : 'Home', icon: Home },
    { id: 'about', label: language === 'zh' ? '关于' : 'About', icon: User },
    { id: 'education', label: language === 'zh' ? '教育' : 'Education', icon: GraduationCap },
    { id: 'experience', label: language === 'zh' ? '经历' : 'Experience', icon: Briefcase },
    { id: 'projects', label: language === 'zh' ? '项目' : 'Projects', icon: FolderOpen },
    { id: 'interests', label: language === 'zh' ? '兴趣' : 'Interests', icon: Heart },
    { id: 'contact', label: language === 'zh' ? '联系' : 'Contact', icon: Mail },
  ];

  const handleNavClick = (sectionId: string) => {
    onSectionChange(sectionId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">
              {language === 'zh' ? '个人作品集' : 'Portfolio'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="p-2"
            >
              <Languages className="w-4 h-4" />
              <span className="ml-1 text-xs">{language.toUpperCase()}</span>
            </Button>
            
            {onAdminToggle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onAdminToggle}
                className="p-2"
              >
                <Settings className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <nav className="py-2">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
                      activeSection === item.id
                        ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 z-40">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-gray-900">
                {language === 'zh' ? '个人作品集' : 'Portfolio'}
              </h1>
              {isAdmin && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {language === 'zh' ? '管理员' : 'Admin'}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
                className="flex-1"
              >
                <Globe className="w-4 h-4 mr-2" />
                {language === 'zh' ? '中文' : 'English'}
              </Button>
              
              {onAdminToggle && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAdminToggle}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4">
            <ul className="space-y-1 px-3">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeSection === item.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <Card>
              <CardContent className="p-3">
                <div className="text-center text-xs text-gray-500">
                  <p>{language === 'zh' ? '© 2024 个人作品集' : '© 2024 Portfolio'}</p>
                  <p className="mt-1">
                    {language === 'zh' ? '版权所有' : 'All rights reserved'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </aside>
    </>
  );
}