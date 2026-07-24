import React, { useState, useEffect, useRef } from 'react';
import { Code, Monitor, Github, ExternalLink, Calendar, MapPin, Users, Zap, ChevronDown, ChevronUp, Tag, Star } from 'lucide-react';
import { useContent } from '../content/ContentContext';
import { useLanguage, useTexts } from '../language/LanguageContext';
import MediaRenderer from '../shared/MediaRenderer';
import UnifiedImage from '../shared/UnifiedImage';
import { imageService, URLValidator } from '../../utils/ImageService';
import { usePageLanguageSync } from '../shared/useLanguageSync';

interface ProjectData {
  title: string;
  description: string;
  role?: string;
  period?: string;
  technologies: string[];
  highlights?: string[];
  link?: string;
  repository?: string;
  imageUrl?: string;
  imageId?: string;
  featured?: boolean;
  githubUrl?: string;
  liveUrl?: string;
  teamSize?: string;
  location?: string;
  order?: number;
  sortOrder?: number;
}

interface ContentItem {
  id: string;
  type: string;
  language: string;
  data: ProjectData;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function ProjectsPage() {
  const { getContentByLanguage, getImageUrl, getImages } = useContent();
  const { currentLanguage, isZh } = useLanguage();
  const texts = useTexts();
  const [projects, setProjects] = useState<ContentItem[]>([]);
  const [allImages, setAllImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());


  const isLoadingRef = useRef(false);
  const currentLanguageRef = useRef(currentLanguage);


  const loadProjects = async (forceRefresh = false) => {
    if (!forceRefresh && isLoadingRef.current) {
      console.log('[ProjectsPage] Already loading, skipping...');
      return;
    }


    if (!forceRefresh && currentLanguageRef.current === currentLanguage && projects.length > 0) {
      console.log('[ProjectsPage] Same language and projects exist, skipping...');
      return;
    }

    isLoadingRef.current = true;
    currentLanguageRef.current = currentLanguage;

    console.log(`[ProjectsPage] Loading projects for language: ${currentLanguage} (forceRefresh: ${forceRefresh})`);
    setIsLoading(true);
    setProjects([]);
    
    try {

      try {
        const images = await getImages(false);
        setAllImages(images);
      } catch (imgError) {
        console.error('[ProjectsPage] Failed to load images:', imgError);
      }

      const content = await getContentByLanguage('projects', currentLanguage);
      console.log(`[ProjectsPage] Loaded ${content.length} projects for ${currentLanguage}`);
      

      const sortedProjects = content.sort((a, b) => {

        const orderA = a.data?.order || a.data?.sortOrder || a.sortOrder || 0;
        const orderB = b.data?.order || b.data?.sortOrder || b.sortOrder || 0;
        
        console.log(`[ProjectsPage] Sorting ${a.data?.title} (order: ${orderA}) vs ${b.data?.title} (order: ${orderB})`);
        
        if (orderA !== orderB) {
          return orderB - orderA;
        }
        

        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
      
      console.log(`[ProjectsPage] Projects sorted by order (descending):`, sortedProjects.map(p => ({
        title: p.data?.title,
        order: p.data?.order || p.data?.sortOrder || p.sortOrder,
        id: p.id
      })));
      
      setProjects(sortedProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  };

  // 使用语言同步Hook
  usePageLanguageSync(
    ['projects'], 
    () => {
      // 语言切换时重新加载项目
      console.log('[ProjectsPage] Language sync triggered, reloading projects');
      loadProjects(true);
    },
    () => {
      // 清空当前状态
      console.log('[ProjectsPage] Clearing state for language switch');
      setProjects([]);
      setExpandedProjects(new Set());
      isLoadingRef.current = false;
      currentLanguageRef.current = currentLanguage;
    }
  );

  // 初始加载
  useEffect(() => {
    if (!isLoadingRef.current) {
      console.log(`[ProjectsPage] Initial load for language: ${currentLanguage}`);
      loadProjects(false);
    }
  }, [currentLanguage]);

  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      console.log(`[ProjectsPage] Toggled expansion for ${projectId}, now expanded:`, newSet.has(projectId));
      return newSet;
    });
  };

  const getProjectImageUrl = (project: ProjectData): string | null => {
    // 使用imageService的统一图片获取逻辑
    const imageUrl = imageService.getUnifiedImageUrl(project, getImageUrl);
    if (imageUrl) {
      return imageUrl;
    }

    // 回退处理
    if (project.imageId) {
      return getImageUrl(project.imageId);
    }
    if (project.imageUrl) {
      const match = project.imageUrl.match(/^\\{\\{image:([^|}]+)\\}\\}$/);
      if (match) {
        return getImageUrl(match[1]);
      }
      // 检查是否是有效的HTTP URL
      if (project.imageUrl.startsWith('http') && URLValidator.isValidImageUrl(project.imageUrl)) {
        return project.imageUrl;
      }
    }
    return null;
  };

  // 检查是否需要展开功能
  const shouldShowExpansion = (project: ProjectData): boolean => {
    // 检查描述长度
    const hasLongDescription = project.description && project.description.length > 120;

    const hasHighlights = project.highlights && project.highlights.length > 0;

    const hasManyTechnologies = project.technologies && project.technologies.length > 4;
    
    return !!(hasLongDescription || hasHighlights || hasManyTechnologies);
  };


  const renderProjectCard = (project: ContentItem) => {
    const isExpanded = expandedProjects.has(project.id);
    const imageUrl = getProjectImageUrl(project.data);
    const shouldExpand = shouldShowExpansion(project.data);
    

    const truncatedDescription = project.data.description && project.data.description.length > 120 
      ? project.data.description.substring(0, 120) + '...' 
      : project.data.description;

    return (
      <div 
        key={project.id}
        id={project.id}
        className={`glass-orange rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.01] group ${
          isExpanded ? 'h-auto' : ''
        }`}
      >
        <div className={`flex ${isExpanded ? 'h-auto min-h-[20rem]' : 'h-80 md:h-96'}`}>

          <div className="w-[40%] max-w-[40%] relative overflow-hidden project-cover-image flex-shrink-0 rounded-[20px]">
            {imageUrl ? (
              <div className="unified-image-container w-full h-full bg-black/20 flex items-center justify-center">
                <UnifiedImage
                  src={imageUrl}
                  alt={project.data.title}
                  className="unified-image w-full h-full object-contain"
                  style={{ 
                    objectFit: 'contain',
                    objectPosition: 'center',
                    maxWidth: '100%',
                    maxHeight: '100%'
                  }}
                  lazy={true}
                  showLoadingSpinner={true}
                  allImages={allImages}
                  getImageUrl={getImageUrl}
                  centerImage={true}
                />
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-800/50 to-orange-900/50 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 mx-auto bg-orange-700/50 rounded-full flex items-center justify-center">
                    <Code className="w-6 h-6 text-orange-400" />
                  </div>
                  <p className="text-small text-orange-300">{isZh ? '项目封面' : 'Cover'}</p>
                </div>
              </div>
            )}
            

            {project.data.featured && (
              <div className="absolute top-2 left-2">
                <span className="bg-green-500/90 text-white px-2 py-1 rounded-xl text-small font-medium flex items-center space-x-1">
                  <Star className="w-3 h-3" />
                  <span>{isZh ? '精选' : 'FEATURED'}</span>
                </span>
              </div>
            )}


            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2 rounded-[0px]">
              {(project.data.link || project.data.liveUrl) && (
                <a
                  href={project.data.link || project.data.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-glass-green flex items-center space-x-1 px-2 py-1 rounded-xl text-small"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>{isZh ? '演示' : 'Demo'}</span>
                </a>
              )}
              
              {(project.data.repository || project.data.githubUrl) && (
                <a
                  href={project.data.repository || project.data.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-glass-cyan flex items-center space-x-1 px-2 py-1 rounded-xl text-small"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Github className="w-3 h-3" />
                  <span>{isZh ? '代码' : 'Code'}</span>
                </a>
              )}
            </div>
          </div>


          <div className="w-[60%] flex flex-col px-[32px] py-[16px] px-[128px]">

            <div className="flex-shrink-0 mb-3">
              <h3 className="text-medium font-medium text-white line-clamp-2 leading-tight mb-2">
                {project.data.title}
              </h3>


              <div className="flex flex-wrap gap-1 mb-2">
                {project.data.role && (
                  <span className="bg-purple-500/20 text-purple-200 px-2 py-1 text-small rounded-xl border border-purple-400/30 flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>{project.data.role}</span>
                  </span>
                )}
                {project.data.period && (
                  <span className="bg-cyan-500/20 text-cyan-200 px-2 py-1 text-small rounded-xl border border-cyan-400/30 flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{project.data.period}</span>
                  </span>
                )}
              </div>
            </div>


            <div className={`flex-1 ${isExpanded ? 'overflow-visible' : 'overflow-hidden'}`}>
              {project.data.description && (
                <div className="space-y-3 h-full flex flex-col">
                  <div className="text-small text-orange-100 leading-relaxed">
                    <MediaRenderer 
                      content={isExpanded ? project.data.description : truncatedDescription} 
                      className="terminal-content"
                    />
                  </div>
                  

                  {isExpanded && project.data.highlights && project.data.highlights.length > 0 && (
                    <div className="space-y-2 flex-shrink-0">
                      <h4 className="text-small text-green-300 font-medium flex items-center space-x-1">
                        <Zap className="w-3 h-3" />
                        <span>{isZh ? '项目亮点' : 'Key Features'}</span>
                      </h4>
                      <div className="space-y-1 max-h-none overflow-visible">
                        {project.data.highlights.map((highlight, idx) => (
                          <div key={idx} className="text-small text-green-200 flex items-start space-x-2">
                            <span className="text-green-300 mt-0.5 flex-shrink-0">•</span>
                            <MediaRenderer content={highlight} className="terminal-content flex-1" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>


            {project.data.technologies && project.data.technologies.length > 0 && (
              <div className="flex-shrink-0 mt-3 mb-3">
                <div className="flex flex-wrap gap-1">
                  {project.data.technologies.slice(0, isExpanded ? undefined : 4).map((tech, idx) => (
                    <span
                      key={idx}
                      className="bg-black/30 border border-blue-300/50 text-blue-200 px-2 py-1 text-small rounded-xl"
                    >
                      {tech}
                    </span>
                  ))}
                  {!isExpanded && project.data.technologies.length > 4 && (
                    <span className="text-orange-200 text-small px-2 py-1 bg-orange-500/20 rounded-xl border border-orange-400/30">
                      +{project.data.technologies.length - 4}
                    </span>
                  )}
                </div>
              </div>
            )}


            <div className="flex-shrink-0 space-y-2">

              {shouldExpand && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    toggleProjectExpansion(project.id);
                  }}
                  className="w-full btn-glass-orange flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-small hover:bg-orange-500/30 transition-colors duration-200 p-[0px]"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      <span>{isZh ? '收起' : 'Collapse'}</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      <span>{isZh ? '展开详情' : 'Expand Details'}</span>
                    </>
                  )}
                </button>
              )}

              {/* 移动端操作按钮 */}
              <div className="flex space-x-2 md:hidden">
                {(project.data.link || project.data.liveUrl) && (
                  <a
                    href={project.data.link || project.data.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-glass-green flex items-center space-x-1 px-3 py-2 rounded-xl text-small flex-1 justify-center"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>{isZh ? '演示' : 'Demo'}</span>
                  </a>
                )}
                
                {(project.data.repository || project.data.githubUrl) && (
                  <a
                    href={project.data.repository || project.data.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-glass-cyan flex items-center space-x-1 px-3 py-2 rounded-xl text-small flex-1 justify-center"
                  >
                    <Github className="w-3 h-3" />
                    <span>{isZh ? '代码' : 'Code'}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-8 font-terminal text-green-400 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="glass-blue rounded-xl p-8">
            <div className="h-8 bg-gray-700/50 rounded-xl mb-4 w-1/3 animate-pulse"></div>
            <div className="h-4 bg-gray-800/50 rounded-xl mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-800/50 rounded-xl w-2/3 animate-pulse"></div>
          </div>

          {/* Project Skeletons */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-orange rounded-xl overflow-hidden">
              <div className="flex h-80">
                <div className="w-[40%] bg-gray-700/50 animate-pulse"></div>
                <div className="w-[60%] p-4 space-y-4">
                  <div className="h-6 bg-gray-700/50 rounded-xl w-3/4 animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-800/50 rounded-xl animate-pulse"></div>
                    <div className="h-3 bg-gray-800/50 rounded-xl w-5/6 animate-pulse"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-800/50 rounded-xl w-16 animate-pulse"></div>
                    <div className="h-6 bg-gray-800/50 rounded-xl w-20 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 font-terminal text-green-400 custom-scrollbar">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto">
        <div className="glass-blue rounded-xl transition-all duration-300 py-[0px] px-[32px]">
          <div className="flex items-center space-x-3 mb-6">
            <Code className="w-6 h-6 text-blue-200" />
            <h1 className="text-large text-white tracking-wide">
              [PROJECTS] {isZh ? '项目展示' : 'Project Showcase'}
            </h1>
          </div>
          
          <div className="text-medium text-blue-100 mb-4">
            {isZh 
              ? '> 我工作经历中的一些项目 '
              : '> Explore my projects experience'}
          </div>
          
          <div className="flex items-center space-x-4 text-small text-blue-200">
            <div className="flex items-center space-x-2">
              <Monitor className="w-4 h-4" />
              <span>{projects.length} {isZh ? '个项目' : 'Projects'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4" />
              <span>{projects.filter(p => p.data.featured).length} {isZh ? '个精选' : 'Featured'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="max-w-7xl mx-auto space-y-6">
        {projects.length > 0 ? (
          projects.map((project) => renderProjectCard(project))
        ) : (
          <div className="glass-rose rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-500/20 border border-red-400/50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Code className="w-8 h-8 text-red-300" />
            </div>
            <h2 className="text-medium text-red-300 mb-4">
              {isZh ? '[INFO] 暂无项目' : '[INFO] No Projects Available'}
            </h2>
            <p className="text-red-200 text-small">
              {isZh 
                ? '> 还没有添加任何项目内容\n> 请在本地内容数据文件中添加项目'
                : '> No projects have been added yet\n> Add projects in the local content data file'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
