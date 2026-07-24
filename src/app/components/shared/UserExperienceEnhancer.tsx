/**
 * UserExperienceEnhancer 组件已被删除
 * 
 * 原因：简化应用架构，移除复杂的UX增强功能
 * 包括：通知系统、离线支持、自动重试、网络状态指示器、错误边界等
 * 
 * 现代应用可使用更轻量的解决方案：
 * - 浏览器原生通知API
 * - Service Worker处理离线功能
 * - React Error Boundary
 * - 简单的状态管理
 */

import React from 'react';

// 为了保持类型导出兼容性，提供空的占位符
export const useUX = () => {
  console.warn('useUX hook is no longer available - UserExperienceEnhancer has been removed');
  return {
    showNotification: () => {},
    showSuccess: () => {},
    showError: () => {},
    showWarning: () => {},
    showInfo: () => {},
    isOnline: navigator.onLine,
    isLoading: false,
    setLoading: () => {}
  };
};

export const withErrorHandling = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return React.forwardRef<any, P>((props, ref) => {
    return <Component ref={ref} {...props} />;
  });
};

interface UserExperienceEnhancerProps {
  children: React.ReactNode;
  enableOfflineSupport?: boolean;
  enableAutoRetry?: boolean;
  maxRetryAttempts?: number;
  retryDelay?: number;
}

export default function UserExperienceEnhancer({ children }: UserExperienceEnhancerProps) {
  return <>{children}</>;
}