import React, { 
  createContext, 
  useContext, 
  useEffect, 
  useState, 
  useCallback, 
  useRef,
  ReactNode 
} from 'react';

// 性能指标接口
interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  componentCount: number;
  imageLoadTime: number;
  scrollPerformance: number;
  interactionDelay: number;
  networkLatency: number;
  cacheHitRate: number;
}

// 优化配置接口
interface OptimizationConfig {
  enableImageLazyLoading: boolean;
  enableComponentMemoization: boolean;
  enableVirtualScrolling: boolean;
  enablePreloading: boolean;
  enableCaching: boolean;
  enablePerformanceMonitoring: boolean;
  maxConcurrentRequests: number;
  imageQuality: 'low' | 'medium' | 'high';
  animationPerformance: 'smooth' | 'balanced' | 'performance';
}

// 性能上下文
interface PerformanceContextType {
  metrics: PerformanceMetrics;
  config: OptimizationConfig;
  updateConfig: (newConfig: Partial<OptimizationConfig>) => void;
  reportMetric: (key: keyof PerformanceMetrics, value: number) => void;
  isOptimizing: boolean;
  suggestions: string[];
}

const defaultMetrics: PerformanceMetrics = {
  renderTime: 0,
  memoryUsage: 0,
  componentCount: 0,
  imageLoadTime: 0,
  scrollPerformance: 0,
  interactionDelay: 0,
  networkLatency: 0,
  cacheHitRate: 0
};

const defaultConfig: OptimizationConfig = {
  enableImageLazyLoading: true,
  enableComponentMemoization: true,
  enableVirtualScrolling: false,
  enablePreloading: true,
  enableCaching: true,
  enablePerformanceMonitoring: true,
  maxConcurrentRequests: 6,
  imageQuality: 'medium',
  animationPerformance: 'balanced'
};

const PerformanceContext = createContext<PerformanceContextType | null>(null);

// 性能管理器提供者组件
export const SmartPerformanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(defaultMetrics);
  const [config, setConfig] = useState<OptimizationConfig>({
    ...defaultConfig,
    enablePerformanceMonitoring: process.env.NODE_ENV !== 'development' // 开发环境禁用
  });
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const metricsHistory = useRef<PerformanceMetrics[]>([]);
  const observerRef = useRef<PerformanceObserver | null>(null);
  const rafId = useRef<number | null>(null);
  const lastMetricUpdate = useRef<number>(0);
  const lastOptimization = useRef<number>(0);

  // 更新配置
  const updateConfig = useCallback((newConfig: Partial<OptimizationConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  // 🔥 关键修复：进一步减少指标更新频率，防止循环
  const reportMetric = useCallback((key: keyof PerformanceMetrics, value: number) => {
    // 🔥 在开发环境中直接返回，避免循环
    if (process.env.NODE_ENV === 'development') {
      return;
    }
    
    const now = Date.now();
    
    // 🔥 大幅增加限制频率 - 30秒才更新一次
    if (now - lastMetricUpdate.current < 30000) {
      return;
    }
    
    lastMetricUpdate.current = now;
    
    setMetrics(prev => {
      // 🔥 增加更大的差值阈值，避免微小变化导致更新
      if (Math.abs(prev[key] - value) < 50) {
        return prev;
      }
      
      return { ...prev, [key]: value };
    });
  }, []);

  // 初始化性能监控 - 在开发环境中禁用以防止循环
  useEffect(() => {
    if (!config.enablePerformanceMonitoring) return;
    
    // 在开发环境中暂时禁用性能监控以防止无限循环
    if (process.env.NODE_ENV === 'development') {
      console.debug('[SmartPerformanceManager] Performance monitoring disabled in development to prevent loops');
      return;
    }

    // Web Vitals 监控
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          switch (entry.entryType) {
            case 'navigation':
              const navEntry = entry as PerformanceNavigationTiming;
              reportMetric('networkLatency', navEntry.responseStart - navEntry.requestStart);
              break;
            case 'paint':
              if (entry.name === 'first-contentful-paint') {
                reportMetric('renderTime', entry.startTime);
              }
              break;
            case 'largest-contentful-paint':
              reportMetric('renderTime', entry.startTime);
              break;
            case 'layout-shift':
              // 记录布局偏移
              break;
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'layout-shift'] });
        observerRef.current = observer;
      } catch (error) {
        console.warn('Performance monitoring not fully supported:', error);
      }
    }

    // 内存使用监控
    const monitorMemory = () => {
      try {
        if ('memory' in performance) {
          const memInfo = (performance as any).memory;
          if (memInfo && memInfo.usedJSHeapSize && memInfo.totalJSHeapSize) {
            const memoryUsage = (memInfo.usedJSHeapSize / memInfo.totalJSHeapSize) * 100;
            reportMetric('memoryUsage', Math.min(100, Math.max(0, memoryUsage)));
          }
        }
      } catch (error) {
        // 静默处理内存监控错误
        console.debug('Memory monitoring not available:', error);
      }
    };

    const intervalId = setInterval(monitorMemory, 30000); // 降低频率到30秒

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      clearInterval(intervalId);
    };
  }, [config.enablePerformanceMonitoring, reportMetric]);

  // 性能分析和优化建议 - SIMPLIFIED to prevent loops
  useEffect(() => {
    // Only update suggestions if there's a significant change
    const newSuggestions: string[] = [];
    
    // Reduce frequency of analysis to prevent loops
    if (metrics.renderTime > 5000) { // Increased threshold
      newSuggestions.push('页面渲染时间过长，建议启用组件记忆化和懒加载');
    }
    
    if (metrics.memoryUsage > 90) { // Increased threshold
      newSuggestions.push('内存使用率过高，建议清理未使用的组件和数据');
    }
    
    // Only update if suggestions actually changed
    setSuggestions(prevSuggestions => {
      if (JSON.stringify(prevSuggestions) === JSON.stringify(newSuggestions)) {
        return prevSuggestions; // No change, return same reference
      }
      return newSuggestions;
    });
    
    // Reduce history updates to prevent memory issues
    if (metricsHistory.current.length > 10) {
      metricsHistory.current = metricsHistory.current.slice(-5);
    }
  }, [
    // Reduce dependencies to only critical ones
    Math.floor(metrics.renderTime / 1000), // Round to reduce frequency
    Math.floor(metrics.memoryUsage / 10)   // Round to reduce frequency
  ]);

  // 自动优化 - DISABLED to prevent infinite loops
  // TODO: Re-enable with better controls after fixing infinite loop issues
  /* useEffect(() => {
    // Auto-optimization temporarily disabled
  }, []); */

  const contextValue: PerformanceContextType = {
    metrics,
    config,
    updateConfig,
    reportMetric,
    isOptimizing,
    suggestions
  };

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  );
};

// 性能钩子
export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within SmartPerformanceProvider');
  }
  return context;
};

// 智能图片组件
export const SmartImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  priority?: 'low' | 'normal' | 'high';
  onLoad?: () => void;
  onError?: () => void;
}> = ({ src, alt, className = '', priority = 'normal', onLoad, onError }) => {
  const { config, reportMetric } = usePerformance();
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const loadStartTime = useRef<number>(0);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleLoad = () => {
    const loadTime = performance.now() - loadStartTime.current;
    reportMetric('imageLoadTime', loadTime);
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  useEffect(() => {
    if (!config.enableImageLazyLoading && imgRef.current) {
      loadStartTime.current = performance.now();
    }
  }, [config.enableImageLazyLoading]);

  // 根据配置调整图片质量
  const getOptimizedSrc = (originalSrc: string): string => {
    if (!originalSrc.includes('?')) {
      return originalSrc;
    }
    
    const url = new URL(originalSrc);
    
    switch (config.imageQuality) {
      case 'low':
        url.searchParams.set('quality', '60');
        url.searchParams.set('format', 'webp');
        break;
      case 'medium':
        url.searchParams.set('quality', '80');
        url.searchParams.set('format', 'webp');
        break;
      case 'high':
        url.searchParams.set('quality', '95');
        break;
    }
    
    return url.toString();
  };

  const optimizedSrc = getOptimizedSrc(src);

  if (hasError) {
    return (
      <div className={`smart-image-error glass-rose rounded-xl p-4 ${className}`}>
        <div className="text-center">
          <div className="text-red-400 mb-2">图片加载失败</div>
          <div className="text-red-300 text-sm">{alt}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`smart-image-container ${className}`}>
      <img
        ref={imgRef}
        src={optimizedSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority === 'high' ? 'eager' : 'lazy'}
        decoding={priority === 'high' ? 'sync' : 'async'}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{
          willChange: 'opacity',
          backfaceVisibility: 'hidden'
        }}
      />
      
      {!isLoaded && (
        <div className="absolute inset-0 glass-blue rounded-xl animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

// 智能滚动容器
export const SmartScrollContainer: React.FC<{
  children: ReactNode;
  className?: string;
  enableVirtualization?: boolean;
  itemHeight?: number;
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
}> = ({ 
  children, 
  className = '', 
  enableVirtualization = false,
  itemHeight = 100,
  onScroll 
}) => {
  const { config, reportMetric } = usePerformance();
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastScrollTime = useRef<number>(0);
  
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const currentTime = performance.now();
    const scrollPerformance = currentTime - lastScrollTime.current;
    lastScrollTime.current = currentTime;
    
    reportMetric('scrollPerformance', scrollPerformance);
    onScroll?.(event);
  }, [reportMetric, onScroll]);

  const scrollContainerClass = `smart-scroll-container ${className} ${
    config.animationPerformance === 'performance' ? 'scroll-smooth-disabled' : 'scroll-smooth'
  }`;

  return (
    <div
      ref={scrollRef}
      className={scrollContainerClass}
      onScroll={handleScroll}
      style={{
        willChange: 'scroll-position',
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)' // 启用硬件加速
      }}
    >
      {children}
    </div>
  );
};

// 性能指标显示组件（开发环境）
export const PerformanceIndicator: React.FC<{ show?: boolean }> = ({ show = false }) => {
  const { metrics, suggestions, isOptimizing } = usePerformance();

  if (!show || process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 glass-blue rounded-xl p-4 text-sm z-50 max-w-xs">
      <div className="text-blue-200 font-medium mb-2 flex items-center">
        <div className={`w-2 h-2 rounded-full mr-2 ${isOptimizing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
        性能监控
      </div>
      
      <div className="space-y-1 text-blue-300">
        <div>渲染: {Math.round(metrics.renderTime)}ms</div>
        <div>内存: {Math.round(metrics.memoryUsage)}%</div>
        <div>图片: {Math.round(metrics.imageLoadTime)}ms</div>
        <div>网络: {Math.round(metrics.networkLatency)}ms</div>
      </div>
      
      {suggestions.length > 0 && (
        <div className="mt-3 pt-2 border-t border-blue-400/20">
          <div className="text-yellow-300 text-xs">优化建议:</div>
          <div className="text-yellow-200 text-xs mt-1">
            {suggestions[0]}
          </div>
        </div>
      )}
    </div>
  );
};

// 资源预加载钩子
export const useResourcePreloader = () => {
  const { config } = usePerformance();
  
  const preloadImage = useCallback((src: string, priority: 'low' | 'high' = 'low') => {
    if (!config.enablePreloading) return Promise.resolve();
    
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
      img.src = src;
      
      if (priority === 'high') {
        img.fetchPriority = 'high';
      }
    });
  }, [config.enablePreloading]);
  
  const preloadRoute = useCallback((route: string) => {
    if (!config.enablePreloading) return;
    
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    document.head.appendChild(link);
  }, [config.enablePreloading]);
  
  return { preloadImage, preloadRoute };
};

export default SmartPerformanceProvider;