import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner@2.0.3';

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingProject: any;
  onSave: (projectData: any) => void;
}

export function ProjectForm({ isOpen, onClose, editingProject, onSave }: ProjectFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const projectData = {
      id: editingProject?.id || Date.now().toString(),
      title: formData.get('title') as string,
      category: formData.get('category') as string,
      period: formData.get('period') as string,
      location: formData.get('location') as string,
      description: formData.get('description') as string,
      role: formData.get('role') as string,
      technologies: (formData.get('technologies') as string).split(',').map(t => t.trim()).filter(t => t),
      achievements: (formData.get('achievements') as string).split('\n').filter(a => a.trim()),
      links: (formData.get('links') as string).split('\n').filter(l => l.trim()),
      images: editingProject?.images || []
    };

    onSave(projectData);
    onClose();
    toast.success(editingProject ? '项目更新成功' : '项目添加成功');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingProject ? '编辑项目' : '添加项目'}</DialogTitle>
          <DialogDescription>
            填写项目的详细信息
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">项目名称*</Label>
              <Input
                id="title"
                name="title"
                defaultValue={editingProject?.title || ''}
                required
                placeholder="项目名称"
              />
            </div>
            <div>
              <Label htmlFor="category">项目类别</Label>
              <Select name="category" defaultValue={editingProject?.category || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="选择类别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="设计">设计</SelectItem>
                  <SelectItem value="策展">策展</SelectItem>
                  <SelectItem value="管理">管理</SelectItem>
                  <SelectItem value="研究">研究</SelectItem>
                  <SelectItem value="其他">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="period">项目时间</Label>
              <Input
                id="period"
                name="period"
                defaultValue={editingProject?.period || ''}
                placeholder="例：2023年1月-3月"
              />
            </div>
            <div>
              <Label htmlFor="location">项目地点</Label>
              <Input
                id="location"
                name="location"
                defaultValue={editingProject?.location || ''}
                placeholder="项目地点"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">项目描述</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={editingProject?.description || ''}
              rows={3}
              placeholder="项目的详细描述"
            />
          </div>

          <div>
            <Label htmlFor="role">担任角色</Label>
            <Input
              id="role"
              name="role"
              defaultValue={editingProject?.role || ''}
              placeholder="在项目中的角色"
            />
          </div>

          <div>
            <Label htmlFor="technologies">使用技术/工具</Label>
            <Textarea
              id="technologies"
              name="technologies"
              defaultValue={editingProject?.technologies?.join(', ') || ''}
              rows={2}
              placeholder="技术和工具，用逗号分隔"
            />
          </div>

          <div>
            <Label htmlFor="achievements">项目成果</Label>
            <Textarea
              id="achievements"
              name="achievements"
              defaultValue={editingProject?.achievements?.join('\n') || ''}
              rows={3}
              placeholder="每行一个成果"
            />
          </div>

          <div>
            <Label htmlFor="links">相关链接</Label>
            <Textarea
              id="links"
              name="links"
              defaultValue={editingProject?.links?.join('\n') || ''}
              rows={2}
              placeholder="每行一个链接"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit">
              {editingProject ? '更新项目' : '添加项目'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}