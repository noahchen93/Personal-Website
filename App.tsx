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
import { RealTimeStatusIndicator } from './components/RealTimeStatusIndicator';
import { DevUtils } from './components/DevUtils';
import { Toaster } from './components/ui/sonner';
import { LanguageProvider } from './contexts/LanguageContext';
import { Button } from './components/ui/button';
import { Settings, ArrowLeft, Activity, Database } from 'lucide-react';
import { getConnectionStatus, addConnectionListener, removeConnectionListener } from './utils/api';

export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showCMS, setShowCMS] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('offline');
  const [showDevUtils, setShowDevUtils] = useState(false);

  // Connection status monitoring
  useEffect(() => {
    const handleConnectionStatusChange = (status: string) => {
      setConnectionStatus(status);
    };

    addConnectionListener(handleConnectionStatusChange);
    setConnectionStatus(getConnectionStatus());

    return () => {
      removeConnectionListener(handleConnectionStatusChange);
    };
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showCMS) {
          setShowCMS(false);
        } else if (showDevUtils) {
          setShowDevUtils(false);
        } else {
          setActiveSection('home');
        }
      }
      
      // Admin shortcut Alt+A
      if (e.altKey && e.key === 'a') {
        if (isAdmin) {
          setShowCMS(!showCMS);
        } else {
          setShowAuthDialog(true);
        }
      }
      
      // Dev utils shortcut Alt+D
      if (e.altKey && e.key === 'd') {
        setShowDevUtils(!showDevUtils);
      }
      
      // Status shortcut Alt+S (show connection status)
      if (e.altKey && e.key === 's') {
        console.log('Connection Status:', getConnectionStatus());
        console.log('Current Mode:', connectionStatus === 'offline' ? 'Offline Mode' : 'Online Mode');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isAdmin, showCMS, showDevUtils, connectionStatus]);

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

  // If showing CMS interface
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
                <h1 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  内容管理系统
                </h1>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    connectionStatus === 'online' ? 'bg-green-500' : 
                    connectionStatus === 'syncing' ? 'bg-blue-500' :
                    connectionStatus === 'checking' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span className="text-sm text-gray-600 capitalize">
                    {connectionStatus === 'online' ? '已连接' :
                     connectionStatus === 'syncing' ? '同步中' :
                     connectionStatus === 'checking' ? '检查中' : '离线模式'}
                  </span>
                </div>
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

          {/* Real-time Status for CMS */}
          <RealTimeStatusIndicator 
            position="bottom-right" 
            compact={true} 
          />

          {/* Dev Utils */}
          <DevUtils 
            isVisible={showDevUtils} 
            onToggle={() => setShowDevUtils(!showDevUtils)} 
          />

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
            <div className="fixed top-4 right-20 z-40 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm flex items-center space-x-2 shadow-lg">
              <Settings className="w-4 h-4" />
              <span>管理模式</span>
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                connectionStatus === 'online' ? 'bg-green-400' : 
                connectionStatus === 'syncing' ? 'bg-blue-400' :
                connectionStatus === 'checking' ? 'bg-yellow-400' : 'bg-gray-400'
              }`} />
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

          {/* Real-time Status Indicator for main site */}
          {!isAdmin && (
            <RealTimeStatusIndicator 
              position="top-right" 
              compact={true}
            />
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

        {/* Dev Utils */}
        <DevUtils 
          isVisible={showDevUtils} 
          onToggle={() => setShowDevUtils(!showDevUtils)} 
        />

        {/* Toast Notifications */}
        <Toaster />

        {/* Keyboard Shortcuts Hint */}
        <div className="fixed bottom-4 left-4 text-xs text-muted-foreground z-10 bg-background/80 backdrop-blur-sm px-2 py-1 rounded">
          {isAdmin ? (
            <div className="space-y-1">
              <div>按 Alt+A 打开/关闭CMS | 按 Alt+D 开发工具 | 按 Esc 返回首页</div>
              <div className="flex items-center space-x-2">
                <div className="text-green-600">✓ 管理员模式已激活</div>
                <div className="flex items-center space-x-1">
                  <Activity className="w-3 h-3" />
                  <span className="capitalize">
                    {connectionStatus === 'offline' ? '离线模式' : connectionStatus}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <span>按 Alt+A 进入管理模式 | 按 Alt+D 开发工具 | 按 Esc 回到首页</span>
              <div className="flex items-center space-x-1 text-muted-foreground/70">
                <Activity className="w-3 h-3" />
                <span className="capitalize text-xs">
                  {connectionStatus === 'offline' ? '离线模式' : connectionStatus}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </LanguageProvider>
  );
}