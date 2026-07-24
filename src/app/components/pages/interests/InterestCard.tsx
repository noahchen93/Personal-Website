import React, { useState, useEffect, useRef } from 'react';
import { Tag, Eye, ExternalLink, Globe, Headphones, Play, Music, Radio, Clock } from 'lucide-react';
import { ContentItem, useContent } from '../../content/ContentContext';
import { useLanguage } from '../../language/LanguageContext';
import UnifiedImage from '../../shared/UnifiedImage';
import MediaRenderer from '../../shared/MediaRenderer';
// 移除分类相关导入
import { imageService, URLValidator } from '../../../utils/ImageService';
import { toast } from 'sonner';

const createPlainTextPreview = (content: string, maxLength = 260) => {
  const plainText = content
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`~|-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return plainText.length > maxLength
    ? `${plainText.slice(0, maxLength).trimEnd()}…`
    : plainText;
};

interface InterestData {
  title: string;
  description?: string;
  content: string;
  imageUrl?: string; // 向后兼容
  imageId?: string; // 新的图片ID字段
  // URL链接相关字段
  type?: 'content' | 'url'; // 内容类型
  url?: string; // 链接地址
  urlTitle?: string; // 链接标题
  urlDescription?: string; // 链接描述
  urlImage?: string; // 链接封面图片
  urlDomain?: string; // 链接域名
  // 手动封面图片支持
  manualCoverImageId?: string; // 手动设置的封面图片ID，优先级高于URL图片
  // 播客相关字段
  isPodcast?: boolean; // 是否为播客内容
  podcastData?: {
    platform: string; // 播客平台
    type: 'show' | 'episode' | 'playlist' | 'unknown'; // 播客类型
    episodes: Array<{
      title: string;
      url: string;
      platform: string;
      duration?: string;
    }>; // 播客单集列表
    showInfo?: {
      title: string;
      platform: string;
      description?: string;
    }; // 播客节目信息
    playUrl?: string; // 播放链接
    rssUrl?: string; // RSS链接
  };
}

interface InterestCardProps {
  interest: ContentItem;
  onReadFull?: (interest: ContentItem) => void;
  allImages?: any[]; // 新增：从父组件传入的图片数据
}

export default function InterestCard({ 
  interest, 
  onReadFull,
  allImages: propAllImages = []
}: InterestCardProps) {
  const { currentLanguage, isZh } = useLanguage();
  const { getImageUrl, getImages } = useContent();
  const [allImages, setAllImages] = useState<any[]>(propAllImages);
  
  // 🔥 防止重复加载的控制变量
  const hasLoadedImagesRef = useRef(false);
  const propImagesHashRef = useRef('');
  
  // 🔥 极简的图片数据同步，避免任何循环依赖
  useEffect(() => {
    if (propAllImages.length > 0) {
      // 计算props数据的hash，只在真正变化时更新
      const propHash = propAllImages.map(img => img.id).sort().join(',');
      
      if (propHash !== propImagesHashRef.current) {
        propImagesHashRef.current = propHash;
        setAllImages(propAllImages);
        hasLoadedImagesRef.current = true;
      }
    }
  }, [propAllImages.length]); // 🔥 只依赖长度，避免深度比较

  // 🔥 备用图片加载，仅在没有props图片且未加载过时执行一次
  useEffect(() => {
    if (propAllImages.length === 0 && !hasLoadedImagesRef.current) {
      hasLoadedImagesRef.current = true;
      
      // 使用timeout避免阻塞主渲染
      const timer = setTimeout(() => {
        getImages(false).then(images => {
          if (images.length > 0) {
            setAllImages(images);
          }
        }).catch(() => {
          // 静默处理错误，不影响组件渲染
        });
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, []); // 🔥 空依赖数组，只在组件挂载时执行一次
  
  // Safely extract data with fallbacks
  const data: InterestData = {
    title: interest.data?.title || '未命名兴趣',
    description: interest.data?.description || '',
    content: interest.data?.content || '',
    imageUrl: interest.data?.imageUrl || '',
    imageId: interest.data?.imageId || '',
    type: interest.data?.type || 'content',
    url: interest.data?.url || '',
    urlTitle: interest.data?.urlTitle || '',
    urlDescription: interest.data?.urlDescription || '',
    urlImage: interest.data?.urlImage || '',
    urlDomain: interest.data?.urlDomain || '',
    manualCoverImageId: interest.data?.manualCoverImageId || '',
    isPodcast: interest.data?.isPodcast || false,
    podcastData: interest.data?.podcastData || undefined
  };
  const contentPreview = createPlainTextPreview(data.content);

  // 获取兴趣封面图片 - 使用统一的图片服务
  const getCoverImageUrl = () => {
    // 使用imageService的统一图片获取逻辑
    const imageUrl = imageService.getUnifiedImageUrl(data, getImageUrl);
    if (imageUrl && URLValidator.isValidImageUrl(imageUrl)) {
      return imageUrl;
    }

    // 回退处理 - 优先级：手动封面图片 > imageId > URL图片 > 向后兼容imageUrl
    if (data.manualCoverImageId) {
      const manualImageUrl = getImageUrl(data.manualCoverImageId);
      if (manualImageUrl && URLValidator.isValidImageUrl(manualImageUrl)) {
        return manualImageUrl;
      }
    }
    
    if (data.imageId) {
      const imageUrl = getImageUrl(data.imageId);
      if (imageUrl && URLValidator.isValidImageUrl(imageUrl)) {
        return imageUrl;
      }
    }
    
    // 向后兼容：检查是否是{{image:id}}格式的imageUrl
    if (data.imageUrl) {
      const imageIdMatch = data.imageUrl.match(/^\{\{image:([^|}]+)\}\}$/);
      if (imageIdMatch) {
        const imageUrl = getImageUrl(imageIdMatch[1]);
        if (imageUrl && URLValidator.isValidImageUrl(imageUrl)) {
          return imageUrl;
        }
      } else if (data.imageUrl.startsWith('http') && URLValidator.isValidImageUrl(data.imageUrl)) {
        return data.imageUrl;
      }
    }
    
    // URL类型的抓取图片（仅当没有手动封面图片时）
    if (data.type === 'url' && data.urlImage && !data.manualCoverImageId && URLValidator.isValidImageUrl(data.urlImage)) {
      return data.urlImage;
    }
    
    return null;
  };

  const coverImageUrl = getCoverImageUrl();

  // 移除分类信息相关代码

  // 处理URL链接点击
  const handleUrlClick = () => {
    if (data.type === 'url' && data.url) {
      window.open(data.url, '_blank', 'noopener,noreferrer');
    }
  };

  // 处理播客播放
  const handlePodcastPlay = (playUrl?: string) => {
    const urlToOpen = playUrl || data.url;
    if (urlToOpen) {
      window.open(urlToOpen, '_blank', 'noopener,noreferrer');
    }
  };

  // 获取播客平台图标
  const getPodcastPlatformIcon = (platform: string) => {
    const lowerPlatform = platform.toLowerCase();
    if (lowerPlatform.includes('spotify')) return Music;
    if (lowerPlatform.includes('apple') || lowerPlatform.includes('itunes')) return Headphones;
    if (lowerPlatform.includes('google') || lowerPlatform.includes('podcasts')) return Radio;
    return Play; // 默认播放图标
  };

  // 获取播客类型显示文本
  const getPodcastTypeText = (type: string) => {
    switch (type) {
      case 'show': return isZh ? '播客节目' : 'Podcast Show';
      case 'episode': return isZh ? '播客单集' : 'Podcast Episode';
      case 'playlist': return isZh ? '播客播放列表' : 'Podcast Playlist';
      default: return isZh ? '播客内容' : 'Podcast Content';
    }
  };

  // 判断内容是否需要阅读全文功能（内容超过3行或150字符）
  const shouldShowReadFullButton = data.content && (data.content.length > 150 || data.content.split('\\n').length > 2);

  // 如果是URL类型，显示特殊的URL卡片样式 - 优化图片展示
  if (data.type === 'url') {
    // 判断是否为播客内容
    const isPodcastContent = data.isPodcast && data.podcastData;
    const cardClass = isPodcastContent 
      ? "glass-purple rounded-xl overflow-hidden hover:border-purple-400/60 transition-all duration-300 font-terminal group cursor-pointer"
      : "glass-pink rounded-xl overflow-hidden hover:border-pink-400/60 transition-all duration-300 font-terminal group cursor-pointer";

    const PlatformIcon = isPodcastContent ? getPodcastPlatformIcon(data.podcastData?.platform || '') : ExternalLink;
    const iconColor = isPodcastContent ? "text-purple-300" : "text-pink-300";
    const borderColor = isPodcastContent ? "border-purple-300/20" : "border-pink-300/20";
    const textColor = isPodcastContent ? "text-purple-200" : "text-pink-200";
    const buttonColor = isPodcastContent ? "text-purple-400" : "text-pink-400";

    return (
      <article className={cardClass} onClick={handleUrlClick}>
        {/* 图片部分 - 动态布局，完整显示图片 */}
        {coverImageUrl && (
          <div className={`relative overflow-hidden border-b ${borderColor} bg-black/40 interest-cover-image cover-image-container`} style={{ minHeight: '200px', maxHeight: '400px' }}>
            <div className="w-full h-full flex items-center justify-center">
              <UnifiedImage
                src={coverImageUrl}
                alt={data.urlTitle || data.title}
                className="opacity-80 group-hover:opacity-100 transition-opacity"
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '100%',
                  minHeight: '200px',
                  objectFit: 'contain',
                  objectPosition: 'center'
                }}
                lazy={true}
                showLoadingSpinner={true}
                allImages={allImages}
                getImageUrl={getImageUrl}
                centerImage={true}
              />
            </div>
            {/* 播客/URL标识 - 放在图片右上角 */}


            {/* 边框装饰 */}
            <div className={`absolute inset-0 border ${borderColor.replace('/20', '/40')} pointer-events-none`}></div>
            {/* 渐变遮罩，增强文字可读性 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
          </div>
        )}
        
        {/* 信息部分 - 紧凑布局 */}
        <div className="space-y-3 m-[0px] px-[8px] py-[0px]">
          <header className="space-y-2">
            {/* 域名显示 */}
            {data.urlDomain && (
              <div className={`flex items-center space-x-1 ${isPodcastContent ? 'text-purple-300' : 'text-pink-300'} text-xs`}>
                <Globe className="w-3 h-3" />
                <span className="text-xs">{data.urlDomain}</span>
              </div>
            )}
            
            {/* 标题 - 更紧凑 */}
            <h3 className={`text-white text-medium tracking-wide ${isPodcastContent ? 'group-hover:text-purple-100' : 'group-hover:text-pink-100'} transition-colors line-clamp-2`}>
              &gt; {data.urlTitle || data.title}
            </h3>
            
            {/* 播客节目信息 */}
            {isPodcastContent && data.podcastData?.showInfo && (
              <div className="bg-purple-900/30 rounded-lg p-2 border border-purple-400/20">
                <div className="flex items-center space-x-2 mb-1">
                  <Radio className="w-3 h-3 text-purple-300" />
                  <span className="text-xs text-purple-200">
                    {isZh ? '节目信息' : 'Show Info'}
                  </span>
                </div>
                <div className="text-purple-100 text-xs">
                  {data.podcastData.showInfo.title}
                </div>
                {data.podcastData.showInfo.description && (
                  <div className="text-purple-200 text-xs mt-1 line-clamp-2">
                    {data.podcastData.showInfo.description}
                  </div>
                )}
              </div>
            )}
            
            {/* 播客剧集列表 */}
            {isPodcastContent && data.podcastData?.episodes && data.podcastData.episodes.length > 0 && (
              <div className="bg-purple-900/30 rounded-lg p-2 border border-purple-400/20">
                <div className="flex items-center space-x-2 mb-2">
                  <Music className="w-3 h-3 text-purple-300" />
                  <span className="text-xs text-purple-200">
                    {isZh ? `剧集列表 (${data.podcastData.episodes.length})` : `Episodes (${data.podcastData.episodes.length})`}
                  </span>
                </div>
                <div className="space-y-1 max-h-20 overflow-y-auto custom-scrollbar">
                  {data.podcastData.episodes.slice(0, 3).map((episode, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between text-xs cursor-pointer hover:bg-purple-800/30 rounded p-1 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePodcastPlay(episode.url);
                      }}
                    >
                      <div className="flex items-center space-x-1 flex-1 min-w-0">
                        <Play className="w-2 h-2 text-purple-400 flex-shrink-0" />
                        <span className="text-purple-100 truncate">{episode.title}</span>
                      </div>
                      {episode.duration && (
                        <div className="flex items-center space-x-1 text-purple-300 ml-2">
                          <Clock className="w-2 h-2" />
                          <span>{episode.duration}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {data.podcastData.episodes.length > 3 && (
                    <div className="text-xs text-purple-300 text-center pt-1">
                      {isZh ? `还有 ${data.podcastData.episodes.length - 3} 个剧集...` : `${data.podcastData.episodes.length - 3} more episodes...`}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* 描述 - 限制行数 */}
            {(data.urlDescription || data.description) && !isPodcastContent && (
              <div className={`${textColor} text-small line-clamp-2`}>
                <MediaRenderer content={data.urlDescription || data.description} className="prose prose-sm" />
              </div>
            )}
          </header>

          {/* 底部信息 - 紧凑排列 */}
          <footer className={`pt-1 border-t ${borderColor}`}>
            {/* 播客专用播放按钮 */}
            {isPodcastContent && (
              <div className="mb-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePodcastPlay(data.podcastData?.playUrl);
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/40 rounded-lg py-2 px-3 transition-all duration-200 group/play px-[12px] py-[0px]"
                >
                  <Play className="w-4 h-4 text-purple-300 group-hover/play:text-white" />
                  <span className="text-sm text-purple-200 group-hover/play:text-white">
                    {isZh ? '播放播客' : 'Play Podcast'}
                  </span>
                </button>
                {data.podcastData?.rssUrl && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(data.podcastData!.rssUrl!);
                      toast.success(isZh ? 'RSS链接已复制' : 'RSS URL copied');
                    }}
                    className="w-full mt-2 flex items-center justify-center space-x-2 bg-purple-800/20 hover:bg-purple-800/40 border border-purple-400/30 rounded-lg py-1 px-3 transition-all duration-200"
                  >
                    <Radio className="w-3 h-3 text-purple-400" />
                    <span className="text-xs text-purple-300">
                      {isZh ? '复制RSS' : 'Copy RSS'}
                    </span>
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center justify-between m-[0px]">
              <div className={`flex items-center space-x-1 ${buttonColor}`}>
                {isPodcastContent ? <Headphones className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />}
                <span className="text-xs">
                  {isPodcastContent 
                    ? (isZh ? '播客内容' : 'Podcast Content')
                    : (isZh ? '外部链接' : 'External Link')
                  }
                </span>
              </div>
              
              {/* 日期信息 */}
              <div className={`${isPodcastContent ? 'text-purple-300' : 'text-pink-300'} text-xs flex items-center space-x-1`}>
                <span>⏱</span>
                <span>
                  {interest.created_at ? new Date(interest.created_at).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  }).replace(/\//g, '-') : 'UNKNOWN_DATE'}
                </span>
              </div>
            </div>
            

          </footer>
        </div>
      </article>
    );
  }

  // 普通内容类型的优化图片展示 - 也支持播客内容
  const isContentPodcast = data.isPodcast && data.podcastData;
  const contentCardClass = isContentPodcast 
    ? "glass-purple rounded-xl overflow-hidden hover:border-purple-400/60 transition-all duration-300 font-terminal group"
    : "glass-pink rounded-xl overflow-hidden hover:border-pink-400/60 transition-all duration-300 font-terminal group";
  const contentBorderColor = isContentPodcast ? "border-purple-300/20" : "border-pink-300/20";
  const contentTextColor = isContentPodcast ? "text-purple-200" : "text-pink-200";

  return (
    <article className={contentCardClass}>
      {coverImageUrl && (
        <div className={`relative overflow-hidden border-b ${contentBorderColor} bg-black/40 interest-cover-image cover-image-container`} style={{ minHeight: '200px', maxHeight: '400px' }}>
          <div className="w-full h-full flex items-center justify-center">
            <UnifiedImage
              src={coverImageUrl}
              alt={data.title}
              className="opacity-80 group-hover:opacity-100 transition-opacity"
              style={{ 
                maxWidth: '100%', 
                maxHeight: '100%',
                minHeight: '200px',
                objectFit: 'contain',
                objectPosition: 'center'
              }}
              lazy={true}
              showLoadingSpinner={true}
              allImages={allImages}
              getImageUrl={getImageUrl}
              centerImage={true}
            />
          </div>
          {/* 播客标识 - 右上角 */}
          {isContentPodcast && (
            <div className="absolute top-3 right-3 bg-black/80 rounded-lg px-3 py-2 backdrop-blur-sm z-10">
              <div className="flex items-center space-x-1">
                <Headphones className="w-4 h-4 text-purple-300" />
                <span className="text-xs text-purple-200">
                  {data.podcastData?.platform}
                </span>
              </div>
            </div>
          )}
          {/* 播客类型标识 - 左上角 */}
          {isContentPodcast && (
            <div className="absolute top-3 left-3 bg-purple-600/80 rounded-lg px-2 py-1 backdrop-blur-sm z-10">
              <div className="flex items-center space-x-1">
                <Music className="w-3 h-3 text-white" />
                <span className="text-xs text-white">
                  {getPodcastTypeText(data.podcastData?.type || 'unknown')}
                </span>
              </div>
            </div>
          )}
          {/* 边框装饰 */}
          <div className={`absolute inset-0 border ${contentBorderColor.replace('/20', '/40')} pointer-events-none rounded-t-xl`}></div>
          {/* 渐变遮罩，增强下方内容的可读性 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>
        </div>
      )}
      
      <div className="pt-6 px-6 pb-1 space-y-4">
        <header>
          {/* 移除分类标签显示 */}
          
          <h3 className="text-white mb-2 tracking-wide">
            &gt; {data.title}
          </h3>
          {data.description && (
            <div className={`${contentTextColor} text-sm`}>
              <MediaRenderer content={data.description} className="prose prose-sm" />
            </div>
          )}

          {/* 播客节目信息 */}
          {isContentPodcast && data.podcastData?.showInfo && (
            <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-400/20 mt-3">
              <div className="flex items-center space-x-2 mb-2">
                <Radio className="w-4 h-4 text-purple-300" />
                <span className="text-sm text-purple-200">
                  {isZh ? '节目信息' : 'Show Info'}
                </span>
              </div>
              <div className="text-purple-100 text-sm font-medium">
                {data.podcastData.showInfo.title}
              </div>
              {data.podcastData.showInfo.description && (
                <div className="text-purple-200 text-sm mt-1">
                  {data.podcastData.showInfo.description}
                </div>
              )}
            </div>
          )}

          {/* 播客剧集列表 */}
          {isContentPodcast && data.podcastData?.episodes && data.podcastData.episodes.length > 0 && (
            <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-400/20 mt-3">
              <div className="flex items-center space-x-2 mb-2">
                <Music className="w-4 h-4 text-purple-300" />
                <span className="text-sm text-purple-200">
                  {isZh ? `剧集列表 (${data.podcastData.episodes.length})` : `Episodes (${data.podcastData.episodes.length})`}
                </span>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                {data.podcastData.episodes.slice(0, 5).map((episode, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between text-sm cursor-pointer hover:bg-purple-800/30 rounded p-2 transition-colors group/episode"
                    onClick={() => handlePodcastPlay(episode.url)}
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <Play className="w-3 h-3 text-purple-400 group-hover/episode:text-purple-300 flex-shrink-0" />
                      <span className="text-purple-100 group-hover/episode:text-white truncate">{episode.title}</span>
                    </div>
                    {episode.duration && (
                      <div className="flex items-center space-x-1 text-purple-300 ml-2">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">{episode.duration}</span>
                      </div>
                    )}
                  </div>
                ))}
                {data.podcastData.episodes.length > 5 && (
                  <div className="text-xs text-purple-300 text-center pt-1">
                    {isZh ? `还有 ${data.podcastData.episodes.length - 5} 个剧集...` : `${data.podcastData.episodes.length - 5} more episodes...`}
                  </div>
                )}
              </div>
            </div>
          )}
        </header>

        {/* 内容预览 - 固定显示3行 */}
        {contentPreview && (
          <div className={`${isContentPodcast ? 'text-purple-100' : 'text-pink-100'} leading-relaxed text-sm terminal-preview-content line-clamp-3`}>
            {contentPreview}
          </div>
        )}

        {/* 播客播放按钮 */}
        {isContentPodcast && data.podcastData?.playUrl && (
          <button
            onClick={() => handlePodcastPlay(data.podcastData?.playUrl)}
            className="flex items-center justify-center space-x-2 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/40 rounded-lg py-3 px-4 transition-all duration-200 w-full group/play"
          >
            <Play className="w-5 h-5 text-purple-300 group-hover/play:text-white" />
            <span className="text-sm text-purple-200 group-hover/play:text-white font-medium">
              {isZh ? '播放播客' : 'Play Podcast'}
            </span>
          </button>
        )}

        {/* RSS复制按钮 */}
        {isContentPodcast && data.podcastData?.rssUrl && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(data.podcastData!.rssUrl!);
              toast.success(isZh ? 'RSS链接已复制' : 'RSS URL copied');
            }}
            className="flex items-center justify-center space-x-2 bg-purple-800/20 hover:bg-purple-800/40 border border-purple-400/30 rounded-lg py-2 px-3 transition-all duration-200 w-full"
          >
            <Radio className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">
              {isZh ? '复制RSS链接' : 'Copy RSS URL'}
            </span>
          </button>
        )}

        {/* 阅读全文按钮 */}
        {shouldShowReadFullButton && onReadFull && (
          <button
            onClick={() => onReadFull(interest)}
            className={`flex items-center space-x-2 ${isContentPodcast ? 'text-purple-400 hover:text-purple-300 border-purple-400/30 hover:bg-purple-500/10' : 'text-pink-400 hover:text-pink-300 border-pink-400/30 hover:bg-pink-500/10'} transition-colors duration-200 text-sm font-mono w-full justify-center py-2 border rounded-lg`}
          >
            <Eye className="w-4 h-4" />
            <span>&gt; {isZh ? '阅读全文' : 'Read Full Article'}</span>
          </button>
        )}

        <footer className={`pt-2 pb-1 border-t ${contentBorderColor}`}>
          <div className={`${isContentPodcast ? 'text-purple-300' : 'text-pink-300'} text-xs flex items-center space-x-2`}>
            <span>⏱</span>
            <span>
              {interest.created_at ? new Date(interest.created_at).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              }).replace(/\//g, '-') : 'UNKNOWN_DATE'}
            </span>
          </div>
        </footer>
      </div>
    </article>
  );
}
