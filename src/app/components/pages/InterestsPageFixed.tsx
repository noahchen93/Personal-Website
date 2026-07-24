// 🔥 此文件已被合并到主InterestsPage.tsx中，可以删除
// 保留作为备份参考

export default function InterestsPageFixed() {
  const { 
    getContentByLanguage, 
    getImageUrl, 
    getImages,
    isOnline
  } = useContent();
  const { currentLanguage, isZh } = useLanguage();
  const texts = useTexts();
  const [allInterests, setAllInterests] = useState<ContentItem[]>([]);
  const [pageSettings, setPageSettings] = useState<PageSettings>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allImages, setAllImages] = useState<any[]>([]);
  const [readingMode, setReadingMode] = useState<ContentItem | null>(null);
  const { preloadImage, preloadRoute } = useResourcePreloader();
  
  // 🔥 严格的防重复加载控制
  const loadingInProgress = useRef(false);
  const loadedForLanguage = useRef<string | null>(null);
  const mountTime = useRef(Date.now());
  const componentId = useRef(`interests-${Math.random().toString(36).substr(2, 9)}`);

  const seoConfig = useMemo(() => ({
    title: isZh ? '兴趣爱好 | Noah Chen - 技术之外的生活分享' : 'Interests | Noah Chen - Life Beyond Technology',
    description: isZh
      ? '分享我在技术之外的兴趣爱好和思考，记录生活中的点点滴滴，探索多彩的世界。'
      : 'Sharing my hobbies and thoughts beyond technology, recording life\\'s moments, exploring the colorful world.',
    keywords: isZh
      ? ['个人兴趣', '兴趣爱好', '生活分享', '多元发展', '生活记录', '个人成长', '兴趣探索']
      : ['Personal Interests', 'Hobbies', 'Life Sharing', 'Diverse Development', 'Life Records', 'Personal Growth', 'Interest Exploration'],
    type: 'website' as const
  }), [isZh]);

  usePageSEO('interests', seoConfig);

  // 🔥 极简的数据加载函数
  const loadData = useCallback(async (language: string, forceReload = false) => {
    const logPrefix = `[${componentId.current}]`;
    
    // 防止重复加载同一语言的数据
    if (!forceReload && loadedForLanguage.current === language) {
      console.log(`${logPrefix} Data already loaded for ${language}, skipping...`);
      return;
    }
    
    // 防止并发加载
    if (loadingInProgress.current) {
      console.log(`${logPrefix} Loading already in progress, skipping...`);
      return;
    }
    
    loadingInProgress.current = true;
    console.log(`${logPrefix} Loading data for language: ${language}`);
    
    try {
      setIsLoading(true);
      setError(null);
      
      // 并行加载所有数据
      const [settingsData, interestsData, imagesData] = await Promise.all([
        // 加载页面设置
        getContentByLanguage('page-settings', language as any)
          .then(content => content.length > 0 && content[0].data?.interests ? content[0].data.interests : {})
          .catch(() => ({})),
        
        // 加载兴趣内容
        getContentByLanguage('interests', language as any)
          .then(content => {
            return content.sort((a, b) => {
              const orderA = a.sortOrder || 999999;
              const orderB = b.sortOrder || 999999;
              if (orderA !== orderB) return orderA - orderB;
              return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
            });
          }),
        
        // 加载图片数据
        getImages(false).catch(() => [])
      ]);
      
      // 批量更新状态
      setPageSettings(settingsData);
      setAllInterests(interestsData);
      setAllImages(imagesData);
      
      loadedForLanguage.current = language;
      console.log(`${logPrefix} Data loaded successfully: ${interestsData.length} interests, ${imagesData.length} images`);
      
    } catch (error) {
      console.error(`${logPrefix} Error loading data:`, error);
      setError(isZh ? '加载页面数据失败，请刷新页面重试。' : 'Failed to load page data, please refresh and try again.');
    } finally {
      setIsLoading(false);
      loadingInProgress.current = false;
    }
  }, [getContentByLanguage, getImages, isZh]);

  // 🔥 使用简化的语言同步Hook
  useSimpleLanguageSync((newLanguage) => {
    console.log(`[${componentId.current}] Language sync triggered: ${newLanguage}`);
    
    // 清空当前数据
    setAllInterests([]);
    setPageSettings({});
    setAllImages([]);
    loadedForLanguage.current = null;
    
    // 延迟加载新语言数据
    setTimeout(() => {
      loadData(newLanguage, true);
    }, 200);
  });

  // 🔥 初始数据加载 - 仅在组件挂载时执行一次
  useEffect(() => {
    const logPrefix = `[${componentId.current}]`;
    console.log(`${logPrefix} Component mounted, initial load for: ${currentLanguage}`);
    
    // 延迟初始加载，避免与其他组件冲突
    const timer = setTimeout(() => {
      loadData(currentLanguage, false);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []); // 空依赖数组，只在挂载时执行

  // 🔥 简化的预加载逻辑
  useEffect(() => {
    if (allInterests.length > 0) {
      // 预加载重要路由
      preloadRoute('/projects');
      preloadRoute('/blog');
      
      // 预加载前3个兴趣的图片
      allInterests.slice(0, 3).forEach((interest, index) => {
        if (interest.imageUrl) {
          setTimeout(() => {
            preloadImage(interest.imageUrl!, 'high');
          }, index * 100);
        }
      });
    }
  }, [allInterests.length, preloadRoute, preloadImage]);

  const handleNavigation = (target: string, external?: boolean) => {
    handleNavigationHelper(target, external);
  };

  // 处理阅读全文
  const handleReadFull = useCallback((interest: ContentItem) => {
    setReadingMode(interest);
    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // 退出阅读模式
  const exitReadingMode = useCallback(() => {
    setReadingMode(null);
  }, []);

  // 阅读模式布局
  if (readingMode) {
    return (
      <ReadingMode
        readingMode={readingMode}
        onExit={exitReadingMode}
        getImageUrl={getImageUrl}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-8 font-terminal text-green-400 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="glass-pink rounded-lg p-8">
            <div className="h-8 bg-gray-700/50 rounded mb-4 w-1/3 animate-pulse"></div>
            <div className="h-4 bg-gray-800/50 rounded mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-800/50 rounded w-2/3 animate-pulse"></div>
          </div>

          {/* Interest Skeletons */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-pink rounded-lg p-6">
                <div className="h-48 bg-gray-700/50 rounded mb-4 animate-pulse"></div>
                <div className="h-6 bg-gray-700/50 rounded mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-800/50 rounded w-3/4 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-8 font-terminal text-green-400 custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="glass-pink rounded-lg p-8 transition-all duration-300 mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <Heart className="w-6 h-6 text-pink-200" />
              <h1 className="text-large text-white tracking-wide">
                [INTERESTS] {isZh ? '兴趣爱好' : 'Personal Interests'}
              </h1>
            </div>
          </div>
          
          <div className="glass-rose rounded-lg p-8 text-center">
            <Heart className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-medium text-red-300 mb-2">
              {isZh ? '加载失败' : 'Loading Failed'}
            </h3>
            <p className="text-red-200 mb-6 text-small">{error}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="btn-glass-pink px-6 py-3 rounded-lg"
              >
                {isZh ? '刷新页面' : 'Refresh Page'}
              </button>
              <button
                onClick={() => loadData(currentLanguage, true)}
                className="btn-glass-cyan px-6 py-3 rounded-lg"
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
    <PageEnhancer pageType="interests" enableAnimations={true} enableLazyLoading={true}>
      <ErrorBoundary>
        <div className="p-6 space-y-8 font-terminal text-green-400 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            
            {/* Page Header - Pink Glass Theme with Animation */}
            <FadeIn delay={0.2}>
              <div className="glass-pink rounded-lg transition-all duration-300 mb-8 px-[32px] py-[24px] pulse-breath">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Heart className="w-6 h-6 text-pink-200" />
                    <h1 className="text-large text-white tracking-wide">
                      [INTERESTS] {pageSettings.title || (isZh ? '个人兴趣' : 'Personal Interests')}
                    </h1>
                  </div>
                </div>
                
                <div className="text-medium text-pink-100 mb-4">
                  {pageSettings.subtitle || (isZh 
                    ? '> 分享我在技术之外的兴趣爱好和思考，记录生活中的点点滴滴'
                    : '> Sharing my hobbies and thoughts beyond technology, recording life\\'s moments')}
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
            </FadeIn>

          {/* Navigation Buttons - Pink Glass */}
          {pageSettings.navigationButtons && pageSettings.navigationButtons.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {pageSettings.navigationButtons.map((button) => (
                <button
                  key={button.id}
                  onClick={() => handleNavigation(button.target, button.external)}
                  className={`inline-flex items-center space-x-2 px-6 py-3 font-terminal tracking-wide transition-all duration-200 rounded-lg ${
                    button.style === 'primary'
                      ? 'btn-glass-pink text-white'
                      : 'btn-glass-cyan text-white'
                  }`}
                >
                  <span>> {button.text}</span>
                  {button.external && <ExternalLink className="w-4 h-4" />}
                </button>
              ))}
            </div>
          )}

          {/* Interests Grid */}
          {allInterests.length === 0 ? (
            <div className="glass-pink rounded-lg p-8 text-center">
              <Heart className="w-16 h-16 text-pink-300 mx-auto mb-4" />
              <h2 className="text-medium text-pink-300 mb-4">
                {isZh ? '[INFO] 暂无兴趣内容' : '[INFO] No Interests Available'}
              </h2>
              <p className="text-pink-200 text-small mb-6">
                {isZh 
                  ? '> 还没有添加任何兴趣内容\n> 请使用管理面板添加内容'
                  : '> No interests have been added yet\n> Please use the admin panel to add content'
                }
              </p>
              
              <button
                onClick={() => loadData(currentLanguage, true)}
                className="btn-glass-cyan px-6 py-3 rounded-lg mx-auto"
              >
                {isZh ? '重新加载' : 'Reload Data'}
              </button>
              
              {/* Debug Info */}
              <div className="mt-4 p-4 bg-purple-900/20 border border-purple-400/30 rounded-lg">
                <p className="text-purple-300 text-small mb-2">
                  {isZh ? '[DEBUG] 调试信息' : '[DEBUG] Debug Information'}
                </p>
                <div className="text-purple-200 text-small space-y-1">
                  <p>Language: {currentLanguage}</p>
                  <p>Online status: {isOnline ? 'Online' : 'Offline'}</p>
                  <p>All interests: {allInterests?.length || 0}</p>
                  <p>Images loaded: {allImages?.length || 0}</p>
                  <p>Component ID: {componentId.current}</p>
                </div>
              </div>
            </div>
          ) : (
            <StaggerContainer staggerDelay={0.15} preset="scaleIn">
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {allInterests.map((interest, index) => (
                  <LazyCard
                    key={interest.id}
                    delay={index * 100}
                    priority={index < 6 ? 'normal' : 'low'}
                    enableProgressBar={true}
                    className="transform transition-all duration-300 hover:scale-[1.02]"
                  >
                    <ErrorBoundary 
                      fallback={
                        <div className="glass-rose rounded-lg p-6 font-terminal">
                          <div className="text-red-300 text-center">
                            <p className="text-small">[ERROR] {isZh ? '兴趣卡片加载失败' : 'Interest card failed to load'}</p>
                            <p className="text-small text-gray-500 mt-1">ID: {interest.id}</p>
                          </div>
                        </div>
                      }
                    >
                      <InterestCard 
                        interest={interest} 
                        onReadFull={handleReadFull}
                        allImages={allImages}
                      />
                    </ErrorBoundary>
                  </LazyCard>
                ))}
              </div>
            </StaggerContainer>
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
    </ErrorBoundary>
  </PageEnhancer>
);
}