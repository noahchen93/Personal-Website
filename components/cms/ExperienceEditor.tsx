import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { MarkdownEditor } from '../MarkdownEditor';
import { 
  Plus, Edit, Trash2, Save, X, CalendarDays,
  Building, MapPin, Users, Briefcase, Star
} from 'lucide-react';

interface ExperienceItem {
  id: number;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  achievements?: string[];
  location?: string;
  employmentType?: string;
  technologies?: string[];
  teamSize?: string;
  industry?: string;
}

interface ExperienceEditorProps {
  data: ExperienceItem[];
  onSave: (data: ExperienceItem[]) => void;
  language: string;
}

export function ExperienceEditor({ data, onSave, language }: ExperienceEditorProps) {
  const [items, setItems] = useState<ExperienceItem[]>(data || []);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<Partial<ExperienceItem>>({});

  const texts = {
    zh: {
      title: '工作经历管理',
      addNew: '添加工作经历',
      edit: '编辑',
      delete: '删除',
      save: '保存',
      cancel: '取消',
      company: '公司名称',
      position: '职位',
      startDate: '开始时间',
      endDate: '结束时间',
      current: '至今',
      description: '工作描述',
      achievements: '主要成就 (每行一个)',
      location: '工作地点',
      employmentType: '雇佣类型',
      technologies: '使用技术 (每行一个)',
      teamSize: '团队规模',
      industry: '行业',
      required: '必填项',
      confirmDelete: '确认删除这条工作经历吗？',
      saved: '工作经历已保存',
      fullTime: '全职',
      partTime: '兼职',
      contract: '合同工',
      internship: '实习',
      freelance: '自由职业'
    },
    en: {
      title: 'Experience Management',
      addNew: 'Add Experience',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel',
      company: 'Company',
      position: 'Position',
      startDate: 'Start Date',
      endDate: 'End Date',
      current: 'Present',
      description: 'Description',
      achievements: 'Achievements (one per line)',
      location: 'Location',
      employmentType: 'Employment Type',
      technologies: 'Technologies (one per line)',
      teamSize: 'Team Size',
      industry: 'Industry',
      required: 'Required',
      confirmDelete: 'Are you sure you want to delete this experience?',
      saved: 'Experience data saved',
      fullTime: 'Full-time',
      partTime: 'Part-time',
      contract: 'Contract',
      internship: 'Internship',
      freelance: 'Freelance'
    }
  };

  const t = texts[language];

  const employmentTypes = [
    { value: 'full-time', label: t.fullTime },
    { value: 'part-time', label: t.partTime },
    { value: 'contract', label: t.contract },
    { value: 'internship', label: t.internship },
    { value: 'freelance', label: t.freelance }
  ];

  useEffect(() => {
    setItems(data || []);
  }, [data]);

  const handleSave = () => {
    onSave(items);
  };

  const handleAdd = () => {
    const newItem: ExperienceItem = {
      id: Date.now(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
      achievements: [],
      location: '',
      employmentType: 'full-time',
      technologies: [],
      teamSize: '',
      industry: ''
    };
    setEditingItem(newItem);
    setEditingId(newItem.id);
  };

  const handleEdit = (item: ExperienceItem) => {
    setEditingItem({ ...item });
    setEditingId(item.id);
  };

  const handleSaveItem = () => {
    if (!editingItem.company || !editingItem.position) {
      alert(t.required);
      return;
    }

    const updatedItems = editingId === editingItem.id 
      ? items.map(item => item.id === editingId ? editingItem as ExperienceItem : item)
      : [...items, editingItem as ExperienceItem];

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

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    if (dateString === 'present') return t.current;
    return dateString;
  };

  const renderEditForm = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Briefcase className="w-5 h-5 mr-2" />
          {editingId === editingItem.id ? t.addNew : t.edit}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="company">{t.company} *</Label>
            <Input
              id="company"
              value={editingItem.company || ''}
              onChange={(e) => setEditingItem(prev => ({ ...prev, company: e.target.value }))}
              placeholder={t.company}
              className="bg-input-background"
            />
          </div>
          
          <div>
            <Label htmlFor="position">{t.position} *</Label>
            <Input
              id="position"
              value={editingItem.position || ''}
              onChange={(e) => setEditingItem(prev => ({ ...prev, position: e.target.value }))}
              placeholder={t.position}
              className="bg-input-background"
            />
          </div>

          <div>
            <Label htmlFor="location">{t.location}</Label>
            <Input
              id="location"
              value={editingItem.location || ''}
              onChange={(e) => setEditingItem(prev => ({ ...prev, location: e.target.value }))}
              placeholder={t.location}
              className="bg-input-background"
            />
          </div>

          <div>
            <Label htmlFor="industry">{t.industry}</Label>
            <Input
              id="industry"
              value={editingItem.industry || ''}
              onChange={(e) => setEditingItem(prev => ({ ...prev, industry: e.target.value }))}
              placeholder={t.industry}
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
            <Label htmlFor="employmentType">{t.employmentType}</Label>
            <Select
              value={editingItem.employmentType || 'full-time'}
              onValueChange={(value) => setEditingItem(prev => ({ ...prev, employmentType: value }))}
            >
              <SelectTrigger className="bg-input-background">
                <SelectValue placeholder={t.employmentType} />
              </SelectTrigger>
              <SelectContent>
                {employmentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="teamSize">{t.teamSize}</Label>
            <Input
              id="teamSize"
              value={editingItem.teamSize || ''}
              onChange={(e) => setEditingItem(prev => ({ ...prev, teamSize: e.target.value }))}
              placeholder="5-10人"
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
          <Label htmlFor="achievements">{t.achievements}</Label>
          <Textarea
            id="achievements"
            value={editingItem.achievements?.join('\n') || ''}
            onChange={(e) => setEditingItem(prev => ({ 
              ...prev, 
              achievements: e.target.value.split('\n').filter(Boolean) 
            }))}
            placeholder={t.achievements}
            rows={4}
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

  const renderExperienceItem = (item: ExperienceItem) => (
    <Card key={item.id} className="mb-4">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">{item.position}</h3>
            <p className="text-muted-foreground flex items-center">
              <Building className="w-4 h-4 mr-1" />
              {item.company}
            </p>
            {item.industry && (
              <p className="text-sm text-muted-foreground">{item.industry}</p>
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

          {item.location && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mr-1" />
              {item.location}
            </div>
          )}
          
          {item.teamSize && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="w-4 h-4 mr-1" />
              {item.teamSize}
            </div>
          )}
        </div>

        {item.employmentType && (
          <div className="mb-4">
            <Badge variant="secondary">
              {employmentTypes.find(type => type.value === item.employmentType)?.label || item.employmentType}
            </Badge>
          </div>
        )}

        {item.description && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {item.description}
            </p>
          </div>
        )}

        {item.achievements && item.achievements.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-foreground mb-2 flex items-center">
              <Star className="w-4 h-4 mr-1" />
              {language === 'zh' ? '主要成就' : 'Key Achievements'}
            </h4>
            <ul className="list-disc list-inside space-y-1">
              {item.achievements.map((achievement, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  {achievement}
                </li>
              ))}
            </ul>
          </div>
        )}

        {item.technologies && item.technologies.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">
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
        {items.map(renderExperienceItem)}
      </div>

      {items.length === 0 && !editingId && (
        <Alert>
          <Briefcase className="h-4 w-4" />
          <AlertDescription>
            {language === 'zh' 
              ? '还没有添加工作经历。点击上方按钮开始添加。'
              : 'No work experience added yet. Click the button above to get started.'
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