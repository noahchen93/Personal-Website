import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { useLanguage } from '../../language/LanguageContext';

interface Education {
  school: string;
  major?: string;
  period: string;
  degree?: string;
}

interface EducationFormProps {
  education: Education;
  onChange: (education: Education) => void;
  onRemove: () => void;
}

export default function EducationForm({ education, onChange, onRemove }: EducationFormProps) {
  const { isZh } = useLanguage();

  const handleChange = (field: keyof Education, value: string) => {
    onChange({ ...education, [field]: value });
  };

  return (
    <div className="p-4 bg-slate-700/50 rounded-lg space-y-4 border border-blue-400/20">
      <div className="flex items-center justify-between">
        <h4 className="text-medium font-terminal terminal-text-white font-medium">
          {isZh ? '教育经历' : 'Education'}
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
          <Label htmlFor="school" className="text-small font-terminal terminal-text-cyan">
            {isZh ? '学校名称' : 'School Name'} *
          </Label>
          <Input
            id="school"
            value={education.school || ''}
            onChange={(e) => handleChange('school', e.target.value)}
            placeholder={isZh ? '请输入学校名称' : 'Enter school name'}
            className="font-terminal text-small cms-input"
            required
          />
        </div>

        <div>
          <Label htmlFor="major" className="text-small font-terminal terminal-text-cyan">
            {isZh ? '专业' : 'Major'}
          </Label>
          <Input
            id="major"
            value={education.major || ''}
            onChange={(e) => handleChange('major', e.target.value)}
            placeholder={isZh ? '请输入专业名称' : 'Enter major'}
            className="font-terminal text-small cms-input"
          />
        </div>

        <div>
          <Label htmlFor="period" className="text-small font-terminal terminal-text-cyan">
            {isZh ? '时间段' : 'Period'} *
          </Label>
          <Input
            id="period"
            value={education.period || ''}
            onChange={(e) => handleChange('period', e.target.value)}
            placeholder={isZh ? '如：2020-2024' : 'e.g., 2020-2024'}
            className="font-terminal text-small cms-input"
            required
          />
        </div>

        <div>
          <Label htmlFor="degree" className="text-small font-terminal terminal-text-cyan">
            {isZh ? '学位' : 'Degree'}
          </Label>
          <Input
            id="degree"
            value={education.degree || ''}
            onChange={(e) => handleChange('degree', e.target.value)}
            placeholder={isZh ? '如：学士学位' : 'e.g., Bachelor\'s Degree'}
            className="font-terminal text-small cms-input"
          />
        </div>
      </div>

      {/* 必填字段提示 */}
      <div className="text-small font-terminal terminal-text-cyan">
        {isZh ? '* 为必填字段' : '* Required fields'}
      </div>
    </div>
  );
}