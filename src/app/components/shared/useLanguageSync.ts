import { useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../language/LanguageContext';
import { useContent } from '../content/ContentContext';

/**
 * 语言切换同步Hook
 * 确保在语言切换时正确重新加载内容，避免缓存问题
 */
export function useLanguageSync() {
  const { currentLanguage } = useLanguage();
  const { refreshContent, clearCache } = useContent();
  const previousLanguage = useRef<string>(currentLanguage);
  const languageChangeCallbacks = useRef<Array<(newLang: string, oldLang: string) => void>>([]);

  // 检测语言变化
  const isLanguageChanged = useCallback(() => {
    const hasChanged = previousLanguage.current !== currentLanguage;
    if (hasChanged) {
      console.log(`[useLanguageSync] Language changed: ${previousLanguage.current} → ${currentLanguage}`);
      previousLanguage.current = currentLanguage;
    }
    return hasChanged;
  }, [currentLanguage]);

  // 注册语言变化回调
  const onLanguageChange = useCallback((callback: (newLang: string, oldLang: string) => void) => {
    languageChangeCallbacks.current.push(callback);
    
    // 返回取消注册函数
    return () => {
      const index = languageChangeCallbacks.current.indexOf(callback);
      if (index > -1) {
        languageChangeCallbacks.current.splice(index, 1);
      }
    };
  }, []);

  // 强制刷新特定内容类型
  const forceRefreshContent = useCallback(async (contentTypes: string[]) => {
    if (!isLanguageChanged()) return;
    
    try {
      console.log(`[useLanguageSync] Force refreshing content types: ${contentTypes.join(', ')} for ${currentLanguage}`);
      
      // 清理缓存
      clearCache();
      
      // 刷新每个内容类型
      await Promise.all(
        contentTypes.map(type => 
          refreshContent(type, currentLanguage as any)
        )
      );
      
      console.log(`[useLanguageSync] Content refresh completed for ${currentLanguage}`);
    } catch (error) {
      console.error('[useLanguageSync] Failed to refresh content:', error);
    }
  }, [currentLanguage, refreshContent, clearCache, isLanguageChanged]);

  // 监听语言变化
  useEffect(() => {
    if (isLanguageChanged()) {
      const oldLang = previousLanguage.current;
      const newLang = currentLanguage;
      
      // 执行所有注册的回调
      languageChangeCallbacks.current.forEach(callback => {
        try {
          callback(newLang, oldLang);
        } catch (error) {
          console.error('[useLanguageSync] Language change callback error:', error);
        }
      });
    }
  }, [currentLanguage, isLanguageChanged]);

  return {
    currentLanguage,
    isLanguageChanged,
    onLanguageChange,
    forceRefreshContent
  };
}

/**
 * 页面级别的语言同步Hook
 * 为特定页面提供语言切换时的内容重载功能
 */
export function usePageLanguageSync(
  contentTypes: string[], 
  onContentReload?: () => void,
  clearStateCallback?: () => void
) {
  const languageSync = useLanguageSync();
  const callbacksRef = useRef({ onContentReload, clearStateCallback });
  const contentTypesRef = useRef(contentTypes);

  // 更新refs以避免useEffect依赖变化
  useEffect(() => {
    callbacksRef.current = { onContentReload, clearStateCallback };
    contentTypesRef.current = contentTypes;
  });

  useEffect(() => {
    const unregister = languageSync.onLanguageChange((newLang, oldLang) => {
      console.log(`[usePageLanguageSync] Page language changed: ${oldLang} → ${newLang}`);
      
      // 🔥 添加防抖，避免快速连续的语言切换
      setTimeout(() => {
        // 清空当前页面状态
        if (callbacksRef.current.clearStateCallback) {
          callbacksRef.current.clearStateCallback();
        }
        
        // 🔥 减少强制刷新的频率，只在真正需要时刷新
        if (oldLang && newLang !== oldLang) {
          languageSync.forceRefreshContent(contentTypesRef.current).then(() => {
            // 触发页面内容重载
            setTimeout(() => {
              if (callbacksRef.current.onContentReload) {
                callbacksRef.current.onContentReload();
              }
            }, 100);
          }).catch(error => {
            console.error('[usePageLanguageSync] Content refresh failed:', error);
          });
        }
      }, 300); // 300ms防抖
    });

    return unregister;
  }, [languageSync]); // 只依赖languageSync

  return languageSync;
}