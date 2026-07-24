import React, { useState } from 'react';
import { Settings, Plus, X, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../../language/LanguageContext';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { ContactData } from './types';
import NavigationButtonForm from './NavigationButtonForm';
import { BUTTON_STYLES, FORM_PLACEHOLDERS, DEFAULT_BUTTON } from './constants';
import { updatePageSettings, addNavigationButton, removeNavigationButton } from './helpers';

interface PageSettingsTabProps {
  contactData: ContactData;
  updateContactData: (updates: Partial<ContactData>) => void;
}

export default function PageSettingsTab({ contactData, updateContactData }: PageSettingsTabProps) {
  const { isZh } = useLanguage();
  const [newButton, setNewButton] = useState(DEFAULT_BUTTON);
  const [showButtonForm, setShowButtonForm] = useState(false);

  const handleUpdatePageSettings = (field: string, value: any) => {
    updatePageSettings(contactData, updateContactData, field, value);
  };

  const handleAddButton = () => {
    const success = addNavigationButton(contactData, updateContactData, newButton);
    if (success) {
      setNewButton(DEFAULT_BUTTON);
      setShowButtonForm(false);
    }
  };

  const handleRemoveButton = (index: number) => {
    removeNavigationButton(contactData, updateContactData, index);
  };

  return (
    <Card className="cms-bg-card border border-blue-500/30 rounded-xl">
      <CardHeader>
        <CardTitle className="text-white font-terminal">
          <Settings className="w-5 h-5 inline mr-2" />
          {isZh ? '页面设置' : 'Page Settings'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 基本页面设置 */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white font-terminal">
              {isZh ? '页面标题' : 'Page Title'}
            </Label>
            <Input
              value={contactData.pageSettings?.title || ''}
              onChange={(e) => handleUpdatePageSettings('title', e.target.value)}
              placeholder={isZh ? FORM_PLACEHOLDERS.title.zh : FORM_PLACEHOLDERS.title.en}
              className="cms-input rounded-xl text-medium"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white font-terminal">
              {isZh ? '页面副标题' : 'Page Subtitle'}
            </Label>
            <Input
              value={contactData.pageSettings?.subtitle || ''}
              onChange={(e) => handleUpdatePageSettings('subtitle', e.target.value)}
              placeholder={isZh ? FORM_PLACEHOLDERS.subtitle.zh : FORM_PLACEHOLDERS.subtitle.en}
              className="cms-input rounded-xl text-medium"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white font-terminal">
              {isZh ? '页面描述' : 'Page Description'}
            </Label>
            <Textarea
              value={contactData.pageSettings?.description || ''}
              onChange={(e) => handleUpdatePageSettings('description', e.target.value)}
              placeholder={isZh ? FORM_PLACEHOLDERS.description.zh : FORM_PLACEHOLDERS.description.en}
              rows={3}
              className="cms-textarea rounded-xl text-medium resize-none"
            />
          </div>
        </div>

        {/* 导航按钮设置 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-white font-terminal">
              {isZh ? '快速导航按钮' : 'Quick Navigation Buttons'}
            </Label>
            <Button onClick={() => setShowButtonForm(true)} size="sm" className="cms-secondary-button">
              <Plus className="w-4 h-4 mr-2" />
              {isZh ? '添加按钮' : 'Add Button'}
            </Button>
          </div>

          {contactData.pageSettings?.navigationButtons && contactData.pageSettings.navigationButtons.length > 0 && (
            <div className="space-y-3">
              {contactData.pageSettings.navigationButtons.map((button, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-blue-500/30 rounded-lg bg-slate-700/50">
                  <div className="flex items-center space-x-3">
                    <div className={`px-2 py-1 rounded text-small ${button.style === 'primary' ? 'bg-blue-500/20 text-blue-200 border border-blue-500/30' : 'bg-slate-600/50 text-slate-300 border border-slate-500/30'}`}>
                      {button.style === 'primary' ? (isZh ? '主要' : 'Primary') : (isZh ? '次要' : 'Secondary')}
                    </div>
                    <div>
                      <div className="text-white font-medium text-medium font-terminal">{button.text}</div>
                      <div className="text-small text-slate-400 flex items-center font-terminal">
                        {button.target}
                        {button.external && <ExternalLink className="w-3 h-3 ml-1" />}
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => handleRemoveButton(index)} size="sm" className="cms-danger-button">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {showButtonForm && (
            <NavigationButtonForm
              newButton={newButton}
              setNewButton={setNewButton}
              onAdd={handleAddButton}
              onCancel={() => setShowButtonForm(false)}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}