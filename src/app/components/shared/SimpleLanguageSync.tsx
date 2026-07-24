import { useEffect, useRef } from 'react';
import { useLanguage } from '../language/LanguageContext';

/**
 * 🔥 超简化的语言同步Hook
 * 专门为解决兴趣页面频闪问题而设计
 * 移除所有复杂的回调和缓存逻辑
 */
export function useSimpleLanguageSync(onLanguageChange?: (newLang: string) => void) {
  const { currentLanguage } = useLanguage();
  const previousLanguageRef = useRef<string>(currentLanguage);
  const isInitialRender = useRef(true);
  
  useEffect(() => {
    // 初始渲染时不触发语言变化回调
    if (isInitialRender.current) {
      isInitialRender.current = false;
      previousLanguageRef.current = currentLanguage;
      return;
    }
    
    // 只有在语言真正变化时才触发回调
    if (previousLanguageRef.current !== currentLanguage) {
      console.log(`[SimpleLanguageSync] Language changed: ${previousLanguageRef.current} → ${currentLanguage}`);
      previousLanguageRef.current = currentLanguage;
      
      if (onLanguageChange) {
        // 使用setTimeout确保状态更新在下一个事件循环中执行
        const timer = setTimeout(() => {
          onLanguageChange(currentLanguage);
        }, 100);
        
        return () => clearTimeout(timer);
      }
    }
  }, [currentLanguage, onLanguageChange]);
  
  return {
    currentLanguage,
    isLanguageChanged: previousLanguageRef.current !== currentLanguage
  };
}