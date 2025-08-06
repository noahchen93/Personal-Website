import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { MarkdownEditor } from '../MarkdownEditor';
import { 
  Plus, Edit, Trash2, Save, X, CalendarDays, ExternalLink,
  FolderOpen, Star, Tag, Link, Image, Palette, Code
} from 'lucide-react';

interface ProjectLink {
  type: string;
  url: string;
  label: string;
}

interface ProjectItem {
  id: number;
  title: string;
  description: string;
  longDescription: string;
  category: string;
  tags: string[];
  images: string[];
  links: ProjectLink[];
  startDate: string;
  endDate: string;
  featured: boolean;
  status: string;
  technologies: string[];
  role: string;
}

interface ProjectsEditorProps {
  data: ProjectItem[];
  onSave: (data: ProjectItem[]) => void;
  language: string;
}

export function ProjectsEditor({ data, onSave, language }: ProjectsEditorProps) {
  const [items, setItems] = useState<ProjectItem[]>(data || []);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<Partial<ProjectItem>>({});

  const texts = {
    zh: {
      title: '项目案例管理',
      addNew: '添加项目',
      edit: '编辑',
      delete: '删除',
      save: '保存',
      cancel: '取消',
      projectTitle: '项目名称',
      description: '简短描述',
      longDescription: '详细描述',
      category: '项目分类',
      tags: '标签 (每行一个)',
      startDate: '开始时间',
      endDate: '结束时间',
      current: '进行中',
      featured: '精选项目',
      status: '项目状态',
      technologies: '使用技术 (每行一个)',
      role: '我的角色',
      links: '项目链接',
      linkType: '链接类型',
      linkUrl: '链接地址',
      linkLabel: '链接标题',
      addLink: '添加链接',
      removeLink: '移除',
      required: '必填项',
      confirmDelete: '确认删除这个项目吗？',
      saved: '项目数据已保存',
      completed: '已完成',
      inProgress: '进行中',
      paused: '暂停',
      cancelled: '已取消',
      website: '项目网站',
      github: 'GitHub',
      demo: '演示',
      documentation: '文档'
    },
    en: {
      title: 'Projects Management',
      addNew: 'Add Project',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel',
      projectTitle: 'Project Title',
      description: 'Short Description',
      longDescription: 'Detailed Description',
      category: 'Category',
      tags: 'Tags (one per line)',
      startDate: 'Start Date',
      endDate: 'End Date',
      current: 'Ongoing',
      featured: 'Featured Project',
      status: 'Status',
      technologies: 'Technologies (one per line)',
      role: 'My Role',
      links: 'Project Links',
      linkType: 'Link Type',
      linkUrl: 'URL',
      linkLabel: 'Label',
      addLink: 'Add Link',
      removeLink: 'Remove',
      required: 'Required',
      confirmDelete: 'Are you sure you want to delete this project?',
      saved: 'Projects data saved',
      completed: 'Completed',
      inProgress: 'In Progress',
      paused: 'Paused',
      cancelled: 'Cancelled',
      website: 'Website',
      github: 'GitHub',
      demo: 'Demo',
      documentation: 'Documentation'
    }
  };

  const t = texts[language];

  const statusOptions = [
    { value: 'completed', label: t.completed },
    { value: 'in-progress', label: t.inProgress },
    { value: 'paused', label: t.paused },
    { value: 'cancelled', label: t.cancelled }
  ];

  const linkTypes = [
    { value: 'website', label: t.website },
    { value: 'github', label: t.github },
    { value: 'demo', label: t.demo },
    { value: 'documentation', label: t.documentation }
  ];

  useEffect(() => {
    setItems(data || []);
  }, [data]);

  const handleSave = () => {
    onSave(items);
  };

  const handleAdd = () => {
    const newItem: ProjectItem = {
      id: Date.now(),
      title: '',
      description: '',
      longDescription: '',
      category: '',
      tags: [],
      images: [],
      links: [],
      startDate: '',
      endDate: '',
      featured: false,
      status: 'completed',
      technologies: [],
      role: ''
    };
    setEditingItem(newItem);
    setEditingId(newItem.id);
  };

  const handleEdit = (item: ProjectItem) => {
    setEditingItem({ ...item });
    setEditingId(item.id);
  };

  const handleSaveItem = () => {
    if (!editingItem.title || !editingItem.description) {
      alert(t.required);
      return;
    }

    const updatedItems = editingId === editingItem.id 
      ? items.map(item => item.id === editingId ? editingItem as ProjectItem : item)
      : [...items, editingItem as ProjectItem];

    setItems(updatedItems);
    setEditingId(null);
    setEditingItem({});
  };

  const handleDelete = (id: number) => {
    if (confirm(t.confirmDelete)) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingItem({});
  };

  const handleAddLink = () => {
    const newLink: ProjectLink = { type: 'website', url: '', label: '' };
    setEditingItem(prev => ({
      ...prev,
      links: [...(prev.links || []), newLink]
    }));
  };

  const handleRemoveLink = (index: number) => {
    setEditingItem(prev => ({
      ...prev,
      links: (prev.links || []).filter((_, i) => i !== index)
    }));
  };

  const handleLinkChange = (index: number, field: keyof ProjectLink, value: string) => {
    setEditingItem(prev => ({
      ...prev,
      links: (prev.links || []).map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    if (dateString === 'present') return t.current;
    return dateString;
  };

  const renderEditForm = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FolderOpen className="w-5 h-5 mr-2" />
          {editingId === editingItem.id ? t.addNew : t.edit}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="title">{t.projectTitle} *</Label>
            <Input
              id="title"
              value={editingItem.title || ''}
              onChange={(e) => setEditingItem(prev => ({ ...prev, title: e.target.value }))}
              placeholder={t.projectTitle}
              className="bg-input-background"
            />
          </div>
          
          <div>
            <Label htmlFor="category">{t.category}</Label>
            <Input
              id="category"
              value={editingItem.category || ''}
              onChange={(e) => setEditingItem(prev => ({ ...prev, category: e.target.value }))}
              placeholder={t.category}
              className="bg-input-background"
            />
          </div>

          <div>
            <Label htmlFor="role">{t.role}</Label>
            <Input
              id="role"
              value={editingItem.role || ''}
              onChange={(e) => setEditingItem(prev => ({ ...prev, role: e.target.value }))}
              placeholder={t.role}
              className="bg-input-background"
            />
          </div>

          <div>
            <Label htmlFor="startDate">{t.startDate}</Label>
            <Input
              id="startDate"
              value={editingItem.startDate || ''}
              onChange={(e) => setEditingItem(prev => ({ ...prev, startDate: e.target.value }))}
              placeholder="YYYY-MM"
              className="bg-input-background"
            />
          </div>

          <div>
            <Label htmlFor="endDate">{t.endDate}</Label>
            <Input
              id="endDate"
              value={editingItem.endDate || ''}
              onChange={(e) => setEditingItem(prev => ({ ...prev, endDate: e.target.value }))}
              placeholder={`YYYY-MM ${language === 'zh' ? '或' : 'or'} present`}
              className="bg-input-background"
            />
          </div>

          <div>
            <Label htmlFor="status">{t.status}</Label>
            <Select
              value={editingItem.status || 'completed'}
              onValueChange={(value) => setEditingItem(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="bg-input-background">
                <SelectValue placeholder={t.status} />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={editingItem.featured || false}
              onCheckedChange={(checked) => setEditingItem(prev => ({ ...prev, featured: checked }))}
            />
            <Label htmlFor="featured">{t.featured}</Label>
          </div>
        </div>

        <div>
          <Label htmlFor="description">{t.description} *</Label>
          <Textarea
            id="description"
            value={editingItem.description || ''}
            onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
            placeholder={t.description}
            rows={2}
            className="bg-input-background"
          />
        </div>

        <div>
          <Label htmlFor="longDescription">{t.longDescription}</Label>
          <MarkdownEditor
            value={editingItem.longDescription || ''}
            onChange={(value) => setEditingItem(prev => ({ ...prev, longDescription: value }))}
            placeholder={t.longDescription}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tags">{t.tags}</Label>
            <Textarea
              id="tags"
              value={editingItem.tags?.join('\n') || ''}
              onChange={(e) => setEditingItem(prev => ({ 
                ...prev, 
                tags: e.target.value.split('\n').filter(Boolean) 
              }))}
              placeholder={t.tags}
              rows={3}
              className="bg-input-background"
            />
          </div>

          <div>
            <Label htmlFor="technologies">{t.technologies}</Label>
            <Textarea
              id="technologies"
              value={editingItem.technologies?.join('\n') || ''}
              onChange={(e) => setEditingItem(prev => ({ 
                ...prev, 
                technologies: e.target.value.split('\n').filter(Boolean) 
              }))}
              placeholder={t.technologies}
              rows={3}
              className="bg-input-background"
            />
          </div>
        </div>

        {/* Project Links */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label>{t.links}</Label>
            <Button type="button" variant="outline" size="sm" onClick={handleAddLink}>
              <Plus className="w-4 h-4 mr-1" />
              {t.addLink}
            </Button>
          </div>
          
          {(editingItem.links || []).map((link, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2 p-3 border rounded-md">
              <Select
                value={link.type}
                onValueChange={(value) => handleLinkChange(index, 'type', value)}
              >
                <SelectTrigger className="bg-input-background">
                  <SelectValue placeholder={t.linkType} />
                </SelectTrigger>
                <SelectContent>
                  {linkTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Input
                value={link.url}
                onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                placeholder={t.linkUrl}
                className="bg-input-background"
              />
              
              <Input
                value={link.label}
                onChange={(e) => handleLinkChange(index, 'label', e.target.value)}
                placeholder={t.linkLabel}
                className="bg-input-background"
              />
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleRemoveLink(index)}
                className="text-destructive hover:text-destructive"
              >
                {t.removeLink}
              </Button>
            </div>
          ))}
        </div>

        <div className="flex space-x-2">
          <Button onClick={handleSaveItem} className="bg-primary text-primary-foreground">
            <Save className="w-4 h-4 mr-2" />
            {t.save}
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            <X className="w-4 h-4 mr-2" />
            {t.cancel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderProjectItem = (item: ProjectItem) => (
    <Card key={item.id} className="mb-4">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
              {item.featured && (
                <Badge variant="default" className="bg-accent text-accent-foreground">
                  <Star className="w-3 h-3 mr-1" />
                  {language === 'zh' ? '精选' : 'Featured'}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">{item.description}</p>
            {item.category && (
              <p className="text-sm text-muted-foreground">
                <Palette className="w-4 h-4 inline mr-1" />
                {item.category}
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(item)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(item.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarDays className="w-4 h-4 mr-1" />
            {formatDate(item.startDate)} - {formatDate(item.endDate)}
          </div>

          {item.role && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Code className="w-4 h-4 mr-1" />
              {item.role}
            </div>
          )}
          
          <div>
            <Badge variant="secondary">
              {statusOptions.find(status => status.value === item.status)?.label || item.status}
            </Badge>
          </div>
        </div>

        {item.longDescription && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {item.longDescription}
            </p>
          </div>
        )}

        {item.tags && item.tags.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-foreground mb-2 flex items-center">
              <Tag className="w-4 h-4 mr-1" />
              {language === 'zh' ? '标签' : 'Tags'}
            </h4>
            <div className="flex flex-wrap gap-1">
              {item.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {item.technologies && item.technologies.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-foreground mb-2 flex items-center">
              <Code className="w-4 h-4 mr-1" />
              {language === 'zh' ? '技术栈' : 'Technologies'}
            </h4>
            <div className="flex flex-wrap gap-1">
              {item.technologies.map((tech, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {item.links && item.links.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2 flex items-center">
              <Link className="w-4 h-4 mr-1" />
              {language === 'zh' ? '项目链接' : 'Links'}
            </h4>
            <div className="flex flex-wrap gap-2">
              {item.links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-foreground">{t.title}</h2>
        <Button onClick={handleAdd} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          {t.addNew}
        </Button>
      </div>

      {editingId && renderEditForm()}

      <div className="space-y-4">
        {items.map(renderProjectItem)}
      </div>

      {items.length === 0 && !editingId && (
        <Alert>
          <FolderOpen className="h-4 w-4" />
          <AlertDescription>
            {language === 'zh' 
              ? '还没有添加项目案例。点击上方按钮开始添加。'
              : 'No projects added yet. Click the button above to get started.'
            }
          </AlertDescription>
        </Alert>
      )}

      <Button 
        onClick={handleSave} 
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
        size="lg"
      >
        <Save className="w-4 h-4 mr-2" />
        {t.saved}
      </Button>
    </div>
  );
}