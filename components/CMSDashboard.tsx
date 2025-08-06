import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { toast } from 'sonner@2.0.3';
import { 
  Upload, Edit, Trash2, Plus, Globe, User, 
  FolderOpen, Heart, Home, GraduationCap, Briefcase, Mail, Palette, Image,
  Save, Send, Copy
} from 'lucide-react';
import { ActionButtons, MediaUploadZone, MediaFileCard } from './cms/CMSComponents';
import { ProjectForm } from './cms/ProjectForm';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { 
  getDefaultHomeData, 
  getDefaultProfileData, 
  getDefaultEducationData,
  getDefaultExperienceData,
  getDefaultContactData,
  getDefaultThemeData,
  getDefaultSiteSettings
} from '../utils/cmsDefaults';

interface CMSDashboardProps {
  accessToken: string;
  onLogout: () => void;
}

export function CMSDashboard({ accessToken, onLogout }: CMSDashboardProps) {
  const [activeTab, setActiveTab] = useState('home');
  const [activeLanguage, setActiveLanguage] = useState<'zh' | 'en'>('zh');
  const [loading, setLoading] = useState(false);
  const [showDrafts, setShowDrafts] = useState(true);

  // Content states
  const [homeData, setHomeData] = useState(getDefaultHomeData('zh'));
  const [profileData, setProfileData] = useState(getDefaultProfileData('zh'));
  const [educationData, setEducationData] = useState(getDefaultEducationData('zh'));
  const [experienceData, setExperienceData] = useState(getDefaultExperienceData('zh'));
  const [contactData, setContactData] = useState(getDefaultContactData('zh'));
  const [projects, setProjects] = useState([]);
  const [interests, setInterests] = useState([]);
  const [themeData, setThemeData] = useState(getDefaultThemeData());
  const [siteSettings, setSiteSettings] = useState(getDefaultSiteSettings());
  const [mediaFiles, setMediaFiles] = useState([]);

  // Dialog states
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [showInterestDialog, setShowInterestDialog] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editingInterest, setEditingInterest] = useState(null);

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const url = `https://${projectId}.supabase.co/functions/v1/make-server-c529659a${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return response.json();
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-c529659a/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}` },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  };

  useEffect(() => {
    loadData();
  }, [activeLanguage, showDrafts]);

  const loadData = async () => {
    setLoading(true);
    try {
      const draftsParam = showDrafts ? '?drafts=true' : '';
      
      const [
        homeResponse,
        profileResponse,
        educationResponse,
        experienceResponse,
        contactResponse,
        projectsResponse,
        interestsResponse,
        themeResponse,
        settingsResponse,
        mediaResponse
      ] = await Promise.all([
        apiCall(`/home/${activeLanguage}${draftsParam}`).catch(() => null),
        apiCall(`/profile/${activeLanguage}${draftsParam}`).catch(() => null),
        apiCall(`/education/${activeLanguage}${draftsParam}`).catch(() => null),
        apiCall(`/experience/${activeLanguage}${draftsParam}`).catch(() => null),
        apiCall(`/contact/${activeLanguage}${draftsParam}`).catch(() => null),
        apiCall(`/projects/${activeLanguage}${draftsParam}`).catch(() => []),
        apiCall(`/interests/${activeLanguage}${draftsParam}`).catch(() => []),
        apiCall(`/theme${draftsParam}`).catch(() => null),
        apiCall(`/settings/site${draftsParam}`).catch(() => null),
        apiCall('/media').catch(() => [])
      ]);

      setHomeData({ ...getDefaultHomeData(activeLanguage), ...homeResponse });
      setProfileData({ ...getDefaultProfileData(activeLanguage), ...profileResponse });
      setEducationData({ ...getDefaultEducationData(activeLanguage), ...educationResponse });
      setExperienceData({ ...getDefaultExperienceData(activeLanguage), ...experienceResponse });
      setContactData({ ...getDefaultContactData(activeLanguage), ...contactResponse });
      setProjects(Array.isArray(projectsResponse) ? projectsResponse : []);
      setInterests(Array.isArray(interestsResponse) ? interestsResponse : []);
      setThemeData({ ...getDefaultThemeData(), ...themeResponse });
      setSiteSettings({ ...getDefaultSiteSettings(), ...settingsResponse });
      setMediaFiles(Array.isArray(mediaResponse) ? mediaResponse : []);

    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async (section: string, data: any, status: 'draft' | 'published' = 'draft') => {
    try {
      const endpoint = section === 'theme' ? '/theme' : 
                     section === 'settings' ? '/settings/site' :
                     `/${section}/${activeLanguage}`;
      
      await apiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify({ ...data, status }),
      });

      const statusText = status === 'draft' ? '草稿保存成功' : '发布成功';
      toast.success(statusText);
      
      if (status === 'published') {
        await loadData();
      }
    } catch (error) {
      console.error(`Failed to save ${section}:`, error);
      toast.error('保存失败');
    }
  };

  const deleteMediaFile = async (filename: string) => {
    try {
      await apiCall(`/media/${filename}`, { method: 'DELETE' });
      toast.success('文件删除成功');
      await loadData();
    } catch (error) {
      console.error('Failed to delete file:', error);
      toast.error('删除失败');
    }
  };

  const handleProjectSave = (projectData: any) => {
    if (editingProject) {
      const newProjects = projects.map(p => p.id === editingProject.id ? projectData : p);
      setProjects(newProjects);
    } else {
      setProjects([...projects, projectData]);
    }
    setEditingProject(null);
  };

  const handleInterestSave = (interestData: any) => {
    if (editingInterest) {
      const newInterests = interests.map(i => i.id === editingInterest.id ? interestData : i);
      setInterests(newInterests);
    } else {
      setInterests([...interests, interestData]);
    }
    setEditingInterest(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-gray-900">内容管理系统</h1>
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <Select value={activeLanguage} onValueChange={(value: 'zh' | 'en') => setActiveLanguage(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zh">中文</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={showDrafts}
                onCheckedChange={setShowDrafts}
                id="show-drafts"
              />
              <Label htmlFor="show-drafts" className="text-sm">
                {showDrafts ? '显示草稿' : '显示已发布'}
              </Label>
            </div>
          </div>
          <Button onClick={onLogout} variant="outline">
            退出登录
          </Button>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="home"><Home className="w-4 h-4" /></TabsTrigger>
            <TabsTrigger value="profile"><User className="w-4 h-4" /></TabsTrigger>
            <TabsTrigger value="education"><GraduationCap className="w-4 h-4" /></TabsTrigger>
            <TabsTrigger value="experience"><Briefcase className="w-4 h-4" /></TabsTrigger>
            <TabsTrigger value="projects"><FolderOpen className="w-4 h-4" /></TabsTrigger>
            <TabsTrigger value="interests"><Heart className="w-4 h-4" /></TabsTrigger>
            <TabsTrigger value="contact"><Mail className="w-4 h-4" /></TabsTrigger>
            <TabsTrigger value="media"><Image className="w-4 h-4" /></TabsTrigger>
            <TabsTrigger value="design"><Palette className="w-4 h-4" /></TabsTrigger>
          </TabsList>

          {/* Home Section Management */}
          <TabsContent value="home" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>首页内容管理</CardTitle>
                  <CardDescription>
                    当前编辑语言: {activeLanguage === 'zh' ? '中文' : 'English'}
                  </CardDescription>
                </div>
                <ActionButtons 
                  section="home"
                  onSaveDraft={() => saveContent('home', homeData, 'draft')}
                  onPublish={() => saveContent('home', homeData, 'published')}
                />
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Hero Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">英雄区域</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="hero-title">主标题</Label>
                      <Input
                        id="hero-title"
                        value={homeData.heroTitle || ''}
                        onChange={(e) => setHomeData(prev => ({ ...prev, heroTitle: e.target.value }))}
                        placeholder="例：Noah Chen"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hero-subtitle">副标题</Label>
                      <Input
                        id="hero-subtitle"
                        value={homeData.heroSubtitle || ''}
                        onChange={(e) => setHomeData(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                        placeholder="例：双语创意项目与展览经理"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hero-description">描述文字</Label>
                      <Textarea
                        id="hero-description"
                        value={homeData.heroDescription || ''}
                        onChange={(e) => setHomeData(prev => ({ ...prev, heroDescription: e.target.value }))}
                        rows={3}
                        placeholder="简短的个人介绍..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="background-image">背景图片URL</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="background-image"
                          value={homeData.backgroundImage || ''}
                          onChange={(e) => setHomeData(prev => ({ ...prev, backgroundImage: e.target.value }))}
                          placeholder="背景图片URL"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = async (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) {
                                try {
                                  const result = await uploadFile(file);
                                  setHomeData(prev => ({ ...prev, backgroundImage: result.url }));
                                  toast.success('图片上传成功');
                                } catch (error) {
                                  toast.error('图片上传失败');
                                }
                              }
                            };
                            input.click();
                          }}
                        >
                          <Upload className="w-4 h-4" />
                        </Button>
                      </div>
                      {homeData.backgroundImage && (
                        <img src={homeData.backgroundImage} alt="Background preview" className="mt-2 max-w-xs rounded" />
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Stats Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">统计数据</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="stat-experience">工作经验</Label>
                      <Input
                        id="stat-experience"
                        value={homeData.stats?.experience || ''}
                        onChange={(e) => setHomeData(prev => ({ 
                          ...prev, 
                          stats: { ...prev.stats, experience: e.target.value }
                        }))}
                        placeholder="7+"
                      />
                    </div>
                    <div>
                      <Label htmlFor="stat-projects">项目经验</Label>
                      <Input
                        id="stat-projects"
                        value={homeData.stats?.projects || ''}
                        onChange={(e) => setHomeData(prev => ({ 
                          ...prev, 
                          stats: { ...prev.stats, projects: e.target.value }
                        }))}
                        placeholder="50+"
                      />
                    </div>
                    <div>
                      <Label htmlFor="stat-countries">工作国家</Label>
                      <Input
                        id="stat-countries"
                        value={homeData.stats?.countries || ''}
                        onChange={(e) => setHomeData(prev => ({ 
                          ...prev, 
                          stats: { ...prev.stats, countries: e.target.value }
                        }))}
                        placeholder="10+"
                      />
                    </div>
                    <div>
                      <Label htmlFor="stat-languages">工作语言</Label>
                      <Input
                        id="stat-languages"
                        value={homeData.stats?.languages || ''}
                        onChange={(e) => setHomeData(prev => ({ 
                          ...prev, 
                          stats: { ...prev.stats, languages: e.target.value }
                        }))}
                        placeholder="2"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Call to Actions */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">行动按钮</h3>
                    <Button
                      onClick={() => {
                        setHomeData(prev => ({
                          ...prev,
                          callToActions: [...(prev.callToActions || []), { text: '', link: '', style: 'primary' }]
                        }));
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      添加按钮
                    </Button>
                  </div>
                  
                  {(homeData.callToActions || []).map((cta, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="按钮文字"
                          value={cta.text || ''}
                          onChange={(e) => {
                            const newCTAs = [...(homeData.callToActions || [])];
                            newCTAs[index] = { ...newCTAs[index], text: e.target.value };
                            setHomeData(prev => ({ ...prev, callToActions: newCTAs }));
                          }}
                        />
                        <Input
                          placeholder="链接地址"
                          value={cta.link || ''}
                          onChange={(e) => {
                            const newCTAs = [...(homeData.callToActions || [])];
                            newCTAs[index] = { ...newCTAs[index], link: e.target.value };
                            setHomeData(prev => ({ ...prev, callToActions: newCTAs }));
                          }}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <Select 
                          value={cta.style || 'primary'} 
                          onValueChange={(value) => {
                            const newCTAs = [...(homeData.callToActions || [])];
                            newCTAs[index] = { ...newCTAs[index], style: value };
                            setHomeData(prev => ({ ...prev, callToActions: newCTAs }));
                          }}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="primary">主要</SelectItem>
                            <SelectItem value="secondary">次要</SelectItem>
                            <SelectItem value="outline">轮廓</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={() => {
                            const newCTAs = (homeData.callToActions || []).filter((_, i) => i !== index);
                            setHomeData(prev => ({ ...prev, callToActions: newCTAs }));
                          }}
                          variant="destructive"
                          size="sm"
                        >
                          删除
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Management */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>个人信息管理</CardTitle>
                  <CardDescription>
                    当前编辑语言: {activeLanguage === 'zh' ? '中文' : 'English'}
                  </CardDescription>
                </div>
                <ActionButtons 
                  section="profile"
                  onSaveDraft={() => saveContent('profile', profileData, 'draft')}
                  onPublish={() => saveContent('profile', profileData, 'published')}
                />
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="bio">个人简介</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio || ''}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={6}
                    placeholder="请输入个人简介..."
                  />
                </div>

                <Separator />

                {/* Education section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>教育背景</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setProfileData(prev => ({
                          ...prev,
                          education: [...(prev.education || []), { institution: '', degree: '', period: '', description: '' }]
                        }));
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      添加教育经历
                    </Button>
                  </div>
                  
                  {(profileData.education || []).map((edu, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="学校/机构"
                          value={edu.institution || ''}
                          onChange={(e) => {
                            const newEducation = [...(profileData.education || [])];
                            newEducation[index] = { ...newEducation[index], institution: e.target.value };
                            setProfileData(prev => ({ ...prev, education: newEducation }));
                          }}
                        />
                        <Input
                          placeholder="学位/专业"
                          value={edu.degree || ''}
                          onChange={(e) => {
                            const newEducation = [...(profileData.education || [])];
                            newEducation[index] = { ...newEducation[index], degree: e.target.value };
                            setProfileData(prev => ({ ...prev, education: newEducation }));
                          }}
                        />
                      </div>
                      <Input
                        placeholder="时间期间"
                        value={edu.period || ''}
                        onChange={(e) => {
                          const newEducation = [...(profileData.education || [])];
                          newEducation[index] = { ...newEducation[index], period: e.target.value };
                          setProfileData(prev => ({ ...prev, education: newEducation }));
                        }}
                      />
                      <Textarea
                        placeholder="详细描述"
                        value={edu.description || ''}
                        onChange={(e) => {
                          const newEducation = [...(profileData.education || [])];
                          newEducation[index] = { ...newEducation[index], description: e.target.value };
                          setProfileData(prev => ({ ...prev, education: newEducation }));
                        }}
                        rows={3}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const newEducation = (profileData.education || []).filter((_, i) => i !== index);
                          setProfileData(prev => ({ ...prev, education: newEducation }));
                        }}
                      >
                        删除
                      </Button>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Experience section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>工作经历</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setProfileData(prev => ({
                          ...prev,
                          experience: [...(prev.experience || []), { company: '', position: '', period: '', description: '' }]
                        }));
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      添加工作经历
                    </Button>
                  </div>
                  
                  {(profileData.experience || []).map((exp, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="公司/组织"
                          value={exp.company || ''}
                          onChange={(e) => {
                            const newExperience = [...(profileData.experience || [])];
                            newExperience[index] = { ...newExperience[index], company: e.target.value };
                            setProfileData(prev => ({ ...prev, experience: newExperience }));
                          }}
                        />
                        <Input
                          placeholder="职位"
                          value={exp.position || ''}
                          onChange={(e) => {
                            const newExperience = [...(profileData.experience || [])];
                            newExperience[index] = { ...newExperience[index], position: e.target.value };
                            setProfileData(prev => ({ ...prev, experience: newExperience }));
                          }}
                        />
                      </div>
                      <Input
                        placeholder="时间期间"
                        value={exp.period || ''}
                        onChange={(e) => {
                          const newExperience = [...(profileData.experience || [])];
                          newExperience[index] = { ...newExperience[index], period: e.target.value };
                          setProfileData(prev => ({ ...prev, experience: newExperience }));
                        }}
                      />
                      <Textarea
                        placeholder="工作描述"
                        value={exp.description || ''}
                        onChange={(e) => {
                          const newExperience = [...(profileData.experience || [])];
                          newExperience[index] = { ...newExperience[index], description: e.target.value };
                          setProfileData(prev => ({ ...prev, experience: newExperience }));
                        }}
                        rows={3}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const newExperience = (profileData.experience || []).filter((_, i) => i !== index);
                          setProfileData(prev => ({ ...prev, experience: newExperience }));
                        }}
                      >
                        删除
                      </Button>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label>联系信息</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="邮箱"
                      value={profileData.contact?.email || ''}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        contact: { ...prev.contact, email: e.target.value }
                      }))}
                    />
                    <Input
                      placeholder="电话"
                      value={profileData.contact?.phone || ''}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        contact: { ...prev.contact, phone: e.target.value }
                      }))}
                    />
                    <Input
                      placeholder="位置"
                      value={profileData.contact?.location || ''}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        contact: { ...prev.contact, location: e.target.value }
                      }))}
                    />
                    <Input
                      placeholder="个人网站"
                      value={profileData.contact?.website || ''}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        contact: { ...prev.contact, website: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Education Management */}
          <TabsContent value="education" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>教育背景管理</CardTitle>
                  <CardDescription>
                    当前编辑语言: {activeLanguage === 'zh' ? '中文' : 'English'}
                  </CardDescription>
                </div>
                <ActionButtons 
                  section="education"
                  onSaveDraft={() => saveContent('education', educationData, 'draft')}
                  onPublish={() => saveContent('education', educationData, 'published')}
                />
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Education entries */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">教育经历</h3>
                    <Button
                      onClick={() => {
                        setEducationData(prev => ({
                          ...prev,
                          education: [...(prev.education || []), {
                            institution: '',
                            degree: '',
                            major: '',
                            period: '',
                            gpa: '',
                            achievements: [],
                            courses: []
                          }]
                        }));
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      添加教育经历
                    </Button>
                  </div>
                  
                  {(educationData.education || []).map((edu, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="学校名称"
                          value={edu.institution || ''}
                          onChange={(e) => {
                            const newEducation = [...(educationData.education || [])];
                            newEducation[index] = { ...newEducation[index], institution: e.target.value };
                            setEducationData(prev => ({ ...prev, education: newEducation }));
                          }}
                        />
                        <Input
                          placeholder="学位"
                          value={edu.degree || ''}
                          onChange={(e) => {
                            const newEducation = [...(educationData.education || [])];
                            newEducation[index] = { ...newEducation[index], degree: e.target.value };
                            setEducationData(prev => ({ ...prev, education: newEducation }));
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <Input
                          placeholder="专业"
                          value={edu.major || ''}
                          onChange={(e) => {
                            const newEducation = [...(educationData.education || [])];
                            newEducation[index] = { ...newEducation[index], major: e.target.value };
                            setEducationData(prev => ({ ...prev, education: newEducation }));
                          }}
                        />
                        <Input
                          placeholder="时间期间"
                          value={edu.period || ''}
                          onChange={(e) => {
                            const newEducation = [...(educationData.education || [])];
                            newEducation[index] = { ...newEducation[index], period: e.target.value };
                            setEducationData(prev => ({ ...prev, education: newEducation }));
                          }}
                        />
                        <Input
                          placeholder="GPA"
                          value={edu.gpa || ''}
                          onChange={(e) => {
                            const newEducation = [...(educationData.education || [])];
                            newEducation[index] = { ...newEducation[index], gpa: e.target.value };
                            setEducationData(prev => ({ ...prev, education: newEducation }));
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>成就（每行一个）</Label>
                        <Textarea
                          placeholder="请输入成就，每行一个"
                          value={(edu.achievements || []).join('\n')}
                          onChange={(e) => {
                            const newEducation = [...(educationData.education || [])];
                            newEducation[index] = { 
                              ...newEducation[index], 
                              achievements: e.target.value.split('\n').filter(a => a.trim()) 
                            };
                            setEducationData(prev => ({ ...prev, education: newEducation }));
                          }}
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>主要课程（每行一个）</Label>
                        <Textarea
                          placeholder="请输入主要课程，每行一个"
                          value={(edu.courses || []).join('\n')}
                          onChange={(e) => {
                            const newEducation = [...(educationData.education || [])];
                            newEducation[index] = { 
                              ...newEducation[index], 
                              courses: e.target.value.split('\n').filter(c => c.trim()) 
                            };
                            setEducationData(prev => ({ ...prev, education: newEducation }));
                          }}
                          rows={3}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const newEducation = (educationData.education || []).filter((_, i) => i !== index);
                          setEducationData(prev => ({ ...prev, education: newEducation }));
                        }}
                      >
                        删除
                      </Button>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Certifications */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">专业认证</h3>
                    <Button
                      onClick={() => {
                        setEducationData(prev => ({
                          ...prev,
                          certifications: [...(prev.certifications || []), {
                            name: '',
                            issuer: '',
                            date: '',
                            credential: ''
                          }]
                        }));
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      添加认证
                    </Button>
                  </div>
                  
                  {(educationData.certifications || []).map((cert, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="认证名称"
                          value={cert.name || ''}
                          onChange={(e) => {
                            const newCertifications = [...(educationData.certifications || [])];
                            newCertifications[index] = { ...newCertifications[index], name: e.target.value };
                            setEducationData(prev => ({ ...prev, certifications: newCertifications }));
                          }}
                        />
                        <Input
                          placeholder="颁发机构"
                          value={cert.issuer || ''}
                          onChange={(e) => {
                            const newCertifications = [...(educationData.certifications || [])];
                            newCertifications[index] = { ...newCertifications[index], issuer: e.target.value };
                            setEducationData(prev => ({ ...prev, certifications: newCertifications }));
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="获得日期"
                          value={cert.date || ''}
                          onChange={(e) => {
                            const newCertifications = [...(educationData.certifications || [])];
                            newCertifications[index] = { ...newCertifications[index], date: e.target.value };
                            setEducationData(prev => ({ ...prev, certifications: newCertifications }));
                          }}
                        />
                        <Input
                          placeholder="证书编号/链接"
                          value={cert.credential || ''}
                          onChange={(e) => {
                            const newCertifications = [...(educationData.certifications || [])];
                            newCertifications[index] = { ...newCertifications[index], credential: e.target.value };
                            setEducationData(prev => ({ ...prev, certifications: newCertifications }));
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const newCertifications = (educationData.certifications || []).filter((_, i) => i !== index);
                          setEducationData(prev => ({ ...prev, certifications: newCertifications }));
                        }}
                      >
                        删除
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Experience Management */}
          <TabsContent value="experience" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>工作经历管理</CardTitle>
                  <CardDescription>
                    当前编辑语言: {activeLanguage === 'zh' ? '中文' : 'English'}
                  </CardDescription>
                </div>
                <ActionButtons 
                  section="experience"
                  onSaveDraft={() => saveContent('experience', experienceData, 'draft')}
                  onPublish={() => saveContent('experience', experienceData, 'published')}
                />
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Work Experience */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">工作经历</h3>
                    <Button
                      onClick={() => {
                        setExperienceData(prev => ({
                          ...prev,
                          experience: [...(prev.experience || []), {
                            company: '',
                            position: '',
                            location: '',
                            period: '',
                            description: '',
                            achievements: [],
                            technologies: []
                          }]
                        }));
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      添加工作经历
                    </Button>
                  </div>
                  
                  {(experienceData.experience || []).map((exp, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="公司名称"
                          value={exp.company || ''}
                          onChange={(e) => {
                            const newExperience = [...(experienceData.experience || [])];
                            newExperience[index] = { ...newExperience[index], company: e.target.value };
                            setExperienceData(prev => ({ ...prev, experience: newExperience }));
                          }}
                        />
                        <Input
                          placeholder="职位"
                          value={exp.position || ''}
                          onChange={(e) => {
                            const newExperience = [...(experienceData.experience || [])];
                            newExperience[index] = { ...newExperience[index], position: e.target.value };
                            setExperienceData(prev => ({ ...prev, experience: newExperience }));
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="工作地点"
                          value={exp.location || ''}
                          onChange={(e) => {
                            const newExperience = [...(experienceData.experience || [])];
                            newExperience[index] = { ...newExperience[index], location: e.target.value };
                            setExperienceData(prev => ({ ...prev, experience: newExperience }));
                          }}
                        />
                        <Input
                          placeholder="时间期间"
                          value={exp.period || ''}
                          onChange={(e) => {
                            const newExperience = [...(experienceData.experience || [])];
                            newExperience[index] = { ...newExperience[index], period: e.target.value };
                            setExperienceData(prev => ({ ...prev, experience: newExperience }));
                          }}
                        />
                      </div>
                      <Textarea
                        placeholder="工作描述"
                        value={exp.description || ''}
                        onChange={(e) => {
                          const newExperience = [...(experienceData.experience || [])];
                          newExperience[index] = { ...newExperience[index], description: e.target.value };
                          setExperienceData(prev => ({ ...prev, experience: newExperience }));
                        }}
                        rows={3}
                      />
                      <div className="space-y-2">
                        <Label>主要成就（每行一个）</Label>
                        <Textarea
                          placeholder="请输入主要成就，每行一个"
                          value={(exp.achievements || []).join('\n')}
                          onChange={(e) => {
                            const newExperience = [...(experienceData.experience || [])];
                            newExperience[index] = { 
                              ...newExperience[index], 
                              achievements: e.target.value.split('\n').filter(a => a.trim()) 
                            };
                            setExperienceData(prev => ({ ...prev, experience: newExperience }));
                          }}
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>技术栈（用逗号分隔）</Label>
                        <Input
                          placeholder="技术和工具，用逗号分隔"
                          value={(exp.technologies || []).join(', ')}
                          onChange={(e) => {
                            const newExperience = [...(experienceData.experience || [])];
                            newExperience[index] = { 
                              ...newExperience[index], 
                              technologies: e.target.value.split(',').map(t => t.trim()).filter(t => t) 
                            };
                            setExperienceData(prev => ({ ...prev, experience: newExperience }));
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const newExperience = (experienceData.experience || []).filter((_, i) => i !== index);
                          setExperienceData(prev => ({ ...prev, experience: newExperience }));
                        }}
                      >
                        删除
                      </Button>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Skills */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">专业技能</h3>
                    <Button
                      onClick={() => {
                        setExperienceData(prev => ({
                          ...prev,
                          skills: [...(prev.skills || []), {
                            category: '',
                            items: []
                          }]
                        }));
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      添加技能类别
                    </Button>
                  </div>
                  
                  {(experienceData.skills || []).map((skillCategory, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-4">
                      <Input
                        placeholder="技能类别"
                        value={skillCategory.category || ''}
                        onChange={(e) => {
                          const newSkills = [...(experienceData.skills || [])];
                          newSkills[index] = { ...newSkills[index], category: e.target.value };
                          setExperienceData(prev => ({ ...prev, skills: newSkills }));
                        }}
                      />
                      <Textarea
                        placeholder="技能列表（用逗号分隔）"
                        value={(skillCategory.items || []).join(', ')}
                        onChange={(e) => {
                          const newSkills = [...(experienceData.skills || [])];
                          newSkills[index] = { ...newSkills[index], items: e.target.value.split(',').map(s => s.trim()).filter(s => s) };
                          setExperienceData(prev => ({ ...prev, skills: newSkills }));
                        }}
                        rows={2}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const newSkills = (experienceData.skills || []).filter((_, i) => i !== index);
                          setExperienceData(prev => ({ ...prev, skills: newSkills }));
                        }}
                      >
                        删除
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Management */}
          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>项目案例管理</CardTitle>
                  <CardDescription>
                    当前编辑语言: {activeLanguage === 'zh' ? '中文' : 'English'}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => {
                      setEditingProject(null);
                      setShowProjectDialog(true);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    添加项目
                  </Button>
                  <ActionButtons 
                    section="projects"
                    onSaveDraft={() => saveContent('projects', { projects }, 'draft')}
                    onPublish={() => saveContent('projects', { projects }, 'published')}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(projects || []).map((project, index) => (
                    <div key={project.id || index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold">{project.title || '未命名项目'}</h4>
                          <p className="text-sm text-gray-600">{project.category} • {project.period}</p>
                          <p className="text-sm mt-1">{project.description}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => {
                              setEditingProject(project);
                              setShowProjectDialog(true);
                            }}
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>确认删除</AlertDialogTitle>
                                <AlertDialogDescription>
                                  确定要删除项目 "{project.title}" 吗？此操作不可恢复。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction onClick={() => {
                                  const newProjects = projects.filter((_, i) => i !== index);
                                  setProjects(newProjects);
                                  toast.success('项目删除成功');
                                }}>
                                  删除
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(!projects || projects.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      还没有项目，点击"添加项目"开始创建
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Project Dialog */}
            <ProjectForm
              isOpen={showProjectDialog}
              onClose={() => setShowProjectDialog(false)}
              editingProject={editingProject}
              onSave={handleProjectSave}
            />
          </TabsContent>

          {/* Interests Management */}
          <TabsContent value="interests" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>兴趣爱好管理</CardTitle>
                  <CardDescription>
                    当前编辑语言: {activeLanguage === 'zh' ? '中文' : 'English'}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => {
                      setEditingInterest(null);
                      setShowInterestDialog(true);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    添加兴趣
                  </Button>
                  <ActionButtons 
                    section="interests"
                    onSaveDraft={() => saveContent('interests', { interests }, 'draft')}
                    onPublish={() => saveContent('interests', { interests }, 'published')}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(interests || []).map((interest, index) => (
                    <div key={interest.id || index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold">{interest.title || '未命名兴趣'}</h4>
                          <p className="text-sm text-gray-600">{interest.category}</p>
                          <p className="text-sm mt-1">{interest.description}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => {
                              setEditingInterest(interest);
                              setShowInterestDialog(true);
                            }}
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>确认删除</AlertDialogTitle>
                                <AlertDialogDescription>
                                  确定要删除兴趣 "{interest.title}" 吗？此操作不可恢复。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction onClick={() => {
                                  const newInterests = interests.filter((_, i) => i !== index);
                                  setInterests(newInterests);
                                  toast.success('兴趣删除成功');
                                }}>
                                  删除
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(!interests || interests.length === 0) && (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      还没有兴趣爱好，点击"添加兴趣"开始创建
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Interest Dialog */}
            <Dialog open={showInterestDialog} onOpenChange={setShowInterestDialog}>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>{editingInterest ? '编辑兴趣' : '添加兴趣'}</DialogTitle>
                  <DialogDescription>
                    填写兴趣爱好的详细信息
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const interestData = {
                    id: editingInterest?.id || Date.now().toString(),
                    title: formData.get('title') as string,
                    category: formData.get('category') as string,
                    description: formData.get('description') as string,
                    level: formData.get('level') as string,
                    achievements: (formData.get('achievements') as string).split('\n').filter(a => a.trim()),
                    resources: (formData.get('resources') as string).split('\n').filter(r => r.trim())
                  };

                  handleInterestSave(interestData);
                  setShowInterestDialog(false);
                  setEditingInterest(null);
                  toast.success(editingInterest ? '兴趣更新成功' : '兴趣添加成功');
                }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">兴趣名称*</Label>
                      <Input
                        id="title"
                        name="title"
                        defaultValue={editingInterest?.title || ''}
                        required
                        placeholder="兴趣名称"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">兴趣类别</Label>
                      <Select name="category" defaultValue={editingInterest?.category || ''}>
                        <SelectTrigger>
                          <SelectValue placeholder="选择类别" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="艺术">艺术</SelectItem>
                          <SelectItem value="音乐">音乐</SelectItem>
                          <SelectItem value="运动">运动</SelectItem>
                          <SelectItem value="技术">技术</SelectItem>
                          <SelectItem value="阅读">阅读</SelectItem>
                          <SelectItem value="旅行">旅行</SelectItem>
                          <SelectItem value="摄影">摄影</SelectItem>
                          <SelectItem value="其他">其他</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">详细描述</Label>
                    <Textarea
                      id="description"
                      name="description"
                      defaultValue={editingInterest?.description || ''}
                      rows={3}
                      placeholder="描述这个兴趣爱好"
                    />
                  </div>

                  <div>
                    <Label htmlFor="level">水平程度</Label>
                    <Select name="level" defaultValue={editingInterest?.level || ''}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择水平" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="初学者">初学者</SelectItem>
                        <SelectItem value="中级">中级</SelectItem>
                        <SelectItem value="高级">高级</SelectItem>
                        <SelectItem value="专业">专业</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="achievements">相关成就</Label>
                    <Textarea
                      id="achievements"
                      name="achievements"
                      defaultValue={editingInterest?.achievements?.join('\n') || ''}
                      rows={2}
                      placeholder="每行一个成就"
                    />
                  </div>

                  <div>
                    <Label htmlFor="resources">相关资源/链接</Label>
                    <Textarea
                      id="resources"
                      name="resources"
                      defaultValue={editingInterest?.resources?.join('\n') || ''}
                      rows={2}
                      placeholder="每行一个资源或链接"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowInterestDialog(false)}>
                      取消
                    </Button>
                    <Button type="submit">
                      {editingInterest ? '更新兴趣' : '添加兴趣'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Contact Management */}
          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>联系信息管理</CardTitle>
                  <CardDescription>
                    当前编辑语言: {activeLanguage === 'zh' ? '中文' : 'English'}
                  </CardDescription>
                </div>
                <ActionButtons 
                  section="contact"
                  onSaveDraft={() => saveContent('contact', contactData, 'draft')}
                  onPublish={() => saveContent('contact', contactData, 'published')}
                />
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Contact Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">基本联系信息</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact-email">邮箱</Label>
                      <Input
                        id="contact-email"
                        value={contactData.contactInfo?.email || ''}
                        onChange={(e) => setContactData(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, email: e.target.value }
                        }))}
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-phone">电话</Label>
                      <Input
                        id="contact-phone"
                        value={contactData.contactInfo?.phone || ''}
                        onChange={(e) => setContactData(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, phone: e.target.value }
                        }))}
                        placeholder="+86 138 0000 0000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-location">地址</Label>
                      <Input
                        id="contact-location"
                        value={contactData.contactInfo?.location || ''}
                        onChange={(e) => setContactData(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, location: e.target.value }
                        }))}
                        placeholder="城市, 国家"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-website">个人网站</Label>
                      <Input
                        id="contact-website"
                        value={contactData.contactInfo?.website || ''}
                        onChange={(e) => setContactData(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, website: e.target.value }
                        }))}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-wechat">微信</Label>
                      <Input
                        id="contact-wechat"
                        value={contactData.contactInfo?.wechat || ''}
                        onChange={(e) => setContactData(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, wechat: e.target.value }
                        }))}
                        placeholder="微信号"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-linkedin">LinkedIn</Label>
                      <Input
                        id="contact-linkedin"
                        value={contactData.contactInfo?.linkedin || ''}
                        onChange={(e) => setContactData(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, linkedin: e.target.value }
                        }))}
                        placeholder="LinkedIn Profile URL"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Social Media */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">社交媒体</h3>
                    <Button
                      onClick={() => {
                        setContactData(prev => ({
                          ...prev,
                          socialMedia: [...(prev.socialMedia || []), { platform: '', username: '', url: '' }]
                        }));
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      添加社交媒体
                    </Button>
                  </div>
                  
                  {(contactData.socialMedia || []).map((social, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="grid grid-cols-3 gap-4">
                        <Input
                          placeholder="平台名称"
                          value={social.platform || ''}
                          onChange={(e) => {
                            const newSocialMedia = [...(contactData.socialMedia || [])];
                            newSocialMedia[index] = { ...newSocialMedia[index], platform: e.target.value };
                            setContactData(prev => ({ ...prev, socialMedia: newSocialMedia }));
                          }}
                        />
                        <Input
                          placeholder="用户名"
                          value={social.username || ''}
                          onChange={(e) => {
                            const newSocialMedia = [...(contactData.socialMedia || [])];
                            newSocialMedia[index] = { ...newSocialMedia[index], username: e.target.value };
                            setContactData(prev => ({ ...prev, socialMedia: newSocialMedia }));
                          }}
                        />
                        <Input
                          placeholder="链接URL"
                          value={social.url || ''}
                          onChange={(e) => {
                            const newSocialMedia = [...(contactData.socialMedia || [])];
                            newSocialMedia[index] = { ...newSocialMedia[index], url: e.target.value };
                            setContactData(prev => ({ ...prev, socialMedia: newSocialMedia }));
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const newSocialMedia = (contactData.socialMedia || []).filter((_, i) => i !== index);
                          setContactData(prev => ({ ...prev, socialMedia: newSocialMedia }));
                        }}
                      >
                        删除
                      </Button>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Collaboration Areas */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">合作领域</h3>
                    <Button
                      onClick={() => {
                        setContactData(prev => ({
                          ...prev,
                          collaborationAreas: [...(prev.collaborationAreas || []), '']
                        }));
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      添加合作领域
                    </Button>
                  </div>
                  
                  {(contactData.collaborationAreas || []).map((area, index) => (
                    <div key={index} className="flex space-x-2">
                      <Input
                        placeholder="合作领域"
                        value={area}
                        onChange={(e) => {
                          const newAreas = [...(contactData.collaborationAreas || [])];
                          newAreas[index] = e.target.value;
                          setContactData(prev => ({ ...prev, collaborationAreas: newAreas }));
                        }}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const newAreas = (contactData.collaborationAreas || []).filter((_, i) => i !== index);
                          setContactData(prev => ({ ...prev, collaborationAreas: newAreas }));
                        }}
                      >
                        删除
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media Management Tab */}
          <TabsContent value="media" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>媒体文件管理</CardTitle>
                <CardDescription>管理所有上传的图片、音频、视频和文档文件</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Upload Section */}
                  <MediaUploadZone 
                    onFileSelect={async (files) => {
                      for (const file of Array.from(files)) {
                        try {
                          await uploadFile(file);
                          toast.success(`${file.name} 上传成功`);
                        } catch (error) {
                          toast.error(`${file.name} 上传失败`);
                        }
                      }
                      await loadData(); // Refresh media list
                    }}
                  />

                  {/* Media Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {(mediaFiles || []).map((file, index) => (
                      <MediaFileCard
                        key={index}
                        file={file}
                        onDelete={deleteMediaFile}
                      />
                    ))}
                  </div>

                  {(!mediaFiles || mediaFiles.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      还没有上传任何文件
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Design/Theme Management */}
          <TabsContent value="design" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>设计主题管理</CardTitle>
                  <CardDescription>自定义网站的外观和样式</CardDescription>
                </div>
                <ActionButtons 
                  section="theme"
                  onSaveDraft={() => saveContent('theme', themeData, 'draft')}
                  onPublish={() => saveContent('theme', themeData, 'published')}
                />
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Colors */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">颜色配置</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(themeData.colors || {}).map(([key, value]) => (
                      <div key={key}>
                        <Label htmlFor={`color-${key}`}>{key}</Label>
                        <div className="flex space-x-2">
                          <Input
                            id={`color-${key}`}
                            type="color"
                            value={value}
                            onChange={(e) => setThemeData(prev => ({
                              ...prev,
                              colors: { ...prev.colors, [key]: e.target.value }
                            }))}
                            className="w-16 h-10 rounded cursor-pointer"
                          />
                          <Input
                            value={value}
                            onChange={(e) => setThemeData(prev => ({
                              ...prev,
                              colors: { ...prev.colors, [key]: e.target.value }
                            }))}
                            placeholder="#000000"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Typography */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">字体配置</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="heading-font">标题字体</Label>
                      <Select 
                        value={themeData.fonts?.heading || 'Inter'} 
                        onValueChange={(value) => setThemeData(prev => ({
                          ...prev,
                          fonts: { ...prev.fonts, heading: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Helvetica">Helvetica</SelectItem>
                          <SelectItem value="Arial">Arial</SelectItem>
                          <SelectItem value="Georgia">Georgia</SelectItem>
                          <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="body-font">正文字体</Label>
                      <Select 
                        value={themeData.fonts?.body || 'Inter'} 
                        onValueChange={(value) => setThemeData(prev => ({
                          ...prev,
                          fonts: { ...prev.fonts, body: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Helvetica">Helvetica</SelectItem>
                          <SelectItem value="Arial">Arial</SelectItem>
                          <SelectItem value="Georgia">Georgia</SelectItem>
                          <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Spacing */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">间距配置</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="container-width">容器最大宽度</Label>
                      <Input
                        id="container-width"
                        value={themeData.spacing?.containerMaxWidth || ''}
                        onChange={(e) => setThemeData(prev => ({
                          ...prev,
                          spacing: { ...prev.spacing, containerMaxWidth: e.target.value }
                        }))}
                        placeholder="1200px"
                      />
                    </div>
                    <div>
                      <Label htmlFor="section-padding">章节内边距</Label>
                      <Input
                        id="section-padding"
                        value={themeData.spacing?.sectionPadding || ''}
                        onChange={(e) => setThemeData(prev => ({
                          ...prev,
                          spacing: { ...prev.spacing, sectionPadding: e.target.value }
                        }))}
                        placeholder="4rem"
                      />
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">预览</h3>
                  <div 
                    className="p-6 rounded-lg border-2 border-dashed"
                    style={{
                      backgroundColor: themeData.colors?.background,
                      color: themeData.colors?.foreground,
                      fontFamily: themeData.fonts?.body
                    }}
                  >
                    <h1 
                      style={{ 
                        fontFamily: themeData.fonts?.heading, 
                        color: themeData.colors?.primary 
                      }}
                    >
                      标题样式预览
                    </h1>
                    <p>这是正文字体的预览效果。</p>
                    <button 
                      style={{ 
                        backgroundColor: themeData.colors?.accent, 
                        color: themeData.colors?.background,
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '4px',
                        marginTop: '8px'
                      }}
                    >
                      按钮预览
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}