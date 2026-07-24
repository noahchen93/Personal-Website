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
        className={`project-card glass-orange group ${
          isExpanded ? 'is-expanded lg:col-span-2' : ''
        }`}
      >
        <div className="project-card__layout">

          <div className="project-card__media project-cover-image">
            {imageUrl ? (
              <UnifiedImage
                src={imageUrl}
                alt={project.data.title}
                className="w-full h-full"
                style={{ objectFit: 'contain', objectPosition: 'center' }}
                lazy
                showLoadingSpinner
                allImages={allImages}
                getImageUrl={getImageUrl}
                centerImage
              />
            ) : (
              <div className="project-card__placeholder">
                <div className="text-center space-y-2">
                  <div className="project-card__placeholder-icon">
                    <Code />
                  </div>
                  <p>{isZh ? '项目封面' : 'Project cover'}</p>
                </div>
              </div>
            )}
            

            {project.data.featured && (
              <div className="project-card__featured">
                <span>
                  <Star aria-hidden="true" />
                  <span>{isZh ? '精选' : 'FEATURED'}</span>
                </span>
              </div>
            )}


            <div className="project-card__media-actions">
              {(project.data.link || project.data.liveUrl) && (
                <a
                  href={project.data.link || project.data.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-card__media-link"
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
                  className="project-card__media-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Github className="w-3 h-3" />
                  <span>{isZh ? '代码' : 'Code'}</span>
                </a>
              )}
            </div>
          </div>


          <div className="project-card__body">

            <div className="project-card__header">
              <h3>
                {project.data.title}
              </h3>


              <div className="project-card__meta">
                {project.data.role && (
                  <span>
                    <Users aria-hidden="true" />
                    <span>{project.data.role}</span>
                  </span>
                )}
                {project.data.period && (
                  <span>
                    <Calendar aria-hidden="true" />
                    <span>{project.data.period}</span>
                  </span>
                )}
              </div>
            </div>


            <div
              id={`project-details-${project.id}`}
              className={`project-card__description ${isExpanded ? 'is-expanded' : ''}`}
            >
              {project.data.description && (
                <div className="space-y-3 h-full flex flex-col">
                  <div>
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
                        {project.data.highlights.map((highlight) => (
                          <div key={highlight} className="text-small text-green-200 flex items-start space-x-2">
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
              <div className="project-card__technologies">
                <div>
                  {project.data.technologies.slice(0, isExpanded ? undefined : 4).map((tech) => (
                    <span
                      key={tech}
                    >
                      {tech}
                    </span>
                  ))}
                  {!isExpanded && project.data.technologies.length > 4 && (
                    <span>
                      +{project.data.technologies.length - 4}
                    </span>
                  )}
                </div>
              </div>
            )}


            <div className="project-card__footer">

              {shouldExpand && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    toggleProjectExpansion(project.id);
                  }}
                  className="project-card__expand"
                  aria-expanded={isExpanded}
                  aria-controls={`project-details-${project.id}`}
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
              <div className="project-card__mobile-links">
                {(project.data.link || project.data.liveUrl) && (
                  <a
                    href={project.data.link || project.data.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-card__mobile-link"
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
                    className="project-card__mobile-link"
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
      <div className="page-section">
        <div className="portfolio-grid">
          {/* Header Skeleton */}
          <div className="page-intro portfolio-skeleton">
            <div className="h-8 bg-gray-700/50 rounded-xl mb-4 w-1/3 animate-pulse"></div>
            <div className="h-4 bg-gray-800/50 rounded-xl mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-800/50 rounded-xl w-2/3 animate-pulse"></div>
          </div>

          {/* Project Skeletons */}
          <div className="project-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="project-card glass-orange overflow-hidden">
              <div className="project-card__layout">
                <div className="project-card__media bg-gray-700/50 animate-pulse"></div>
                <div className="project-card__body space-y-4">
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
      </div>
    );
  }

  return (
    <div className="page-section page-section--projects">
      {/* Page Header */}
      <div className="portfolio-grid">
        <section className="page-intro">
          <div className="page-intro__eyebrow">
            <Code aria-hidden="true" />
            <span>{isZh ? '作品索引' : 'Selected work'}</span>
          </div>
          <div className="page-intro__body">
            <h1>
              [PROJECTS] {isZh ? '项目展示' : 'Project Showcase'}
            </h1>
            <p>
            {isZh 
              ? '产品、交互与 AI 实践中的代表项目。'
              : 'Selected product, interaction and AI work.'}
            </p>
          </div>
          <div className="page-intro__stats">
            <div>
              <Monitor className="w-4 h-4" />
              <span>{projects.length} {isZh ? '个项目' : 'Projects'}</span>
            </div>
            <div>
              <Star className="w-4 h-4" />
              <span>{projects.filter(p => p.data.featured).length} {isZh ? '个精选' : 'Featured'}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Projects List */}
      <div className="portfolio-grid project-grid">
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
