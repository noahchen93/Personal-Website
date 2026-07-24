import React, { useState, useEffect } from 'react';
import { User, Plus, Trash2, ExternalLink, X } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { useContent } from '../../content/ContentContext';
import { useLanguage } from '../../language/LanguageContext';
import { toast } from 'sonner';
import MarkdownEditor from '../MarkdownEditor';
import StatusMessage from '../shared/StatusMessage';
import EditorHeader from '../shared/EditorHeader';
import EducationForm from '../forms/EducationForm';
import WorkExperienceForm from '../forms/WorkExperienceForm';
import { useAutoSave } from '../hooks/useAutoSave';
import DraftManager from '../shared/DraftManager';

interface NavigationButton {
  id: string;
  text: string;
  target: string;
  style: 'primary' | 'secondary';
  external?: boolean;
  customUrl?: string;
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

export default function HomeEditor() {
  const { getContentByLanguage, createContent, updateContent, isOnline } = useContent();
  const { currentLanguage, isZh } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false); // 添加草稿保存状态
  const [homeData, setHomeData] = useState<HomeData>({});
  const [contentId, setContentId] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [showSkillInput, setShowSkillInput] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // 添加未保存更改状态
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null); // 添加最后保存时间

  useEffect(() => {
    loadHomeData();
  }, [currentLanguage]);

  const loadHomeData = async () => {
    setIsLoading(true);
    try {
      const content = await getContentByLanguage('home', currentLanguage);
      if (content.length > 0) {
        setHomeData(content[0].data || {});
        setContentId(content[0].id);
        setIsPublished(content[0].is_published);
      } else {
        setHomeData({});
        setContentId(null);
      }
    } catch (error) {
      console.error('Error loading home data:', error);
      toast.error(isZh ? '加载数据失败' : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  // 修复保存草稿功能
  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      let result;
      if (contentId) {
        result = await updateContent(contentId, {
          type: 'home',
          data: homeData,
          is_published: false,
          language: currentLanguage
        });
      } else {
        result = await createContent({
          type: 'home',
          data: homeData,
          is_published: false,
          language: currentLanguage
        });
        setContentId(result.id);
      }
      setIsPublished(false);
      setHasUnsavedChanges(false);
      setLastSavedTime(new Date());
      toast.success(isZh ? '草稿已保存' : 'Draft saved');
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error(isZh ? '草稿保存失败' : 'Failed to save draft');
    } finally {
      setIsSavingDraft(false);
    }
  };

  // 修复发布功能 - 移除未定义的setIsPublishing
  const handleSave = async () => {
    setIsSaving(true);
    try {
      let result;
      if (contentId) {
        result = await updateContent(contentId, {
          type: 'home',
          data: homeData,
          is_published: true,
          language: currentLanguage
        });
        setIsPublished(true);
      } else {
        result = await createContent({
          type: 'home',
          data: homeData,
          is_published: true,
          language: currentLanguage
        });
        setContentId(result.id);
        setIsPublished(true);
      }
      setHasUnsavedChanges(false);
      setLastSavedTime(new Date());
      toast.success(isZh ? '发布成功' : 'Published successfully');
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error(isZh ? '发布失败' : 'Failed to publish');
    } finally {
      setIsSaving(false);
    }
  };

  const updateData = (field: keyof HomeData, value: any) => {
    setHomeData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true); // 标记有未保存的更改
  };

  const addEducation = () => {
    const newEducation = { school: '', major: '', period: '', degree: '' };
    updateData('education', [...(homeData.education || []), newEducation]);
  };

  const updateEducation = (index: number, education: any) => {
    const updated = [...(homeData.education || [])];
    updated[index] = education;
    updateData('education', updated);
  };

  const removeEducation = (index: number) => {
    const updated = [...(homeData.education || [])];
    updated.splice(index, 1);
    updateData('education', updated);
  };

  const addWorkExperience = () => {
    const newWork = { company: '', position: '', period: '', location: '', description: '' };
    updateData('workExperience', [...(homeData.workExperience || []), newWork]);
  };

  const updateWorkExperience = (index: number, work: any) => {
    const updated = [...(homeData.workExperience || [])];
    updated[index] = work;
    updateData('workExperience', updated);
  };

  const removeWorkExperience = (index: number) => {
    const updated = [...(homeData.workExperience || [])];
    updated.splice(index, 1);
    updateData('workExperience', updated);
  };

  const addSkill = () => {
    setShowSkillInput(true);
  };

  const handleAddSkill = () => {
    if (newSkillInput.trim()) {
      updateData('skills', [...(homeData.skills || []), newSkillInput.trim()]);
      setNewSkillInput('');
      setShowSkillInput(false);
    }
  };

  const handleCancelAddSkill = () => {
    setNewSkillInput('');
    setShowSkillInput(false);
  };

  const removeSkill = (index: number) => {
    const updated = [...(homeData.skills || [])];
    updated.splice(index, 1);
    updateData('skills', updated);
  };

  const addNavigationButton = () => {
    const newButton: NavigationButton = {
      id: Date.now().toString(),
      text: '',
      target: '',
      style: 'primary',
      external: false
    };
    updateData('navigationButtons', [...(homeData.navigationButtons || []), newButton]);
  };

  const updateNavigationButton = (index: number, button: NavigationButton) => {
    const updated = [...(homeData.navigationButtons || [])];
    updated[index] = button;
    updateData('navigationButtons', updated);
  };

  const removeNavigationButton = (index: number) => {
    const updated = [...(homeData.navigationButtons || [])];
    updated.splice(index, 1);
    updateData('navigationButtons', updated);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-700/50 rounded w-1/3"></div>
        <div className="h-32 bg-slate-700/50 rounded"></div>
        <div className="h-64 bg-slate-700/50 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 admin-editor cms-container">
      <EditorHeader
        title={isZh ? '首页内容编辑' : 'Home Page Editor'}
        description={isZh ? '编辑网站首页的个人信息和介绍内容' : 'Edit personal information and introduction content for the homepage'}
        icon={<User className="w-5 h-5" />}
        onSave={handleSave}
        isSaving={isSaving}
        onSaveDraft={handleSaveDraft}
        isSavingDraft={isSavingDraft}
        showDraftSave={true}
        hasUnsavedChanges={hasUnsavedChanges}
        lastSavedTime={lastSavedTime}
        isOnline={isOnline}
        saveButtonText={isZh ? '发布' : 'Publish'}
        isPublished={isPublished}
      />

      <div className="space-y-8">
        {/* 基本信息 */}
        <div className="space-y-4 bg-slate-800/50 rounded-lg p-6 border border-blue-400/30">
          <h3 className="text-medium font-terminal terminal-text-white font-medium">
            {isZh ? '基本信息' : 'Basic Information'}
          </h3>
          
          <div className="grid gap-4">
            <div>
              <Label htmlFor="heroTitle" className="text-small font-terminal terminal-text-cyan">
                {isZh ? '主标题' : 'Main Title'}
              </Label>
              <Input
                id="heroTitle"
                value={homeData.heroTitle || ''}
                onChange={(e) => updateData('heroTitle', e.target.value)}
                className="font-terminal text-small cms-input"
                placeholder={isZh ? '输入主标题' : 'Enter main title'}
              />
            </div>
            
            <div>
              <Label htmlFor="heroSubtitle" className="text-small font-terminal terminal-text-cyan">
                {isZh ? '副标题' : 'Subtitle'}
              </Label>
              <Input
                id="heroSubtitle"
                value={homeData.heroSubtitle || ''}
                onChange={(e) => updateData('heroSubtitle', e.target.value)}
                className="font-terminal text-small cms-input"
                placeholder={isZh ? '输入副标题' : 'Enter subtitle'}
              />
            </div>
          </div>
        </div>

        {/* 个人简介 */}
        <div className="space-y-4 bg-slate-800/50 rounded-lg p-6 border border-blue-400/30">
          <h3 className="text-medium font-terminal terminal-text-white font-medium">
            {isZh ? '个人简介' : 'Personal Summary'}
          </h3>
          <MarkdownEditor
            value={homeData.summary || ''}
            onChange={(value) => updateData('summary', value)}
            placeholder={isZh ? '输入个人简介内容...' : 'Enter personal summary...'}
            className="min-h-[200px]"
          />
        </div>

        {/* 教育背景 */}
        <div className="space-y-4 bg-slate-800/50 rounded-lg p-6 border border-blue-400/30">
          <div className="flex items-center justify-between">
            <h3 className="text-medium font-terminal terminal-text-white font-medium">
              {isZh ? '教育背景' : 'Education'}
            </h3>
            <Button onClick={addEducation} variant="outline" size="sm" className="font-terminal text-small cms-secondary-button">
              <Plus className="w-4 h-4 mr-1" />
              {isZh ? '添加' : 'Add'}
            </Button>
          </div>

          <div>
            <Label className="text-small font-terminal terminal-text-cyan">
              {isZh ? '区块标题' : 'Section Title'}
            </Label>
            <Input
              value={homeData.educationTitle || ''}
              onChange={(e) => updateData('educationTitle', e.target.value)}
              placeholder={isZh ? '教育背景' : 'Education'}
              className="font-terminal text-small cms-input"
            />
          </div>

          <div className="space-y-4">
            {(homeData.education || []).map((edu, index) => (
              <EducationForm
                key={index}
                education={edu}
                onChange={(education) => updateEducation(index, education)}
                onRemove={() => removeEducation(index)}
              />
            ))}
          </div>
        </div>

        {/* 工作经历 */}
        <div className="space-y-4 bg-slate-800/50 rounded-lg p-6 border border-blue-400/30">
          <div className="flex items-center justify-between">
            <h3 className="text-medium font-terminal terminal-text-white font-medium">
              {isZh ? '工作经历' : 'Work Experience'}
            </h3>
            <Button onClick={addWorkExperience} variant="outline" size="sm" className="font-terminal text-small cms-secondary-button">
              <Plus className="w-4 h-4 mr-1" />
              {isZh ? '添加' : 'Add'}
            </Button>
          </div>

          <div>
            <Label className="text-small font-terminal terminal-text-cyan">
              {isZh ? '区块标题' : 'Section Title'}
            </Label>
            <Input
              value={homeData.workExperienceTitle || ''}
              onChange={(e) => updateData('workExperienceTitle', e.target.value)}
              placeholder={isZh ? '工作经历' : 'Work Experience'}
              className="font-terminal text-small cms-input"
            />
          </div>

          <div className="space-y-4">
            {(homeData.workExperience || []).map((work, index) => (
              <WorkExperienceForm
                key={index}
                workExperience={work}
                onChange={(workExperience) => updateWorkExperience(index, workExperience)}
                onRemove={() => removeWorkExperience(index)}
              />
            ))}
          </div>
        </div>

        {/* 核心技能 */}
        <div className="space-y-4 bg-slate-800/50 rounded-lg p-6 border border-blue-400/30">
          <div className="flex items-center justify-between">
            <h3 className="text-medium font-terminal terminal-text-white font-medium">
              {isZh ? '核心技能' : 'Core Skills'}
            </h3>
            <Button onClick={addSkill} variant="outline" size="sm" className="font-terminal text-small cms-secondary-button">
              <Plus className="w-4 h-4 mr-1" />
              {isZh ? '添加技能' : 'Add Skill'}
            </Button>
          </div>

          <div>
            <Label className="text-small font-terminal terminal-text-cyan">
              {isZh ? '区块标题' : 'Section Title'}
            </Label>
            <Input
              value={homeData.skillsTitle || ''}
              onChange={(e) => updateData('skillsTitle', e.target.value)}
              placeholder={isZh ? '核心技能' : 'Core Skills'}
              className="font-terminal text-small cms-input"
            />
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {(homeData.skills || []).map((skill, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-small font-terminal border border-blue-400/30"
                >
                  <span>{skill}</span>
                  <button
                    onClick={() => removeSkill(index)}
                    className="text-blue-300 hover:text-red-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            
            {/* 添加技能输入框 */}
            {showSkillInput && (
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label className="text-small font-terminal terminal-text-cyan">
                    {isZh ? '技能名称' : 'Skill Name'}
                  </Label>
                  <Input
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    placeholder={isZh ? '输入技能名称...' : 'Enter skill name...'}
                    className="font-terminal text-small cms-input"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddSkill();
                      } else if (e.key === 'Escape') {
                        handleCancelAddSkill();
                      }
                    }}
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddSkill}
                    size="sm"
                    className="font-terminal text-small cms-primary-button"
                    disabled={!newSkillInput.trim()}
                  >
                    {isZh ? '添加' : 'Add'}
                  </Button>
                  <Button
                    onClick={handleCancelAddSkill}
                    variant="ghost"
                    size="sm"
                    className="font-terminal text-small text-gray-400 hover:text-white"
                  >
                    {isZh ? '取消' : 'Cancel'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 探索更多部分 */}
        <div className="space-y-4 bg-slate-800/50 rounded-lg p-6 border border-blue-400/30">
          <h3 className="text-medium font-terminal terminal-text-white font-medium">
            {isZh ? '探索更多部分' : 'Explore More Section'}
          </h3>
          
          <div className="grid gap-4">
            <div>
              <Label className="text-small font-terminal terminal-text-cyan">
                {isZh ? '区块标题' : 'Section Title'}
              </Label>
              <Input
                value={homeData.ctaTitle || ''}
                onChange={(e) => updateData('ctaTitle', e.target.value)}
                placeholder={isZh ? '探索更多' : 'Explore More'}
                className="font-terminal text-small cms-input"
              />
            </div>
            
            <div>
              <Label className="text-small font-terminal terminal-text-cyan">
                {isZh ? '描述文本' : 'Description'}
              </Label>
              <Textarea
                value={homeData.ctaDescription || ''}
                onChange={(e) => updateData('ctaDescription', e.target.value)}
                placeholder={isZh ? '了解我的项目经历、个人兴趣和创作成果' : 'Learn about my projects, interests, and creative works'}
                className="font-terminal text-small cms-textarea"
                rows={3}
              />
            </div>
          </div>

          {/* 导航按钮 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-small font-terminal terminal-text-cyan">
                {isZh ? '导航按钮' : 'Navigation Buttons'}
              </Label>
              <Button onClick={addNavigationButton} variant="outline" size="sm" className="font-terminal text-small cms-secondary-button">
                <Plus className="w-4 h-4 mr-1" />
                {isZh ? '添加按钮' : 'Add Button'}
              </Button>
            </div>

            <div className="space-y-4">
              {(homeData.navigationButtons || []).map((button, index) => (
                <div key={button.id} className="p-4 bg-slate-700/50 rounded-lg space-y-3 border border-blue-400/20">
                  <div className="flex items-center justify-between">
                    <h4 className="text-small font-terminal terminal-text-white">
                      {isZh ? `按钮 ${index + 1}` : `Button ${index + 1}`}
                    </h4>
                    <Button
                      onClick={() => removeNavigationButton(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 font-terminal text-small hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-small font-terminal terminal-text-cyan">
                        {isZh ? '按钮文字' : 'Button Text'}
                      </Label>
                      <Input
                        value={button.text}
                        onChange={(e) => updateNavigationButton(index, { ...button, text: e.target.value })}
                        className="font-terminal text-small cms-input"
                        placeholder={isZh ? '查看项目' : 'View Projects'}
                      />
                    </div>

                    <div>
                      <Label className="text-small font-terminal terminal-text-cyan">
                        {isZh ? '目标地址' : 'Target'}
                      </Label>
                      <Select
                        value={button.target}
                        onValueChange={(value) => updateNavigationButton(index, { ...button, target: value })}
                      >
                        <SelectTrigger className="font-terminal text-small cms-select">
                          <SelectValue placeholder={isZh ? "选择目标页面" : "Select target page"} />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-blue-400/30">
                          <SelectItem value="home" className="text-white hover:bg-slate-700">
                            {isZh ? '首页' : 'Home'}
                          </SelectItem>
                          <SelectItem value="projects" className="text-white hover:bg-slate-700">
                            {isZh ? '项目作品' : 'Projects'}
                          </SelectItem>
                          <SelectItem value="blog" className="text-white hover:bg-slate-700">
                            {isZh ? '博客文章' : 'Blog'}
                          </SelectItem>
                          <SelectItem value="interests" className="text-white hover:bg-slate-700">
                            {isZh ? '个人兴趣' : 'Interests'}
                          </SelectItem>
                          <SelectItem value="contact" className="text-white hover:bg-slate-700">
                            {isZh ? '联系方式' : 'Contact'}
                          </SelectItem>
                          <SelectItem value="ai-explore" className="text-white hover:bg-slate-700">
                            {isZh ? 'AI探索' : 'AI Explore'}
                          </SelectItem>
                          <SelectItem value="custom" className="text-white hover:bg-slate-700 border-t border-blue-400/30">
                            {isZh ? '自定义链接' : 'Custom Link'}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {/* 自定义链接输入框 */}
                      {button.target === 'custom' && (
                        <div className="mt-2">
                          <Label className="text-small font-terminal terminal-text-cyan">
                            {isZh ? '自定义URL' : 'Custom URL'}
                          </Label>
                          <Input
                            value={button.customUrl || ''}
                            onChange={(e) => updateNavigationButton(index, { 
                              ...button, 
                              customUrl: e.target.value,
                              external: true // 自定义链接默认为外部链接
                            })}
                            className="font-terminal text-small cms-input"
                            placeholder={isZh ? '输入完整URL，如: https://example.com' : 'Enter full URL, e.g.: https://example.com'}
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <Label className="text-small font-terminal terminal-text-cyan">
                        {isZh ? '按钮样式' : 'Button Style'}
                      </Label>
                      <Select
                        value={button.style}
                        onValueChange={(value: 'primary' | 'secondary') => 
                          updateNavigationButton(index, { ...button, style: value })
                        }
                      >
                        <SelectTrigger className="font-terminal text-small cms-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-blue-400/30">
                          <SelectItem value="primary" className="text-white hover:bg-slate-700">Primary</SelectItem>
                          <SelectItem value="secondary" className="text-white hover:bg-slate-700">Secondary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`external-${index}`}
                        checked={button.external || false}
                        onChange={(e) => updateNavigationButton(index, { ...button, external: e.target.checked })}
                        className="rounded bg-slate-700 border-blue-400/30 text-blue-500"
                      />
                      <Label htmlFor={`external-${index}`} className="text-small font-terminal terminal-text-cyan flex items-center space-x-1">
                        <ExternalLink className="w-3 h-3" />
                        <span>{isZh ? '外部链接' : 'External Link'}</span>
                      </Label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <StatusMessage />
    </div>
  );
}