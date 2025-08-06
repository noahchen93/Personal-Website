import { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { HomeSection } from './components/sections/HomeSection';
import { AboutSection } from './components/sections/AboutSection';
import { EducationSection } from './components/sections/EducationSection';
import { ExperienceSection } from './components/sections/ExperienceSection';
import { ProjectsSection } from './components/sections/ProjectsSection';
import { InterestsSection } from './components/sections/InterestsSection';
import { ContactSection } from './components/sections/ContactSection';
import { AuthDialog } from './components/AuthDialog';
import { CMSDashboard } from './components/CMSDashboard';
import { Toaster } from './components/ui/sonner';
import { LanguageProvider } from './contexts/LanguageContext';
import { Button } from './components/ui/button';
import { Settings, ArrowLeft } from 'lucide-react';

export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showCMS, setShowCMS] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // 处理键盘导航
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showCMS) {
          setShowCMS(false);
        } else {
          setActiveSection('home');
        }
      }
      // 管理员快捷键 Alt+A
      if (e.altKey && e.key === 'a') {
        if (isAdmin) {
          setShowCMS(!showCMS);
        } else {
          setShowAuthDialog(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isAdmin, showCMS]);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  const handleAdminToggle = () => {
    if (isAdmin) {
      if (showCMS) {
        setShowCMS(false);
      } else {
        setShowCMS(true);
      }
    } else {
      setShowAuthDialog(true);
    }
  };

  const handleAuthSuccess = (token: string) => {
    setAccessToken(token);
    setIsAdmin(true);
    setShowAuthDialog(false);
    setShowCMS(true);
  };

  const handleLogout = () => {
    setAccessToken(null);
    setIsAdmin(false);
    setShowCMS(false);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return <HomeSection onSectionChange={handleSectionChange} />;
      case 'about':
        return <AboutSection />;
      case 'education':
        return <EducationSection />;
      case 'experience':
        return <ExperienceSection />;
      case 'projects':
        return <ProjectsSection />;
      case 'interests':
        return <InterestsSection />;
      case 'contact':
        return <ContactSection />;
      default:
        return <HomeSection onSectionChange={handleSectionChange} />;
    }
  };

  // 如果显示CMS界面
  if (showCMS && isAdmin && accessToken) {
    return (
      <LanguageProvider>
        <div className="min-h-screen bg-gray-50">
          {/* CMS Header */}
          <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCMS(false)}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>返回网站</span>
                </Button>
                <div className="h-6 w-px bg-gray-300"></div>
                <h1 className="text-lg font-semibold text-gray-900">内容管理系统</h1>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-sm text-gray-600">
                  已登录管理员
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                >
                  退出登录
                </Button>
              </div>
            </div>
          </div>

          {/* CMS Content */}
          <div className="pt-16">
            <CMSDashboard
              accessToken={accessToken}
              onLogout={handleLogout}
            />
          </div>

          {/* Toast Notifications */}
          <Toaster />
        </div>
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <Navigation
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          isAdmin={isAdmin}
          onAdminToggle={handleAdminToggle}
        />

        {/* Main Content */}
        <main className="lg:ml-64 pt-16 lg:pt-0">
          {/* Admin Mode Indicator */}
          {isAdmin && (
            <div className="fixed top-4 right-4 z-40 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>管理模式</span>
              <Button
                size="sm"
                variant="ghost"
                className="text-primary-foreground hover:text-primary-foreground/80 h-auto p-1 ml-2"
                onClick={() => setShowCMS(true)}
              >
                打开CMS
              </Button>
            </div>
          )}

          {/* Section Content */}
          <div className="min-h-screen">
            {renderSection()}
          </div>
        </main>

        {/* Authentication Dialog */}
        <AuthDialog
          isOpen={showAuthDialog}
          onClose={() => setShowAuthDialog(false)}
          onAuthSuccess={handleAuthSuccess}
        />

        {/* Toast Notifications */}
        <Toaster />

        {/* Keyboard Shortcuts Hint */}
        <div className="fixed bottom-4 left-4 text-xs text-muted-foreground z-10 bg-background/80 backdrop-blur-sm px-2 py-1 rounded">
          {isAdmin ? (
            <div className="space-y-1">
              <div>按 Alt+A 打开/关闭CMS | 按 Esc 返回首页</div>
              <div className="text-green-600">✓ 管理员模式已激活</div>
            </div>
          ) : (
            '按 Alt+A 进入管理模式 | 按 Esc 回到首页'
          )}
        </div>
      </div>
    </LanguageProvider>
  );
}