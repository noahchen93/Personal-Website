import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Heart, Star, User, Clock, ExternalLink } from 'lucide-react';
import { useContent, ContentItem } from '../content/ContentContext';
import { useLanguage, useTexts } from '../language/LanguageContext';
import InterestCard from './interests/InterestCard';
import ReadingMode from './interests/ReadingMode';
import PageLoadingState from '../shared/PageLoadingState';

// 终端提示符常量 - 移到组件外部避免重新创建
const TERMINAL_PROMPT = '> ';

export default function InterestsPage() {
  const { getContentByLanguage, getImageUrl, getImages, isOnline } = useContent();
  const { currentLanguage, isZh } = useLanguage();
  const texts = useTexts();
  
  // 简化的状态管理
  const [allInterests, setAllInterests] = useState<ContentItem[]>([]);
  const [pageSettings, setPageSettings] = useState<any>({});
  const [allImages, setAllImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readingMode, setReadingMode] = useState<ContentItem | null>(null);
  
  // 使用ref来避免重复加载
  const isLoadingRef = useRef(false);
  const loadedLanguageRef = useRef<string | null>(null);

  // 稳定的数据加载函数
  const loadData = useCallback(async (language: string) => {
    // 防止重复加载同一语言数据
    if (isLoadingRef.current || loadedLanguageRef.current === language) {
      console.log('[InterestsPage] Skipping duplicate load for:', language);
      return;
    }
    
    isLoadingRef.current = true;
    console.log('[InterestsPage] Loading data for language:', language);
    setIsLoading(true);
    setError(null);

    try {
      // 加载页面设置
      const settingsContent = await getContentByLanguage('page-settings', language as any);
      const settings = settingsContent.length > 0 && settingsContent[0].data?.interests 
        ? settingsContent[0].data.interests 
        : {};

      // 加载兴趣内容
      const interestsContent = await getContentByLanguage('interests', language as any);
      const sortedInterests = interestsContent.sort((a, b) => {
        const orderA = a.sortOrder || 999999;
        const orderB = b.sortOrder || 999999;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });

      // 加载图片
      const images = await getImages(false).catch(() => []);

      // 批量更新状态
      setPageSettings(settings);
      setAllInterests(sortedInterests);
      setAllImages(images);
      loadedLanguageRef.current = language;

      console.log('[InterestsPage] Data loaded successfully:', {
        interests: sortedInterests.length,
        images: images.length,
        settings: Object.keys(settings).length
      });

    } catch (err) {
      console.error('[InterestsPage] Error loading data:', err);
      setError(isZh ? '加载页面数据失败，请刷新页面重试。' : 'Failed to load page data, please refresh and try again.');
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [getContentByLanguage, getImages, isZh]);

  // 初始数据加载 - 只在语言变化时执行
  useEffect(() => {
    loadedLanguageRef.current = null; // 重置语言状态
    loadData(currentLanguage);
  }, [currentLanguage, loadData]);

  // 处理导航
  const handleNavigation = (target: string, external?: boolean) => {
    if (external) {
      window.open(target, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = target;
    }
  };

  // 处理阅读全文
  const handleReadFull = (interest: ContentItem) => {
    setReadingMode(interest);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 退出阅读模式
  const exitReadingMode = () => {
    setReadingMode(null);
  };

  // 字符串常量 - 使用useMemo稳定引用
  const defaultSubtitle = useMemo(() => isZh 
    ? `${TERMINAL_PROMPT}分享我在技术之外的兴趣爱好和思考，记录生活中的点点滴滴`
    : `${TERMINAL_PROMPT}Sharing my hobbies and thoughts beyond technology, recording life's moments`
  , [isZh]);

  const emptyStateText = useMemo(() => isZh 
    ? `${TERMINAL_PROMPT}还没有添加任何兴趣内容\n${TERMINAL_PROMPT}请在本地内容数据文件中添加内容`
    : `${TERMINAL_PROMPT}No interests have been added yet\n${TERMINAL_PROMPT}Add interests in the local content data file`
  , [isZh]);

  // 阅读模式渲染
  if (readingMode) {
    return (
      <ReadingMode
        readingMode={readingMode}
        onExit={exitReadingMode}
        getImageUrl={getImageUrl}
      />
    );
  }

  // 加载状态
  if (isLoading) {
    return <PageLoadingState label={isZh ? '正在加载兴趣内容…' : 'Loading interests…'} />;
  }

  // 错误状态
  if (error) {
    return (
      <div className="p-6 space-y-8 font-terminal terminal-text custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="glass-pink rounded-xl p-8 transition-all duration-300 mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <Heart className="w-6 h-6 text-pink-200" />
              <h1 className="text-large terminal-text-white tracking-wide">
                [INTERESTS] {isZh ? '兴趣爱好' : 'Personal Interests'}
              </h1>
            </div>
          </div>
          
          <div className="glass-rose rounded-xl p-8 text-center">
            <Heart className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-medium text-red-300 mb-2">
              {isZh ? '加载失败' : 'Loading Failed'}
            </h3>
            <p className="text-red-200 mb-6 text-small">{error}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="btn-glass-rose px-6 py-3 rounded-xl"
              >
                {isZh ? '刷新页面' : 'Refresh Page'}
              </button>
              <button
                onClick={() => {
                  loadedLanguageRef.current = null;
                  loadData(currentLanguage);
                }}
                className="btn-glass-cyan px-6 py-3 rounded-xl"
              >
                {isZh ? '重新加载' : 'Reload Data'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 font-terminal terminal-text custom-scrollbar">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header - Pink Glass Theme */}
        <div className="glass-pink rounded-xl transition-all duration-300 mb-8 px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Heart className="w-6 h-6 text-pink-200" />
              <h1 className="text-large terminal-text-white tracking-wide">
                [INTERESTS] {pageSettings.title || (isZh ? '个人兴趣' : 'Personal Interests')}
              </h1>
            </div>
          </div>
          
          <div className="text-medium text-pink-100 mb-4">
            {pageSettings.subtitle || defaultSubtitle}
          </div>
          
          <div className="flex items-center space-x-4 text-small text-pink-200">
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4" />
              <span>{allInterests.length} {isZh ? '个兴趣' : 'Interests'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4" />
              <span>{isZh ? '多元发展' : 'Diverse Development'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>
                {isZh ? '状态' : 'Status'}: {isOnline ? (isZh ? '在线' : 'Online') : (isZh ? '离线' : 'Offline')}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        {pageSettings.navigationButtons && pageSettings.navigationButtons.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {pageSettings.navigationButtons.map((button: any) => (
              <button
                key={button.id}
                onClick={() => handleNavigation(button.target, button.external)}
                className={`inline-flex items-center space-x-2 px-6 py-3 font-terminal tracking-wide transition-all duration-200 rounded-xl ${
                  button.style === 'primary'
                    ? 'btn-glass-pink terminal-text-white'
                    : 'btn-glass-cyan terminal-text-white'
                }`}
              >
                <span>{TERMINAL_PROMPT}{button.text}</span>
                {button.external && <ExternalLink className="w-4 h-4" />}
              </button>
            ))}
          </div>
        )}

        {/* Interests Grid */}
        {allInterests.length === 0 ? (
          <div className="glass-pink rounded-xl p-8 text-center">
            <Heart className="w-16 h-16 text-pink-300 mx-auto mb-4" />
            <h2 className="text-medium text-pink-300 mb-4">
              {isZh ? '[INFO] 暂无兴趣内容' : '[INFO] No Interests Available'}
            </h2>
            <p className="text-pink-200 text-small mb-6 whitespace-pre-line">
              {emptyStateText}
            </p>
            
            <button
              onClick={() => {
                loadedLanguageRef.current = null;
                loadData(currentLanguage);
              }}
              className="btn-glass-cyan px-6 py-3 rounded-xl"
            >
              {isZh ? '重新加载' : 'Reload Data'}
            </button>
            
            {/* Debug Info */}
            <div className="mt-4 p-4 bg-purple-900/20 border border-purple-400/30 rounded-xl">
              <p className="text-purple-300 text-small mb-2">
                {isZh ? '[DEBUG] 调试信息' : '[DEBUG] Debug Information'}
              </p>
              <div className="text-purple-200 text-small space-y-1">
                <p>Language: {currentLanguage}</p>
                <p>Online status: {isOnline ? 'Online' : 'Offline'}</p>
                <p>All interests: {allInterests?.length || 0}</p>
                <p>Images loaded: {allImages?.length || 0}</p>
                <p>Data loaded: {loadedLanguageRef.current ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {allInterests.map((interest) => (
              <div
                key={interest.id}
                className="transform transition-all duration-300 hover:scale-105"
              >
                <InterestCard 
                  interest={interest} 
                  onReadFull={handleReadFull}
                  allImages={allImages}
                />
              </div>
            ))}
          </div>
        )}

        {/* Status Footer */}
        <div className="flex items-center justify-between text-small text-pink-300 pt-8 border-t border-pink-400/20">
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4" />
            <span>
              {isZh ? `共 ${allInterests.length} 个兴趣` : `${allInterests.length} interests total`}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span className={isOnline ? 'text-green-400' : 'text-yellow-400'}>
                {isOnline ? (isZh ? '在线模式' : 'Online') : (isZh ? '离线模式' : 'Offline')}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{allImages.length} {isZh ? '张图片' : 'Images'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
