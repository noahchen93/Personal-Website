import React from 'react';
import { Check, X, ExternalLink } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Card, CardContent } from '../../../ui/card';
import { Label } from '../../../ui/label';
import { useLanguage } from '../../../language/LanguageContext';
import { BUTTON_STYLE_OPTIONS, FORM_PLACEHOLDERS, DEFAULT_BUTTON } from './constants';

interface NavigationButtonFormProps {
  newButton: any;
  setNewButton: (button: any) => void;
  onAdd: () => void;
  onCancel: () => void;
}

export default function NavigationButtonForm({ 
  newButton, 
  setNewButton, 
  onAdd, 
  onCancel 
}: NavigationButtonFormProps) {
  const { isZh } = useLanguage();

  return (
    <Card className="bg-slate-700/50 border border-blue-500/30 rounded-xl">
      <CardContent className="pt-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-small text-white font-terminal">
              {isZh ? '按钮文字' : 'Button Text'}
            </Label>
            <Input
              value={newButton.text}
              onChange={(e) => setNewButton(prev => ({ ...prev, text: e.target.value }))}
              placeholder={isZh ? FORM_PLACEHOLDERS.buttonText.zh : FORM_PLACEHOLDERS.buttonText.en}
              className="cms-input rounded-xl text-medium"
            />
          </div>
          <div>
            <Label className="text-small text-white font-terminal">
              {isZh ? '链接地址' : 'Link Target'}
            </Label>
            <Input
              value={newButton.target}
              onChange={(e) => setNewButton(prev => ({ ...prev, target: e.target.value }))}
              placeholder={isZh ? FORM_PLACEHOLDERS.buttonTarget.zh : FORM_PLACEHOLDERS.buttonTarget.en}
              className="cms-input rounded-xl text-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-small text-white font-terminal">
              {isZh ? '按钮样式' : 'Button Style'}
            </Label>
            <select
              value={newButton.style}
              onChange={(e) => setNewButton(prev => ({ ...prev, style: e.target.value }))}
              className="cms-select w-full rounded-xl text-medium"
            >
              {BUTTON_STYLE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {isZh ? option.labelZh : option.labelEn}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="external-link"
              checked={newButton.external}
              onChange={(e) => setNewButton(prev => ({ ...prev, external: e.target.checked }))}
              className="w-4 h-4 text-blue-500 bg-slate-700 border-blue-500/30 rounded focus:ring-blue-500"
            />
            <Label htmlFor="external-link" className="text-small text-white font-terminal">
              {isZh ? '外部链接' : 'External Link'}
            </Label>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button onClick={onCancel} className="cms-secondary-button" size="sm">
            {isZh ? '取消' : 'Cancel'}
          </Button>
          <Button
            onClick={onAdd}
            size="sm"
            disabled={!newButton.text || !newButton.target}
            className="cms-primary-button"
          >
            <Check className="w-4 h-4 mr-2" />
            {isZh ? '添加' : 'Add'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}