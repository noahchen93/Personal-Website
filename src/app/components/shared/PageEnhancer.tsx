import React, { ReactNode, useEffect, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import EnhancedLazyLoader from './EnhancedLazyLoader';
import AnimationSystem, { PageTransition } from './AnimationSystem';
import { usePerformance, SmartScrollContainer } from './SmartPerformanceManager';

interface PageEnhancerProps {
  children: ReactNode;
  pageType?: 'home' | 'projects' | 'blog' | 'interests' | 'ai-explore' | 'contact';
  enableAnimations?: boolean;
  enableLazyLoading?: boolean;
  enablePerformanceOptimizations?: boolean;
  customTransition?: 'fade' | 'slide' | 'scale' | 'terminal';
  className?: string;
}

// 页面类型配置
const PAGE_CONFIGS = {
  home: {
    priority: 'critical' as const,
    animationPreset: 'cyber' as const,
    transitionMode: 'terminal' as const,
    enableHoverEffects: true,
    enableScrollOptimization: true
  },
  projects: {
    priority: 'high' as const,
    animationPreset: 'slideUp' as const,
    transitionMode: 'slide' as const,
    enableHoverEffects: true,
    enableScrollOptimization: true
  },
  blog: {
    priority: 'normal' as const,
    animationPreset: 'fadeIn' as const,
    transitionMode: 'fade' as const,
    enableHoverEffects: false,
    enableScrollOptimization: true
  },
  interests: {
    priority: 'normal' as const,
    animationPreset: 'scaleIn' as const,
    transitionMode: 'scale' as const,
    enableHoverEffects: true,
    enableScrollOptimization: true
  },
  'ai-explore': {
    priority: 'high' as const,
    animationPreset: 'glitch' as const,
    transitionMode: 'terminal' as const,
    enableHoverEffects: true,
    enableScrollOptimization: false
  },
  contact: {
    priority: 'low' as const,
    animationPreset: 'fadeIn' as const,
    transitionMode: 'fade' as const,
    enableHoverEffects: false,
    enableScrollOptimization: false
  }
};

const PageEnhancer: React.FC<PageEnhancerProps> = ({
  children,
  pageType = 'home',
  enableAnimations = true,
  enableLazyLoading = true,
  enablePerformanceOptimizations = true,
  customTransition,
  className = ''
}) => {
  const { config, reportMetric } = usePerformance();
  const [isPageReady, setIsPageReady] = useState(false);
  const [renderStartTime] = useState(() => performance.now());

  const pageConfig = PAGE_CONFIGS[pageType];
  const transitionMode = customTransition || pageConfig.transitionMode;

  // 页面准备完成监听
  useEffect(() => {
    const handlePageReady = () => {
      const renderTime = performance.now() - renderStartTime;
      reportMetric('renderTime', renderTime);
      setIsPageReady(true);
    };

    // 使用 requestAnimationFrame 确保 DOM 渲染完成
    const raf = requestAnimationFrame(() => {
      handlePageReady();
    });

    return () => {
      cancelAnimationFrame(raf);
    };
  }, [renderStartTime, reportMetric]);

  // 根据配置决定是否启用功能
  const shouldEnableAnimations = enableAnimations && config.animationPerformance !== 'performance';
  const shouldEnableLazyLoading = enableLazyLoading && config.enableImageLazyLoading;
  const shouldEnableScrollOptimization = enablePerformanceOptimizations && pageConfig.enableScrollOptimization;

  // 包装内容的组件
  const ContentWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
    if (!shouldEnableAnimations) {
      return <div className={`page-content ${className}`}>{children}</div>;
    }

    return (
      <AnimationSystem
        preset={pageConfig.animationPreset}
        duration={0.8}
        triggerOnView={true}
        enableHover={pageConfig.enableHoverEffects}
        className={`page-content ${className}`}
      >
        {children}
      </AnimationSystem>
    );
  };

  // 懒加载包装器
  const LazyWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
    if (!shouldEnableLazyLoading) {
      return <>{children}</>;
    }

    return (
      <EnhancedLazyLoader
        priority={pageConfig.priority}
        enableBlurTransition={true}
        enableScaleAnimation={shouldEnableAnimations}
        enableFadeAnimation={shouldEnableAnimations}
        enableProgressBar={pageType === 'projects' || pageType === 'ai-explore'}
        animationDuration={600}
        loadingText={`正在加载${pageType === 'home' ? '首页' : pageType === 'projects' ? '项目' : pageType === 'blog' ? '博客' : pageType === 'interests' ? '兴趣' : pageType === 'ai-explore' ? 'AI探索' : '联系'}内容...`}
      >
        {children}
      </EnhancedLazyLoader>
    );
  };

  // 滚动优化包装器
  const ScrollWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
    if (!shouldEnableScrollOptimization) {
      return <>{children}</>;
    }

    return (
      <SmartScrollContainer
        className="min-h-screen"
        onScroll={(e) => {
          // 记录滚动性能指标
          const scrollTop = e.currentTarget.scrollTop;
          if (scrollTop > 0) {
            reportMetric('scrollPerformance', performance.now());
          }
        }}
      >
        {children}
      </SmartScrollContainer>
    );
  };

  return (
    <AnimatePresence mode="wait">
      <PageTransition mode={transitionMode} duration={0.6}>
        <div 
          className={`page-enhancer hardware-accelerated ${pageType}-page`}
          data-page-type={pageType}
          data-animations-enabled={shouldEnableAnimations}
          data-lazy-loading-enabled={shouldEnableLazyLoading}
          data-optimizations-enabled={enablePerformanceOptimizations}
        >
          <ScrollWrapper>
            <LazyWrapper>
              <ContentWrapper>
                {children}
              </ContentWrapper>
            </LazyWrapper>
          </ScrollWrapper>

          {/* 页面特效层 */}
          {shouldEnableAnimations && (
            <div className="page-effects-layer pointer-events-none fixed inset-0 z-0">
              {/* 根据页面类型添加不同的背景效果 */}
              {pageType === 'home' && (
                <>
                  <div className="floating-particles w-full h-full absolute inset-0 opacity-30"></div>
                  <div className="terminal-scanlines w-full h-full absolute inset-0 opacity-10"></div>
                </>
              )}
              
              {pageType === 'ai-explore' && (
                <>
                  <div className="matrix-rain w-full h-full absolute inset-0 opacity-20"></div>
                  <div className="data-stream w-full h-full absolute inset-0 opacity-15"></div>
                </>
              )}
              
              {(pageType === 'projects' || pageType === 'interests') && (
                <div className="cyber-glow w-64 h-64 absolute top-20 right-20 opacity-20"></div>
              )}
            </div>
          )}
        </div>
      </PageTransition>
    </AnimatePresence>
  );
};

// 高阶组件：为页面组件添加增强功能
export const withPageEnhancer = <P extends object>(
  Component: React.ComponentType<P>,
  config?: Partial<PageEnhancerProps>
) => {
  const EnhancedComponent = React.forwardRef<any, P>((props, ref) => (
    <PageEnhancer {...config}>
      <Component {...props} ref={ref} />
    </PageEnhancer>
  ));

  EnhancedComponent.displayName = `withPageEnhancer(${Component.displayName || Component.name})`;
  return EnhancedComponent;
};

// 页面组件工厂
export const createEnhancedPage = (
  pageType: PageEnhancerProps['pageType'],
  Component: React.ComponentType<any>
) => {
  return withPageEnhancer(Component, { pageType });
};

// 快速页面创建器
export const EnhancedHomePage = (Component: React.ComponentType<any>) => 
  createEnhancedPage('home', Component);

export const EnhancedProjectsPage = (Component: React.ComponentType<any>) => 
  createEnhancedPage('projects', Component);

export const EnhancedBlogPage = (Component: React.ComponentType<any>) => 
  createEnhancedPage('blog', Component);

export const EnhancedInterestsPage = (Component: React.ComponentType<any>) => 
  createEnhancedPage('interests', Component);

export const EnhancedAIExplorePage = (Component: React.ComponentType<any>) => 
  createEnhancedPage('ai-explore', Component);

export const EnhancedContactPage = (Component: React.ComponentType<any>) => 
  createEnhancedPage('contact', Component);

export default PageEnhancer;