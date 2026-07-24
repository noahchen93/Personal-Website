import React, { useState, useEffect, useRef } from 'react';
import { Save, RotateCcw, Type, FileText, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { useLanguage } from '../language/LanguageContext';

interface PageTitleData {
  title: string;
  subtitle: string;
}

interface PageTitleEditorProps {
  pageKey: string;
  currentData: PageTitleData;
  onSave: (data: PageTitleData) => Promise<void>;
  onReset: () => Promise<void>;
  isLoading?: boolean;
  isSaving?: boolean;
}

export default function PageTitleEditor({
  pageKey,
  currentData,
  onSave,
  onReset,
  isLoading = false,
  isSaving = false
}: PageTitleEditorProps) {
  const { isZh } = useLanguage();
  const [formData, setFormData] = useState<PageTitleData>(currentData);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // 使用ref来跟踪是否是首次渲染
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    // 首次渲染时直接设置数据
    if (isFirstRenderRef.current) {
      setFormData(currentData);
      isFirstRenderRef.current = false;
      return;
    }

    // 后续更新时只有确实变化才重置
    const currentDataString = JSON.stringify(currentData);
    const formDataString = JSON.stringify({
      title: formData.title,
      subtitle: formData.subtitle
    });
    
    if (currentDataString !== formDataString) {
      setFormData(currentData);
      setHasChanges(false);
    }
  }, [currentData]);

  useEffect(() => {
    // 计算是否有变化
    const hasChanges = 
      formData.title !== currentData.title ||
      formData.subtitle !== currentData.subtitle;
    setHasChanges(hasChanges);
  }, [formData.title, formData.subtitle, currentData.title, currentData.subtitle]);

  const handleSave = async () => {
    setSaveError(null);
    try {
      await onSave(formData);
      // 不要立即设置hasChanges为false，让父组件状态更新后自然更新
    } catch (error) {
      console.error('Save error:', error);
      setSaveError(isZh ? '保存失败，请重试' : 'Save failed, please try again');
    }
  };

  const handleReset = async () => {
    try {
      await onReset();
      setFormData(currentData);
      setHasChanges(false);
    } catch (error) {
      console.error('Reset error:', error);
    }
  };

  const handleInputChange = (field: keyof PageTitleData, value: string) => {
    setSaveError(null); // 清除之前的错误消息
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <Card className="cms-bg-card mb-6 border border-blue-500/30">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-600/20">
              <Type className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="h-5 bg-slate-700 rounded animate-pulse w-32"></div>
              <div className="h-3 bg-slate-600 rounded animate-pulse w-48 mt-2"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="h-3 bg-slate-700 rounded animate-pulse w-16"></div>
              <div className="h-9 bg-slate-600 rounded animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-slate-700 rounded animate-pulse w-16"></div>
              <div className="h-16 bg-slate-600 rounded animate-pulse"></div>
            </div>
            <div className="flex items-end space-x-2">
              <div className="h-9 bg-slate-600 rounded animate-pulse w-16"></div>
              <div className="h-9 bg-slate-600 rounded animate-pulse w-20"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="cms-bg-card mb-6 border border-blue-500/30">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-600/20">
              <Type className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg text-white font-terminal">
                {isZh ? '页面标题设置' : 'Page Title Settings'}
              </CardTitle>
              <p className="text-sm text-slate-300 font-terminal">
                {isZh ? '设置页面的主标题和副标题' : 'Configure page title and subtitle'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {hasChanges && (
              <div className="flex items-center space-x-1 text-amber-200 bg-amber-500/20 px-2 py-1 rounded-full border border-amber-500/30">
                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-terminal">
                  {isZh ? '有未保存更改' : 'Unsaved changes'}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <Separator className="bg-blue-500/30" />

      <CardContent className="pt-4 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
          {/* Title Input */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Type className="w-3.5 h-3.5 text-cyan-400" />
              <label className="text-sm text-white font-terminal">
                {isZh ? '主标题' : 'Main Title'}
              </label>
            </div>
            <Input
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder={isZh ? '输入页面主标题...' : 'Enter main title...'}
              className="cms-input h-9 rounded-xl text-sm"
              disabled={isSaving}
            />
          </div>

          {/* Subtitle Input */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <label className="text-sm text-white font-terminal">
                {isZh ? '副标题' : 'Subtitle'}
              </label>
            </div>
            <Textarea
              value={formData.subtitle}
              onChange={(e) => handleInputChange('subtitle', e.target.value)}
              placeholder={isZh ? '输入页面副标题或描述...' : 'Enter subtitle or description...'}
              className="cms-textarea h-16 resize-none rounded-xl text-sm"
              disabled={isSaving}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!hasChanges || isSaving}
              className="cms-secondary-button flex items-center space-x-1 rounded-xl h-9 px-3 text-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isZh ? '重置' : 'Reset'}</span>
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="cms-primary-button flex items-center space-x-1 min-w-[80px] rounded-xl h-9 px-3 text-sm"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isZh ? '保存中...' : 'Saving...'}</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{isZh ? '保存' : 'Save'}</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {saveError && (
          <div className="mt-4">
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-xs text-red-300 font-terminal">
                    {saveError}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}