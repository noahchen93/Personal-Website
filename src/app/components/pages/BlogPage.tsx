import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Calendar, Tag, FileText, BookOpen, Clock, User, ArrowLeft, Eye } from 'lucide-react';
import { useContent, ContentItem } from '../content/ContentContext';
import MediaRenderer from '../shared/MediaRenderer';
import { useLanguage, useTexts } from '../language/LanguageContext';
import UnifiedImage from '../shared/UnifiedImage';
import { imageService, URLValidator } from '../../utils/ImageService';
import { usePageLanguageSync } from '../shared/useLanguageSync';
import PageLoadingState from '../shared/PageLoadingState';


function BlogPostContent({ 
  post, 
  data, 
  isZh,
  onReadFullScreen
}: { 
  post: ContentItem; 
  data: any; 
  isZh: boolean;
  onReadFullScreen?: () => void;
}) {

  const getPreviewContent = (content: string, excerpt?: string) => {
    if (excerpt) return excerpt;
    

    const textContent = content.replace(/[#*`]/g, '').trim();
    if (textContent.length <= 300) return content;
    
    const truncated = textContent.substring(0, 300);
    const lastSentence = truncated.lastIndexOf('。');
    const lastPeriod = truncated.lastIndexOf('.');
    const lastSpace = truncated.lastIndexOf(' ');
    
    let cutPoint = Math.max(lastSentence, lastPeriod, lastSpace);
    if (cutPoint === -1 || cutPoint < 150) cutPoint = 300;
    
    return textContent.substring(0, cutPoint) + '...';
  };

  const previewContent = getPreviewContent(data.content, data.excerpt);
  const needsReadMore = data.excerpt ? true : (data.content && data.content.length > 300);

  return (
    <div className="terminal-content">

      <div className="mb-4">
        <div className="terminal-preview-content">
          <MediaRenderer 
            content={previewContent} 
            className="terminal-content text-green-100" 
          />
        </div>
      </div>
      

      {needsReadMore && onReadFullScreen && (
        <div className="flex items-center justify-center mb-4">
          <button
            onClick={onReadFullScreen}
            className="btn-glass-cyan flex items-center space-x-2 px-4 py-2 rounded-lg text-small transition-all duration-200"
          >
            <Eye className="w-4 h-4" />
            <span>{isZh ? '阅读全文' : 'Read Full Article'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function BlogPage() {
  const { 
    getContentByLanguage, 
    getImageUrl, 
    getImages, 
    lastUpdateTimestamp
  } = useContent();
  const { currentLanguage, isZh } = useLanguage();
  const texts = useTexts();
  
  const [posts, setPosts] = useState<ContentItem[]>([]);
  const [allImages, setAllImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readingMode, setReadingMode] = useState<ContentItem | null>(null);
  

  const loadBlogPosts = useCallback(async () => {
    console.log(`[BlogPage] Loading blog posts for ${currentLanguage}`);
    
    try {
      setIsLoading(true);
      setError(null);
      

      try {
        const images = await getImages(false);
        setAllImages(images);
      } catch (imgError) {

      }
      
      const blogContent = await getContentByLanguage('blog', currentLanguage);

      

      const sortedPosts = blogContent.sort((a, b) => {
        const orderA = a.sortOrder || a.data?.order || 999999;
        const orderB = b.sortOrder || b.data?.order || 999999;
        
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        
        const dateA = a.createdAt || a.created_at || 0;
        const dateB = b.createdAt || b.created_at || 0;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
      
      setPosts(sortedPosts);

    } catch (err) {

      setError(isZh ? '加载博客文章时出错' : 'Error loading blog posts');
    } finally {
      setIsLoading(false);
    }
  }, [getContentByLanguage, currentLanguage, isZh, getImages]);

  usePageLanguageSync(
    ['blog'], 
    () => {

      loadBlogPosts();
    },
    () => {

      setPosts([]);
      setError(null);
      setReadingMode(null);
    }
  );


  useEffect(() => {
    console.log(`[BlogPage] Loading content - language: ${currentLanguage}, timestamp: ${lastUpdateTimestamp}`);
    loadBlogPosts();
  }, [lastUpdateTimestamp, currentLanguage, loadBlogPosts]);


  const getPostImageUrl = useMemo(() => {
    return (data: any) => {
      if (!data) return null;
      

      if (data.cover_image_id) {
        const imageUrl = getImageUrl(data.cover_image_id);
        if (imageUrl && imageUrl !== '') {
          return imageUrl;
        }
      }
      

      if (data.coverImage) {
        const match = data.coverImage.match(/^\{\{image:([^|}]+)\}\}$/);
        if (match) {
          const imageId = match[1];
          const imageUrl = getImageUrl(imageId);
          if (imageUrl && imageUrl !== '') {
            return imageUrl;
          }
        }
        

        if (data.coverImage.startsWith('http') && URLValidator.isValidImageUrl(data.coverImage)) {
          return data.coverImage;
        }
      }
      

      const imageUrl = imageService.getUnifiedImageUrl(data, getImageUrl);
      if (imageUrl) {
        return imageUrl;
      }
      
      return null;
    };
  }, []);

  // 阅读全文模式组件
  const BlogReadingMode = useCallback(({ post }: { post: ContentItem }) => {
    const data = post.data;

    return (
      <div className="min-h-screen font-terminal text-green-400 custom-scrollbar bg-background">
        {/* 固定悬浮❌关闭按钮 - 始终可见，位于导航栏下方 */}
        <div className="fixed top-28 left-8 z-50">
          <button
            onClick={() => setReadingMode(null)}
            className="w-8 h-8 rounded-full border border-green-400/60 hover:border-green-400 text-green-300 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-sm transition-all duration-200 flex items-center justify-center text-small shadow-lg hover:shadow-green-500/20"
            aria-label={isZh ? '关闭阅读模式' : 'Close reading mode'}
          >
            ❌
          </button>
        </div>

        {/* 阅读内容区域 */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          <article className="glass-green rounded-xl overflow-hidden">
            {/* 封面图片 */}
            {(() => {
              const imageUrl = getPostImageUrl(data);
              return imageUrl && (
                <div className="relative overflow-hidden blog-cover-image cover-image-container">
                  <UnifiedImage
                    src={imageUrl}
                    alt={data.cover_caption || data.title || 'Blog Cover'}
                    className="w-full h-auto object-contain"
                    style={{ maxHeight: '400px', minHeight: '200px' }}
                    lazy={false}
                    showLoadingSpinner={true}
                    allImages={allImages}
                    getImageUrl={getImageUrl}
                    centerImage={true}
                  />
                  {data.cover_caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                      <p className="text-white text-small leading-tight">
                        {data.cover_caption}
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 文章内容 */}
            <div className="p-8 lg:p-12 space-y-8">
              {/* 文章头部 */}
              <header className="space-y-6">
                <h1 className="text-large text-white font-terminal tracking-wide leading-tight">
                  [BLOG] {data.title}
                </h1>
                
                {/* 元信息 */}
                <div className="flex flex-wrap items-center gap-4 text-small text-green-200">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {post.createdAt ? new Date(post.createdAt).toLocaleDateString(isZh ? 'zh-CN' : 'en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Unknown Date'}
                    </span>
                  </div>
                  
                  {data.readingTime && (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{data.readingTime}</span>
                    </div>
                  )}
                  
                  {data.tags && data.tags.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Tag className="w-4 h-4" />
                      <div className="flex flex-wrap gap-1">
                        {data.tags.map((tag: string, tagIndex: number) => (
                          <span
                            key={tagIndex}
                            className="bg-black/30 border border-green-300/60 text-green-200 px-2 py-0.5 rounded text-small font-terminal"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 描述/摘要 */}
                {data.excerpt && (
                  <div className="text-medium text-green-100 leading-relaxed border-l-4 border-green-400 pl-6 bg-black/20 py-4 rounded-r-lg">
                    <MediaRenderer content={data.excerpt} className="prose prose-lg" />
                  </div>
                )}
              </header>

              {/* 正文内容 */}
              <div className="prose prose-lg max-w-none">
                <div className="text-medium text-green-50 leading-relaxed terminal-content">
                  <MediaRenderer content={data.content || ''} className="prose prose-lg" />
                </div>
              </div>

              {/* 文章底部 */}
              <footer className="pt-8 border-t border-green-300/20">
                <div className="flex items-center justify-between">
                  <div className="text-small text-green-300">
                    {isZh ? '感谢阅读' : 'Thanks for reading'}
                  </div>
                  
                  <button
                    onClick={() => setReadingMode(null)}
                    className="btn-glass-cyan px-6 py-3 rounded-lg text-medium font-terminal flex items-center space-x-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{isZh ? '返回博客列表' : 'Back to Blog List'}</span>
                  </button>
                </div>
              </footer>
            </div>
          </article>
        </div>
      </div>
    );
  }, [getPostImageUrl, allImages, getImageUrl, isZh]);

  // 如果在阅读模式，显示阅读模式组件
  if (readingMode) {
    return <BlogReadingMode post={readingMode} />;
  }

  if (isLoading) {
    return <PageLoadingState label={isZh ? '正在加载博客…' : 'Loading blog…'} />;
  }

  if (error) {
    return (
      <div className="p-6 space-y-8 font-terminal text-green-400 custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="glass-green rounded-lg p-8 transition-all duration-300 mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <FileText className="w-6 h-6 text-green-200" />
              <h1 className="text-large text-white tracking-wide">
                [BLOG] {isZh ? '博客' : 'Blog'}
              </h1>
            </div>
          </div>
          
          <div className="glass-rose rounded-lg p-8 text-center">
            <FileText className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-medium text-red-300 mb-2">
              {isZh ? '加载失败' : 'Loading Failed'}
            </h3>
            <p className="text-red-200 mb-6 text-small">{error}</p>
            <button
              onClick={() => loadBlogPosts()}
              className="btn-glass-green px-6 py-3 rounded-lg"
            >
              {isZh ? '重试' : 'Retry'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="p-6 space-y-8 font-terminal text-green-400 custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="glass-green rounded-lg p-8 transition-all duration-300 mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <FileText className="w-6 h-6 text-green-200" />
              <h1 className="text-large text-white tracking-wide">
                [BLOG] {isZh ? '博客' : 'Blog'}
              </h1>
            </div>
          </div>
          
          <div className="glass-green rounded-lg p-8 text-center">
            <FileText className="w-16 h-16 text-green-300 mx-auto mb-4" />
            <h3 className="text-medium text-green-300 mb-2">
              {isZh ? '暂无博客文章' : 'No Blog Posts Yet'}
            </h3>
            <p className="text-green-200 text-small mb-6">
              {isZh 
                ? '还没有发布任何博客文章，请稍后再来查看。' 
                : 'No blog posts have been published yet. Please check back later.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 font-terminal text-green-400 custom-scrollbar">
      <div className="max-w-6xl mx-auto">
        {/* Page Header - Green Glass Theme */}
        <div className="glass-green rounded-lg transition-all duration-300 mb-8 py-[0px] px-[32px]">
          <div className="flex items-center space-x-3 mb-6">
            <BookOpen className="w-6 h-6 text-green-200" />
            <h1 className="text-large text-white tracking-wide">
              [BLOG] {isZh ? '博客文章' : 'Blog Posts'}
            </h1>
          </div>
          
          <div className="text-medium text-green-100 mb-4">
            {isZh 
              ? '> 分享技术见解、学习心得和生活感悟'
              : '> Sharing technical insights, learning experiences, and life reflections'}
          </div>
          
          <div className="flex items-center flex-wrap gap-4 text-small text-green-200">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>{posts.length} {isZh ? '篇文章' : 'Articles'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{isZh ? '定期更新' : 'Regular Updates'}</span>
            </div>
          </div>
        </div>
        
        {/* Blog Posts */}
        <div className="blog-grid">
          {posts.map((post) => {
            const data = post.data;
            
            return (
              <article
                key={`${post.id}-${currentLanguage}`}
                id={post.id}
                className="blog-card glass-green rounded-lg p-6 transition-all duration-300 hover:transform hover:-translate-y-1 group"
              >
                {/* Post Header */}
                <header className="mb-4">
                  {/* Cover Image */}
                  {(() => {
                    const imageUrl = getPostImageUrl(data);
                    return imageUrl && (
                      <div className="relative w-full mb-4 rounded-lg overflow-hidden border border-green-300/20 blog-cover-image cover-image-container">
                        <UnifiedImage
                          src={imageUrl}
                          alt={data.cover_caption || data.title || 'Blog cover'}
                          className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-500"
                          style={{ maxHeight: '300px', minHeight: '150px' }}
                          lazy={true}
                          showLoadingSpinner={true}
                          allImages={allImages}
                          getImageUrl={getImageUrl}
                          centerImage={true}
                        />
                        {data.cover_caption && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                            <p className="text-white text-small leading-tight">
                              {data.cover_caption}
                            </p>
                          </div>
                        )}
                        {/* Featured Badge */}
                        {data.featured && (
                          <div className="absolute top-4 left-4 bg-gradient-to-r from-green-500/95 to-green-600/95 text-white px-3 py-1.5 text-small rounded-lg backdrop-blur-sm border border-green-400/40 shadow-lg">
                            ⭐ {isZh ? '精选' : 'FEATURED'}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  
                  <h3 className="text-large text-white mb-3 leading-tight group-hover:text-green-100 transition-colors">
                    &gt; {data.title}
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-green-300" />
                      <time dateTime={post.createdAt || post.created_at} className="text-small text-green-300">
                        {new Date(post.createdAt || post.created_at || 0).toLocaleDateString(isZh ? 'zh-CN' : 'en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </time>
                    </div>
                    
                    {data.readingTime && (
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-green-300" />
                        <span className="text-small text-green-300">{data.readingTime}</span>
                      </div>
                    )}
                    
                    {data.tags && data.tags.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <Tag className="w-4 h-4 text-green-300" />
                        <div className="flex flex-wrap gap-1">
                          {data.tags.map((tag: string, tagIndex: number) => (
                            <span
                              key={tagIndex}
                              className="bg-black/30 border border-green-300/60 text-green-200 px-2 py-0.5 rounded text-small font-terminal"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </header>

                {/* Post Content */}
                <BlogPostContent 
                  post={post} 
                  data={data} 
                  isZh={isZh}
                  onReadFullScreen={() => setReadingMode(post)}
                />
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
