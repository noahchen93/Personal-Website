import React, { useState, useEffect } from 'react';
import { useContent } from '../../content/ContentContext';
import { useLanguage } from '../../language/LanguageContext';
import EditorHeader from '../shared/EditorHeader';
import StatusMessage from '../shared/StatusMessage';
import MarkdownEditor from '../MarkdownEditor';
import ImageSelectorDialog from '../markdown/ImageSelectorDialog';
import SimpleImageSelectorDialog from '../markdown/SimpleImageSelectorDialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Card } from '../../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  Upload, 
  ExternalLink, 
  Star, 
  Bot,
  Globe,
  Image as ImageIcon,
  Settings,
  Eye,
  Tag,
  Calendar,
  Github,
  Link,
  FileText,
  ImagePlus,
  Loader2
} from 'lucide-react';
import SmartImage from '../../shared/SmartImage';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface AIProject {
  id: string;
  title: string;
  description: string;
  content?: string; // 正文字段
  coverImage: string;
  url: string;
  githubUrl?: string; // GitHub字段
  tags: string[];
  featured?: boolean;
  createdAt: string;
  // URL链接相关字段
  type?: 'content' | 'url'; // 内容类型：普通内容或URL链接
  urlTitle?: string; // 链接标题（从抓取的元数据中获取）
  urlDescription?: string; // 链接描述
  urlImage?: string; // 链接封面图片
  urlDomain?: string; // 链接域名
  // 手动封面图片支持
  manualCoverImageId?: string; // 手动设置的封面图片ID，优先级高于URL图片
}

interface AIExploreData {
  title: string;
  subtitle: string;
  introduction: string;
  projects: AIProject[];
  lastUpdated: string;
}

interface ProjectFormData {
  title: string;
  description: string;
  content: string; // 正文字段
  coverImage: string;
  url: string;
  githubUrl: string; // GitHub字段
  tags: string;
  featured: boolean;
  // URL相关字段
  type: 'content' | 'url'; // 内容类型
  urlTitle: string; // URL标题
  urlDescription: string; // URL描述
  urlImage: string; // URL图片
  urlDomain: string; // URL域名
  manualCoverImageId: string; // 手动封面图片ID
}

const defaultFormData: ProjectFormData = {
  title: '',
  description: '',
  content: '', // 正文字段默认值
  coverImage: '',
  url: '',
  githubUrl: '', // GitHub字段默认值
  tags: '',
  featured: false,
  type: 'content', // 默认为普通内容
  urlTitle: '',
  urlDescription: '',
  urlImage: '',
  urlDomain: '',
  manualCoverImageId: ''
};

export default function AIExploreEditor() {
  const { isOnline, getContent, createContent, updateContent } = useContent();
  const { isZh, currentLanguage } = useLanguage();
  const [data, setData] = useState<AIExploreData | null>(null);
  const [contentId, setContentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<AIProject | null>(null);
  const [projectForm, setProjectForm] = useState<ProjectFormData>(defaultFormData);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [showManualCoverImageSelector, setShowManualCoverImageSelector] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  
  // URL抓取相关状态
  const [isUrlFetching, setIsUrlFetching] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  useEffect(() => {
    loadData();
  }, [isZh]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await getContent('ai-explore', undefined, isZh ? 'zh' : 'en');
      
      if (response && response.length > 0) {
        setData(response[0].data);
        setContentId(response[0].id);
        setIsPublished(response[0].is_published || false);
      } else {
        // 创建默认数据结构
        const defaultData: AIExploreData = {
          title: isZh ? 'AI探索之旅' : 'AI Exploration Journey',
          subtitle: isZh ? '探索人工智能的无限可能' : 'Exploring the infinite possibilities of AI',
          introduction: isZh 
            ? '欢迎来到我的AI探索世界！这里展示了我在人工智能领域的学习成果、实际应用和深度思考。从构建智能应用到掌握前沿技术，从分析行业趋势到分享使用心得，记录我在AI时代的成长轨迹。'
            : 'Welcome to my AI exploration world! Here I showcase my learning achievements, practical applications, and deep thinking in the field of artificial intelligence. From building intelligent applications to mastering cutting-edge technologies, from analyzing industry trends to sharing user experiences, documenting my growth journey in the AI era.',
          projects: [],
          lastUpdated: new Date().toISOString()
        };
        setData(defaultData);
        setContentId('default');
        setIsPublished(false);
        setIsDirty(true);
      }
    } catch (error) {
      console.error('Error loading AI explore data:', error);
      toast.error(isZh ? '加载AI探索数据失败' : 'Failed to load AI explore data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!data) return;
    
    setIsSaving(true);
    try {
      console.log('🚀 Starting draft save process...', {
        contentId,
        isDefault: contentId === 'default',
        hasData: !!data,
        title: data.title,
        currentLanguage
      });

      let result;
      if (contentId && contentId !== 'default') {
        // Update existing content as draft
        console.log('📝 Updating existing content as draft with ID:', contentId);
        result = await updateContent(contentId, {
          type: 'ai-explore',
          title: data.title || 'AI探索', // 确保有title字段
          data: data,
          is_published: false, // 保存为草稿
          language: currentLanguage
        });
      } else {
        // Create new content as draft
        console.log('✨ Creating new AI explore content as draft');
        result = await createContent({
          type: 'ai-explore',
          title: data.title || (isZh ? 'AI探索之旅' : 'AI Exploration Journey'), // 确保有title字段
          data: data,
          is_published: false, // 保存为草稿
          language: currentLanguage
        });
        
        if (result && result.id) {
          console.log('✅ New draft content created with ID:', result.id);
          setContentId(result.id);
        } else {
          console.warn('⚠️ Create operation returned result without ID:', result);
        }
      }
      
      console.log('✅ AI explore data saved as draft successfully:', result);
      toast.success(isZh ? 'AI探索数据已保存为草稿' : 'AI explore data saved as draft');
      setIsDirty(false);
      setIsPublished(false);
      setLastSaved(Date.now());
    } catch (error) {
      console.error('❌ Failed to save AI explore data as draft:', {
        error: error.message,
        stack: error.stack,
        contentId,
        data: data ? 'present' : 'missing'
      });
      toast.error(`${isZh ? '保存AI探索草稿失败' : 'Failed to save AI explore draft'}: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!data) return;
    
    setIsPublishing(true);
    try {
      console.log('🚀 Starting publish process...', {
        contentId,
        isDefault: contentId === 'default',
        hasData: !!data,
        title: data.title,
        currentLanguage
      });

      let result;
      if (contentId && contentId !== 'default') {
        // Update existing content and publish
        console.log('📝 Updating existing content and publishing with ID:', contentId);
        result = await updateContent(contentId, {
          type: 'ai-explore',
          title: data.title || 'AI探索', // 确保有title字段
          data: data,
          is_published: true, // 发布
          language: currentLanguage
        });
      } else {
        // Create new content and publish
        console.log('✨ Creating new AI explore content and publishing');
        result = await createContent({
          type: 'ai-explore',
          title: data.title || (isZh ? 'AI探索之旅' : 'AI Exploration Journey'), // 确保有title字段
          data: data,
          is_published: true, // 发布
          language: currentLanguage
        });
        
        if (result && result.id) {
          console.log('✅ New content created and published with ID:', result.id);
          setContentId(result.id);
        } else {
          console.warn('⚠️ Create operation returned result without ID:', result);
        }
      }
      
      console.log('✅ AI explore data published successfully:', result);
      toast.success(isZh ? 'AI探索数据已发布' : 'AI explore data published successfully');
      setIsDirty(false);
      setIsPublished(true);
      setLastSaved(Date.now());
    } catch (error) {
      console.error('❌ Failed to publish AI explore data:', {
        error: error.message,
        stack: error.stack,
        contentId,
        data: data ? 'present' : 'missing'
      });
      toast.error(`${isZh ? '发布AI探索数据失败' : 'Failed to publish AI explore data'}: ${error.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const updateData = (updates: Partial<AIExploreData>) => {
    if (!data) return;
    
    const newData = { 
      ...data, 
      ...updates, 
      lastUpdated: new Date().toISOString() 
    };
    setData(newData);
    setIsDirty(true);
  };

  const handleProjectSubmit = async () => {
    if (!data || !projectForm.title.trim()) return;

    // 根据类型验证不同字段
    if (projectForm.type === 'url') {
      if (!projectForm.url?.trim()) {
        toast.error(isZh ? '请输入有效的URL链接' : 'Please enter a valid URL');
        return;
      }
    } else {
      if (!projectForm.content.trim()) {
        toast.error(isZh ? '请输入项目内容' : 'Please enter project content');
        return;
      }
    }

    const newProject: AIProject = {
      id: editingProject?.id || Date.now().toString(),
      title: projectForm.title.trim(),
      description: projectForm.description.trim(),
      content: projectForm.content.trim(), // 添加正文字段
      coverImage: projectForm.coverImage.trim(),
      url: projectForm.url.trim(),
      githubUrl: projectForm.githubUrl.trim(),
      tags: projectForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      featured: projectForm.featured,
      createdAt: editingProject?.createdAt || new Date().toISOString(),
      // URL相关字段
      type: projectForm.type,
      urlTitle: projectForm.urlTitle,
      urlDescription: projectForm.urlDescription,
      urlImage: projectForm.urlImage,
      urlDomain: projectForm.urlDomain,
      manualCoverImageId: projectForm.manualCoverImageId
    };

    console.log('🖼️ 项目封面图片:', projectForm.coverImage);

    let updatedProjects;
    if (editingProject) {
      updatedProjects = data.projects.map(p => 
        p.id === editingProject.id ? newProject : p
      );
    } else {
      updatedProjects = [...data.projects, newProject];
    }

    updateData({ projects: updatedProjects });
    
    // 自动保存为草稿
    await handleSave();
    
    toast.success(editingProject ? 
      (isZh ? '项目已更新并保存为草稿' : 'Project updated and saved as draft') :
      (isZh ? '项目已添加并保存为草稿' : 'Project added and saved as draft')
    );
    
    resetProjectForm();
  };

  const handleEditProject = (project: AIProject) => {
    setEditingProject(project);
    
    // 兼容旧的coverImage数据，如果是{{image:id}}格式则提取ID
    let imageId = project.manualCoverImageId || '';
    if (!imageId && project.coverImage) {
      const match = project.coverImage.match(/^\{\{image:([^|}]+)\}\}$/);
      if (match) {
        imageId = match[1];
      }
    }
    
    setProjectForm({
      title: project.title,
      description: project.description,
      content: project.content || '', // 添加正文字段
      coverImage: project.coverImage,
      url: project.url,
      githubUrl: project.githubUrl || '',
      tags: project.tags.join(', '),
      featured: project.featured || false,
      type: project.type || 'content',
      urlTitle: project.urlTitle || '',
      urlDescription: project.urlDescription || '',
      urlImage: project.urlImage || '',
      urlDomain: project.urlDomain || '',
      manualCoverImageId: imageId
    });
    
    if (project.type === 'url' && project.url) {
      setUrlInput(project.url);
    }
    
    setIsProjectDialogOpen(true);
  };

  const handleDeleteProject = (projectId: string) => {
    if (!data) return;
    if (!confirm(isZh ? '确定要删除这个项目吗？' : 'Are you sure you want to delete this project?')) return;

    const updatedProjects = data.projects.filter(p => p.id !== projectId);
    updateData({ projects: updatedProjects });
  };

  const resetProjectForm = () => {
    setProjectForm(defaultFormData);
    setEditingProject(null);
    setIsProjectDialogOpen(false);
    setUrlInput('');
  };

  const getCategoryName = (category: string) => {
    const names = {
      zh: { application: 'AI应用', skill: 'AI技能', review: 'AI评测' },
      en: { application: 'Applications', skill: 'Skills', review: 'Reviews' }
    };
    return names[isZh ? 'zh' : 'en'][category as keyof typeof names.zh] || category;
  };

  // 图片选择处理函数 - 用于普通内容的封面图片
  const handleImageSelect = (imageId: string, caption?: string) => {
    console.log('🖼️ 图片选择处理函数被调用:', { imageId, caption });
    const imageRef = `{{image:${imageId}}}`;
    setProjectForm(prev => ({ ...prev, coverImage: imageRef }));
    toast.success(isZh ? '✅ 封面图片已设置' : '✅ Cover image set');
    setShowImageSelector(false); // 关闭图片选择器
    console.log('✅ 图片引用已设置:', imageRef);
  };

  // 手动封面图片选择处理函数 - 用于URL类型的手动封面图片
  const handleManualCoverImageSelect = (imageId: string, caption?: string) => {
    setProjectForm(prev => ({ ...prev, manualCoverImageId: imageId }));
    toast.success(isZh ? '✅ 手动封面图片已设置' : '✅ Manual cover image set');
    setShowManualCoverImageSelector(false);
  };

  // 移除封面图片
  const handleRemoveImage = () => {
    setProjectForm(prev => ({ ...prev, coverImage: '' }));
    toast.success(isZh ? '✅ 封面图片已移除' : '✅ Cover image removed');
  };

  // 移除手动封面图片
  const handleRemoveManualCoverImage = () => {
    setProjectForm(prev => ({ ...prev, manualCoverImageId: '' }));
    toast.success(isZh ? '✅ 手动封面图片已移除' : '✅ Manual cover image removed');
  };

  // URL抓取功能
  const fetchUrlMetadata = async () => {
    if (!urlInput.trim()) {
      toast.error(isZh ? '请输入有效的URL' : 'Please enter a valid URL');
      return;
    }

    setIsUrlFetching(true);
    try {
      // 构建Supabase函数URL
      const supabaseUrl = `https://${projectId}.supabase.co`;
      const apiUrl = `${supabaseUrl}/functions/v1/make-server-55b791b3/fetch-url-metadata`;
      
      console.log('Fetching URL metadata from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ url: urlInput.trim() })
      });

      const result = await response.json();
      
      if (result.success && result.data) {
        const metadata = result.data;
        setProjectForm(prev => ({
          ...prev,
          type: 'url',
          url: metadata.url,
          urlTitle: metadata.title,
          urlDescription: metadata.description,
          urlImage: metadata.image,
          urlDomain: metadata.domain,
          title: metadata.title || prev.title,
          description: metadata.description || prev.description
        }));
        
        toast.success(isZh ? '✅ URL元数据已获取' : '✅ URL metadata fetched successfully');
      } else {
        // 即使失败也设置基本信息
        if (result.fallback_data) {
          const fallback = result.fallback_data;
          setProjectForm(prev => ({
            ...prev,
            type: 'url',
            url: fallback.url,
            urlTitle: fallback.title,
            urlDescription: fallback.description,
            urlImage: fallback.image,
            urlDomain: fallback.domain,
            title: fallback.title || prev.title,
            description: fallback.description || prev.description
          }));
        }
        
        toast.warning(isZh ? '⚠️ URL信息获取不完整，请手动完善' : '⚠️ URL metadata partially fetched, please complete manually');
      }
    } catch (error) {
      console.error('Error fetching URL metadata:', error);
      
      // 设置基本URL信息
      try {
        const url = new URL(urlInput.trim());
        setProjectForm(prev => ({
          ...prev,
          type: 'url',
          url: url.toString(),
          urlDomain: url.hostname,
          title: url.hostname || prev.title,
          description: `Link to ${url.hostname}` || prev.description
        }));
      } catch {
        // URL格式无效
      }
      
      toast.error(isZh ? '❌ URL信息获取失败' : '❌ Failed to fetch URL metadata');
    } finally {
      setIsUrlFetching(false);
    }
  };

  // 切换内容类型
  const handleTypeChange = (newType: 'content' | 'url') => {
    setProjectForm(prev => ({
      ...prev,
      type: newType,
      // 清空相关字段
      ...(newType === 'content' ? {
        url: '',
        urlTitle: '',
        urlDescription: '',
        urlImage: '',
        urlDomain: ''
      } : {})
    }));
    
    if (newType === 'content') {
      setUrlInput('');
    }
  };

  // 获取项目封面图片URL
  const getProjectCoverImageUrl = (project: AIProject) => {
    // 优先级：手动封面图片 > coverImage > URL图片
    if (project.manualCoverImageId) {
      return `{{image:${project.manualCoverImageId}}}`;
    }
    if (project.coverImage) {
      return project.coverImage;
    }
    if (project.type === 'url' && project.urlImage) {
      return project.urlImage;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <EditorHeader 
          title={isZh ? "AI探索编辑器" : "AI Explore Editor"}
          onSave={handleSave}
          isSaving={isSaving}
          hasUnsavedChanges={isDirty}
          lastSavedTime={lastSaved ? new Date(lastSaved) : null}
          isOnline={isOnline}
        />
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <EditorHeader 
        title={isZh ? "AI探索编辑器" : "AI Explore Editor"}
        onSave={handlePublish}
        isSaving={isPublishing}
        hasUnsavedChanges={isDirty}
        lastSavedTime={lastSaved ? new Date(lastSaved) : null}
        isOnline={isOnline}
        saveButtonText={isZh ? "发布" : "Publish"}
        isPublished={isPublished}
        onSaveDraft={handleSave}
        isSavingDraft={isSaving}
        showDraftSave={true}
      />

      <StatusMessage 
        isOnline={isOnline}
        isSaving={isSaving}
        isDirty={isDirty}
        lastSaved={lastSaved}
      />

      {/* 图片选择对话框 */}
      <ImageSelectorDialog
        open={showImageSelector}
        onOpenChange={setShowImageSelector}
        onImageSelect={handleImageSelect}
      />

      {/* 手动封面图片选择对话框 */}
      <ImageSelectorDialog
        open={showManualCoverImageSelector}
        onOpenChange={setShowManualCoverImageSelector}
        onImageSelect={handleManualCoverImageSelect}
      />

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="rounded">
          <TabsTrigger value="basic" className="rounded">
            <Settings className="w-4 h-4 mr-2" />
            {isZh ? '基本设置' : 'Basic Settings'}
          </TabsTrigger>
          <TabsTrigger value="projects" className="rounded">
            <Bot className="w-4 h-4 mr-2" />
            {isZh ? 'AI项目' : 'AI Projects'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          {/* Basic Information */}
          <Card className="cms-bg-card p-6 rounded-xl border border-blue-500/30">
            <h3 className="text-large font-medium mb-4 flex items-center text-white font-terminal">
              <Bot className="w-5 h-5 mr-2" />
              {isZh ? '页面信息' : 'Page Information'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label className="text-white font-terminal">{isZh ? '页面标题' : 'Page Title'}</Label>
                <Input
                  value={data.title}
                  onChange={(e) => updateData({ title: e.target.value })}
                  placeholder={isZh ? '输入页面标题' : 'Enter page title'}
                  className="cms-input rounded-xl"
                />
              </div>

              <div>
                <Label className="text-white font-terminal">{isZh ? '页面副标题' : 'Page Subtitle'}</Label>
                <Input
                  value={data.subtitle}
                  onChange={(e) => updateData({ subtitle: e.target.value })}
                  placeholder={isZh ? '输入页面副标题' : 'Enter page subtitle'}
                  className="cms-input rounded-xl"
                />
              </div>

              <div>
                <Label className="text-white font-terminal">{isZh ? '页面介绍' : 'Page Introduction'}</Label>
                <MarkdownEditor
                  value={data.introduction}
                  onChange={(value) => updateData({ introduction: value })}
                  placeholder={isZh ? '编写页面介绍内容...' : 'Write page introduction...'}
                  height="200px"
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          {/* Add Project Button */}
          <div className="flex justify-between items-center">
            <h3 className="text-large font-medium flex items-center">
              <Bot className="w-5 h-5 mr-2" />
              {isZh ? 'AI项目管理' : 'AI Projects Management'}
              <Badge variant="outline" className="ml-2 rounded">
                {data.projects.length}
              </Badge>
            </h3>
            
            <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => {
                    setEditingProject(null);
                    setProjectForm(defaultFormData);
                  }}
                  className="rounded text-[rgba(255,251,251,1)]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isZh ? '添加项目' : 'Add Project'}
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto dialog-scrollbar z-[10000] sm:max-w-4xl">
                <DialogHeader>
                  <DialogTitle className="text-large">
                    {editingProject ? 
                      (isZh ? '编辑AI项目' : 'Edit AI Project') : 
                      (isZh ? '添加AI项目' : 'Add AI Project')
                    }
                  </DialogTitle>
                  <DialogDescription>
                    {editingProject 
                      ? (isZh ? '修改AI项目的详细信息和设置' : 'Modify the AI project details and settings')
                      : (isZh ? '填写新AI项目的基本信息、内容和配置' : 'Fill in the basic information, content and configuration for the new AI project')
                    }
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  {/* 内容类型选择 */}
                  <div>
                    <Label className="text-white font-terminal">{isZh ? '内容类型' : 'Content Type'}</Label>
                    <div className="flex space-x-4 mt-2">
                      <button
                        type="button"
                        onClick={() => handleTypeChange('content')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-small font-terminal transition-all duration-200 ${
                          projectForm.type === 'content'
                            ? 'btn-glass-blue text-white'
                            : 'text-blue-200/60 border border-blue-400/30 hover:text-blue-200 hover:bg-blue-500/20 backdrop-blur-sm'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        <span>{isZh ? '普通内容' : 'Regular Content'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTypeChange('url')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-small font-terminal transition-all duration-200 ${
                          projectForm.type === 'url'
                            ? 'btn-glass-green text-white'
                            : 'text-green-200/60 border border-green-400/30 hover:text-green-200 hover:bg-green-500/20 backdrop-blur-sm'
                        }`}
                      >
                        <Link className="w-4 h-4" />
                        <span>{isZh ? 'URL链接' : 'URL Link'}</span>
                      </button>
                    </div>
                  </div>

                  {/* URL提取功能 */}
                  {projectForm.type === 'url' && (
                    <div className="space-y-4 p-4 border border-green-400/30 rounded-lg bg-green-500/10">
                      <div className="flex items-center space-x-2 text-green-300">
                        <Globe className="w-5 h-5" />
                        <h4 className="font-medium">{isZh ? 'URL信息提取' : 'URL Metadata Extraction'}</h4>
                      </div>
                      
                      <div className="flex gap-2">
                        <Input
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          placeholder={isZh ? '输入要分析的URL...' : 'Enter URL to analyze...'}
                          className="flex-1 rounded cms-input"
                        />
                        <Button
                          type="button"
                          onClick={fetchUrlMetadata}
                          disabled={isUrlFetching || !urlInput.trim()}
                          className="rounded bg-green-600 hover:bg-green-700"
                        >
                          {isUrlFetching ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Globe className="w-4 h-4" />
                          )}
                          <span className="ml-2">{isZh ? '提取信息' : 'Extract'}</span>
                        </Button>
                      </div>
                      
                      {/* URL信息显示 */}
                      {projectForm.urlDomain && (
                        <div className="space-y-2 text-small">
                          <div className="flex items-center space-x-2 text-green-200">
                            <Globe className="w-4 h-4" />
                            <span>{isZh ? '域名:' : 'Domain:'} {projectForm.urlDomain}</span>
                          </div>
                          {projectForm.urlTitle && (
                            <div className="text-green-200">
                              <span className="font-medium">{isZh ? '标题:' : 'Title:'}</span> {projectForm.urlTitle}
                            </div>
                          )}
                          {projectForm.urlDescription && (
                            <div className="text-green-200">
                              <span className="font-medium">{isZh ? '描述:' : 'Description:'}</span> {projectForm.urlDescription}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <Label>{isZh ? '项目标题' : 'Project Title'} *</Label>
                    <Input
                      value={projectForm.title}
                      onChange={(e) => setProjectForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder={isZh ? '输入项目标题' : 'Enter project title'}
                      className="rounded"
                    />
                  </div>

                  <div>
                    <Label>{isZh ? '项目描述' : 'Project Description'}</Label>
                    <Textarea
                      value={projectForm.description}
                      onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder={isZh ? '简短描述这个AI项目的功能和特点' : 'Brief description of this AI project features'}
                      rows={3}
                      className="rounded"
                    />
                  </div>

                  {/* 根据类型显示不同的内容字段 */}
                  {projectForm.type === 'content' && (
                    <div>
                      <Label>{isZh ? '项目正文' : 'Project Content'}</Label>
                      <div className="border border-gray-600 rounded">
                        <MarkdownEditor
                          value={projectForm.content}
                          onChange={(value) => setProjectForm(prev => ({ ...prev, content: value }))}
                          placeholder={isZh ? '编写详细的项目介绍、设计思路、技术实现、使用心得等...' : 'Write detailed project introduction, design philosophy, technical implementation, user experience, etc...'}
                          height="300px"
                        />
                      </div>
                    </div>
                  )}

                  {/* 封面图片设置 */}
                  <div>
                    <Label>{isZh ? '封面图片' : 'Cover Image'}</Label>
                    
                    {projectForm.type === 'content' ? (
                      // 普通内容类型的封面图片
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            value={projectForm.coverImage}
                            onChange={(e) => setProjectForm(prev => ({ ...prev, coverImage: e.target.value }))}
                            placeholder={isZh ? '输入图片URL或点击选择图片' : 'Enter image URL or click to select image'}
                            className="flex-1 rounded"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowImageSelector(true)}
                            className="rounded text-cyan-400 border-cyan-400 hover:bg-cyan-400 hover:text-slate-900"
                          >
                            <ImageIcon className="w-4 h-4 mr-1" />
                            {isZh ? '选择' : 'Select'}
                          </Button>
                          {projectForm.coverImage && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleRemoveImage}
                              className="rounded text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      // URL类型的封面图片（手动设置优先）
                      <div className="space-y-2">
                        <div className="text-xs text-gray-400 mb-2">
                          {isZh ? '可以手动选择封面图片，优先级高于URL抓取的图片' : 'You can manually select a cover image, which takes priority over the URL extracted image'}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowManualCoverImageSelector(true)}
                            className="rounded text-purple-400 border-purple-400 hover:bg-purple-400 hover:text-white"
                          >
                            <ImagePlus className="w-4 h-4 mr-1" />
                            {isZh ? '手动选择封面' : 'Select Manual Cover'}
                          </Button>
                          {projectForm.manualCoverImageId && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleRemoveManualCoverImage}
                              className="rounded text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              {isZh ? '移除手动封面' : 'Remove Manual Cover'}
                            </Button>
                          )}
                        </div>
                        
                        {/* 显示当前封面图片信息 */}
                        <div className="text-xs text-gray-400">
                          {projectForm.manualCoverImageId ? (
                            <span className="text-purple-300">{isZh ? '✅ 已设置手动封面图片' : '✅ Manual cover image set'}</span>
                          ) : projectForm.urlImage ? (
                            <span className="text-green-300">{isZh ? '🔗 将使用URL抓取的图片' : '🔗 Will use URL extracted image'}</span>
                          ) : (
                            <span className="text-gray-400">{isZh ? '❌ 无封面图片' : '❌ No cover image'}</span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* 图片预览 */}
                    {((projectForm.type === 'content' && projectForm.coverImage) || 
                      (projectForm.type === 'url' && (projectForm.manualCoverImageId || projectForm.urlImage))) && (
                      <div className="mt-2">
                        <div className="text-small text-gray-400 mb-2">
                          {isZh ? '预览:' : 'Preview:'}
                        </div>
                        <SmartImage
                          src={
                            projectForm.type === 'content' 
                              ? projectForm.coverImage
                              : projectForm.manualCoverImageId 
                                ? `{{image:${projectForm.manualCoverImageId}}}` 
                                : projectForm.urlImage
                          }
                          alt="Cover Image Preview"
                          className="w-full h-32 object-cover rounded border"
                          onError={(error) => {
                            console.warn('Preview image failed to load:', error);
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>{isZh ? '项目URL' : 'Project URL'}</Label>
                    <Input
                      value={projectForm.url}
                      onChange={(e) => setProjectForm(prev => ({ ...prev, url: e.target.value }))}
                      placeholder={isZh ? '输入可访问的网站地址' : 'Enter accessible website URL'}
                      className="rounded"
                    />
                  </div>

                  <div>
                    <Label>{isZh ? 'GitHub仓库URL' : 'GitHub Repository URL'}</Label>
                    <Input
                      value={projectForm.githubUrl}
                      onChange={(e) => setProjectForm(prev => ({ ...prev, githubUrl: e.target.value }))}
                      placeholder={isZh ? '输入GitHub仓库地址' : 'Enter GitHub repository URL'}
                      className="rounded"
                    />
                  </div>

                  <div>
                    <Label>{isZh ? '标签' : 'Tags'}</Label>
                    <Input
                      value={projectForm.tags}
                      onChange={(e) => setProjectForm(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder={isZh ? '用逗号分隔多个标签，如：ChatGPT, 自然语言处理, AI工具' : 'Separate multiple tags with commas, e.g.: ChatGPT, NLP, AI Tools'}
                      className="rounded"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={projectForm.featured}
                      onChange={(e) => setProjectForm(prev => ({ ...prev, featured: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="featured" className="cursor-pointer">
                      <Star className="w-4 h-4 inline mr-1" />
                      {isZh ? '设为精选项目' : 'Mark as Featured Project'}
                    </Label>
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button 
                      onClick={handleProjectSubmit}
                      disabled={!projectForm.title.trim()}
                      className="flex-1 rounded"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingProject ? (isZh ? '更新' : 'Update') : (isZh ? '添加' : 'Add')}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={resetProjectForm}
                      className="rounded"
                    >
                      {isZh ? '取消' : 'Cancel'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Projects List */}
          {data.projects.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.projects.map((project) => {
                const coverImageUrl = getProjectCoverImageUrl(project);
                
                return (
                  <Card key={project.id} className="cms-bg-card overflow-hidden rounded-xl border border-blue-500/30">
                    {coverImageUrl && (
                      <div className="aspect-video relative">
                        <SmartImage
                          src={coverImageUrl}
                          alt={project.title}
                          className="w-full h-full object-cover"
                          onError={(error) => {
                            console.warn(`Project cover image failed to load: ${coverImageUrl}`, error);
                          }}
                        />
                        {project.featured && (
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-yellow-500 text-yellow-900 rounded-xl">
                              <Star className="w-3 h-3 mr-1" />
                              {isZh ? '精选' : 'Featured'}
                            </Badge>
                          </div>
                        )}
                        {/* 内容类型标识 */}
                        <div className="absolute top-2 left-2">
                          {project.type === 'url' ? (
                            <Badge className="bg-green-500 text-white rounded-xl">
                              <Link className="w-3 h-3 mr-1" />
                              {isZh ? 'URL' : 'URL'}
                            </Badge>
                          ) : (
                            <Badge className="bg-blue-500 text-white rounded-xl">
                              <FileText className="w-3 h-3 mr-1" />
                              {isZh ? '内容' : 'Content'}
                            </Badge>
                          )}
                        </div>
                        {/* 手动封面图片标识 */}
                        {project.manualCoverImageId && (
                          <div className="absolute bottom-2 right-2">
                            <Badge className="bg-purple-500 text-white rounded-xl">
                              <ImagePlus className="w-3 h-3 mr-1" />
                              {isZh ? '手动封面' : 'Manual Cover'}
                            </Badge>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium line-clamp-2 text-white font-terminal">{project.title}</h4>
                      </div>
                      
                      {project.description && (
                        <p className="text-small text-slate-300 line-clamp-2 font-terminal">
                          {project.description}
                        </p>
                      )}
                      
                      {/* URL域名显示 */}
                      {project.type === 'url' && project.urlDomain && (
                        <div className="flex items-center space-x-1 text-xs text-green-400">
                          <Globe className="w-3 h-3" />
                          <span>{project.urlDomain}</span>
                        </div>
                      )}
                      
                      {project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {project.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs rounded-md border-blue-500/30 text-cyan-200">
                              {tag}
                            </Badge>
                          ))}
                          {project.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs rounded-md border-blue-500/30 text-cyan-200">
                              +{project.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <div className="flex space-x-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditProject(project)}
                          className="cms-secondary-button flex-1 rounded-xl text-xs"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          {isZh ? '编辑' : 'Edit'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteProject(project.id)}
                          className="cms-danger-button text-xs rounded-xl"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="cms-bg-card p-8 text-center rounded-xl border border-blue-500/30">
              <Bot className="w-16 h-16 text-blue-300 mx-auto mb-4" />
              <h3 className="text-large font-medium text-blue-300 mb-2">
                {isZh ? '还没有AI项目' : 'No AI Projects Yet'}
              </h3>
              <p className="text-slate-400 text-small mb-4">
                {isZh ? '点击上方"添加项目"按钮开始创建你的第一个AI项目' : 'Click the "Add Project" button above to create your first AI project'}
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}