import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { useLanguage } from '../../language/LanguageContext';

interface WorkExperience {
  company: string;
  position: string;
  period: string;
  location?: string;
  description?: string;
}

interface WorkExperienceFormProps {
  workExperience: WorkExperience;
  onChange: (workExperience: WorkExperience) => void;
  onRemove: () => void;
}

export default function WorkExperienceForm({ 
  workExperience, 
  onChange, 
  onRemove 
}: WorkExperienceFormProps) {
  const { isZh } = useLanguage();

  const handleChange = (field: keyof WorkExperience, value: string) => {
    onChange({ ...workExperience, [field]: value });
  };

  // 确保workExperience是一个有效的对象
  const safeWorkExperience = workExperience || {
    company: '',
    position: '',
    period: '',
    location: '',
    description: ''
  };

  return (
    <div className="p-4 bg-slate-700/50 rounded-lg space-y-4 border border-blue-400/20">
      <div className="flex items-center justify-between">
        <h4 className="text-medium font-terminal terminal-text-white font-medium">
          {isZh ? '工作经历' : 'Work Experience'}
        </h4>
        <Button
          onClick={onRemove}
          variant="ghost"
          size="sm"
          className="text-red-400 hover:text-red-300 font-terminal text-small hover:bg-red-500/10"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="company" className="text-small font-terminal terminal-text-cyan">
            {isZh ? '公司名称' : 'Company Name'} *
          </Label>
          <Input
            id="company"
            value={safeWorkExperience.company || ''}
            onChange={(e) => handleChange('company', e.target.value)}
            placeholder={isZh ? '请输入公司名称' : 'Enter company name'}
            className="font-terminal text-small cms-input"
            required
          />
        </div>

        <div>
          <Label htmlFor="position" className="text-small font-terminal terminal-text-cyan">
            {isZh ? '职位' : 'Position'} *
          </Label>
          <Input
            id="position"
            value={safeWorkExperience.position || ''}
            onChange={(e) => handleChange('position', e.target.value)}
            placeholder={isZh ? '请输入职位名称' : 'Enter position title'}
            className="font-terminal text-small cms-input"
            required
          />
        </div>

        <div>
          <Label htmlFor="period" className="text-small font-terminal terminal-text-cyan">
            {isZh ? '工作时间' : 'Period'} *
          </Label>
          <Input
            id="period"
            value={safeWorkExperience.period || ''}
            onChange={(e) => handleChange('period', e.target.value)}
            placeholder={isZh ? '如：2022-2024' : 'e.g., 2022-2024'}
            className="font-terminal text-small cms-input"
            required
          />
        </div>

        <div>
          <Label htmlFor="location" className="text-small font-terminal terminal-text-cyan">
            {isZh ? '工作地点' : 'Location'}
          </Label>
          <Input
            id="location"
            value={safeWorkExperience.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder={isZh ? '如：北京' : 'e.g., Beijing'}
            className="font-terminal text-small cms-input"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description" className="text-small font-terminal terminal-text-cyan">
          {isZh ? '工作描述' : 'Job Description'}
        </Label>
        <Textarea
          id="description"
          value={safeWorkExperience.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder={isZh ? '请描述主要工作内容和成就...' : 'Describe key responsibilities and achievements...'}
          className="font-terminal text-small cms-textarea"
          rows={3}
        />
      </div>

      {/* 必填字段提示 */}
      <div className="text-small font-terminal terminal-text-cyan">
        {isZh ? '* 为必填字段' : '* Required fields'}
      </div>
    </div>
  );
}