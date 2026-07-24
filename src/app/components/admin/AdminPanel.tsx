import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { Button } from '../ui/button';
import { Home, Code, FileText, User, Phone, Image, X, Bot, LogOut } from 'lucide-react';
import { useLanguage } from '../language/LanguageContext';
import { useAuth } from '../auth/AuthContext';
import LanguageToggle from '../language/LanguageToggle';
import HomeEditor from './editors/HomeEditor';
import ProjectsEditor from './editors/ProjectsEditor';
import AIExploreEditor from './editors/AIExploreEditor';
import BlogEditor from './editors/BlogEditor';
import InterestsEditor from './editors/InterestsEditor';
import ContactEditor from './editors/ContactEditor';
import ContentEditor from './ContentEditor';
import ImageManagerPanel from './ImageManagerPanel';

type EditorType = 'home' | 'projects' | 'ai-explore' | 'blog' | 'interests' | 'contact' | 'images';

interface MenuItem {
  id: EditorType;
  icon: React.ReactNode;
  label: string;
  labelEn: string;
}

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const { isZh } = useLanguage();
  const { user, signOut } = useAuth();
  const [currentEditor, setCurrentEditor] = useState<EditorType>('home');




  const menuItems: MenuItem[] = [
    { id: 'home', icon: <Home className="w-4 h-4" />, label: '首页', labelEn: 'Home' },
    { id: 'projects', icon: <Code className="w-4 h-4" />, label: '项目', labelEn: 'Projects' },
    { id: 'ai-explore', icon: <Bot className="w-4 h-4" />, label: 'AI探索', labelEn: 'AI Explore' },
    { id: 'blog', icon: <FileText className="w-4 h-4" />, label: '博客', labelEn: 'Blog' },
    { id: 'interests', icon: <User className="w-4 h-4" />, label: '兴趣', labelEn: 'Interests' },
    { id: 'contact', icon: <Phone className="w-4 h-4" />, label: '联系', labelEn: 'Contact' },
    { id: 'images', icon: <Image className="w-4 h-4" />, label: '图片管理', labelEn: 'Images' }
  ];

  const handleMenuClick = (editorId: EditorType) => {
    setCurrentEditor(editorId);
  };

  const renderEditor = () => {
    switch (currentEditor) {
      case 'home':
        return <HomeEditor />;
      case 'projects':
        return <ProjectsEditor />;
      case 'ai-explore':
        return <AIExploreEditor />;
      case 'blog':
        return <BlogEditor />;
      case 'interests':
        return <InterestsEditor />;
      case 'contact':
        return <ContactEditor />;
      case 'images':
        return <ImageManagerPanel />;
      default:
        return <HomeEditor />;
    }
  };

  const getCurrentMenuItem = () => {
    return menuItems.find(item => item.id === currentEditor);
  };

  const currentItem = getCurrentMenuItem();


  const handleClose = () => {
    onClose();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      handleClose();
    } catch (error) {
      
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-none p-0 z-[100] cms-container terminal-bg border-l border-blue-400/30"
        style={{ 
          maxWidth: 'none',
          width: '100vw',
          height: '100vh',
          zIndex: 100
        }}
      >

        <SheetHeader className="sr-only">
          <SheetTitle>
            {isZh ? '管理面板' : 'Admin Panel'}
          </SheetTitle>
          <SheetDescription>
            {isZh 
              ? '网站内容管理系统，包含首页、项目、博客、兴趣和联系页面的编辑功能' 
              : 'Website content management system with editors for home, projects, blog, interests and contact pages'
            }
          </SheetDescription>
        </SheetHeader>

        <div className="h-full flex terminal-bg terminal-scanlines">

          <div className="w-64 cms-bg-secondary border-r border-blue-400/30 flex flex-col shrink-0">

            <div className="p-4 border-b border-blue-400/30">
              <div className="flex items-center justify-between mb-3">
                <h2 className="terminal-text-white terminal-glow cms-text-primary">
                  {isZh ? '管理面板' : 'Admin Panel'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="cms-secondary-button transition-all duration-200"
                  aria-label={isZh ? '关闭管理面板' : 'Close admin panel'}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              

              {user && (
                <div className="mb-3 p-2 bg-slate-800/50 rounded border border-blue-400/30">
                  <div className="text-small text-cyan-300 mb-1">
                    {isZh ? '已登录:' : 'Logged in as:'}
                  </div>
                  <div className="text-small text-white font-medium terminal-glow">
                    {user.name || user.email}
                  </div>
                </div>
              )}
              

              <div className="flex justify-center mb-3">
                <LanguageToggle 
                  variant="cms" 
                  className="w-full justify-center"
                />
              </div>


              <Button
                onClick={handleSignOut}
                className="w-full cms-danger-button flex items-center justify-center space-x-2"
                aria-label={isZh ? '退出登录' : 'Sign out'}
              >
                <LogOut className="w-4 h-4" />
                <span>{isZh ? '退出登录' : 'Sign Out'}</span>
              </Button>
            </div>


            <div className="flex-1 p-4 overflow-y-auto terminal-scrollbar">
              <nav className="space-y-2" role="navigation" aria-label={isZh ? '管理面板导航' : 'Admin panel navigation'}>
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 transition-all duration-200 rounded-lg border cms-text-primary ${
                      currentEditor === item.id
                        ? 'cms-primary-button terminal-glow'
                        : 'cms-secondary-button hover:cms-primary-button hover:terminal-glow'
                    }`}
                    aria-current={currentEditor === item.id ? 'page' : undefined}
                    aria-label={`${isZh ? '切换到' : 'Switch to'} ${isZh ? item.label : item.labelEn} ${isZh ? '编辑器' : 'editor'}`}
                  >
                    {item.icon}
                    <span>{isZh ? item.label : item.labelEn}</span>
                  </button>
                ))}
              </nav>
            </div>


            <div className="p-4 border-t border-blue-400/30">
              <div className="terminal-text-small cms-text-secondary space-y-1">
                <div>
                  {isZh ? '当前编辑器:' : 'Current Editor:'}
                </div>
                <div className="cms-text-primary font-medium terminal-glow">
                  {currentItem ? (isZh ? currentItem.label : currentItem.labelEn) : ''}
                </div>
              </div>
            </div>
          </div>


          <div className="flex-1 flex flex-col min-h-0 terminal-bg cms-container">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-6 admin-panel-content cms-container">
                <main role="main" aria-label={isZh ? '内容编辑区域' : 'Content editing area'}>
                  {renderEditor()}
                </main>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}