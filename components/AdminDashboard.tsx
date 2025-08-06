import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  BarChart3, 
  MessageSquare, 
  FolderOpen,
  PenTool,
  Users,
  Clock,
  TrendingUp
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { getAccessToken } from '../utils/supabase/client';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  tags: string[];
  year: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string;
  status: 'new' | 'read' | 'replied';
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export function AdminDashboard({ onClose }: { onClose: () => void }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);

  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    category: 'design',
    image: '',
    tags: '',
    year: new Date().getFullYear().toString(),
    status: 'draft' as 'draft' | 'published'
  });

  useEffect(() => {
    loadData();
  }, []);

  const makeRequest = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const token = await getAccessToken();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c529659a${endpoint}`,
        {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : `Bearer ${publicAnonKey}`,
            ...options.headers,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || 'Request failed');
      }

      return response.json();
    } catch (error: any) {
      console.error('API request error:', error);
      throw error;
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const [projectsRes, contactsRes, analyticsRes] = await Promise.all([
        makeRequest('/projects'),
        makeRequest('/contact'),
        makeRequest('/analytics')
      ]);

      setProjects(projectsRes.projects || []);
      setContacts(contactsRes.submissions || []);
      setAnalytics(analyticsRes.analytics || {});
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('加载管理数据失败: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    try {
      const projectData = {
        ...projectForm,
        tags: projectForm.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };

      await makeRequest('/projects', {
        method: 'POST',
        body: JSON.stringify(projectData)
      });

      toast.success('项目创建成功');
      setIsProjectDialogOpen(false);
      setProjectForm({
        title: '',
        description: '',
        category: 'design',
        image: '',
        tags: '',
        year: new Date().getFullYear().toString(),
        status: 'draft'
      });
      loadData();
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('创建项目失败: ' + error.message);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('确定要删除这个项目吗？')) return;

    try {
      await makeRequest(`/projects/${id}`, {
        method: 'DELETE'
      });

      toast.success('项目删除成功');
      loadData();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('删除项目失败: ' + error.message);
    }
  };

  const handleUpdateProjectStatus = async (id: string, status: 'draft' | 'published') => {
    try {
      await makeRequest(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });

      toast.success(`项目${status === 'published' ? '发布' : '保存为草稿'}成功`);
      loadData();
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('更新项目状态失败: ' + error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>加载管理面板...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">管理面板</h1>
          <Button onClick={onClose} variant="outline">
            退出管理模式
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              概览
            </TabsTrigger>
            <TabsTrigger value="projects">
              <FolderOpen className="w-4 h-4 mr-2" />
              项目管理
            </TabsTrigger>
            <TabsTrigger value="contacts">
              <MessageSquare className="w-4 h-4 mr-2" />
              联系消息
            </TabsTrigger>
            <TabsTrigger value="blog">
              <PenTool className="w-4 h-4 mr-2" />
              博客管理
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">总项目数</CardTitle>
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.totalProjects || 0}</div>
                  <p className="text-xs text-muted-foreground">+2 较上月</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">联系消息</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.totalContacts || 0}</div>
                  <p className="text-xs text-muted-foreground">+5 较上周</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">博客文章</CardTitle>
                  <PenTool className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.totalBlogPosts || 0}</div>
                  <p className="text-xs text-muted-foreground">+1 较上月</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Contacts */}
            <Card>
              <CardHeader>
                <CardTitle>近期联系消息</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.recentContacts?.slice(0, 5).map((contact: Contact) => (
                    <div key={contact.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">{contact.name}</span>
                          <Badge variant={contact.status === 'new' ? 'default' : 'secondary'}>
                            {contact.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{contact.subject}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(contact.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  )) || <p className="text-muted-foreground">暂无联系消息</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">项目管理</h2>
              <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    新建项目
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>创建新项目</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">项目标题</Label>
                      <Input
                        id="title"
                        value={projectForm.title}
                        onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                        placeholder="输入项目标题"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">项目描述</Label>
                      <Textarea
                        id="description"
                        value={projectForm.description}
                        onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                        placeholder="输入项目描述"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">项目分类</Label>
                        <Select value={projectForm.category} onValueChange={(value) => setProjectForm({ ...projectForm, category: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="选择分类" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="design">设计作品</SelectItem>
                            <SelectItem value="exhibition">策展项目</SelectItem>
                            <SelectItem value="ai">AI实验</SelectItem>
                            <SelectItem value="3d">3D打印</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="year">年份</Label>
                        <Input
                          id="year"
                          value={projectForm.year}
                          onChange={(e) => setProjectForm({ ...projectForm, year: e.target.value })}
                          placeholder="2024"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="image">项目图片URL</Label>
                      <Input
                        id="image"
                        value={projectForm.image}
                        onChange={(e) => setProjectForm({ ...projectForm, image: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div>
                      <Label htmlFor="tags">标签 (用逗号分隔)</Label>
                      <Input
                        id="tags"
                        value={projectForm.tags}
                        onChange={(e) => setProjectForm({ ...projectForm, tags: e.target.value })}
                        placeholder="UI/UX, 移动应用, 创新"
                      />
                    </div>

                    <div>
                      <Label htmlFor="status">状态</Label>
                      <Select value={projectForm.status} onValueChange={(value: 'draft' | 'published') => setProjectForm({ ...projectForm, status: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="选择状态" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">草稿</SelectItem>
                          <SelectItem value="published">已发布</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" onClick={() => setIsProjectDialogOpen(false)}>
                        取消
                      </Button>
                      <Button onClick={handleCreateProject}>
                        创建项目
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id}>
                  <CardContent className="p-4">
                    <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden">
                      {project.image && (
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold truncate">{project.title}</h3>
                        <Badge variant={project.status === 'published' ? 'default' : 'secondary'}>
                          {project.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {project.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-1">
                        {project.tags?.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-xs text-muted-foreground">
                          {project.year}
                        </span>
                        
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateProjectStatus(
                              project.id,
                              project.status === 'published' ? 'draft' : 'published'
                            )}
                          >
                            {project.status === 'published' ? '取消发布' : '发布'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {projects.length === 0 && (
              <div className="text-center py-12">
                <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">还没有项目，创建第一个项目吧！</p>
              </div>
            )}
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="space-y-6">
            <h2 className="text-2xl font-bold">联系消息</h2>
            
            <div className="space-y-4">
              {contacts.map((contact) => (
                <Card key={contact.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold">{contact.name}</h3>
                          <Badge variant={contact.status === 'new' ? 'default' : 'secondary'}>
                            {contact.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{contact.email}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(contact.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">主题: {contact.subject}</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {contact.message}
                      </p>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        标记为已读
                      </Button>
                      <Button size="sm">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        回复
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {contacts.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">暂无联系消息</p>
              </div>
            )}
          </TabsContent>

          {/* Blog Tab */}
          <TabsContent value="blog" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">博客管理</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                新建文章
              </Button>
            </div>
            
            <div className="text-center py-12">
              <PenTool className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">博客功能开发中...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}