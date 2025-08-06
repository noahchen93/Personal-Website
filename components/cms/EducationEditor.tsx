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
  Plus, Edit, Trash2, Save, X, CalendarDays,
  GraduationCap, Award, BookOpen, MapPin
} from 'lucide-react';

interface EducationItem {
  id: number;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
  gpa?: string;
  honors?: string[];
  coursework?: string[];
  location?: string;
}

interface EducationEditorProps {
  data: EducationItem[];
  onSave: (data: EducationItem[]) => void;
  language: string;
}

export function EducationEditor({ data, onSave, language }: EducationEditorProps) {
  const [items, setItems] = useState<EducationItem[]>(data || []);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<Partial<EducationItem>>({});

  const texts = {
    zh: {
      title: '教育背景管理',
      addNew: '添加教育经历',
      edit: '编辑',
      delete: '删除',
      save: '保存',
      cancel: '取消',
      institution: '学校/机构',
      degree: '学位',
      field: '专业领域',
      startDate: '开始时间',
      endDate: '结束时间',
      current: '至今',
      description: '描述',
      gpa: 'GPA',
      honors: '荣誉奖项 (每行一个)',
      coursework: '主要课程 (每行一个)',
      location: '地点',
      required: '必填项',
      confirmDelete: '确认删除这条教育经历吗？',
      saved: '教育背景已保存'
    },
    en: {
      title: 'Education Management',
      addNew: 'Add Education',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel',
      institution: 'Institution',
      degree: 'Degree',
      field: 'Field of Study',
      startDate: 'Start Date',
      endDate: 'End Date',
      current: 'Present',
      description: 'Description',
      gpa: 'GPA',
      honors: 'Honors (one per line)',
      coursework: 'Coursework (one per line)',
      location: 'Location',
      required: 'Required',
      confirmDelete: 'Are you sure you want to delete this education entry?',
      saved: 'Education data saved'
    }
  };

  const t = texts[language];

  useEffect(() => {
    setItems(data || []);
  }, [data]);

  const handleSave = () => {
    onSave(items);
  };

  const handleAdd = () => {
    const newItem: EducationItem = {
      id: Date.now(),
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      description: '',
      gpa: '',
      honors: [],
      coursework: [],
      location: ''
    };
    setEditingItem(newItem);
    setEditingId(newItem.id);
  };

  const handleEdit = (item: EducationItem) => {
    setEditingItem({ ...item });
    setEditingId(item.id);
  };

  const handleSaveItem = () => {
    if (!editingItem.institution || !editingItem.degree) {
      alert(t.required);
      return;
    }

    const updatedItems = editingId === editingItem.id 
      ? items.map(item => item.id === editingId ? editingItem as EducationItem : item)
      : [...items, editingItem as EducationItem];

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
          <GraduationCap className="w-5 h-5 mr-2" />
          {editingId === editingItem.id ? t.addNew : t.edit}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="institution">{t.institution} *</Label>
            <Input
              id="institution"
              value={editingItem.institution || ''}
              onChange={(e) => setEditingItem(prev => ({ ...prev, institution: e.target.value }))}
              placeholder={t.institution}
              className="bg-input-background"
            />
          </div>
          
          <div>
            <Label htmlFor="degree">{t.degree} *</Label>
            <Input
              id="degree"
              value={editingItem.degree || ''}
              onChange={(e) => setEditingItem(prev => ({ ...prev, degree: e.target.value }))}
              placeholder={t.degree}
              className="bg-input-background"
            />
          </div>

          <div>
            <Label htmlFor="field">{t.field}</Label>
            <Input
              id="field"
              value={editingItem.field || ''}
              onChange={(e) => setEditingItem(prev => ({ ...prev, field: e.target.value }))}
              placeholder={t.field}
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
            <Label htmlFor="gpa">{t.gpa}</Label>
            <Input
              id="gpa"
              value={editingItem.gpa || ''}
              onChange={(e) => setEditingItem(prev => ({ ...prev, gpa: e.target.value }))}
              placeholder="3.8/4.0"
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
          <Label htmlFor="honors">{t.honors}</Label>
          <Textarea
            id="honors"
            value={editingItem.honors?.join('\n') || ''}
            onChange={(e) => setEditingItem(prev => ({ 
              ...prev, 
              honors: e.target.value.split('\n').filter(Boolean) 
            }))}
            placeholder={t.honors}
            rows={3}
            className="bg-input-background"
          />
        </div>

        <div>
          <Label htmlFor="coursework">{t.coursework}</Label>
          <Textarea
            id="coursework"
            value={editingItem.coursework?.join('\n') || ''}
            onChange={(e) => setEditingItem(prev => ({ 
              ...prev, 
              coursework: e.target.value.split('\n').filter(Boolean) 
            }))}
            placeholder={t.coursework}
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

  const renderEducationItem = (item: EducationItem) => (
    <Card key={item.id} className="mb-4">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">{item.institution}</h3>
            <p className="text-muted-foreground">{item.degree}</p>
            {item.field && (
              <p className="text-sm text-muted-foreground">{item.field}</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {item.location && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mr-1" />
              {item.location}
            </div>
          )}
          
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarDays className="w-4 h-4 mr-1" />
            {formatDate(item.startDate)} - {formatDate(item.endDate)}
          </div>

          {item.gpa && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Award className="w-4 h-4 mr-1" />
              GPA: {item.gpa}
            </div>
          )}
        </div>

        {item.description && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {item.description}
            </p>
          </div>
        )}

        {item.honors && item.honors.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-foreground mb-2 flex items-center">
              <Award className="w-4 h-4 mr-1" />
              {language === 'zh' ? '荣誉奖项' : 'Honors'}
            </h4>
            <div className="flex flex-wrap gap-1">
              {item.honors.map((honor, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {honor}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {item.coursework && item.coursework.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2 flex items-center">
              <BookOpen className="w-4 h-4 mr-1" />
              {language === 'zh' ? '主要课程' : 'Coursework'}
            </h4>
            <div className="flex flex-wrap gap-1">
              {item.coursework.map((course, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {course}
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
        {items.map(renderEducationItem)}
      </div>

      {items.length === 0 && !editingId && (
        <Alert>
          <GraduationCap className="h-4 w-4" />
          <AlertDescription>
            {language === 'zh' 
              ? '还没有添加教育经历。点击上方按钮开始添加。'
              : 'No education entries added yet. Click the button above to get started.'
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