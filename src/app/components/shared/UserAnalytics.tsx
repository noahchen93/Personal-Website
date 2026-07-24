import React, { useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../language/LanguageContext';
import { useContent } from '../content/ContentContext';

interface AnalyticsEvent {
  type: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
  userId?: string;
  sessionId: string;
  url: string;
  referrer?: string;
  userAgent: string;
  language: string;
  screenResolution: string;
  viewportSize: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  connectionType?: string;
  pageLoadTime?: number;
  engagementTime?: number;
  scrollDepth?: number;
}

interface UserSession {
  id: string;
  startTime: number;
  endTime?: number;
  pageViews: number;
  events: number;
  totalEngagementTime: number;
  bounced: boolean;
  exitPage?: string;
}

interface UserAnalyticsProps {
  enabled?: boolean;
  enableHeatmap?: boolean;
  enableRealTimeAnalytics?: boolean;
  enableErrorTracking?: boolean;
  enablePerformanceTracking?: boolean;
  enableUserJourney?: boolean;
  sampleRate?: number;
  onEvent?: (event: AnalyticsEvent) => void;
  onSession?: (session: UserSession) => void;
}

const UserAnalytics: React.FC<UserAnalyticsProps> = ({
  enabled = true,
  enableHeatmap = true,
  enableRealTimeAnalytics = true,
  enableErrorTracking = true,
  enablePerformanceTracking = true,
  enableUserJourney = true,
  sampleRate = 1.0,
  onEvent,
  onSession
}) => {
  const { currentLanguage } = useLanguage();
  const { isOnline } = useContent();
  const sessionRef = useRef<UserSession | null>(null);
  const engagementStartRef = useRef<number>(Date.now());
  const scrollDepthRef = useRef<number>(0);
  const heatmapDataRef = useRef<{ x: number; y: number; timestamp: number }[]>([]);
  const eventQueueRef = useRef<AnalyticsEvent[]>([]);

  // 检查是否应该追踪
  const shouldTrack = useCallback((): boolean => {
    if (!enabled) return false;
    if (Math.random() > sampleRate) return false;
    
    // 不在开发环境追踪
    if (process.env.NODE_ENV === 'development' && !window.location.search.includes('analytics=true')) {
      return false;
    }
    
    return true;
  }, [enabled, sampleRate]);

  // 获取设备类型
  const getDeviceType = useCallback((): 'mobile' | 'tablet' | 'desktop' => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }, []);

  // 获取连接类型
  const getConnectionType = useCallback((): string => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    return connection ? connection.effectiveType || connection.type || 'unknown' : 'unknown';
  }, []);

  // 生成会话ID
  const generateSessionId = useCallback((): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // 初始化会话
  const initializeSession = useCallback(() => {
    const sessionId = generateSessionId();
    sessionRef.current = {
      id: sessionId,
      startTime: Date.now(),
      pageViews: 1,
      events: 0,
      totalEngagementTime: 0,
      bounced: true
    };
    
    localStorage.setItem('analytics_session_id', sessionId);
    localStorage.setItem('analytics_session_start', Date.now().toString());
  }, [generateSessionId]);

  // 发送事件
  const sendEvent = useCallback((eventData: Partial<AnalyticsEvent>) => {
    if (!shouldTrack() || !sessionRef.current) return;

    const event: AnalyticsEvent = {
      type: 'event',
      category: 'general',
      action: 'unknown',
      timestamp: Date.now(),
      sessionId: sessionRef.current.id,
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      language: currentLanguage,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      deviceType: getDeviceType(),
      connectionType: getConnectionType(),
      engagementTime: Date.now() - engagementStartRef.current,
      scrollDepth: scrollDepthRef.current,
      ...eventData
    };

    // 更新会话统计
    sessionRef.current.events++;
    sessionRef.current.bounced = sessionRef.current.events <= 1 && sessionRef.current.pageViews <= 1;

    // 添加到队列
    eventQueueRef.current.push(event);

    // 回调处理
    onEvent?.(event);

    // 在线时发送事件
    if (isOnline && enableRealTimeAnalytics) {
      flushEventQueue();
    }

    console.log('[Analytics] Event:', event.category, event.action, event.label);
  }, [shouldTrack, currentLanguage, getDeviceType, getConnectionType, isOnline, enableRealTimeAnalytics, onEvent]);

  // 发送事件队列
  const flushEventQueue = useCallback(async () => {
    if (eventQueueRef.current.length === 0) return;

    try {
      // 这里可以集成到您的分析服务（如Google Analytics, Mixpanel等）
      const events = [...eventQueueRef.current];
      eventQueueRef.current = [];

      // 示例：发送到自定义分析端点
      if (process.env.VITE_ANALYTICS_ENDPOINT) {
        await fetch(process.env.VITE_ANALYTICS_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events })
        });
      }

      // 存储到本地存储作为备份
      const storedEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      const allEvents = [...storedEvents, ...events].slice(-1000); // 保留最近1000个事件
      localStorage.setItem('analytics_events', JSON.stringify(allEvents));

    } catch (error) {
      console.error('[Analytics] Failed to send events:', error);
      // 重新添加到队列
      eventQueueRef.current.unshift(...eventQueueRef.current);
    }
  }, []);

  // 页面浏览追踪
  const trackPageView = useCallback((path?: string) => {
    const currentPath = path || window.location.pathname;
    
    sendEvent({
      category: 'page',
      action: 'view',
      label: currentPath,
      pageLoadTime: performance.now()
    });

    if (sessionRef.current) {
      sessionRef.current.pageViews++;
      sessionRef.current.bounced = false;
    }
  }, [sendEvent]);

  // 滚动深度追踪
  const trackScrollDepth = useCallback(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.round((scrollTop / docHeight) * 100);
    
    if (scrollPercent > scrollDepthRef.current) {
      scrollDepthRef.current = scrollPercent;
      
      // 发送滚动里程碑事件
      const milestones = [25, 50, 75, 90, 100];
      const milestone = milestones.find(m => scrollPercent >= m && scrollDepthRef.current < m);
      
      if (milestone) {
        sendEvent({
          category: 'engagement',
          action: 'scroll',
          label: `${milestone}%`,
          value: milestone
        });
      }
    }
  }, [sendEvent]);

  // 点击热力图追踪
  const trackClick = useCallback((event: MouseEvent) => {
    if (!enableHeatmap) return;

    const { clientX, clientY } = event;
    const target = event.target as HTMLElement;
    
    heatmapDataRef.current.push({
      x: clientX,
      y: clientY,
      timestamp: Date.now()
    });

    // 限制热力图数据大小
    if (heatmapDataRef.current.length > 1000) {
      heatmapDataRef.current = heatmapDataRef.current.slice(-500);
    }

    sendEvent({
      category: 'interaction',
      action: 'click',
      label: target.tagName.toLowerCase() + (target.id ? `#${target.id}` : '') + (target.className ? `.${target.className.split(' ')[0]}` : ''),
      value: 1
    });
  }, [enableHeatmap, sendEvent]);

  // 用户旅程追踪
  const trackUserJourney = useCallback((step: string, details?: any) => {
    if (!enableUserJourney) return;

    sendEvent({
      category: 'journey',
      action: 'step',
      label: step,
      value: Date.now() - (sessionRef.current?.startTime || Date.now())
    });
  }, [enableUserJourney, sendEvent]);

  // 错误追踪
  const trackError = useCallback((error: Error, info?: any) => {
    if (!enableErrorTracking) return;

    sendEvent({
      category: 'error',
      action: 'javascript',
      label: error.message,
      value: 1
    });
  }, [enableErrorTracking, sendEvent]);

  // 性能追踪
  const trackPerformance = useCallback(() => {
    if (!enablePerformanceTracking || !performance.getEntriesByType) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      sendEvent({
        category: 'performance',
        action: 'timing',
        label: 'page_load',
        value: Math.round(navigation.loadEventEnd - navigation.fetchStart)
      });

      sendEvent({
        category: 'performance',
        action: 'timing',
        label: 'dom_ready',
        value: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart)
      });
    }

    // 追踪资源加载
    const resources = performance.getEntriesByType('resource');
    const slowResources = resources.filter(resource => resource.duration > 1000);
    
    if (slowResources.length > 0) {
      sendEvent({
        category: 'performance',
        action: 'slow_resource',
        label: 'count',
        value: slowResources.length
      });
    }
  }, [enablePerformanceTracking, sendEvent]);

  // 会话结束处理
  const endSession = useCallback(() => {
    if (!sessionRef.current) return;

    const session = sessionRef.current;
    session.endTime = Date.now();
    session.totalEngagementTime = Date.now() - session.startTime;
    session.exitPage = window.location.pathname;

    onSession?.(session);

    sendEvent({
      category: 'session',
      action: 'end',
      label: 'normal',
      value: session.totalEngagementTime
    });

    flushEventQueue();
  }, [onSession, sendEvent, flushEventQueue]);

  // 初始化
  useEffect(() => {
    if (!shouldTrack()) return;

    initializeSession();
    trackPageView();
    
    // 性能追踪
    if (enablePerformanceTracking) {
      setTimeout(trackPerformance, 1000);
    }

    // 事件监听器
    const handleScroll = () => trackScrollDepth();
    const handleClick = (e: MouseEvent) => trackClick(e);
    const handleBeforeUnload = () => endSession();
    const handleVisibilityChange = () => {
      if (document.hidden) {
        sendEvent({
          category: 'engagement',
          action: 'page_hidden',
          value: Date.now() - engagementStartRef.current
        });
      } else {
        engagementStartRef.current = Date.now();
        sendEvent({
          category: 'engagement',
          action: 'page_visible'
        });
      }
    };

    // 添加事件监听
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('click', handleClick);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 定期发送队列中的事件
    const flushInterval = setInterval(flushEventQueue, 30000); // 每30秒

    // 错误监听
    if (enableErrorTracking) {
      const handleError = (event: ErrorEvent) => {
        trackError(new Error(event.message), {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        });
      };
      
      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        trackError(new Error(event.reason), { type: 'unhandled_promise_rejection' });
      };

      window.addEventListener('error', handleError);
      window.addEventListener('unhandledrejection', handleUnhandledRejection);

      return () => {
        window.removeEventListener('scroll', handleScroll);
        document.removeEventListener('click', handleClick);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('error', handleError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        clearInterval(flushInterval);
      };
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClick);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(flushInterval);
    };
  }, [shouldTrack, initializeSession, trackPageView, trackPerformance, trackScrollDepth, trackClick, endSession, enablePerformanceTracking, enableErrorTracking, flushEventQueue, sendEvent, trackError]);

  // 路由变化追踪
  useEffect(() => {
    trackPageView();
  }, [window.location.pathname, trackPageView]);

  // 暴露追踪函数到全局
  useEffect(() => {
    if (!shouldTrack()) return;

    (window as any).analytics = {
      track: (category: string, action: string, label?: string, value?: number) => {
        sendEvent({ category, action, label, value });
      },
      trackPageView,
      trackUserJourney,
      trackError,
      getSessionId: () => sessionRef.current?.id,
      getHeatmapData: () => [...heatmapDataRef.current],
      getEventQueue: () => [...eventQueueRef.current]
    };

    return () => {
      delete (window as any).analytics;
    };
  }, [shouldTrack, sendEvent, trackPageView, trackUserJourney, trackError]);

  // 组件不渲染任何UI，仅用于追踪
  return null;
};

export default UserAnalytics;