import React from 'react';
import { ArrowLeft, Calendar, Tag as TagIcon } from 'lucide-react';
import { ContentItem, useContent } from '../../content/ContentContext';
import { useLanguage } from '../../language/LanguageContext';
import MediaRenderer from '../../shared/MediaRenderer';
import UnifiedImage from '../../shared/UnifiedImage';
import { getInterestImageUrlHelper } from './helpers';
import { imageService, URLValidator } from '../../../utils/ImageService';

interface ReadingModeProps {
  readingMode: ContentItem;
  onExit: () => void;
  getImageUrl: (id: string) => string;
}

export default function ReadingMode({
  readingMode,
  onExit,
  getImageUrl
}: ReadingModeProps) {
  const { currentLanguage, isZh } = useLanguage();
  const { getImages } = useContent();
  const [allImages, setAllImages] = React.useState<any[]>([]);
  
  // 获取图片列表
  React.useEffect(() => {
    getImages().then(setAllImages).catch(() => {});
  }, [getImages]);
  
  // 移除分类信息相关代码
  
  // 使用统一的图片获取逻辑
  const getCoverImageUrl = () => {
    // 使用imageService的统一图片获取逻辑
    const imageUrl = imageService.getUnifiedImageUrl(readingMode.data, getImageUrl);
    if (imageUrl) {
      return imageUrl;
    }
    // 回退到helper函数
    return getInterestImageUrlHelper(readingMode, getImageUrl);
  };
  
  const coverImageUrl = getCoverImageUrl();

  return (
    <div className="min-h-screen font-terminal text-green-400 custom-scrollbar bg-background">
      {/* 固定悬浮❌关闭按钮 - 始终可见，位于导航栏下方 */}
      <div className="fixed top-28 left-8 z-50">
        <button
          onClick={onExit}
          className="w-8 h-8 rounded-full border border-pink-400/60 hover:border-pink-400 text-pink-300 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-sm transition-all duration-200 flex items-center justify-center text-small shadow-lg hover:shadow-pink-500/20"
          aria-label={isZh ? '关闭阅读模式' : 'Close reading mode'}
        >
          ❌
        </button>
      </div>

      {/* 阅读内容区域 */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <article className="glass-pink rounded-xl overflow-hidden">
          {/* 封面图片 */}
          {coverImageUrl && (
            <div className="aspect-[21/9] overflow-hidden">
              <UnifiedImage
                src={coverImageUrl}
                alt={readingMode.data?.title || 'Interest Cover'}
                className="w-full h-full object-cover"
                lazy={false}
                showLoadingSpinner={true}
                allImages={allImages}
                getImageUrl={getImageUrl}
              />
            </div>
          )}

          {/* 文章内容 */}
          <div className="p-8 lg:p-12 space-y-8">
            {/* 文章头部 */}
            <header className="space-y-6">
              <h1 className="text-large text-white font-terminal tracking-wide leading-tight">
                [INTEREST] {readingMode.data?.title}
              </h1>
              
              {/* 元信息 */}
              <div className="flex flex-wrap items-center gap-4 text-small text-pink-200">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {readingMode.created_at ? new Date(readingMode.created_at).toLocaleDateString(isZh ? 'zh-CN' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Unknown Date'}
                  </span>
                </div>
                
                {/* 移除分类信息显示 */}
              </div>

              {/* 描述 */}
              {readingMode.data?.description && (
                <div className="text-medium text-pink-100 leading-relaxed border-l-4 border-pink-400 pl-6 bg-black/20 py-4 rounded-r-lg">
                  <MediaRenderer content={readingMode.data.description} className="prose prose-lg" />
                </div>
              )}
            </header>

            {/* 正文内容 */}
            <div className="prose prose-lg max-w-none">
              <div className="text-medium text-pink-50 leading-relaxed terminal-content">
                <MediaRenderer content={readingMode.data?.content || ''} className="prose prose-lg" />
              </div>
            </div>

            {/* 文章底部 */}
            <footer className="pt-8 border-t border-pink-300/20">
              <div className="flex items-center justify-between">
                <div className="text-small text-pink-300">
                  {isZh ? '感谢阅读' : 'Thanks for reading'}
                </div>
                
                <button
                  onClick={onExit}
                  className="btn-glass-cyan px-6 py-3 rounded-lg text-medium font-terminal flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{isZh ? '返回兴趣列表' : 'Back to Interests'}</span>
                </button>
              </div>
            </footer>
          </div>
        </article>
      </div>
    </div>
  );
}
