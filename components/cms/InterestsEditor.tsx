import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { MarkdownEditor } from '../MarkdownEditor';
import { 
  Plus, Edit, Trash2, Save, X, Heart, ExternalLink,
  Tag, Link, Image, Palette
} from 'lucide-react';

interface InterestLink {
  type: string;
  url: string;
  label: string;
}

interface InterestItem {
  id: number;
  category: string;
  title: string;
  description: string;
  images: string[];
  links: InterestLink[];
  tags: string[];
}

interface InterestsEditorProps {
  data: InterestItem[];
  onSave: (data: InterestItem[]) => void;
  language: string;
}

export function InterestsEditor({ data, onSave, language }: InterestsEditorProps) {
  const [items, setItems] = useState<InterestItem[]>(data || []);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<Partial<InterestItem>>({});

  const texts = {
    zh: {
      title: '兴趣爱好管理',
      addNew: '添加兴趣',
      edit: '编辑',
      delete: '删除',
      save: '保存',
      cancel: '取消',
      category: '分类',
      interestTitle: '标题',
      description: '描述',
      tags: '标签 (每行一个)',
      links: '相关链接',
      linkType: '链接类型',
      linkUrl: '链接地址',
      linkLabel: '链接标题',
      addLink: '添加链接',
      removeLink: '移除',
      required: '必填项',
      confirmDelete: '确认删除这个兴趣项目吗？',
      saved: '兴趣数据已保存',
      portfolio: '作品集',
      blog: '博客',
      social: '社交媒体',
      website: '网站',
      github: 'GitHub',
      other: '其他'
    },
    en: {
      title: 'Interests Management',
      addNew: 'Add Interest',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel',
      category: 'Category',
      interestTitle: 'Title',
      description: 'Description',
      tags: 'Tags (one per line)',
      links: 'Related Links',
      linkType: 'Link Type',
      linkUrl: 'URL',
      linkLabel: 'Label',
      addLink: 'Add Link',
      removeLink: 'Remove',
      required: 'Required',
      confirmDelete: 'Are you sure you want to delete this interest?',
      saved: 'Interests data saved',
      portfolio: 'Portfolio',
      blog: 'Blog',
      social: 'Social Media',
      website: 'Website',
      github: 'GitHub',
      other: 'Other'
    }
  };

  const t = texts[language];

  const linkTypes = [
    { value: 'portfolio', label: t.portfolio },
    { value: 'blog', label: t.blog },
    { value: 'social', label: t.social },
    { value: 'website', label: t.website },
    { value: 'github', label: t.github },
    { value: 'other', label: t.other }
  ];

  useEffect(() => {
    setItems(data || []);
  }, [data]);

  const handleSave = () => {
    onSave(items);
  };

  const handleAdd = () => {
    const newItem: InterestItem = {
      id: Date.now(),
      category: '',
      title: '',
      description: '',
      images: [],
      links: [],
      tags: []
    };
    setEditingItem(newItem);
    setEditingId(newItem.id);
  };

  const handleEdit = (item: InterestItem) => {
    setEditingItem({ ...item });
    setEditingId(item.id);
  };

  const handleSaveItem = () => {
    if (!editingItem.title || !editingItem.category) {
      alert(t.required);
      return;
    }

    const updatedItems = editingId === editingItem.id 
      ? items.map(item => item.id === editingId ? editingItem as InterestItem : item)
      : [...items, editingItem as InterestItem];

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
    const newLink: InterestLink = { type: 'website', url: '', label: '' };
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

  const handleLinkChange = (index: number, field: keyof InterestLink, value: string) => {
    setEditingItem(prev => ({
      ...prev,
      links: (prev.links || []).map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const renderEditForm = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Heart className="w-5 h-5 mr-2" />
          {editingId === editingItem.id ? t.addNew : t.edit}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">{t.category} *</Label>
            <Input
              id="category"
              value={editingItem.category || ''}
              onChange={(e) => setEditingItem(prev => ({ ...prev, category: e.target.value }))}
              placeholder={t.category}
              className="bg-input-background"
            />
          </div>
          
          <div>
            <Label htmlFor="title">{t.interestTitle} *</Label>
            <Input
              id="title"
              value={editingItem.title || ''}
              onChange={(e) => setEditingItem(prev => ({ ...prev, title: e.target.value }))}
              placeholder={t.interestTitle}
              className="bg-input-background"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">{t.description}</Label>
          <MarkdownEditor
            value={editingItem.description || ''}
            onChange={(value) => setEditingItem(prev => ({ ...prev, description: value }))}
            placeholder={t.description}
          />
        </div>

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

        {/* Links */}
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
              <select
                value={link.type}
                onChange={(e) => handleLinkChange(index, 'type', e.target.value)}
                className="px-3 py-2 border rounded-md bg-input-background"
              >
                {linkTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              
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

  const renderInterestItem = (item: InterestItem) => (
    <Card key={item.id} className="mb-4">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="secondary" className="bg-accent/10 text-accent-foreground">
                <Palette className="w-3 h-3 mr-1" />
                {item.category}
              </Badge>
            </div>
            <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
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

        {item.description && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {item.description}
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
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {item.links && item.links.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2 flex items-center">
              <Link className="w-4 h-4 mr-1" />
              {language === 'zh' ? '相关链接' : 'Links'}
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
        {items.map(renderInterestItem)}
      </div>

      {items.length === 0 && !editingId && (
        <Alert>
          <Heart className="h-4 w-4" />
          <AlertDescription>
            {language === 'zh' 
              ? '还没有添加兴趣爱好。点击上方按钮开始添加。'
              : 'No interests added yet. Click the button above to get started.'
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