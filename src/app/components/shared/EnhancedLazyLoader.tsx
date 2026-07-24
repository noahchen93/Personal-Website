import React, { 
  useEffect, 
  useRef, 
  useCallback, 
  useState, 
  useMemo,
  ReactNode,
  CSSProperties 
} from 'react';
import { Loader2, Image as ImageIcon, AlertCircle, Zap } from 'lucide-react';

interface EnhancedLazyLoaderProps {
  children: ReactNode;
  threshold?: number;
  rootMargin?: string;
  fallback?: ReactNode;
  placeholder?: ReactNode;
  onIntersect?: () => void;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  style?: CSSProperties;
  enableBlurTransition?: boolean;
  enableScaleAnimation?: boolean;
  enableFadeAnimation?: boolean;
  enableSlideAnimation?: boolean;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  delay?: number;
  animationDuration?: number;
  preloadImages?: boolean;
  enableProgressBar?: boolean;
  errorRetryCount?: number;
  loadingText?: string;
  errorText?: string;
  slideDirection?: 'up' | 'down' | 'left' | 'right';
}

interface LoadingState {
  isIntersecting: boolean;
  isLoading: boolean;
  isLoaded: boolean;
  hasError: boolean;
  progress: number;
  retryCount: number;
}

const EnhancedLazyLoader: React.FC<EnhancedLazyLoaderProps> = ({
  children,
  threshold = 0.1,
  rootMargin = '50px',
  fallback,
  placeholder,
  onIntersect,
  onLoad,
  onError,
  className = '',
  style = {},
  enableBlurTransition = true,
  enableScaleAnimation = true,
  enableFadeAnimation = true,
  enableSlideAnimation = false,
  priority = 'normal',
  delay = 0,
  animationDuration = 500,
  preloadImages = true,
  enableProgressBar = false,
  errorRetryCount = 3,
  loadingText = '正在加载...',
  errorText = '加载失败',
  slideDirection = 'up'
}) => {
  const [state, setState] = useState<LoadingState>({
    isIntersecting: false,
    isLoading: false,
    isLoaded: false,
    hasError: false,
    progress: 0,
    retryCount: 0
  });

  const elementRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // 优先级配置
  const priorityConfig = useMemo(() => {
    switch (priority) {
      case 'critical':
        return { immediate: true, preload: true, rootMargin: '200px' };
      case 'high':
        return { immediate: false, preload: true, rootMargin: '150px' };
      case 'normal':
        return { immediate: false, preload: preloadImages, rootMargin };
      case 'low':
        return { immediate: false, preload: false, rootMargin: '25px' };
      default:
        return { immediate: false, preload: preloadImages, rootMargin };
    }
  }, [priority, preloadImages, rootMargin]);

  // 创建 Intersection Observer
  const createObserver = useCallback(() => {
    if (!elementRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !state.isIntersecting) {
          setState(prev => ({ ...prev, isIntersecting: true, isLoading: true }));
          onIntersect?.();
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin: priorityConfig.rootMargin
      }
    );

    observer.observe(elementRef.current);
    observerRef.current = observer;
  }, [threshold, priorityConfig.rootMargin, state.isIntersecting, onIntersect]);

  // 初始化观察器
  useEffect(() => {
    if (priorityConfig.immediate) {
      setState(prev => ({ ...prev, isIntersecting: true, isLoading: true }));
      return;
    }

    if (delay > 0) {
      timeoutRef.current = setTimeout(createObserver, delay);
    } else {
      createObserver();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [createObserver, delay, priorityConfig.immediate]);

  // 加载内容
  const loadContent = useCallback(async () => {
    if (!state.isIntersecting || state.isLoaded) return;

    try {
      const element = elementRef.current;
      if (!element) return;

      setState(prev => ({ ...prev, isLoading: true, progress: 0 }));

      // 查找所有需要加载的图片
      const images = Array.from(element.querySelectorAll('img')) as HTMLImageElement[];
      const videos = Array.from(element.querySelectorAll('video')) as HTMLVideoElement[];
      const totalItems = images.length + videos.length;

      if (totalItems === 0) {
        setState(prev => ({ ...prev, isLoaded: true, isLoading: false, progress: 100 }));
        onLoad?.();
        return;
      }

      let loadedCount = 0;

      const updateProgress = () => {
        const progress = Math.round((loadedCount / totalItems) * 100);
        setState(prev => ({ ...prev, progress }));
      };

      const promises: Promise<void>[] = [];

      // 加载图片
      images.forEach((img) => {
        if (img.complete && img.naturalWidth > 0) {
          loadedCount++;
          updateProgress();
          return;
        }

        const promise = new Promise<void>((resolve, reject) => {
          const handleLoad = () => {
            loadedCount++;
            updateProgress();
            resolve();
          };

          const handleError = () => {
            reject(new Error(`Image failed to load: ${img.src}`));
          };

          img.addEventListener('load', handleLoad, { once: true });
          img.addEventListener('error', handleError, { once: true });

          // 设置超时
          setTimeout(() => {
            reject(new Error(`Image loading timeout: ${img.src}`));
          }, 10000);
        });

        promises.push(promise);
      });

      // 加载视频
      videos.forEach((video) => {
        const promise = new Promise<void>((resolve, reject) => {
          const handleCanPlay = () => {
            loadedCount++;
            updateProgress();
            resolve();
          };

          const handleError = () => {
            reject(new Error(`Video failed to load: ${video.src}`));
          };

          video.addEventListener('canplaythrough', handleCanPlay, { once: true });
          video.addEventListener('error', handleError, { once: true });

          // 设置超时
          setTimeout(() => {
            reject(new Error(`Video loading timeout: ${video.src}`));
          }, 15000);
        });

        promises.push(promise);
      });

      // 等待所有资源加载完成
      const results = await Promise.allSettled(promises);
      const failedCount = results.filter(r => r.status === 'rejected').length;

      if (failedCount > 0 && failedCount === totalItems) {
        throw new Error(`All resources failed to load (${failedCount}/${totalItems})`);
      }

      // 添加动画延迟
      await new Promise(resolve => setTimeout(resolve, animationDuration * 0.3));

      setState(prev => ({ 
        ...prev, 
        isLoaded: true, 
        isLoading: false, 
        progress: 100 
      }));
      onLoad?.();

    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown loading error');
      
      if (state.retryCount < errorRetryCount) {
        setState(prev => ({ 
          ...prev, 
          retryCount: prev.retryCount + 1,
          isLoading: false 
        }));
        
        // 重试延迟
        setTimeout(() => {
          setState(prev => ({ ...prev, hasError: false }));
          loadContent();
        }, 1000 * (state.retryCount + 1));
      } else {
        setState(prev => ({ 
          ...prev, 
          hasError: true, 
          isLoading: false 
        }));
        onError?.(err);
      }
    }
  }, [state.isIntersecting, state.isLoaded, state.retryCount, errorRetryCount, animationDuration, onLoad, onError]);

  // 触发加载
  useEffect(() => {
    if (state.isIntersecting && !state.isLoaded && !state.hasError) {
      loadContent();
    }
  }, [state.isIntersecting, state.isLoaded, state.hasError, loadContent]);

  // 生成动画样式
  const generateAnimationStyles = (): CSSProperties => {
    const baseStyle: CSSProperties = {
      transition: `all ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    };

    if (!state.isIntersecting) {
      return {
        ...baseStyle,
        opacity: enableFadeAnimation ? 0.1 : 1,
        transform: [
          enableScaleAnimation ? 'scale(0.95)' : '',
          enableSlideAnimation ? getSlideTransform(slideDirection, 20) : ''
        ].filter(Boolean).join(' ') || 'none',
        filter: enableBlurTransition ? 'blur(2px)' : 'none'
      };
    }

    if (state.isLoading) {
      return {
        ...baseStyle,
        opacity: enableFadeAnimation ? 0.7 : 1,
        transform: [
          enableScaleAnimation ? 'scale(0.98)' : '',
          enableSlideAnimation ? getSlideTransform(slideDirection, 5) : ''
        ].filter(Boolean).join(' ') || 'none',
        filter: enableBlurTransition ? 'blur(1px)' : 'none'
      };
    }

    if (state.isLoaded) {
      return {
        ...baseStyle,
        opacity: 1,
        transform: 'scale(1) translate(0, 0)',
        filter: 'none'
      };
    }

    return baseStyle;
  };

  // 获取滑动变换
  const getSlideTransform = (direction: string, distance: number): string => {
    switch (direction) {
      case 'up': return `translateY(${distance}px)`;
      case 'down': return `translateY(-${distance}px)`;
      case 'left': return `translateX(${distance}px)`;
      case 'right': return `translateX(-${distance}px)`;
      default: return '';
    }
  };

  // 渲染占位符
  const renderPlaceholder = () => {
    if (placeholder) return placeholder;

    return (
      <div className="flex items-center justify-center min-h-[200px] glass-blue rounded-xl border border-blue-400/20">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 glass-cyan rounded-full flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-cyan-300" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-blue-400/20 rounded-xl w-32 mx-auto animate-pulse"></div>
            <div className="h-3 bg-blue-400/10 rounded-xl w-24 mx-auto animate-pulse delay-75"></div>
            <div className="h-2 bg-blue-400/5 rounded-xl w-16 mx-auto animate-pulse delay-150"></div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染加载状态
  const renderLoading = () => {
    return (
      <div className="relative">
        <div 
          className="absolute inset-0 z-20 glass-blue rounded-xl flex flex-col items-center justify-center space-y-4"
          style={{
            backdropFilter: 'blur(8px) saturate(150%)',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)'
          }}
        >
          <div className="flex items-center space-x-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
            <span className="text-blue-200 font-medium">{loadingText}</span>
            {priority === 'high' || priority === 'critical' ? (
              <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
            ) : null}
          </div>
          
          {enableProgressBar && (
            <div className="w-48 bg-blue-900/30 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${state.progress}%` }}
              />
            </div>
          )}
          
          {enableProgressBar && (
            <span className="text-blue-300 text-sm">
              {state.progress}%
            </span>
          )}
        </div>
        
        <div style={{ filter: 'blur(2px)', opacity: 0.3 }}>
          {children}
        </div>
      </div>
    );
  };

  // 渲染错误状态
  const renderError = () => {
    if (fallback) return fallback;

    return (
      <div className="flex items-center justify-center min-h-[200px] glass-rose rounded-xl border border-red-400/30">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <div>
            <p className="text-red-300 font-medium mb-2">{errorText}</p>
            <p className="text-red-400/70 text-sm mb-4">
              已重试 {state.retryCount} 次
            </p>
            <button
              onClick={() => {
                setState(prev => ({ 
                  ...prev, 
                  hasError: false, 
                  retryCount: 0,
                  progress: 0 
                }));
                loadContent();
              }}
              className="btn-glass-rose px-4 py-2 rounded-xl text-sm"
            >
              重新加载
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 合并样式
  const containerStyle: CSSProperties = {
    ...style,
    ...generateAnimationStyles()
  };

  return (
    <div 
      ref={elementRef}
      className={`enhanced-lazy-container ${className}`}
      style={containerStyle}
      data-priority={priority}
      data-intersecting={state.isIntersecting}
      data-loading={state.isLoading}
      data-loaded={state.isLoaded}
      data-error={state.hasError}
      data-progress={state.progress}
    >
      {!state.isIntersecting ? renderPlaceholder() : 
       state.hasError ? renderError() :
       state.isLoading ? renderLoading() :
       children}
    </div>
  );
};

// 预设配置
export const LazyLoadPresets = {
  hero: {
    priority: 'critical' as const,
    enableBlurTransition: true,
    enableScaleAnimation: true,
    enableFadeAnimation: true,
    enableSlideAnimation: true,
    slideDirection: 'up' as const,
    animationDuration: 800,
    threshold: 0.1,
    rootMargin: '200px'
  },
  
  card: {
    priority: 'normal' as const,
    enableBlurTransition: true,
    enableScaleAnimation: true,
    enableFadeAnimation: true,
    enableSlideAnimation: false,
    animationDuration: 600,
    threshold: 0.2,
    rootMargin: '100px',
    enableProgressBar: true
  },
  
  list: {
    priority: 'normal' as const,
    enableBlurTransition: false,
    enableScaleAnimation: false,
    enableFadeAnimation: true,
    enableSlideAnimation: true,
    slideDirection: 'up' as const,
    animationDuration: 400,
    threshold: 0.1,
    rootMargin: '50px'
  },
  
  footer: {
    priority: 'low' as const,
    enableBlurTransition: false,
    enableScaleAnimation: false,
    enableFadeAnimation: true,
    animationDuration: 300,
    threshold: 0.1,
    rootMargin: '25px'
  }
};

// 工厂函数
export const createLazyComponent = (preset: keyof typeof LazyLoadPresets) => {
  return (props: Partial<EnhancedLazyLoaderProps>) => (
    <EnhancedLazyLoader {...LazyLoadPresets[preset]} {...props} />
  );
};

// 预定义组件
export const LazyHero = createLazyComponent('hero');
export const LazyCard = createLazyComponent('card');
export const LazyList = createLazyComponent('list');
export const LazyFooter = createLazyComponent('footer');

export default EnhancedLazyLoader;