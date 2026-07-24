import React, { useState, useEffect, useCallback } from 'react';
import { Download, Smartphone, Wifi, WifiOff, RotateCcw, Settings, Bell, X } from 'lucide-react';
import { useLanguage } from '../language/LanguageContext';

interface PWAManagerProps {
  enableNotifications?: boolean;
  enableOfflineCache?: boolean;
  enableUpdatePrompt?: boolean;
  autoPromptInstall?: boolean;
}

interface PWAInstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const PWAManager: React.FC<PWAManagerProps> = ({
  enableNotifications = true,
  enableOfflineCache = true,
  enableUpdatePrompt = true,
  autoPromptInstall = true
}) => {
  const { isZh } = useLanguage();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [installPromptEvent, setInstallPromptEvent] = useState<PWAInstallEvent | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // 监听网络状态
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 监听安装提示事件
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const installEvent = e as PWAInstallEvent;
      setInstallPromptEvent(installEvent);
      setIsInstallable(true);
      
      if (autoPromptInstall) {
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 3000); // 3秒后显示安装提示
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [autoPromptInstall]);

  // 注册Service Worker
  useEffect(() => {
    if (!enableOfflineCache || !('serviceWorker' in navigator)) return;

    const registerServiceWorker = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        setRegistration(reg);

        // 监听更新
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
                if (enableUpdatePrompt) {
                  setShowUpdatePrompt(true);
                }
              }
            });
          }
        });

        // 监听控制变化
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });

      } catch (error) {
        console.error('[PWA] Service Worker registration failed:', error);
      }
    };

    registerServiceWorker();
  }, [enableOfflineCache, enableUpdatePrompt]);

  // 检查通知权限
  useEffect(() => {
    if (!enableNotifications || !('Notification' in window)) return;
    
    setNotificationPermission(Notification.permission);
  }, [enableNotifications]);

  // 安装PWA
  const handleInstall = useCallback(async () => {
    if (!installPromptEvent) return;

    try {
      await installPromptEvent.prompt();
      const { outcome } = await installPromptEvent.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstallable(false);
        setShowInstallPrompt(false);
        
        // 发送安装成功通知
        if (notificationPermission === 'granted') {
          new Notification(
            isZh ? '应用安装成功' : 'App Installed Successfully',
            {
              body: isZh ? '您现在可以从主屏幕访问应用' : 'You can now access the app from your home screen',
              icon: '/icons/icon-192x192.png',
              badge: '/icons/icon-72x72.png'
            }
          );
        }
      }
      
      setInstallPromptEvent(null);
    } catch (error) {
      console.error('[PWA] Installation failed:', error);
    }
  }, [installPromptEvent, notificationPermission, isZh]);

  // 更新应用
  const handleUpdate = useCallback(() => {
    if (!registration || !registration.waiting) return;

    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    setShowUpdatePrompt(false);
  }, [registration]);

  // 请求通知权限
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) return;

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        new Notification(
          isZh ? '通知已启用' : 'Notifications Enabled',
          {
            body: isZh ? '您将收到重要更新和消息' : 'You will receive important updates and messages',
            icon: '/icons/icon-192x192.png'
          }
        );
      }
    } catch (error) {
      console.error('[PWA] Notification permission request failed:', error);
    }
  }, [isZh]);

  // 发送测试通知
  const sendTestNotification = useCallback(() => {
    if (notificationPermission !== 'granted') return;

    new Notification(
      isZh ? '测试通知' : 'Test Notification',
      {
        body: isZh ? '这是一条测试通知消息' : 'This is a test notification message',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'test-notification',
        requireInteraction: false
      }
    );
  }, [notificationPermission, isZh]);

  // 清除缓存
  const clearCache = useCallback(async () => {
    if (!('caches' in window)) return;

    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      
      // 刷新页面
      window.location.reload();
    } catch (error) {
      console.error('[PWA] Cache clearing failed:', error);
    }
  }, []);

  // 网络状态指示器
  const NetworkStatus = () => (
    <div className={`fixed top-16 right-4 z-30 transition-all duration-300 ${
      isOnline ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-90'
    }`}>
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-small font-terminal ${
        isOnline 
          ? 'glass-green text-green-200' 
          : 'glass-rose text-rose-200 animate-pulse'
      }`}>
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            <span>{isZh ? '在线' : 'Online'}</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>{isZh ? '离线' : 'Offline'}</span>
          </>
        )}
      </div>
    </div>
  );

  // 安装提示弹窗
  const InstallPrompt = () => (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-blue rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Download className="w-8 h-8 text-blue-400" />
          </div>
          
          <h3 className="text-large text-white font-terminal mb-2">
            {isZh ? '安装应用' : 'Install App'}
          </h3>
          
          <p className="text-blue-200 text-small mb-6">
            {isZh 
              ? '将此应用添加到您的主屏幕，获得更好的体验和离线访问功能。'
              : 'Add this app to your home screen for a better experience and offline access.'
            }
          </p>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="btn-glass-orange flex-1 py-3 rounded-lg text-small"
            >
              {isZh ? '稍后' : 'Later'}
            </button>
            <button
              onClick={handleInstall}
              className="btn-glass-green flex-1 py-3 rounded-lg text-small font-medium"
            >
              {isZh ? '安装' : 'Install'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // 更新提示弹窗
  const UpdatePrompt = () => (
    <div className="fixed top-20 right-4 z-40 w-80">
      <div className="glass-amber rounded-xl p-4 shadow-lg border border-amber-400/30">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <RotateCcw className="w-4 h-4 text-amber-400" />
          </div>
          
          <div className="flex-1">
            <h4 className="text-white font-medium mb-1">
              {isZh ? '更新可用' : 'Update Available'}
            </h4>
            <p className="text-amber-200 text-small mb-3">
              {isZh ? '新版本已就绪，点击更新以获得最新功能。' : 'A new version is ready. Click update to get the latest features.'}
            </p>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setShowUpdatePrompt(false)}
                className="px-3 py-1 text-small text-amber-300 hover:text-amber-200 transition-colors"
              >
                {isZh ? '忽略' : 'Dismiss'}
              </button>
              <button
                onClick={handleUpdate}
                className="btn-glass-amber px-3 py-1 text-small"
              >
                {isZh ? '更新' : 'Update'}
              </button>
            </div>
          </div>
          
          <button
            onClick={() => setShowUpdatePrompt(false)}
            className="text-amber-400 hover:text-amber-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // PWA控制面板（开发模式下显示）
  const PWAControls = () => {
    if (process.env.NODE_ENV !== 'development') return null;

    return (
      <div className="fixed bottom-4 right-4 z-30">
        <div className="glass-purple rounded-xl p-4 shadow-lg w-64">
          <div className="flex items-center space-x-2 mb-3">
            <Settings className="w-4 h-4 text-purple-400" />
            <h4 className="text-white font-medium text-small">PWA Controls</h4>
          </div>
          
          <div className="space-y-2">
            {isInstallable && (
              <button
                onClick={handleInstall}
                className="w-full btn-glass-green py-2 text-small rounded-lg flex items-center justify-center space-x-2"
              >
                <Download className="w-3 h-3" />
                <span>{isZh ? '安装应用' : 'Install App'}</span>
              </button>
            )}
            
            {enableNotifications && (
              <button
                onClick={notificationPermission === 'granted' ? sendTestNotification : requestNotificationPermission}
                className="w-full btn-glass-blue py-2 text-small rounded-lg flex items-center justify-center space-x-2"
              >
                <Bell className="w-3 h-3" />
                <span>
                  {notificationPermission === 'granted' 
                    ? (isZh ? '测试通知' : 'Test Notification')
                    : (isZh ? '启用通知' : 'Enable Notifications')
                  }
                </span>
              </button>
            )}
            
            <button
              onClick={clearCache}
              className="w-full btn-glass-orange py-2 text-small rounded-lg flex items-center justify-center space-x-2"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isZh ? '清除缓存' : 'Clear Cache'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <NetworkStatus />
      {showInstallPrompt && <InstallPrompt />}
      {showUpdatePrompt && <UpdatePrompt />}
      <PWAControls />
    </>
  );
};

export default PWAManager;