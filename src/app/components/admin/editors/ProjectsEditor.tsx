import React, { useState, useEffect } from 'react';
import { Save, Loader2, Plus, Trash2, ExternalLink, Github, Tag, MapPin, Image, X } from 'lucide-react';
import { useContent, ContentItem } from '../../content/ContentContext';
import { useLanguage } from '../../language/LanguageContext';
import EditorHeader from '../shared/EditorHeader';
import StatusMessage from '../shared/StatusMessage';
import MarkdownEditor from '../MarkdownEditor';
import PageTitleEditor from '../../shared/PageTitleEditor';
import ImageSelectorDialog from '../markdown/ImageSelectorDialog';
import { toast } from 'sonner';

interface ProjectData {
  title: string;
  description: string;
  role?: string;
  period?: string;
  location?: string;
  technologies: string[];
  highlights?: string[];
  link?: string;
  repository?: string;
  githubUrl?: string;
  imageId?: string; // 改为图片ID引用
  featured?: boolean;
  liveUrl?: string;
  projectType?: string;
  order?: number; // 添加编号字段
}

interface ProjectsEditorProps {
  onBack: () => void;
}

// 预定义的项目类型选项
const PROJECT_TYPE_OPTIONS = {
  zh: [
    '展览',
    '活动', 
    '其他'
  ],
  en: [
    'Exhibition',
    'Event',
    'Other'
  ]
};

export default function ProjectsEditor({ onBack }: ProjectsEditorProps) {
  const { getContent, updateContent, createContent, deleteContent, getContentByLanguage, getImageUrl } = useContent();
  const { currentLanguage, isZh } = useLanguage();
  const [projects, setProjects] = useState<ContentItem[]>([]);
  const [pageContent, setPageContent] = useState<any>({});
  const [pageContentItem, setPageContentItem] = useState<ContentItem | null>(null);
  
  // 稳定的页面标题数据
  const [currentPageTitleData, setCurrentPageTitleData] = useState({
    title: '',
    subtitle: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingProject, setEditingProject] = useState<ContentItem | null>(null);
  const [projectData, setProjectData] = useState<ProjectData>({
    title: '',
    description: '',
    role: '',
    period: '',
    location: '',
    technologies: [],
    highlights: [],
    link: '',
    repository: '',
    githubUrl: '',
    imageId: '', // 使用图片ID而不是URL
    featured: false,
    projectType: '',
    order: 0
  });
  const [newTechnology, setNewTechnology] = useState('');
  const [newHighlight, setNewHighlight] = useState('');
  const [customProjectType, setCustomProjectType] = useState('');
  const [showImageSelector, setShowImageSelector] = useState(false);

  // 获取当前语言的项目类型选项
  const projectTypeOptions = PROJECT_TYPE_OPTIONS[currentLanguage] || PROJECT_TYPE_OPTIONS.zh;

  useEffect(() => {
    loadProjects();
  }, [currentLanguage]);

  const loadProjects = async () => {
    try {
      console.log('🔄 开始加载项目，语言:', currentLanguage);
      
      // 只加载当前语言的项目，确保语言分离
      const content = await getContentByLanguage('projects', currentLanguage);
      
      console.log('📋 原始项目数据:', content.map(p => ({ 
        id: p.id, 
        title: p.data.title || p.title, 
        order: p.data.order,
        created_at: p.created_at 
      })));
      
      // 简化排序逻辑：只按编号排序，没有编号的按创建时间排序
      const sortedContent = content.sort((a, b) => {
        const aOrder = a.data.order || 0;
        const bOrder = b.data.order || 0;
        
        // 如果都有编号，按编号排序
        if (aOrder !== 0 && bOrder !== 0) {
          return aOrder - bOrder;
        }
        
        // 如果只有一个有编号，有编号的在前
        if (aOrder !== 0 && bOrder === 0) return -1;
        if (aOrder === 0 && bOrder !== 0) return 1;
        
        // 都没有编号，按创建时间排序（最新的在前）
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      console.log('✅ 排序后的项目:', sortedContent.map(p => ({ 
        id: p.id, 
        title: p.data.title || p.title, 
        order: p.data.order 
      })));
      
      setProjects(sortedContent);
      
      // 加载页面标题内容
      const pageTitle = await getContentByLanguage('projects_page', currentLanguage);
      if (pageTitle.length > 0) {
        const data = pageTitle[0].data || {};
        setPageContent(data);
        setPageContentItem(pageTitle[0]);
        setCurrentPageTitleData({
          title: data.title || '',
          subtitle: data.subtitle || ''
        });
      } else {
        setPageContent({});
        setPageContentItem(null);
        setCurrentPageTitleData({
          title: '',
          subtitle: ''
        });
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      setMessage({ type: 'error', text: isZh ? '加载项目失败' : 'Failed to load projects' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingProject(null);
    
    // 自动分配下一个编号
    const maxOrder = Math.max(0, ...projects.map(p => p.data.order || 0));
    const nextOrder = maxOrder + 1;
    
    setProjectData({
      title: '',
      description: '',
      role: '',
      period: '',
      location: '',
      technologies: [],
      highlights: [],
      link: '',
      repository: '',
      githubUrl: '',
      imageId: '', // 使用图片ID
      featured: false,
      projectType: '',
      order: nextOrder
    });
    setCustomProjectType('');
  };

  const handleEdit = (project: ContentItem) => {
    setEditingProject(project);
    const data = project.data;
    
    // 兼容旧的imageUrl数据，如果是{{image:id}}格式则提取ID
    let imageId = data.imageId || '';
    if (!imageId && data.imageUrl) {
      const match = data.imageUrl.match(/^\{\{image:([^|}]+)\}\}$/);
      if (match) {
        imageId = match[1];
      }
    }
    
    setProjectData({
      ...data,
      location: data.location || '',
      githubUrl: data.githubUrl || data.repository || '',
      projectType: data.projectType || data.activityType || '',
      order: data.order || 0,
      imageId: imageId // 使用imageId字段
    });
    
    // 检查是否是自定义项目类型
    const projectType = data.projectType || data.activityType || '';
    if (projectType && !projectTypeOptions.includes(projectType) && projectType !== '其他' && projectType !== 'Other') {
      setCustomProjectType(projectType);
    } else {
      setCustomProjectType('');
    }
  };

  const handleSave = async () => {
    if (!projectData.title.trim()) {
      setMessage({ type: 'error', text: isZh ? '请输入项目标题' : 'Please enter project title' });
      return;
    }

    if (!projectData.description.trim()) {
      setMessage({ type: 'error', text: isZh ? '请输入项目描述' : 'Please enter project description' });
      return;
    }

    // 处理项目类型（如果选择"其他"并输入了自定义类型，使用自定义类型）
    const finalProjectType = (projectData.projectType === '其他' || projectData.projectType === 'Other') && customProjectType.trim() 
      ? customProjectType.trim() 
      : projectData.projectType || '';

    setIsSaving(true);
    setMessage(null);
    
    try {
      const dataToSave = {
        ...projectData,
        projectType: finalProjectType,
        // 移除旧的activityType字段，但保留向后兼容
        activityType: undefined,
        // 为了向后兼容，如果有imageId则同时保存imageUrl格式
        imageUrl: projectData.imageId ? `{{image:${projectData.imageId}}}` : undefined
      };
      
      console.log('开始保存项目:', { 
        editing: !!editingProject, 
        title: projectData.title,
        language: currentLanguage,
        order: projectData.order,
        imageId: projectData.imageId,
        data: dataToSave 
      });
      
      if (editingProject) {
        const updatedProject = await updateContent(editingProject.id, {
          title: projectData.title,
          data: dataToSave,
          language: currentLanguage
        });
        console.log('项目更新成功:', updatedProject);
        setProjects(prev => {
          const updated = prev.map(p => p.id === editingProject.id ? updatedProject : p);
          // 重新排序
          return updated.sort((a, b) => {
            const aOrder = a.data.order || 0;
            const bOrder = b.data.order || 0;
            if (aOrder !== 0 && bOrder !== 0) return aOrder - bOrder;
            if (aOrder !== 0 && bOrder === 0) return -1;
            if (aOrder === 0 && bOrder !== 0) return 1;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
        });
        setMessage({ type: 'success', text: isZh ? '项目已更新' : 'Project updated successfully' });
        toast.success(isZh ? '✅ 项目已更新' : '✅ Project updated successfully');
      } else {
        const newProject = await createContent({
          type: 'projects',
          title: projectData.title,
          data: dataToSave,
          is_published: true,
          language: currentLanguage
        });
        console.log('项目创建成功:', newProject);
        setProjects(prev => {
          const updated = [newProject, ...prev];
          // 重新排序
          return updated.sort((a, b) => {
            const aOrder = a.data.order || 0;
            const bOrder = b.data.order || 0;
            if (aOrder !== 0 && bOrder !== 0) return aOrder - bOrder;
            if (aOrder !== 0 && bOrder === 0) return -1;
            if (aOrder === 0 && bOrder !== 0) return 1;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
        });
        setMessage({ type: 'success', text: isZh ? '项目已创建' : 'Project created successfully' });
        toast.success(isZh ? '✅ 项目已创建' : '✅ Project created successfully');
      }
      
      // Reset form
      setEditingProject(null);
      const maxOrder = Math.max(0, ...projects.map(p => p.data.order || 0));
      setProjectData({
        title: '',
        description: '',
        role: '',
        period: '',
        location: '',
        technologies: [],
        highlights: [],
        link: '',
        repository: '',
        githubUrl: '',
        imageId: '', // 使用图片ID
        featured: false,
        projectType: '',
        order: maxOrder + 1
      });
      setCustomProjectType('');
      
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('保存项目时出现错误:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setMessage({ 
        type: 'error', 
        text: isZh ? `保存失败: ${errorMessage}` : `Save failed: ${errorMessage}` 
      });
      toast.error(isZh ? `❌ 保存失败: ${errorMessage}` : `❌ Save failed: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!window.confirm(isZh ? '确定要删除这个项目吗？' : 'Are you sure you want to delete this project?')) return;

    try {
      await deleteContent(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setMessage({ type: 'success', text: isZh ? '项目已删除' : 'Project deleted successfully' });
      toast.success(isZh ? '✅ 项目已删除' : '✅ Project deleted successfully');
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting project:', error);
      setMessage({ type: 'error', text: isZh ? '删除失败，请重试' : 'Failed to delete, please try again' });
      toast.error(isZh ? '❌ 删除失败' : '❌ Failed to delete');
    }
  };

  const addTechnology = () => {
    if (newTechnology.trim() && !projectData.technologies.includes(newTechnology.trim())) {
      setProjectData(prev => ({
        ...prev,
        technologies: [...prev.technologies, newTechnology.trim()]
      }));
      setNewTechnology('');
    }
  };

  const removeTechnology = (tech: string) => {
    setProjectData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }));
  };

  const addHighlight = () => {
    if (newHighlight.trim()) {
      setProjectData(prev => ({
        ...prev,
        highlights: [...(prev.highlights || []), newHighlight.trim()]
      }));
      setNewHighlight('');
    }
  };

  const removeHighlight = (index: number) => {
    setProjectData(prev => ({
      ...prev,
      highlights: prev.highlights?.filter((_, i) => i !== index) || []
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const handlePageTitleSave = async (data: { title: string; subtitle: string }) => {
    try {
      if (pageContentItem) {
        // 更新现有页面标题
        const updatedContent = await updateContent(pageContentItem.id, {
          data: { title: data.title, subtitle: data.subtitle },
          language: currentLanguage
        });
        setPageContentItem(updatedContent);
        setPageContent({ title: data.title, subtitle: data.subtitle });
      } else {
        // 创建新的页面标题
        const newContent = await createContent({
          type: 'projects_page',
          title: `Projects Page Title (${currentLanguage.toUpperCase()})`,
          data: { title: data.title, subtitle: data.subtitle },
          is_published: true,
          language: currentLanguage
        });
        setPageContentItem(newContent);
        setPageContent({ title: data.title, subtitle: data.subtitle });
      }
      
      // 更新稳定的标题数据
      setCurrentPageTitleData({
        title: data.title,
        subtitle: data.subtitle
      });
      
      setMessage({ 
        type: 'success', 
        text: isZh ? '页面标题已保存' : 'Page title saved successfully' 
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving page title:', error);
      // 回滚状态
      setCurrentPageTitleData({
        title: pageContent.title || '',
        subtitle: pageContent.subtitle || ''
      });
      setMessage({ 
        type: 'error', 
        text: isZh ? '保存失败，请重试' : 'Save failed, please try again' 
      });
      throw error;
    }
  };

  const handlePageTitleReset = async () => {
    // 重置到原始数据，而不是重新加载
    const originalData = pageContentItem?.data || {};
    const originalTitle = originalData.title || '';
    const originalSubtitle = originalData.subtitle || '';
    
    setPageContent({
      title: originalTitle,
      subtitle: originalSubtitle
    });
    
    setCurrentPageTitleData({
      title: originalTitle,
      subtitle: originalSubtitle
    });
  };

  // 图片选择处理函数 - 使用ID引用
  const handleImageSelect = (imageId: string, caption?: string) => {
    setProjectData(prev => ({ ...prev, imageId: imageId }));
    toast.success(isZh ? '✅ 项目封面图片已设置' : '✅ Project cover image set');
  };

  // 移除封面图片
  const handleRemoveImage = () => {
    setProjectData(prev => ({ ...prev, imageId: '' }));
    toast.success(isZh ? '✅ ��目封面图片已移除' : '✅ Project cover image removed');
  };

  return (
    <div className="space-y-6 admin-editor cms-container">
      <EditorHeader
        title={isZh ? '项目管理' : 'Project Management'}
        onBack={onBack}
      />

      {message && (
        <StatusMessage type={message.type} message={message.text} />
      )}

      {/* 图片选择对话框 */}
      <ImageSelectorDialog
        open={showImageSelector}
        onOpenChange={setShowImageSelector}
        onImageSelect={handleImageSelect}
      />

      {/* 统一的页面标题编辑器 */}
      <PageTitleEditor
        pageKey="projects"
        currentData={currentPageTitleData}
        onSave={handlePageTitleSave}
        onReset={handlePageTitleReset}
        isLoading={isLoading}
        isSaving={isSaving}
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 项目列表 - 显示封面图片 */}
        <div className="cms-bg-card rounded-xl shadow-lg border border-blue-500/30">
          <div className="p-4 border-b border-blue-500/30 flex items-center justify-between">
            <h3 className="font-semibold text-white font-terminal">
              {isZh ? '项目列表' : 'Project List'}
              <span className="ml-2 text-sm text-slate-400">
                ({projects.length})
              </span>
            </h3>
          </div>
          
          <div className="divide-y divide-blue-500/20 max-h-96 overflow-y-auto custom-scrollbar">
            {projects.map((project) => {
              // 获取项目封面图片
              const imageId = project.data.imageId || (project.data.imageUrl && project.data.imageUrl.match(/^\{\{image:([^|}]+)\}\}$/)?.[1]);
              const imageUrl = imageId ? getImageUrl(imageId) : null;
              
              return (
                <div key={project.id} className="p-4 hover:bg-slate-700/50 rounded-xl transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* 项目封面图片 */}
                      {imageUrl && (
                        <div className="mb-3">
                          <img 
                            src={imageUrl} 
                            alt={project.data.title}
                            className="w-full h-32 object-cover rounded-lg border border-blue-500/30"
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium font-terminal text-white">
                          {project.data.title}
                        </h4>
                        
                        {/* 编号显示 */}
                        {project.data.order > 0 && (
                          <span className="text-xs bg-blue-500/20 text-blue-200 px-2 py-0.5 rounded-full font-terminal">
                            #{project.data.order}
                          </span>
                        )}
                        
                        {project.data.featured && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-200 px-2 py-1 rounded-full border border-yellow-500/30">
                            {isZh ? '精选' : 'Featured'}
                          </span>
                        )}
                        
                        {(project.data.projectType || project.data.activityType) && (
                          <span className="text-xs bg-green-500/20 text-green-200 px-2 py-1 rounded-full border border-green-500/30">
                            {project.data.projectType || project.data.activityType}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-slate-300 mb-2 line-clamp-2 font-terminal">
                        {project.data.description}
                      </p>
                      
                      {/* 项目时间和地点信息 */}
                      <div className="flex items-center space-x-4 mb-2">
                        {project.data.period && (
                          <span className="text-xs text-slate-400 font-terminal">
                            📅 {project.data.period}
                          </span>
                        )}
                        {project.data.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3 text-cyan-400" />
                            <span className="text-xs text-slate-400 font-terminal">{project.data.location}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* 技术标签 */}
                      <div className="flex flex-wrap gap-1">
                        {project.data.technologies?.slice(0, 3).map((tech: string) => (
                          <span key={tech} className="text-xs bg-blue-500/20 text-blue-200 px-2 py-1 rounded-md border border-blue-500/30">
                            {tech}
                          </span>
                        ))}
                        {project.data.technologies?.length > 3 && (
                          <span className="text-xs text-slate-400 font-terminal">+{project.data.technologies.length - 3}</span>
                        )}
                      </div>
                    </div>
                    
                    {/* 操作按钮 */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(project)}
                        className="cms-secondary-button text-sm px-3 py-1"
                      >
                        {isZh ? '编辑' : 'Edit'}
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="cms-danger-button text-sm px-3 py-1"
                      >
                        {isZh ? '删除' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {projects.length === 0 && (
              <div className="p-8 text-center text-slate-400 font-terminal">
                {isZh ? '还没有项目，点击右侧"新建"按钮开始添加' : 'No projects yet, click the "New" button on the right to get started'}
              </div>
            )}
          </div>
        </div>

        {/* 项目编辑表单 */}
        <div className="cms-bg-card rounded-xl shadow-lg border border-blue-500/30">
          <div className="p-4 border-b border-blue-500/30 flex items-center justify-between">
            <h3 className="font-semibold text-white font-terminal">
              {editingProject ? (isZh ? '编辑项目' : 'Edit Project') : (isZh ? '新建项目' : 'New Project')}
            </h3>
            {!editingProject && (
              <button
                onClick={handleCreateNew}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-3 py-1.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md text-small"
              >
                <Plus className="w-4 h-4" />
                <span>{isZh ? '新建' : 'New'}</span>
              </button>
            )}
          </div>
          
          <div className="p-4 space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
            {/* 编号字段 */}
            <div>
              <label className="block text-sm font-medium text-white mb-1 font-terminal">
                {isZh ? '编号 (用于排序)' : 'Order Number (for sorting)'}
              </label>
              <input
                type="number"
                min="0"
                value={projectData.order || ''}
                onChange={(e) => setProjectData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                className="cms-input w-full rounded-xl"
                placeholder={isZh ? '输入编号，数字越小越靠前' : 'Enter order number, smaller numbers appear first'}
              />
              <p className="text-xs text-slate-400 mt-1 font-terminal">
                {isZh ? '编号越小，项目在前端显示时越靠前。编号为0的项目按创建时间排序。' : 'Smaller numbers appear first. Projects with order 0 are sorted by creation time.'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1 font-terminal">
                {isZh ? '项目标题 *' : 'Project Title *'}
              </label>
              <input
                type="text"
                value={projectData.title}
                onChange={(e) => setProjectData(prev => ({ ...prev, title: e.target.value }))}
                className="cms-input w-full rounded-xl"
                placeholder={isZh ? '输入项目标题' : 'Enter project title'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1 font-terminal">
                {isZh ? '项目描述 *' : 'Project Description *'}
              </label>
              <MarkdownEditor
                value={projectData.description}
                onChange={(value) => setProjectData(prev => ({ ...prev, description: value }))}
                placeholder={isZh ? '详细描述项目内容、功能特点、技术实现等...' : 'Detailed description of project content, features, technical implementation, etc...'}
                minHeight="120px"
                height="200px"
              />
            </div>

            {/* 项目封面图片选择 - 使用ID引用 */}
            <div>
              <label className="block text-sm font-medium text-white mb-2 font-terminal">
                <div className="flex items-center space-x-2">
                  <Image className="w-4 h-4" />
                  <span>{isZh ? '项目封面图片' : 'Project Cover Image'}</span>
                </div>
              </label>
              
              {projectData.imageId ? (
                <div className="space-y-2">
                  {/* 图片预览 */}
                  <div className="relative">
                    <img 
                      src={getImageUrl(projectData.imageId)} 
                      alt="Project cover preview"
                      className="w-full h-40 object-cover rounded-lg border border-blue-500/30"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                      title={isZh ? '移除图片' : 'Remove image'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 font-terminal">
                    {isZh ? `图片ID: ${projectData.imageId}` : `Image ID: ${projectData.imageId}`}
                  </p>
                </div>
              ) : (
                <div className="text-center py-6 border-2 border-dashed border-blue-500/30 rounded-lg">
                  <Image className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-400 mb-3 font-terminal">
                    {isZh ? '未设置封面图片' : 'No cover image set'}
                  </p>
                  <button
                    onClick={() => setShowImageSelector(true)}
                    className="cms-primary-button text-sm"
                  >
                    <Image className="w-4 h-4 mr-2" />
                    {isZh ? '选择图片' : 'Select Image'}
                  </button>
                </div>
              )}
              
              {projectData.imageId && (
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => setShowImageSelector(true)}
                    className="cms-secondary-button text-sm"
                  >
                    {isZh ? '更换图片' : 'Change Image'}
                  </button>
                </div>
              )}
            </div>

            {/* 项目类型选择 */}
            <div>
              <label className="block text-sm font-medium text-white mb-1 font-terminal">
                <div className="flex items-center space-x-1">
                  <Tag className="w-4 h-4" />
                  <span>{isZh ? '项目类型' : 'Project Type'}</span>
                </div>
              </label>
              <div className="space-y-2">
                <select
                  value={customProjectType ? '其他' : (projectData.projectType || '')}
                  onChange={(e) => {
                    if (e.target.value === '其他' || e.target.value === 'Other') {
                      setProjectData(prev => ({ ...prev, projectType: e.target.value }));
                      // 不清空customProjectType，保持用户已输入的内容
                    } else {
                      setProjectData(prev => ({ ...prev, projectType: e.target.value }));
                      setCustomProjectType('');
                    }
                  }}
                  className="cms-select w-full rounded-xl"
                >
                  <option value="">{isZh ? '选择项目类型' : 'Select project type'}</option>
                  {projectTypeOptions.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                
                {(projectData.projectType === '其他' || projectData.projectType === 'Other' || customProjectType) && (
                  <input
                    type="text"
                    value={customProjectType}
                    onChange={(e) => setCustomProjectType(e.target.value)}
                    className="cms-input w-full rounded-xl"
                    placeholder={isZh ? '输入自定义项目类型' : 'Enter custom project type'}
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1 font-terminal">
                  {isZh ? '我的角色' : 'My Role'}
                </label>
                <input
                  type="text"
                  value={projectData.role || ''}
                  onChange={(e) => setProjectData(prev => ({ ...prev, role: e.target.value }))}
                  className="cms-input w-full rounded-xl"
                  placeholder={isZh ? '如：前端开发工程师' : 'e.g., Frontend Developer'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-1 font-terminal">
                  {isZh ? '项目周期' : 'Project Period'}
                </label>
                <input
                  type="text"
                  value={projectData.period || ''}
                  onChange={(e) => setProjectData(prev => ({ ...prev, period: e.target.value }))}
                  className="cms-input w-full rounded-xl"
                  placeholder={isZh ? '如：2023.01-2023.06' : 'e.g., Jan 2023 - Jun 2023'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1 font-terminal">
                  {isZh ? '项目地点' : 'Project Location'}
                </label>
                <input
                  type="text"
                  value={projectData.location || ''}
                  onChange={(e) => setProjectData(prev => ({ ...prev, location: e.target.value }))}
                  className="cms-input w-full rounded-xl"
                  placeholder={isZh ? '如：北京·中国美术馆' : 'e.g., New York, MoMA'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1 font-terminal">
                {isZh ? '技术栈' : 'Tech Stack'}
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {projectData.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center bg-blue-500/20 text-blue-200 px-2 py-1 rounded-lg text-sm border border-blue-500/30"
                  >
                    {tech}
                    <button
                      onClick={() => removeTechnology(tech)}
                      className="ml-1 text-blue-300 hover:text-blue-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTechnology}
                  onChange={(e) => setNewTechnology(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTechnology()}
                  className="cms-input flex-1 rounded-xl"
                  placeholder={isZh ? '输入技术名称' : 'Enter technology name'}
                />
                <button
                  onClick={addTechnology}
                  className="cms-secondary-button"
                  disabled={!newTechnology.trim()}
                >
                  {isZh ? '添加' : 'Add'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1 font-terminal">
                {isZh ? '项目亮点' : 'Project Highlights'}
              </label>
              <div className="space-y-2 mb-2">
                {(projectData.highlights || []).map((highlight, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-slate-700/50 rounded border border-blue-500/20">
                    <span className="flex-1 text-sm text-white font-terminal">{highlight}</span>
                    <button
                      onClick={() => removeHighlight(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newHighlight}
                  onChange={(e) => setNewHighlight(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addHighlight()}
                  className="cms-input flex-1 rounded-xl"
                  placeholder={isZh ? '输入项目亮点' : 'Enter project highlight'}
                />
                <button
                  onClick={addHighlight}
                  className="cms-secondary-button"
                  disabled={!newHighlight.trim()}
                >
                  {isZh ? '添加' : 'Add'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1 font-terminal">
                  {isZh ? '项目链接' : 'Project Link'}
                </label>
                <input
                  type="url"
                  value={projectData.link || ''}
                  onChange={(e) => setProjectData(prev => ({ ...prev, link: e.target.value }))}
                  className="cms-input w-full rounded-xl"
                  placeholder={isZh ? '项目在线链接' : 'Project live URL'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-1 font-terminal">
                  {isZh ? '源码仓库' : 'Repository'}
                </label>
                <input
                  type="url"
                  value={projectData.githubUrl || ''}
                  onChange={(e) => setProjectData(prev => ({ ...prev, githubUrl: e.target.value }))}
                  className="cms-input w-full rounded-xl"
                  placeholder={isZh ? 'GitHub等代码仓库链接' : 'GitHub repository URL'}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                checked={projectData.featured || false}
                onChange={(e) => setProjectData(prev => ({ ...prev, featured: e.target.checked }))}
                className="rounded bg-slate-700 border-blue-400/30 text-blue-500"
              />
              <label htmlFor="featured" className="text-sm font-medium text-white font-terminal">
                {isZh ? '设为精选项目' : 'Mark as Featured Project'}
              </label>
            </div>
          </div>
          
          <div className="p-4 border-t border-blue-500/30">
            <div className="flex space-x-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="cms-primary-button flex items-center space-x-2"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSaving ? (isZh ? '保存中...' : 'Saving...') : (isZh ? '保存项目' : 'Save Project')}</span>
              </button>
              
              {editingProject && (
                <button
                  onClick={handleCreateNew}
                  className="cms-secondary-button"
                >
                  {isZh ? '取消编辑' : 'Cancel Edit'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}