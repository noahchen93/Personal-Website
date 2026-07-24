import React, { useState, useEffect } from 'react';
import { useContent } from '../content/ContentContext';
import { useLanguage } from '../language/LanguageContext';
import { 
  ExternalLink, 
  Brain, 
  Star,
  Globe,
  Eye,
  Bot,
  Network,
  ChevronDown,
  ChevronUp,
  Github
} from 'lucide-react';
import UnifiedImage from '../shared/UnifiedImage';
import MediaRenderer from '../shared/MediaRenderer';
import { imageService, URLValidator } from '../../utils/ImageService';
import { usePageLanguageSync } from '../shared/useLanguageSync';

interface AIProject {
  id: string;
  title: string;
  description: string;
  content?: string;
  coverImage: string;
  url: string;
  githubUrl?: string;
  tags: string[];
  featured?: boolean;
  createdAt: string;
  type?: 'content' | 'url';
  urlTitle?: string;
  urlDescription?: string;
  urlImage?: string;
  urlDomain?: string;
  manualCoverImageId?: string;
}

interface AIExploreData {
  title: string;
  subtitle: string;
  introduction: string;
  projects: AIProject[];
  lastUpdated: string;
}

const FEATURED_BADGE_CLASSES = "absolute top-4 left-4 bg-gradient-to-r from-green-500/95 to-green-600/95 text-white px-3 py-1.5 text-small rounded-lg backdrop-blur-sm border border-green-400/40 shadow-lg";

export default function AIExplorePage() {
  const { getContent, getImageUrl, getImages, lastUpdateTimestamp } = useContent();
  const { isZh } = useLanguage();
  const [data, setData] = useState<AIExploreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewProject, setPreviewProject] = useState<AIProject | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [allImages, setAllImages] = useState<any[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      setData(null);
      
      const response = await getContent('ai-explore', undefined, isZh ? 'zh' : 'en');
      
      if (response && response.length > 0) {
        const publishedContent = response.find(item => item.is_published) || response[0];
        
        if (publishedContent && publishedContent.data) {
          setData(publishedContent.data);
        } else {
          setData({
            title: isZh ? 'AI探索之旅' : 'AI Exploration Journey',
            subtitle: isZh ? '探索人工智能的无限可能' : 'Exploring the infinite possibilities of AI',
            introduction: isZh 
              ? '欢迎来到我的AI探索世界！这里展示了我在人工智能领域的学习成果、实际应用和深度思考。从构建智能应用到掌握前沿技术，从分析行业趋势到分享使用心得，记录我在AI时代的成长轨迹。'
              : 'Welcome to my AI exploration world! Here I showcase my learning achievements, practical applications, and deep thinking in the field of artificial intelligence. From building intelligent applications to mastering cutting-edge technologies, from analyzing industry trends to sharing user experiences, documenting my growth journey in the AI era.',
            projects: [],
            lastUpdated: new Date().toISOString()
          });
        }
      } else {
        setData({
          title: isZh ? 'AI探索之旅' : 'AI Exploration Journey',
          subtitle: isZh ? '探索人工智能的无限可能' : 'Exploring the infinite possibilities of AI',
          introduction: isZh 
            ? '欢迎来到我的AI探索世界！这里展示了我在人工智能领域的学习成果、实际应用和深度思考。'
            : 'Welcome to my AI exploration world! Here I showcase my learning achievements, practical applications, and deep thinking in the AI field.',
          projects: [],
          lastUpdated: new Date().toISOString()
        });
      }
    } catch (error) {
      setData({
        title: isZh ? '我的AI探索之旅' : 'My AI Exploration Journey',
        subtitle: isZh ? '我折腾AI做的一些小项目' : 'Exploring the infinite possibilities of AI',
        introduction: isZh 
          ? '欢迎来到我的AI探索世界！'
          : 'Welcome to my AI exploration world!',
        projects: [],
        lastUpdated: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  usePageLanguageSync(
    ['ai-explore'], 
    () => {
      loadData();
    },
    () => {
      setData(null);
      setExpandedProjects(new Set());
    }
  );

  useEffect(() => {
    getImages().then(setAllImages).catch(() => {});
  }, [getImages]);

  useEffect(() => {
    loadData();
  }, [lastUpdateTimestamp]);

  useEffect(() => {
    if (previewProject) {
      document.body.classList.add('body-scroll-locked');
      document.body.style.overflow = 'hidden';
      
      setTimeout(() => {
        const modalElement = document.querySelector('[role="dialog"]') as HTMLElement;
        if (modalElement) {
          modalElement.focus();
        }
      }, 100);
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setPreviewProject(null);
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        document.body.classList.remove('body-scroll-locked');
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [previewProject]);

  const allProjects = data?.projects || [];

  const handlePreview = (project: AIProject) => {
    setPreviewProject(project);
  };

  const handleVisitSite = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const getProjectImageUrl = (project: AIProject) => {

    const imageUrl = imageService.getUnifiedImageUrl(project, getImageUrl);
    if (imageUrl) {
      return imageUrl;
    }

    if (project.manualCoverImageId) {
      return getImageUrl(project.manualCoverImageId);
    }
    
    if (project.coverImage) {
      const match = project.coverImage.match(/^\\{\\{image:([^|}]+)\\}\\}$/);
      if (match) {
        return getImageUrl(match[1]);
      }

      if (project.coverImage.startsWith('http') && URLValidator.isValidImageUrl(project.coverImage)) {
        return project.coverImage;
      }
    }

    if (project.type === 'url' && project.urlImage && URLValidator.isValidImageUrl(project.urlImage)) {
      return project.urlImage;
    }
    
    return null;
  };

  const handleUrlProjectClick = (project: AIProject) => {
    if (project.type === 'url' && project.url) {
      window.open(project.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleTagClick = (project: AIProject, e: React.MouseEvent) => {
    e.stopPropagation();
    handlePreview(project);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-8 font-terminal text-green-400 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-6">

          <div className="glass-purple rounded-lg p-8">
            <div className="h-8 bg-gray-700/50 rounded mb-4 w-1/3 animate-pulse"></div>
            <div className="h-4 bg-gray-800/50 rounded mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-800/50 rounded w-2/3 animate-pulse"></div>
          </div>


          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-purple rounded-lg p-6">
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

  if (!data) return null;

  return (
    <div className="p-6 space-y-8 font-terminal text-green-400 custom-scrollbar">
      <div className="max-w-7xl mx-auto">
        <div className="glass-purple rounded-lg transition-all duration-300 mb-8 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Brain className="w-6 h-6 text-purple-200" />
            <h1 className="text-large text-white tracking-wide">
              [AI EXPLORE] {data.title}
            </h1>
          </div>
          
          <div className="text-medium text-purple-100 mb-4">
            {data.subtitle}
          </div>
          
          <div className="flex items-center space-x-4 text-small text-purple-200">
            <div className="flex items-center space-x-2">
              <Bot className="w-4 h-4" />
              <span>{allProjects.length} {isZh ? '个AI项目' : 'AI Projects'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4" />
              <span>{allProjects.filter(p => p.featured).length} {isZh ? '个精选' : 'Featured'}</span>
            </div>
          </div>
        </div>

        {allProjects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {allProjects.map((project) => {
              const isExpanded = expandedProjects.has(project.id);
              const imageUrl = getProjectImageUrl(project);
              const isUrlType = project.type === 'url';
              
              return (
                <div 
                  key={project.id}
                  id={project.id}
                  className={`glass-purple rounded-lg transition-all duration-300 hover:transform hover:-translate-y-2 group overflow-hidden shadow-2xl ${
                    isUrlType ? 'cursor-pointer' : ''
                  }`}
                  onClick={isUrlType ? () => handleUrlProjectClick(project) : undefined}
                >
                  <div className="relative">
                    {imageUrl ? (
                      <div className="relative overflow-hidden rounded-t-lg border-b border-purple-300/20 bg-black/30 ai-explore-cover-image cover-image-container">
                        <UnifiedImage
                          src={imageUrl}
                          alt={project.urlTitle || project.title}
                          className="group-hover:scale-105 transition-transform duration-500 filter group-hover:brightness-110"
                          style={{ 
                            maxHeight: '300px', 
                            minHeight: '150px',
                            objectFit: 'contain',
                            objectPosition: 'center'
                          }}
                          lazy={true}
                          showLoadingSpinner={true}
                          allImages={allImages}
                          getImageUrl={getImageUrl}
                          centerImage={true}
                        />

                        {project.featured && (
                          <div className={FEATURED_BADGE_CLASSES}>
                            ⭐ {isZh ? '精选' : 'FEATURED'}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-purple-500/40 to-purple-600/40 flex items-center justify-center rounded-t-lg border-b border-purple-300/20 min-h-[150px]">
                        <div className="text-center text-purple-300/90">
                          <Bot className="w-16 h-16 mx-auto mb-3 opacity-70" />
                          <p className="text-medium font-medium">{isZh ? 'AI项目' : 'AI Project'}</p>
                        </div>

                        {project.featured && (
                          <div className={FEATURED_BADGE_CLASSES}>
                            ⭐ {isZh ? '精选' : 'FEATURED'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-medium text-white font-terminal group-hover:text-purple-100 transition-colors flex-1 pr-2">
                        {'>'} {project.urlTitle || project.title}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleProjectExpansion(project.id);
                        }}
                        className="btn-glass-purple px-3 py-1.5 rounded text-small flex items-center space-x-1 flex-shrink-0"
                      >
                        <span className="text-small">{isExpanded ? (isZh ? '收起' : 'Less') : (isZh ? '详情' : 'More')}</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>
                    
                    {isUrlType && project.urlDomain && (
                      <div className="flex items-center space-x-1 text-xs text-green-400 mb-3">
                        <Globe className="w-3 h-3" />
                        <span>{project.urlDomain}</span>
                      </div>
                    )}
                    
                    <div className={`text-small text-purple-100 leading-relaxed mb-4 ${!isExpanded ? 'line-clamp-2' : ''}`}>
                      <MediaRenderer 
                        content={project.urlDescription || project.description} 
                        className="prose prose-sm" 
                      />
                    </div>


                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {project.tags.slice(0, isExpanded ? undefined : 3).map((tag, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => handleTagClick(project, e)}
                            className="bg-black/40 border border-purple-300/70 text-purple-200 px-2 py-1 text-small rounded font-terminal hover:bg-purple-500/30 hover:text-white hover:border-purple-300 transition-all duration-200 cursor-pointer"
                            title={isZh ? `点击预览 "${project.title}"` : `Click to preview "${project.title}"`}
                          >
                            {tag}
                          </button>
                        ))}
                        {!isExpanded && project.tags.length > 3 && (
                          <button
                            onClick={(e) => handleTagClick(project, e)}
                            className="text-purple-200 text-small px-2 py-1 bg-purple-500/20 rounded border border-purple-400/30 hover:bg-purple-500/40 hover:text-white transition-all duration-200 cursor-pointer"
                            title={isZh ? `点击预览 "${project.title}"` : `Click to preview "${project.title}"`}
                          >
                            +{project.tags.length - 3}
                          </button>
                        )}
                      </div>
                    )}

                    <div className="flex space-x-2">
                      {!isUrlType && project.content && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreview(project);
                          }}
                          className="btn-glass-cyan flex items-center space-x-2 rounded text-small flex-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span className="text-medium">{isZh ? '阅读全文' : 'Read Full'}</span>
                        </button>
                      )}
                      {project.url && !isUrlType && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVisitSite(project.url);
                          }}
                          className="btn-glass-green flex items-center space-x-2 rounded text-small flex-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span className="text-medium">{isZh ? '访问' : 'Visit'}</span>
                        </button>
                      )}
                      {project.githubUrl && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVisitSite(project.githubUrl);
                          }}
                          className="btn-glass-amber flex items-center space-x-2 px-3 py-1.5 rounded text-small"
                        >
                          <Github className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    

                    {isUrlType && (
                      <div className="text-center text-xs text-purple-300/70 mt-3 border-t border-purple-300/20 pt-3">
                        {isZh ? '点击卡片访问完整页面' : 'Click card to visit full page'}
                      </div>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="border-t border-purple-300/20 p-6 bg-black/10 animate-fadeIn">
                      {(project.content || (isUrlType && project.urlDescription)) && (
                        <div className="mb-4">
                          <h4 className="text-medium text-white flex items-center space-x-2 mb-3">
                            <Network className="w-4 h-4 text-purple-300" />
                            <span>[CONTENT] {isZh ? '详细介绍' : 'Detailed Introduction'}</span>
                          </h4>
                          <div className="text-small text-purple-100 leading-relaxed">
                            <MediaRenderer 
                              content={project.content || project.urlDescription || ''} 
                              className="prose prose-sm" 
                            />
                          </div>
                        </div>
                      )}
                      
                      {(project.url || project.githubUrl) && (
                        <div className="pt-4 border-t border-purple-300/20">
                          <h4 className="text-small text-white mb-3 flex items-center">
                            <Globe className="w-4 h-4 mr-2 text-purple-300" />
                            {isZh ? '项目链接' : 'Project Links'}
                          </h4>
                          <div className="space-y-2 text-small">
                            {project.url && (
                              <div className="flex items-center space-x-2 text-purple-200">
                                <ExternalLink className="w-3 h-3" />
                                <span>{isZh ? '项目地址:' : 'Project URL:'}</span>
                                <a 
                                  href={project.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-cyan-300 hover:text-cyan-200 underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {project.url}
                                </a>
                              </div>
                            )}
                            {project.githubUrl && (
                              <div className="flex items-center space-x-2 text-purple-200">
                                <Github className="w-3 h-3" />
                                <span>{isZh ? '源码地址:' : 'Source Code:'}</span>
                                <a 
                                  href={project.githubUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-cyan-300 hover:text-cyan-200 underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {project.githubUrl}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (

          <div className="glass-purple rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-purple-500/20 border border-purple-400/50 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-purple-300" />
            </div>
            <h2 className="text-medium text-purple-300 mb-4">
              {isZh ? '[INFO] 暂无AI项目' : '[INFO] No AI Projects Available'}
            </h2>
            <p className="text-purple-200 text-small">
              {isZh 
                ? '> 还没有添加任何AI项目\\n> 请在本地内容数据文件中添加项目'
                : '> No AI projects have been added yet\\n> Add projects in the local content data file'
              }
            </p>
          </div>
        )}

        {previewProject && (
          <div 
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-[200] p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setPreviewProject(null);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setPreviewProject(null);
              }
            }}
            tabIndex={0}
            role="dialog"
            aria-modal="true"
            aria-labelledby="preview-title"
          >
            <div className="glass-purple rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto dialog-scrollbar">
              <div className="p-6 border-b border-purple-300/20 flex items-center justify-between bg-black/20 sticky top-0 z-10">
                <h2 id="preview-title" className="text-large text-white font-terminal flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-purple-300" />
                  <span>[PREVIEW] {previewProject.title}</span>
                </h2>
                <button
                  onClick={() => setPreviewProject(null)}
                  className="text-purple-300 hover:text-white transition-colors p-2"
                  aria-label={isZh ? '关闭预览' : 'Close preview'}
                >
                  <span className="text-xl">×</span>
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {getProjectImageUrl(previewProject) && (
                  <div className="rounded-lg overflow-hidden border border-purple-300/20">
                    <UnifiedImage
                      src={getProjectImageUrl(previewProject)!}
                      alt={previewProject.title}
                      className="w-full"
                      style={{ maxHeight: '400px', objectFit: 'contain' }}
                      showLoadingSpinner={true}
                      allImages={allImages}
                      getImageUrl={getImageUrl}
                      centerImage={true}
                    />
                  </div>
                )}
                
                <div>
                  <h4 className="text-medium text-white mb-2 font-terminal">
                    [DESCRIPTION] {isZh ? '项目描述' : 'Project Description'}
                  </h4>
                  <div className="text-small text-purple-100 leading-relaxed">
                    <MediaRenderer content={previewProject.description} className="prose prose-sm" />
                  </div>
                </div>
                
                {previewProject.content && (
                  <div>
                    <h4 className="text-medium text-white mb-2 font-terminal">
                      [CONTENT] {isZh ? '详细内容' : 'Detailed Content'}
                    </h4>
                    <div className="text-small text-purple-100 leading-relaxed">
                      <MediaRenderer content={previewProject.content} className="prose prose-sm" />
                    </div>
                  </div>
                )}
                
                {previewProject.tags && previewProject.tags.length > 0 && (
                  <div>
                    <h4 className="text-medium text-white mb-2 font-terminal">
                      [TAGS] {isZh ? '标签' : 'Tags'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {previewProject.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-black/40 border border-purple-300/70 text-purple-200 px-3 py-1.5 text-small rounded font-terminal"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-3 pt-4 border-t border-purple-300/20">
                  {previewProject.url && (
                    <button
                      onClick={() => {
                        handleVisitSite(previewProject.url);
                        setPreviewProject(null);
                      }}
                      className="btn-glass-green flex items-center space-x-2 px-4 py-2 rounded-lg text-small flex-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>{isZh ? '访问项目' : 'Visit Project'}</span>
                    </button>
                  )}
                  {previewProject.githubUrl && (
                    <button
                      onClick={() => {
                        handleVisitSite(previewProject.githubUrl);
                        setPreviewProject(null);
                      }}
                      className="btn-glass-amber flex items-center space-x-2 px-4 py-2 rounded-lg text-small"
                    >
                      <Github className="w-4 h-4" />
                      <span>{isZh ? '源代码' : 'Source Code'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center text-small text-purple-300 pt-8 border-t border-purple-400/20">
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4" />
            <span>
              {isZh ? `共 ${allProjects.length} 个AI项目` : `${allProjects.length} AI projects total`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
