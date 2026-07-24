import React, { useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../language/LanguageContext';

interface AdvancedOptimizationsProps {
  enableImageOptimization?: boolean;
  enableResourceHints?: boolean;
  enableMemoryOptimization?: boolean;
  enableRenderOptimization?: boolean;
  enableConnectionOptimization?: boolean;
}

const AdvancedOptimizations: React.FC<AdvancedOptimizationsProps> = ({
  enableImageOptimization = true,
  enableResourceHints = true,
  enableMemoryOptimization = true,
  enableRenderOptimization = true,
  enableConnectionOptimization = true
}) => {
  const { isZh } = useLanguage();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const preloadedImages = useRef<Set<string>>(new Set());

  // 资源预加载优化
  const optimizeResourceHints = useCallback(() => {
    if (!enableResourceHints) return;

    // DNS预解析
    const dnsHints = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://cdn.jsdelivr.net',
      'https://unpkg.com'
    ];

    dnsHints.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });

    // 预连接关键域名
    const preconnectDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ];

    preconnectDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    console.log('[Optimization] Resource hints applied');
  }, [enableResourceHints]);

  // 图片懒加载和优化
  const optimizeImages = useCallback(() => {
    if (!enableImageOptimization) return;

    // 创建交叉观察器
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          
          // 懒加载图片
          if (img.dataset.src && !img.src) {
            img.src = img.dataset.src;
            img.onload = () => {
              img.classList.add('loaded');
            };
          }

          // 预加载下一张图片
          const nextImg = img.parentElement?.nextElementSibling?.querySelector('img[data-src]') as HTMLImageElement;
          if (nextImg && !preloadedImages.current.has(nextImg.dataset.src || '')) {
            const preloadLink = document.createElement('link');
            preloadLink.rel = 'prefetch';
            preloadLink.href = nextImg.dataset.src || '';
            document.head.appendChild(preloadLink);
            preloadedImages.current.add(nextImg.dataset.src || '');
          }

          observerRef.current?.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.1
    });

    // 观察所有懒加载图片
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => observerRef.current?.observe(img));

    console.log('[Optimization] Image optimization applied to', lazyImages.length, 'images');
  }, [enableImageOptimization]);

  // 内存优化
  const optimizeMemory = useCallback(() => {
    if (!enableMemoryOptimization) return;

    // 清理未使用的图片
    const cleanupImages = () => {
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        const rect = img.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight + 1000 && rect.bottom > -1000;
        
        if (!isVisible && img.src && img.dataset.src) {
          img.src = '';
          img.removeAttribute('src');
        }
      });
    };

    // 定期清理内存
    const cleanupInterval = setInterval(cleanupImages, 60000); // 每分钟清理一次

    // 监听内存压力
    if ('memory' in performance && (performance as any).memory) {
      const checkMemory = () => {
        const memory = (performance as any).memory;
        const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        
        if (memoryUsage > 0.8) {
          console.warn('[Optimization] High memory usage detected:', memoryUsage);
          cleanupImages();
          
          // 强制垃圾回收（如果可用）
          if ('gc' in window) {
            (window as any).gc();
          }
        }
      };

      const memoryInterval = setInterval(checkMemory, 30000); // 每30秒检查内存

      return () => {
        clearInterval(cleanupInterval);
        clearInterval(memoryInterval);
      };
    }

    return () => clearInterval(cleanupInterval);
  }, [enableMemoryOptimization]);

  // 渲染优化
  const optimizeRendering = useCallback(() => {
    if (!enableRenderOptimization) return;

    // 启用GPU加速
    const enableGPUAcceleration = () => {
      const style = document.createElement('style');
      style.textContent = `
        .gpu-accelerated {
          transform: translateZ(0);
          will-change: transform, opacity;
          backface-visibility: hidden;
          perspective: 1000px;
        }
        
        .smooth-scroll {
          scroll-behavior: smooth;
        }
        
        .optimize-animations {
          animation-fill-mode: both;
          animation-duration: 0.3s;
          animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
      `;
      document.head.appendChild(style);

      // 为关键元素添加GPU加速
      const criticalElements = document.querySelectorAll('.glass-blue, .glass-orange, .glass-purple, .btn-glass-blue');
      criticalElements.forEach(el => {
        el.classList.add('gpu-accelerated');
      });
    };

    // 优化滚动性能
    const optimizeScrolling = () => {
      let scrollTimeout: NodeJS.Timeout;
      let isScrolling = false;

      const handleScrollStart = () => {
        if (!isScrolling) {
          isScrolling = true;
          document.body.classList.add('is-scrolling');
        }
        clearTimeout(scrollTimeout);
      };

      const handleScrollEnd = () => {
        scrollTimeout = setTimeout(() => {
          isScrolling = false;
          document.body.classList.remove('is-scrolling');
        }, 150);
      };

      window.addEventListener('scroll', handleScrollStart, { passive: true });
      window.addEventListener('scroll', handleScrollEnd, { passive: true });
    };

    enableGPUAcceleration();
    optimizeScrolling();

    console.log('[Optimization] Rendering optimizations applied');
  }, [enableRenderOptimization]);

  // 连接优化
  const optimizeConnections = useCallback(() => {
    if (!enableConnectionOptimization) return;

    // 检测连接质量
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      const handleConnectionChange = () => {
        const { effectiveType, downlink, rtt, saveData } = connection;
        
        console.log('[Optimization] Connection info:', {
          effectiveType,
          downlink: `${downlink} Mbps`,
          rtt: `${rtt} ms`,
          saveData
        });

        // 根据连接质量调整策略
        if (effectiveType === 'slow-2g' || effectiveType === '2g' || saveData) {
          // 低速连接优化
          document.body.classList.add('low-bandwidth');
          
          // 禁用非关键动画
          const style = document.createElement('style');
          style.id = 'low-bandwidth-style';
          style.textContent = `
            .low-bandwidth * {
              animation-duration: 0.1s !important;
              transition-duration: 0.1s !important;
            }
            .low-bandwidth .terminal-scanlines {
              display: none !important;
            }
          `;
          document.head.appendChild(style);
        } else {
          // 移除低速连接优化
          document.body.classList.remove('low-bandwidth');
          const lowBandwidthStyle = document.getElementById('low-bandwidth-style');
          if (lowBandwidthStyle) {
            lowBandwidthStyle.remove();
          }
        }
      };

      connection.addEventListener('change', handleConnectionChange);
      handleConnectionChange(); // 初始检查
    }

    // 预加载关键资源
    const preloadCriticalResources = () => {
      const criticalUrls = [
        '/api/content/home',
        '/api/content/projects',
        '/api/content/blog'
      ];

      criticalUrls.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
      });
    };

    preloadCriticalResources();

    console.log('[Optimization] Connection optimizations applied');
  }, [enableConnectionOptimization]);

  // 初始化所有优化
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      optimizeResourceHints();
      optimizeImages();
      optimizeRendering();
      optimizeConnections();
      
      const cleanup = optimizeMemory();
      
      return cleanup;
    }, 1000); // 延迟1秒执行，避免阻塞初始渲染

    return () => {
      clearTimeout(timeoutId);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [optimizeResourceHints, optimizeImages, optimizeMemory, optimizeRendering, optimizeConnections]);

  // 暴露优化控制到全局（开发模式）
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      (window as any).optimizations = {
        reapplyImageOptimization: optimizeImages,
        clearImageCache: () => {
          preloadedImages.current.clear();
          console.log('[Optimization] Image cache cleared');
        },
        getMemoryInfo: () => {
          if ('memory' in performance) {
            return (performance as any).memory;
          }
          return null;
        },
        toggleGPUAcceleration: (enable: boolean) => {
          const elements = document.querySelectorAll('.gpu-accelerated');
          elements.forEach(el => {
            if (enable) {
              el.classList.add('gpu-accelerated');
            } else {
              el.classList.remove('gpu-accelerated');
            }
          });
        }
      };

      return () => {
        delete (window as any).optimizations;
      };
    }
  }, [optimizeImages]);

  // 组件不渲染任何UI
  return null;
};

export default AdvancedOptimizations;