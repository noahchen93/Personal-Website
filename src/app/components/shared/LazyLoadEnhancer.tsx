import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Loader2, Image as ImageIcon } from 'lucide-react';

interface LazyLoadEnhancerProps {
  children: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  fallback?: React.ReactNode;
  placeholder?: React.ReactNode;
  onIntersect?: () => void;
  onLoad?: () => void;
  className?: string;
  style?: React.CSSProperties;
  enableBlurTransition?: boolean;
  priority?: 'low' | 'normal' | 'high';
}

const LazyLoadEnhancer: React.FC<LazyLoadEnhancerProps> = ({
  children,
  threshold = 0.1,
  rootMargin = '50px',
  fallback,
  placeholder,
  onIntersect,
  onLoad,
  className = '',
  style = {},
  enableBlurTransition = true,
  priority = 'normal'
}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 移除 createObserver 函数以避免无限循环

  // 预加载处理 - 简化以避免无限循环
  useEffect(() => {
    if (priority === 'high') {
      // 高优先级内容立即加载
      setIsIntersecting(true);
      return;
    }

    // 直接创建observer，避免依赖createObserver回调
    if (!elementRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          if (onIntersect) {
            onIntersect();
          }
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
    };
  }, [priority, threshold, rootMargin]); // 移除 createObserver 和 onIntersect 依赖

  // 监听加载完成
  useEffect(() => {
    if (!isIntersecting) return;

    const element = elementRef.current;
    if (!element) return;

    // 监听图片加载
    const images = element.querySelectorAll('img');
    const loadPromises: Promise<void>[] = [];

    images.forEach((img) => {
      if (img.complete) {
        return;
      }

      const promise = new Promise<void>((resolve, reject) => {
        const handleLoad = () => {
          img.removeEventListener('load', handleLoad);
          img.removeEventListener('error', handleError);
          resolve();
        };

        const handleError = () => {
          img.removeEventListener('load', handleLoad);
          img.removeEventListener('error', handleError);
          reject(new Error(`Image failed to load: ${img.src}`));
        };

        img.addEventListener('load', handleLoad);
        img.addEventListener('error', handleError);
      });

      loadPromises.push(promise);
    });

    // 等待所有图片加载完成
    if (loadPromises.length > 0) {
      Promise.allSettled(loadPromises)
        .then((results) => {
          const failedCount = results.filter(r => r.status === 'rejected').length;
          if (failedCount > 0) {
            console.warn(`[LazyLoadEnhancer] ${failedCount} images failed to load`);
            setHasError(true);
          }
          setIsLoaded(true);
          if (onLoad) {
            onLoad();
          }
        });
    } else {
      // 没有图片时立即标记为已加载
      setIsLoaded(true);
      if (onLoad) {
        onLoad();
      }
    }
  }, [isIntersecting, onLoad]);

  // 渲染占位符
  const renderPlaceholder = () => {
    if (placeholder) {
      return placeholder;
    }

    return (
      <div className="flex items-center justify-center min-h-[200px] bg-gray-800/20 rounded-xl border border-gray-600/20">
        <div className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 bg-gray-600/30 rounded-full flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-gray-400" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-600/30 rounded-xl w-32 mx-auto animate-pulse"></div>
            <div className="h-3 bg-gray-600/20 rounded-xl w-24 mx-auto animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染加载中状态
  const renderLoading = () => {
    return (
      <div className="relative">
        {enableBlurTransition && (
          <div 
            className="absolute inset-0 z-10 backdrop-blur-sm bg-black/20 flex items-center justify-center rounded-xl"
            style={{
              opacity: isLoaded ? 0 : 1,
              transition: 'opacity 0.5s ease-in-out',
              pointerEvents: isLoaded ? 'none' : 'auto'
            }}
          >
            <div className="glass-blue rounded-xl p-4 flex items-center space-x-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
              <span className="text-blue-200 text-small">Loading...</span>
            </div>
          </div>
        )}
        {children}
      </div>
    );
  };

  // 渲染错误状态
  const renderError = () => {
    if (fallback) {
      return fallback;
    }

    return (
      <div className="flex items-center justify-center min-h-[200px] bg-red-900/20 rounded-xl border border-red-500/30">
        <div className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 bg-red-500/30 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-red-300 text-small font-medium">加载失败</p>
            <p className="text-red-400/70 text-small">请稍后重试</p>
          </div>
        </div>
      </div>
    );
  };

  // 容器样式
  const containerStyle: React.CSSProperties = {
    ...style,
    transition: enableBlurTransition ? 'all 0.3s ease-in-out' : undefined,
    transform: isLoaded ? 'translateY(0)' : 'translateY(5px)',
    opacity: isIntersecting ? 1 : 0.3,
  };

  return (
    <div 
      ref={elementRef}
      className={`lazy-load-container ${className}`}
      style={containerStyle}
      data-priority={priority}
      data-intersecting={isIntersecting}
      data-loaded={isLoaded}
      data-error={hasError}
    >
      {!isIntersecting ? renderPlaceholder() : 
       hasError ? renderError() :
       !isLoaded && enableBlurTransition ? renderLoading() :
       children}
    </div>
  );
};

// 预设的懒加载配置
export const LazyLoadPresets = {
  // 图片卡片
  imageCard: {
    threshold: 0.2,
    rootMargin: '100px',
    enableBlurTransition: true,
    priority: 'normal' as const
  },
  
  // 首屏内容
  aboveFold: {
    threshold: 0.1,
    rootMargin: '200px',
    enableBlurTransition: false,
    priority: 'high' as const
  },
  
  // 列表项
  listItem: {
    threshold: 0.1,
    rootMargin: '50px',
    enableBlurTransition: false,
    priority: 'normal' as const
  },
  
  // 页脚内容
  footer: {
    threshold: 0.1,
    rootMargin: '25px',
    enableBlurTransition: false,
    priority: 'low' as const
  }
};

// 工厂函数：创建预设的懒加载组件
export const createLazyComponent = (preset: keyof typeof LazyLoadPresets) => {
  return (props: Omit<LazyLoadEnhancerProps, keyof typeof LazyLoadPresets[typeof preset]>) => (
    <LazyLoadEnhancer {...LazyLoadPresets[preset]} {...props} />
  );
};

// 预定义组件
export const LazyImageCard = createLazyComponent('imageCard');
export const LazyAboveFold = createLazyComponent('aboveFold');
export const LazyListItem = createLazyComponent('listItem');
export const LazyFooter = createLazyComponent('footer');

export default LazyLoadEnhancer;