import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner@2.0.3';

interface InterestFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingInterest: any;
  onSave: (interestData: any) => void;
}

export function InterestForm({ isOpen, onClose, editingInterest, onSave }: InterestFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
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

    onSave(interestData);
    onClose();
    toast.success(editingInterest ? '兴趣更新成功' : '兴趣添加成功');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{editingInterest ? '编辑兴趣' : '添加兴趣'}</DialogTitle>
          <DialogDescription>
            填写兴趣爱好的详细信息
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit">
              {editingInterest ? '更新兴趣' : '添加兴趣'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}