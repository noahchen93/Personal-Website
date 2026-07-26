import React, { useState, useEffect, useCallback } from 'react';
import { Terminal, User, Code, Heart, MessageCircle, ChevronRight, Monitor, Activity, Zap, Building2, ChevronUp, ChevronDown, Calendar, MapPin, GraduationCap, Pause, Play, ArrowLeft, ArrowRight, Eye, ExternalLink, Bot, FileText } from 'lucide-react';
import { useContent } from '../content/ContentContext';
import { useLanguage, useTexts } from '../language/LanguageContext';
import MediaRenderer from '../shared/MediaRenderer';
import UnifiedImage from '../shared/UnifiedImage';
import AIChatBox from '../chat/AIChatBox';
import { imageService, URLValidator } from '../../utils/ImageService';
import { usePageLanguageSync } from '../shared/useLanguageSync';
import EnhancedLazyLoader, { LazyHero, LazyCard } from '../shared/EnhancedLazyLoader';
import AnimationSystem, { StaggerContainer, FadeIn, SlideUp, ScaleIn } from '../shared/AnimationSystem';
import { SmartImage, useResourcePreloader } from '../shared/SmartPerformanceManager';


interface UnifiedContentItem {
  id: string;
  type: 'projects' | 'blog' | 'ai-explore' | 'interests';
  title: string;
  description?: string;
  content?: string;
  imageUrl?: string;
  featured?: boolean;
  metadata?: {
    technologies?: string[];
    tags?: string[];
    category?: string;
    difficulty?: string;
    readingTime?: string;
    url?: string;
    githubUrl?: string;
    [key: string]: any;
  };
  originalData: any;
}

interface NavigationButton {
  id: string;
  text: string;
  target: string;
  style: 'primary' | 'secondary';
  external?: boolean;
}

interface HomeData {
  heroTitle?: string;
  heroSubtitle?: string;
  summary?: string;
  educationTitle?: string;
  workExperienceTitle?: string;
  skillsTitle?: string;
  ctaTitle?: string;
  ctaDescription?: string;
  education?: Array<{
    school: string;
    major?: string;
    period: string;
    degree?: string;
  }>;
  workExperience?: Array<{
    company: string;
    position: string;
    period: string;
    location?: string;
    description?: string;
  }>;
  skills?: string[];
  navigationButtons?: NavigationButton[];
}

export default function HomePage() {
  const { 
    getContentByLanguage, 
    getContent, 
    getImageUrl, 
    getImages, 
    refreshContent, 
    refreshImages,
    isOnline 
  } = useContent();
  const { currentLanguage, isZh } = useLanguage();
  const texts = useTexts();
  const [homeData, setHomeData] = useState<HomeData>({});
  const [unifiedContentItems, setUnifiedContentItems] = useState<UnifiedContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasContent, setHasContent] = useState(false);
  const [allImages, setAllImages] = useState<any[]>([]);
  

  const [isWorkExpanded, setIsWorkExpanded] = useState(false);
  

  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);


  const getAIExploreImageUrl = useCallback((project: any): string | null => {
    console.log('[HomePage] Getting AI Explore image URL for project:', project.title || 'Untitled');
    
    if (project.manualCoverImageId) {
      console.log('[HomePage] Trying manualCoverImageId:', project.manualCoverImageId);
      const url = getImageUrl(project.manualCoverImageId);
      if (url && !url.startsWith('data:image/svg+xml')) {
        console.log('[HomePage] ✅ Found image via manualCoverImageId:', url);
        return url;
      }
    }
    

    if (project.coverImage) {

      const match = project.coverImage.match(/^\{\{image:([^|}]+)\}\}$/);
      if (match) {
        const imageId = match[1];

        const url = getImageUrl(imageId);
        if (url && !url.startsWith('data:image/svg+xml')) {

          return url;
        }
      }
      
      // 检查是否是直接的图片ID
      const directUrl = getImageUrl(project.coverImage);
      if (directUrl && !directUrl.startsWith('data:image/svg+xml')) {

        return directUrl;
      }
      
      if (project.coverImage.startsWith('http') && URLValidator.isValidImageUrl(project.coverImage)) {

        return project.coverImage;
      }
    }
    

    if (project.type === 'url' && project.urlImage && URLValidator.isValidImageUrl(project.urlImage)) {

      return project.urlImage;
    }
    

    const imageFields = ['image_id', 'imageUrl', 'image', 'imageId', 'cover_image_id', 'coverImageId'];
    for (const field of imageFields) {
      if (project[field]) {
        console.log(`[HomePage] Trying field ${field}:`, project[field]);
        // 检查{{image:id}}格式 - 修复转义问题
        const match = project[field].match(/^\{\{image:([^|}]+)\}\}$/);
        if (match) {
          const imageId = match[1];
          console.log(`[HomePage] Extracted image ID from ${field}:`, imageId);
          const url = getImageUrl(imageId);
          if (url && !url.startsWith('data:image/svg+xml')) {
            console.log(`[HomePage] ✅ Found image via ${field} template:`, url);
            return url;
          }
        }
        
        // 检查直接图片ID
        const directUrl = getImageUrl(project[field]);
        if (directUrl && !directUrl.startsWith('data:image/svg+xml')) {
          console.log(`[HomePage] ✅ Found image via direct ${field} ID:`, directUrl);
          return directUrl;
        }
        
        // 检查HTTP URL
        if (typeof project[field] === 'string' && project[field].startsWith('http')) {
          console.log(`[HomePage] ✅ Found image via ${field} HTTP URL:`, project[field]);
          return project[field];
        }
      }
    }
    
    console.log('[HomePage] ❌ No image found for AI Explore project:', project.title || 'Untitled');
    return null;
  }, [getImageUrl]);

  // 专门处理兴趣内容的图片URL获取函数 - 增强版
  const getInterestImageUrl = useCallback((interest: any): string | null => {
    console.log('[HomePage] Getting Interest image URL for item:', interest.title || 'Untitled');
    
    // 1. 优先处理手动设置的封面图片ID
    if (interest.manualCoverImageId) {
      console.log('[HomePage] Trying manualCoverImageId:', interest.manualCoverImageId);
      const url = getImageUrl(interest.manualCoverImageId);
      if (url && !url.startsWith('data:image/svg+xml')) {
        console.log('[HomePage] ✅ Found image via manualCoverImageId:', url);
        return url;
      }
    }
    
    // 2. 处理imageId字段（兴趣内容的主要图片字段）
    if (interest.imageId) {
      console.log('[HomePage] Trying imageId:', interest.imageId);
      const url = getImageUrl(interest.imageId);
      if (url && !url.startsWith('data:image/svg+xml')) {
        console.log('[HomePage] ✅ Found image via imageId:', url);
        return url;
      }
    }
    
    // 3. 处理imageUrl字段（向后兼容） - 修复正则表达式
    if (interest.imageUrl) {
      console.log('[HomePage] Trying imageUrl:', interest.imageUrl);
      // 检查{{image:id}}格式 - 修复转义问题
      const match = interest.imageUrl.match(/^\{\{image:([^|}]+)\}\}$/);
      if (match) {
        const imageId = match[1];
        console.log('[HomePage] Extracted image ID from imageUrl:', imageId);
        const url = getImageUrl(imageId);
        if (url && !url.startsWith('data:image/svg+xml')) {
          console.log('[HomePage] ✅ Found image via imageUrl template:', url);
          return url;
        }
      }
      
      // 检查是否是直接的图片ID
      const directUrl = getImageUrl(interest.imageUrl);
      if (directUrl && !directUrl.startsWith('data:image/svg+xml')) {
        console.log('[HomePage] ✅ Found image via direct imageUrl ID:', directUrl);
        return directUrl;
      }
      
      // 检查是否是直接的HTTP URL
      if (interest.imageUrl.startsWith('http') && URLValidator.isValidImageUrl(interest.imageUrl)) {
        console.log('[HomePage] ✅ Found image via imageUrl HTTP URL:', interest.imageUrl);
        return interest.imageUrl;
      }
    }
    
    // 4. 对于URL类型兴趣，使用抓取的图片
    if (interest.type === 'url' && interest.urlImage && URLValidator.isValidImageUrl(interest.urlImage)) {
      console.log('[HomePage] ✅ Found image via urlImage:', interest.urlImage);
      return interest.urlImage;
    }
    
    // 5. 尝试其他可能的图片字段 - 扩展字段列表
    const imageFields = ['image_id', 'image', 'cover_image_id', 'coverImage', 'coverImageId'];
    for (const field of imageFields) {
      if (interest[field]) {
        console.log(`[HomePage] Trying field ${field}:`, interest[field]);
        // 检查{{image:id}}格式 - 修复转义问题
        const match = interest[field].match(/^\{\{image:([^|}]+)\}\}$/);
        if (match) {
          const imageId = match[1];
          console.log(`[HomePage] Extracted image ID from ${field}:`, imageId);
          const url = getImageUrl(imageId);
          if (url && !url.startsWith('data:image/svg+xml')) {
            console.log(`[HomePage] ✅ Found image via ${field} template:`, url);
            return url;
          }
        }
        
        // 检查直接图片ID
        const directUrl = getImageUrl(interest[field]);
        if (directUrl && !directUrl.startsWith('data:image/svg+xml')) {
          console.log(`[HomePage] ✅ Found image via direct ${field} ID:`, directUrl);
          return directUrl;
        }
        
        // 检查HTTP URL
        if (typeof interest[field] === 'string' && interest[field].startsWith('http')) {
          console.log(`[HomePage] ✅ Found image via ${field} HTTP URL:`, interest[field]);
          return interest[field];
        }
      }
    }
    
    console.log('[HomePage] ❌ No image found for Interest item:', interest.title || 'Untitled');
    return null;
  }, [getImageUrl]);

  // 增强的图片URL获取函数
  const getEnhancedImageUrl = useCallback((data: any, itemType: 'projects' | 'blog' | 'ai-explore' | 'interests'): string | null => {
    if (!data) return null;
    
    console.log(`[HomePage] Getting enhanced image URL for ${itemType}:`, data.title || 'Untitled');
    
    // 对AI探索项目使用专门的处理函数
    if (itemType === 'ai-explore') {
      return getAIExploreImageUrl(data);
    }
    
    // 对兴趣内容使用专门的处理函数
    if (itemType === 'interests') {
      return getInterestImageUrl(data);
    }
    
    // 1. 优先使用imageService的统一获取逻辑
    let imageUrl = imageService.getUnifiedImageUrl(data, getImageUrl);
    if (imageUrl) {
      console.log(`[HomePage] ✅ Found image via imageService for ${itemType}:`, imageUrl);
      return imageUrl;
    }
    
    // 2. 尝试各种可能的图片字段 - 修复正则表达式和扩展字段
    const imageFields = ['cover_image_id', 'image_id', 'coverImage', 'imageUrl', 'image', 'imageId', 'coverImageId'];
    for (const field of imageFields) {
      if (data[field]) {
        console.log(`[HomePage] Trying field ${field} for ${itemType}:`, data[field]);
        // 检查是否是{{image:id}}格式 - 修复转义问题
        const match = data[field].match(/^\{\{image:([^|}]+)\}\}$/);
        if (match) {
          const imageId = match[1];
          console.log(`[HomePage] Extracted image ID from ${field}:`, imageId);
          const url = getImageUrl(imageId);
          if (url && !url.startsWith('data:image/svg+xml')) {
            console.log(`[HomePage] ✅ Found image via ${field} template for ${itemType}:`, url);
            return url;
          }
        }
        
 
        const directUrl = getImageUrl(data[field]);
        if (directUrl && !directUrl.startsWith('data:image/svg+xml')) {
          console.log(`[HomePage] ✅ Found image via direct ${field} ID for ${itemType}:`, directUrl);
          return directUrl;
        }
        
 
        if (typeof data[field] === 'string' && data[field].startsWith('http')) {
          console.log(`[HomePage] ✅ Found image via ${field} HTTP URL for ${itemType}:`, data[field]);
          return data[field];
        }
      }
    }
    
    // 3. 从内容中提取第一张图片 - 修复正则表达式
    if (data.content) {
      console.log(`[HomePage] Trying to extract image from content for ${itemType}`);
      const imagePattern = /\{\{image:([^|}]+)\}\}/g;
      const match = imagePattern.exec(data.content);
      if (match) {
        const imageId = match[1];
        console.log(`[HomePage] Extracted image ID from content:`, imageId);
        const url = getImageUrl(imageId);
        if (url && !url.startsWith('data:image/svg+xml')) {
          console.log(`[HomePage] ✅ Found image via content extraction for ${itemType}:`, url);
          return url;
        }
      }
    }
    
    console.log(`[HomePage] ❌ No image found for ${itemType}:`, data.title || 'Untitled');
    return null;
  }, [getImageUrl, getAIExploreImageUrl, getInterestImageUrl]);

  // 统一内容转换函数
  const convertToUnifiedFormat = useCallback((rawItem: any, type: 'projects' | 'blog' | 'ai-explore' | 'interests'): UnifiedContentItem => {
    const data = rawItem.data || rawItem;
    
    // 使用增强的图片URL获取逻辑，传入类型信息
    const imageUrl = getEnhancedImageUrl(data, type);
    
    return {
      id: rawItem.id || `${type}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title: data.title || '无标题',
      description: data.description || '',
      content: data.content || '',
      imageUrl,
      featured: data.featured || false,
      metadata: {
        // 项目特有字段
        technologies: data.technologies || [],
        // 博客特有字段
        tags: data.tags || [],
        readingTime: data.readingTime || '',
        // AI探索特有字段
        category: data.category || '',
        difficulty: data.difficulty || '',
        // 兴趣特有字段和AI探索项目共用字段
        url: data.url || '',
        githubUrl: data.githubUrl || '',
        // AI探索项目的特殊字段
        type: data.type || '', // URL类型项目标识
        urlTitle: data.urlTitle || '',
        urlDescription: data.urlDescription || '',
        urlImage: data.urlImage || '',
        urlDomain: data.urlDomain || '',
        manualCoverImageId: data.manualCoverImageId || '',
        // 兴趣内容的特殊字段
        imageId: data.imageId || '', // 兴趣内容的主要图片字段
        // 其他元数据
        ...data.metadata
      },
      originalData: data
    };
  }, [getEnhancedImageUrl]);

  // 优化的加载所有内容函数 - 减少不必要的同步操作
  const loadAllContent = useCallback(async () => {
    console.log(`[HomePage] Loading all content for ${currentLanguage}`);
    setIsLoading(true);
    
    try {
      // 优化图片加载逻辑 - 只在需要时进行同步
      console.log('[HomePage] Loading images...');
      const images = await getImages(false); // 不强制刷新，使用缓存
      setAllImages(images);
      console.log(`[HomePage] Loaded ${images.length} images`);
      
      // 加载首页数据
      const homeContent = await getContentByLanguage('home', currentLanguage);
      if (homeContent.length > 0) {
        setHomeData(homeContent[0].data || {});
        setHasContent(true);
      } else {
        setHomeData({});
        setHasContent(false);
      }

      // 加载所有类型的内容
      const [projectsRaw, blogRaw, aiExploreRaw, interestsRaw] = await Promise.all([
        getContentByLanguage('projects', currentLanguage),
        getContentByLanguage('blog', currentLanguage),
        getContentByLanguage('ai-explore', currentLanguage),
        getContentByLanguage('interests', currentLanguage)
      ]);

      // 转换所有内容为统一格式
      const allUnifiedItems: UnifiedContentItem[] = [];

      // 转换项目
      projectsRaw.forEach(item => {
        if (item.data && item.data.title) {
          allUnifiedItems.push(convertToUnifiedFormat(item, 'projects'));
        }
      });

      // 转换博客
      blogRaw.forEach(item => {
        if (item.data && item.data.title) {
          allUnifiedItems.push(convertToUnifiedFormat(item, 'blog'));
        }
      });

      // 转换兴趣 - 确保包含所有图片字段
      interestsRaw.forEach(item => {
        if (item.data && item.data.title) {
          const converted = convertToUnifiedFormat({
            id: item.id,
            data: {
              // 基本信息
              title: item.data.title,
              description: item.data.description,
              content: item.data.content,
              
              // 兴趣内容的图片相关字段 - 保留所有可能的图片字段
              imageId: item.data.imageId, // 主要图片字段
              imageUrl: item.data.imageUrl, // 向后兼容字段
              manualCoverImageId: item.data.manualCoverImageId, // 手动封面图片
              image: item.data.image,
              image_id: item.data.image_id,
              cover_image_id: item.data.cover_image_id,
              
              // URL类型兴趣的图片字段
              type: item.data.type,
              urlImage: item.data.urlImage,
              urlTitle: item.data.urlTitle,
              urlDescription: item.data.urlDescription,
              urlDomain: item.data.urlDomain,
              
              // 其他字段
              category: item.data.category,
              tags: item.data.tags,
              featured: item.data.featured,
              url: item.data.url
            }
          }, 'interests');
          
          allUnifiedItems.push(converted);
        }
      });

      // 转换AI探索内容
      aiExploreRaw.forEach((item, index) => {
        if (item.data) {
          if (item.data.projects && Array.isArray(item.data.projects)) {
            item.data.projects.forEach((project: any, projectIndex: number) => {
              const converted = convertToUnifiedFormat({
                id: project.id || `ai-explore-${item.id}-${projectIndex}`,
                data: {
                  // 基本信息
                  title: project.title,
                  description: project.description,
                  content: project.content,
                  
                  // 图片相关字段 - 保留所有可能的图片字段
                  coverImage: project.coverImage,
                  imageUrl: project.imageUrl,
                  image: project.image,
                  imageId: project.imageId,
                  image_id: project.image_id,
                  cover_image_id: project.cover_image_id,
                  manualCoverImageId: project.manualCoverImageId,
                  
                  // URL类型项目的图片字段
                  type: project.type,
                  urlImage: project.urlImage,
                  urlTitle: project.urlTitle,
                  urlDescription: project.urlDescription,
                  urlDomain: project.urlDomain,
                  
                  // 其他字段
                  category: project.category,
                  difficulty: project.difficulty,
                  tags: project.tags,
                  featured: project.featured,
                  url: project.url,
                  githubUrl: project.githubUrl
                }
              }, 'ai-explore');
              
              allUnifiedItems.push(converted);
            });
          }
        }
      });

      const itemsWithImages = allUnifiedItems.filter(item => item.imageUrl);
      const itemsWithoutImages = allUnifiedItems.filter(item => !item.imageUrl);
      
      console.log(`[HomePage] ===== Content Loading Summary =====`);
      console.log(`[HomePage] Total unified items: ${allUnifiedItems.length}`);
      console.log(`[HomePage] Items with images: ${itemsWithImages.length}`);
      console.log(`[HomePage] Items without images: ${itemsWithoutImages.length}`);
      
      // 详细记录有图片的项目
      console.log(`[HomePage] Items WITH images:`);
      itemsWithImages.forEach(item => {
        console.log(`[HomePage] - [${item.type}] ${item.title}: ${item.imageUrl}`);
      });
      
      // 详细记录没有图片的项目
      console.log(`[HomePage] Items WITHOUT images:`);
      itemsWithoutImages.forEach(item => {
        console.log(`[HomePage] - [${item.type}] ${item.title}: NO IMAGE`);
        // 打印原始数据以便调试
        const originalData = item.originalData;
        const possibleImageFields = ['imageId', 'imageUrl', 'coverImage', 'image_id', 'cover_image_id', 'image', 'manualCoverImageId'];
        possibleImageFields.forEach(field => {
          if (originalData[field]) {
            console.log(`[HomePage]   * ${field}: ${originalData[field]}`);
          }
        });
      });
      console.log(`[HomePage] ===============================`);

      // 随机打乱所有内容
      const shuffledItems = allUnifiedItems.sort(() => Math.random() - 0.5);
      
      // 将有图片的内容排在前面
      const itemsWithImagesShuffled = itemsWithImages.sort(() => Math.random() - 0.5);
      const itemsWithoutImagesShuffled = itemsWithoutImages.sort(() => Math.random() - 0.5);
      
      const finalItems = [...itemsWithImagesShuffled, ...itemsWithoutImagesShuffled];
      
      setUnifiedContentItems(finalItems);

    } catch (error) {
      console.error('❌ 内容加载失败:', error);
      setHomeData({});
      setHasContent(false);
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage, getContentByLanguage, getImages, convertToUnifiedFormat]);

  // 使用语言同步Hook
  usePageLanguageSync(
    ['home', 'projects', 'blog', 'ai-explore', 'interests'], 
    () => {
      // 语言切换时重新加载所有内容
      console.log('[HomePage] Language sync triggered, reloading all content');
      loadAllContent();
    },
    () => {
      // 清空当前状态
      console.log('[HomePage] Clearing state for language switch');
      setHomeData({});
      setUnifiedContentItems([]);
      setHasContent(false);
      setCurrentContentIndex(0);
      // 重置工作经历展开状态
      setIsWorkExpanded(false);
    }
  );

  // 优化加载逻辑 - 减少频繁刷新，只在语言切换时重新加载
  useEffect(() => {
    console.log(`[HomePage] Loading content - language: ${currentLanguage}`);
    loadAllContent();
  }, [currentLanguage, loadAllContent]); // 移除lastUpdateTimestamp依赖以防止频繁刷新

  // 自动轮播
  useEffect(() => {
    if (!isAutoPlaying || unifiedContentItems.length === 0) return;
    
    const currentItem = unifiedContentItems[currentContentIndex];
    const displayTime = currentItem?.featured ? 8000 : 5000;
    
    const timer = setInterval(() => {
      setCurrentContentIndex((prev) => (prev + 1) % unifiedContentItems.length);
    }, displayTime);

    return () => clearInterval(timer);
  }, [isAutoPlaying, unifiedContentItems.length, currentContentIndex]);

  // 重置轮播索引
  useEffect(() => {
    if (unifiedContentItems.length > 0 && currentContentIndex >= unifiedContentItems.length) {
      setCurrentContentIndex(0);
    }
  }, [unifiedContentItems.length, currentContentIndex]);

  // 工作经历相关 - 增强逻辑
  const shouldCollapseWork = homeData.workExperience && homeData.workExperience.length > 2;
  const displayedWorkExperience = shouldCollapseWork && !isWorkExpanded 
    ? homeData.workExperience?.slice(0, 2) 
    : homeData.workExperience;

  // 工作经历展开切换函数 - 添加调试信息和更好的错误处理
  const handleWorkExpansionToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('[HomePage] Work expansion toggle clicked');
    console.log('[HomePage] Current isWorkExpanded:', isWorkExpanded);
    console.log('[HomePage] shouldCollapseWork:', shouldCollapseWork);
    console.log('[HomePage] Work experience count:', homeData.workExperience?.length || 0);
    
    setIsWorkExpanded(prev => {
      const newValue = !prev;
      console.log('[HomePage] Setting isWorkExpanded to:', newValue);
      return newValue;
    });
  }, [isWorkExpanded, shouldCollapseWork, homeData.workExperience?.length]);

  // 导航处理
  const handleNavigation = (target: string, external?: boolean) => {
    if (external) {
      window.open(target, '_blank', 'noopener,noreferrer');
    } else {
      window.dispatchEvent(new CustomEvent('navigate', { detail: target }));
    }
  };

  // 内容导航处理
  const handleContentNavigation = (type: string, id: string) => {
    const pageMapping = {
      'projects': 'projects',
      'blog': 'blog', 
      'ai-explore': 'ai_explore',
      'interests': 'interests'
    };
    const targetPage = pageMapping[type as keyof typeof pageMapping];
    if (targetPage) {
      window.dispatchEvent(new CustomEvent('navigate', { detail: targetPage }));
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 200);
    }
  };

  // AI探索项目特有的URL处理函数
  const handleAIExploreAction = (item: UnifiedContentItem, action: 'visit' | 'read') => {
    if (action === 'visit') {
      const url = item.metadata?.url;
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        const githubUrl = item.metadata?.githubUrl;
        if (githubUrl) {
          window.open(githubUrl, '_blank', 'noopener,noreferrer');
        }
      }
    } else if (action === 'read') {
      handleContentNavigation('ai-explore', item.id);
    }
  };

  // 轮播控制
  const shuffleContent = () => {
    const shuffled = [...unifiedContentItems].sort(() => Math.random() - 0.5);
    setUnifiedContentItems(shuffled);
    setCurrentContentIndex(0);
  };

  const nextContent = () => {
    setCurrentContentIndex((prev) => (prev + 1) % unifiedContentItems.length);
  };

  const prevContent = () => {
    setCurrentContentIndex((prev) => (prev - 1 + unifiedContentItems.length) % unifiedContentItems.length);
  };

  // 获取内容类型样式
  const getTypeStyles = (type: string) => {
    const styles = {
      projects: 'bg-blue-500/20 text-blue-200',
      blog: 'bg-purple-500/20 text-purple-200',
      'ai-explore': 'bg-cyan-500/20 text-cyan-200',
      interests: 'bg-pink-500/20 text-pink-200'
    };
    return styles[type as keyof typeof styles] || 'bg-gray-500/20 text-gray-200';
  };

  // 获取内容类型标签
  const getTypeLabel = (type: string) => {
    const labels = {
      projects: isZh ? '项目' : 'PROJECT',
      blog: isZh ? '博客' : 'BLOG',
      'ai-explore': isZh ? 'AI探索' : 'AI EXPLORE',
      interests: isZh ? '兴趣' : 'INTEREST'
    };
    return labels[type as keyof typeof labels] || type.toUpperCase();
  };

  // 渲染内容标签
  const renderContentTags = (item: UnifiedContentItem) => {
    switch (item.type) {
      case 'projects':
        return item.metadata?.technologies?.slice(0, 3).map((tech, index) => (
          <span key={index} className="bg-black/30 border border-blue-300 text-blue-200 px-2 py-1 text-small rounded-xl">
            {tech}
          </span>
        ));
        
      case 'blog':
        const tags = [];
        if (item.metadata?.tags) {
          tags.push(...item.metadata.tags.slice(0, 2).map((tag, index) => (
            <span key={index} className="bg-black/30 border border-purple-300 text-purple-200 px-2 py-1 text-small rounded-xl">
              #{tag}
            </span>
          )));
        }
        if (item.metadata?.readingTime) {
          tags.push(
            <span key="reading-time" className="bg-black/30 border border-yellow-300 text-yellow-200 px-2 py-1 text-small rounded-xl">
              📖 {item.metadata.readingTime}
            </span>
          );
        }
        return tags;
        
      case 'ai-explore':
        const aiTags = [];
        if (item.metadata?.category) {
          aiTags.push(
            <span key="category" className="bg-black/30 border border-cyan-300 text-cyan-200 px-2 py-1 text-small rounded-xl">
              📂 {item.metadata.category}
            </span>
          );
        }
        if (item.metadata?.difficulty) {
          aiTags.push(
            <span key="difficulty" className="bg-black/30 border border-yellow-300 text-yellow-200 px-2 py-1 text-small rounded-xl">
              🎯 {item.metadata.difficulty}
            </span>
          );
        }
        // 显示URL类型标识
        if (item.metadata?.type === 'url') {
          aiTags.push(
            <span key="url-type" className="bg-black/30 border border-green-300 text-green-200 px-2 py-1 text-small rounded-xl">
              🔗 URL
            </span>
          );
        }
        aiTags.push(
          <span key="ai-powered" className="bg-black/30 border border-green-300 text-green-200 px-2 py-1 text-small rounded-xl">
            🤖 AI Powered
          </span>
        );
        return aiTags;
        
      case 'interests':
        const interestTags = [];
        if (item.metadata?.category) {
          interestTags.push(
            <span key="category" className="bg-black/30 border border-pink-300 text-pink-200 px-2 py-1 text-small rounded-xl">
              {item.metadata.category}
            </span>
          );
        }
        if (item.metadata?.tags) {
          interestTags.push(...item.metadata.tags.slice(0, 2).map((tag, index) => (
            <span key={index} className="bg-black/30 border border-pink-300 text-pink-200 px-2 py-1 text-small rounded-xl">
              #{tag}
            </span>
          )));
        }
        // 显示URL类型标识
        if (item.metadata?.type === 'url') {
          interestTags.push(
            <span key="url-type" className="bg-black/30 border border-green-300 text-green-200 px-2 py-1 text-small rounded-xl">
              🔗 URL
            </span>
          );
        }
        return interestTags;
        
      default:
        return null;
    }
  };

  // 渲染统一内容操作按钮
  const renderContentActionButtons = (item: UnifiedContentItem) => {
    if (item.type === 'ai-explore') {
      return (
        <div className="flex space-x-2">
          {item.content && (
            <button
              onClick={() => handleAIExploreAction(item, 'read')}
              className="btn-glass-cyan flex items-center space-x-1 px-3 py-1.5 rounded-xl text-small flex-1"
            >
              <Eye className="w-3 h-3" />
              <span>{isZh ? '阅读全文' : 'Read More'}</span>
            </button>
          )}
          {(item.metadata?.url || item.metadata?.githubUrl) && (
            <button
              onClick={() => handleAIExploreAction(item, 'visit')}
              className="btn-glass-green flex items-center space-x-1 px-3 py-1.5 rounded-xl text-small flex-1"
            >
              <ExternalLink className="w-3 h-3" />
              <span>{isZh ? '访问网站' : 'Visit Site'}</span>
            </button>
          )}
        </div>
      );
    } else {
      return (
        <button
          onClick={() => handleContentNavigation(item.type, item.id)}
          className="btn-glass-orange flex items-center space-x-2 px-4 py-2 rounded-xl text-small group"
        >
          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          <span>{isZh ? '查看详情' : 'View Details'}</span>
        </button>
      );
    }
  };

  // 调试工作经历状态
  useEffect(() => {
    console.log('[HomePage] Work experience state updated:');
    console.log('- isWorkExpanded:', isWorkExpanded);
    console.log('- shouldCollapseWork:', shouldCollapseWork);
    console.log('- displayedWorkExperience length:', displayedWorkExperience?.length || 0);
    console.log('- total workExperience length:', homeData.workExperience?.length || 0);
  }, [isWorkExpanded, shouldCollapseWork, displayedWorkExperience?.length, homeData.workExperience?.length]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-8 font-terminal text-green-400 custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          <div className="glass-blue rounded-xl p-8 transition-all duration-300 mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <Terminal className="w-6 h-6 text-blue-200" />
              <h1 className="text-large text-white tracking-wide">
                [HOME] {isZh ? '主页' : 'Home Page'}
              </h1>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-blue rounded-xl p-6">
                <div className="h-6 bg-gray-700/50 mb-4 w-1/3 animate-pulse rounded-xl"></div>
                <div className="h-4 bg-gray-800/50 mb-2 animate-pulse rounded-xl"></div>
                <div className="h-4 bg-gray-800/50 w-3/4 animate-pulse rounded-xl"></div>
              </div>
              <div className="glass-orange rounded-xl p-6">
                <div className="h-5 bg-gray-700/50 mb-4 w-1/4 animate-pulse rounded-xl"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-48 bg-gray-700/50 animate-pulse rounded-xl"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-800/50 animate-pulse rounded-xl"></div>
                    <div className="h-4 bg-gray-800/50 w-3/4 animate-pulse rounded-xl"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="glass-cyan rounded-xl p-6">
                <div className="h-5 bg-gray-700/50 mb-4 w-1/2 animate-pulse rounded-xl"></div>
                <div className="space-y-3">
                  <div className="h-12 bg-gray-800/50 animate-pulse rounded-xl"></div>
                  <div className="h-12 bg-gray-800/50 animate-pulse rounded-xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 font-terminal text-green-400 custom-scrollbar">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto">
        <div className="glass-blue rounded-xl p-8 transition-all duration-300 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <Terminal className="w-6 h-6 text-blue-200" />
            <h1 className="text-large text-white tracking-wide">
              [HOME] {isZh ? '主页' : 'Home Page'}
            </h1>
          </div>
          
          {/* Hero Section */}
          {hasContent && (
            <>
              {homeData.heroTitle && (
                <h2 className="text-large text-white mb-4 tracking-wide">
                  {homeData.heroTitle}
                </h2>
              )}
              
              {homeData.heroSubtitle && (
                <div className="text-medium mb-6 homepage-subtitle-white" data-homepage-subtitle="true">
                  <MediaRenderer content={homeData.heroSubtitle} className="terminal-content homepage-subtitle-white" />
                </div>
              )}
              
              {homeData.summary && (
                <div className="text-medium text-blue-100 mb-6 leading-relaxed">
                  <MediaRenderer content={homeData.summary} className="terminal-content" />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 左侧主要内容区域 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 随机推荐内容展示 */}
            {unifiedContentItems.length > 0 && (
              <div className="glass-orange rounded-xl transition-all duration-300 group hover:shadow-xl py-[0px] px-[16px]">
                <div className="flex items-center justify-between my-[8px] mx-[0px]">
                  <div className="flex items-center space-x-3">
                    <Activity className="w-5 h-5 text-orange-300" />
                    <h2 className="text-medium text-white tracking-wide">
                      {isZh ? '随机推荐' : 'Random Showcase'}
                    </h2>
                  </div>
                  

                </div>

                {unifiedContentItems[currentContentIndex] && (
                  <div className="grid md:grid-cols-2 gap-6 m-[0px]">
                    {/* 左侧图片 - 移除所有标签 */}
                    <div className="relative homepage-showcase-image">
                      {unifiedContentItems[currentContentIndex].imageUrl ? (
                        <div className="unified-image-container bg-black/20 rounded-xl overflow-hidden" style={{ minHeight: '250px', maxHeight: '400px' }}>
                          <UnifiedImage
                            src={unifiedContentItems[currentContentIndex].imageUrl}
                            alt={unifiedContentItems[currentContentIndex].title}
                            className="unified-image"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'contain',
                              objectPosition: 'center'
                            }}
                            lazy={false}
                            showLoadingSpinner={true}
                            allImages={allImages}
                            getImageUrl={getImageUrl}
                            centerImage={true}
                            onError={(e) => {
                              const currentItem = unifiedContentItems[currentContentIndex];
                              console.warn(`[HomePage] Image failed to load for ${currentItem.type}:`, currentItem.imageUrl);
                              console.log(`[HomePage] Item: ${currentItem.title} (ID: ${currentItem.id})`);
                              
                              // Try to find an alternative image from the item's metadata
                              const alternativeFields = ['urlImage', 'coverImage', 'imageUrl', 'image'];
                              let foundAlternative = false;
                              
                              for (const field of alternativeFields) {
                                const altImageUrl = currentItem.metadata?.[field] || currentItem.originalData?.[field];
                                if (altImageUrl && altImageUrl !== currentItem.imageUrl) {
                                  console.log(`[HomePage] Trying alternative image from ${field}:`, altImageUrl);
                                  // Update the item's imageUrl with the alternative
                                  setUnifiedContentItems(prev => 
                                    prev.map((item, index) => 
                                      index === currentContentIndex 
                                        ? { ...item, imageUrl: altImageUrl }
                                        : item
                                    )
                                  );
                                  foundAlternative = true;
                                  break;
                                }
                              }
                              
                              if (!foundAlternative) {
                                console.log('[HomePage] No alternative found, will show placeholder');
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div className="aspect-video bg-gradient-to-br from-orange-600/50 to-orange-700/50 rounded-xl flex items-center justify-center">
                          <div className="text-center">
                            <Code className="w-12 h-12 mx-auto mb-2 text-orange-300" />
                            <p className="text-small text-orange-300">{isZh ? '暂无图片' : 'No Image'}</p>
                            {/* 显示调试信息（仅在开发环境） */}
                            {process.env.NODE_ENV === 'development' && (
                              <p className="text-small text-orange-400/70 mt-1">
                                [{unifiedContentItems[currentContentIndex].type}] {unifiedContentItems[currentContentIndex].title}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 右侧内容 */}
                    <div className="space-y-4">
                      {/* 标题和标签行 - 将标签移到标题右侧 */}
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <h3 className="text-medium text-white group-hover:text-orange-100 transition-colors flex-1 min-w-0">
                          {unifiedContentItems[currentContentIndex].title}
                        </h3>
                        
                        {/* 右侧固定标签区域 */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* 类型标签 */}
                          <span className={`px-2 py-1 rounded-xl text-small font-medium ${getTypeStyles(unifiedContentItems[currentContentIndex].type)}`}>
                            {getTypeLabel(unifiedContentItems[currentContentIndex].type)}
                          </span>
                          
                          {/* 精选标签 */}
                          {unifiedContentItems[currentContentIndex].featured && (
                            <span className="bg-yellow-500/90 text-black px-2 py-1 rounded-xl text-small font-medium">
                              ⭐ {isZh ? '精选' : 'FEATURED'}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {unifiedContentItems[currentContentIndex].description && (
                        <div className="text-small text-orange-100 leading-relaxed">
                          <MediaRenderer 
                            content={unifiedContentItems[currentContentIndex].description.length > 120 
                              ? unifiedContentItems[currentContentIndex].description.substring(0, 120) + '...' 
                              : unifiedContentItems[currentContentIndex].description
                            } 
                            className="terminal-content" 
                          />
                        </div>
                      )}
                      
                      {/* 标签 */}
                      <div className="flex flex-wrap gap-2">
                        {renderContentTags(unifiedContentItems[currentContentIndex])}
                      </div>
                      
                      {/* 操作按钮 */}
                      <div className="pt-2">
                        {renderContentActionButtons(unifiedContentItems[currentContentIndex])}
                      </div>
                    </div>
                  </div>
                )}

                {/* 指示器 */}
                <div className="flex justify-center mt-6 space-x-2">
                  {unifiedContentItems.slice(0, 5).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentContentIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentContentIndex 
                          ? 'bg-orange-400 w-6' 
                          : 'bg-orange-600/50 hover:bg-orange-500/70'
                      }`}
                    />
                  ))}
                  {unifiedContentItems.length > 5 && (
                    <span className="text-small text-orange-300 ml-2">
                      +{unifiedContentItems.length - 5}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* 工作经历卡片 - 修复展开功能 */}
            {homeData.workExperience && homeData.workExperience.length > 0 && (
              <div className="glass-purple rounded-xl p-6 transition-all duration-300 group hover:shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-5 h-5 text-purple-300" />
                    <h2 className="text-medium text-white tracking-wide">
                      {homeData.workExperienceTitle || (isZh ? '工作经历' : 'Work Experience')}
                    </h2>
                  </div>
                  
                  {shouldCollapseWork && (
                    <button
                      onClick={handleWorkExpansionToggle}
                      className="btn-glass-purple flex items-center space-x-1 px-3 py-1 rounded-xl text-small hover:bg-purple-500/30 transition-colors duration-200"
                      type="button"
                      aria-label={isWorkExpanded ? (isZh ? '收起工作经历' : 'Collapse work experience') : (isZh ? '展开全部工作经历' : 'Show all work experience')}
                    >
                      {isWorkExpanded ? (
                        <>
                          <ChevronUp className="w-3 h-3" />
                          <span>{isZh ? '收起' : 'Collapse'}</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3 h-3" />
                          <span>{isZh ? '展开全部' : 'Show All'}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                
                <div className="work-experience-list">
                  {displayedWorkExperience?.map((work, index) => (
                    <div key={index} className="relative pl-6 group/work">
                      {/* 时间轴线条 */}
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-400 to-purple-600"></div>
                      {/* 时间轴圆点 */}
                      <div className="absolute left-[-3px] top-2 w-2 h-2 bg-purple-400 rounded-full shadow-lg shadow-purple-400/50"></div>
                      
                      <div className="bg-purple-500/10 border border-purple-400/20 rounded-xl p-4 group-hover/work:bg-purple-500/15 transition-all duration-300">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
                          <div className="flex-1 space-y-2">
                            <h3 className="text-medium text-purple-200 group-hover/work:text-purple-100 transition-colors font-medium">
                              {work.company}
                            </h3>
                            
                            <div className="flex items-center space-x-2">
                              <span className="text-small text-purple-300/80">{isZh ? '职位：' : 'Position:'}</span>
                              <span className="text-small text-purple-300 font-medium">{work.position}</span>
                            </div>
                            
                            {work.location && (
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-3 h-3 text-purple-400" />
                                <span className="text-small text-purple-400">{work.location}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="md:ml-4">
                            <div className="flex items-center space-x-2 text-small text-purple-300 bg-purple-500/20 px-3 py-2 rounded-xl border border-purple-400/30">
                              <Calendar className="w-3 h-3" />
                              <span>{work.period}</span>
                            </div>
                          </div>
                        </div>
                        
                        {work.description && (
                          <div className="bg-purple-500/15 border border-purple-400/25 rounded-xl p-4 space-y-3">
                            <div className="flex items-center space-x-2 mb-3">
                              <FileText className="w-4 h-4 text-purple-300" />
                              <span className="text-small text-purple-300 font-medium">
                                {isZh ? '工作描述' : 'Job Description'}
                              </span>
                            </div>
                            <div className="terminal-content text-small text-purple-100 leading-relaxed">
                              <MediaRenderer content={work.description} className="terminal-content" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {shouldCollapseWork && !isWorkExpanded && homeData.workExperience && homeData.workExperience.length > 2 && (
                    <div className="text-center pt-4">
                      <div className="bg-purple-500/20 border border-purple-400/30 rounded-xl px-4 py-3">
                        <button
                          onClick={handleWorkExpansionToggle}
                          className="text-small text-purple-300 flex items-center justify-center space-x-2 hover:text-purple-200 transition-colors w-full"
                          type="button"
                        >
                          <ChevronDown className="w-3 h-3" />
                          <span>
                            {isZh ? `还有 ${homeData.workExperience.length - 2} 条工作经历，点击展开` : `${homeData.workExperience.length - 2} more experiences, click to expand`}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 右侧侧边栏 */}
          <div className="space-y-6">
            {/* 教育经历卡片 - 保持在右侧 */}
            {homeData.education && homeData.education.length > 0 && (
              <div className="glass-cyan rounded-xl p-6 transition-all duration-300 group hover:shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <GraduationCap className="w-5 h-5 text-cyan-300" />
                  <h2 className="text-medium text-white tracking-wide">
                    {homeData.educationTitle || (isZh ? '教育经历' : 'Education')}
                  </h2>
                </div>
                
                <div className="space-y-6">
                  {homeData.education.map((edu, index) => (
                    <div key={index} className="relative pl-6 group/edu">
                      {/* 时间轴线条 */}
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-400 to-cyan-600"></div>
                      {/* 时间轴圆点 */}
                      <div className="absolute left-[-3px] top-2 w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50"></div>
                      
                      <div className="bg-cyan-500/10 border border-cyan-400/20 rounded-xl p-4 group-hover/edu:bg-cyan-500/15 transition-all duration-300">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                          <div className="flex-1 space-y-2">
                            <h3 className="text-medium text-cyan-200 group-hover/edu:text-cyan-100 transition-colors font-medium">
                              {edu.school}
                            </h3>
                            
                            {edu.major && (
                              <div className="flex items-center space-x-2">
                                <span className="text-small text-cyan-300/80">{isZh ? '专业：' : 'Major:'}</span>
                                <span className="text-small text-cyan-300 font-medium">{edu.major}</span>
                              </div>
                            )}
                            
                            {edu.degree && (
                              <div className="flex items-center space-x-2">
                                <span className="text-small text-cyan-300/80">{isZh ? '学位：' : 'Degree:'}</span>
                                <span className="text-small text-cyan-400 bg-cyan-500/20 px-2 py-1 rounded-xl border border-cyan-400/30">
                                  {edu.degree}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="md:ml-4">
                            <div className="flex items-center space-x-2 text-small text-cyan-300 bg-cyan-500/20 px-3 py-2 rounded-xl border border-cyan-400/30">
                              <Calendar className="w-3 h-3" />
                              <span>{edu.period}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 技能标签 */}
            {homeData.skills && homeData.skills.length > 0 && (
              <div className="glass-green rounded-xl p-6 transition-all duration-300 group hover:shadow-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <Zap className="w-5 h-5 text-green-300" />
                  <h2 className="text-medium text-white tracking-wide">
                    {homeData.skillsTitle || (isZh ? '技能' : 'Skills')}
                  </h2>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {homeData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-black/30 border border-green-300 text-green-200 px-3 py-1 text-small rounded-xl hover:bg-green-500/20 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AI聊天机器人 */}
            <div className="glass-amber rounded-xl p-6 transition-all duration-300 group hover:shadow-xl">
              <div className="flex items-center space-x-3 mb-4">
                <Bot className="w-5 h-5 text-amber-300" />
                <h2 className="text-medium text-white tracking-wide">
                  {isZh ? 'AI 助手' : 'AI Assistant'}
                </h2>
              </div>
              
              <div className="mb-4">
                <p className="text-small text-amber-100">
                  {isZh 
                    ? '有任何问题？与我的AI助手聊天，了解更多关于我的信息！' 
                    : 'Got questions? Chat with my AI assistant to learn more about me!'
                  }
                </p>
              </div>
              
              <AIChatBox />
            </div>

            {/* 快速导航 */}
            {homeData.navigationButtons && homeData.navigationButtons.length > 0 && (
              <div className="glass-rose rounded-xl p-6 transition-all duration-300 group hover:shadow-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <MessageCircle className="w-5 h-5 text-rose-300" />
                  <h2 className="text-medium text-white tracking-wide">
                    {homeData.ctaTitle || (isZh ? '快速导航' : 'Quick Navigation')}
                  </h2>
                </div>
                
                {homeData.ctaDescription && (
                  <div className="text-small text-rose-100 mb-4 leading-relaxed">
                    <MediaRenderer content={homeData.ctaDescription} className="terminal-content" />
                  </div>
                )}
                
                <div className="space-y-3">
                  {homeData.navigationButtons.map((button) => (
                    <button
                      key={button.id}
                      onClick={() => handleNavigation(button.target, button.external)}
                      className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-small transition-all group/btn ${
                        button.style === 'primary' 
                          ? 'btn-glass-rose hover:bg-rose-500/30' 
                          : 'btn-glass-purple hover:bg-purple-500/30'
                      }`}
                    >
                      <span>{button.text}</span>
                      <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
