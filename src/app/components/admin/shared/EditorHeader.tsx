import React from 'react';
import { ArrowLeft, Save, Loader2, Wifi, WifiOff, Upload, Eye } from 'lucide-react';
import { useLanguage } from '../../language/LanguageContext';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { toast } from 'sonner';

interface EditorHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  onBack?: () => void;
  rightContent?: React.ReactNode;
  // 保存相关props
  onSave?: () => Promise<any>;
  isSaving?: boolean;
  lastSavedTime?: Date | null;
  hasUnsavedChanges?: boolean;
  isOnline?: boolean;
  // 新增：发布相关props
  saveButtonText?: string;
  isPublished?: boolean;
  onSaveDraft?: () => Promise<any>;
  isSavingDraft?: boolean;
  showDraftSave?: boolean;
}

export default function EditorHeader({ 
  title, 
  description, 
  icon,
  onBack,
  rightContent,
  onSave,
  isSaving,
  lastSavedTime,
  hasUnsavedChanges,
  isOnline,
  saveButtonText,
  isPublished,
  onSaveDraft,
  isSavingDraft,
  showDraftSave
}: EditorHeaderProps) {
  const { isZh } = useLanguage();

  const handleSave = async () => {
    console.log('🔄 EditorHeader handleSave called', {
      hasOnSave: !!onSave,
      isSaving,
      hasUnsavedChanges,
      lastSavedTime
    });
    
    if (!onSave) {
      console.warn('No onSave function provided to EditorHeader');
      return;
    }
    
    console.log('🔄 EditorHeader: Starting save process...');
    
    try {
      await onSave();
      console.log('✅ EditorHeader: Save completed successfully');
      // Note: Don't show toast here since the individual editor will handle it
    } catch (error) {
      console.error('❌ EditorHeader: Save error:', error);
      // Note: Don't show toast here since the individual editor will handle it
      throw error; // Re-throw to let the editor handle it
    }
  };

  const handleSaveDraft = async () => {
    if (!onSaveDraft) {
      console.warn('No onSaveDraft function provided to EditorHeader');
      return;
    }
    
    try {
      await onSaveDraft();
      console.log('✅ EditorHeader: Draft saved successfully');
    } catch (error) {
      console.error('❌ EditorHeader: Draft save error:', error);
      throw error;
    }
  };

  const formatLastSaved = (date: Date | null) => {
    if (!date) return null;
    
    // Ensure date is a valid Date object
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return null;
    
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    
    if (diffSeconds < 10) {
      return isZh ? '刚刚保存' : 'Just saved';
    } else if (diffSeconds < 60) {
      return isZh ? `${diffSeconds}秒前保存` : `Saved ${diffSeconds}s ago`;
    } else if (diffMinutes < 60) {
      return isZh ? `${diffMinutes}分钟前保存` : `Saved ${diffMinutes}m ago`;
    } else {
      return isZh ? '很久之前保存' : 'Saved long ago';
    }
  };

  return (
    <div className="border-b border-blue-400/30 pb-4 mb-6 bg-slate-800/50 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="terminal-text-cyan hover:terminal-text-white hover:bg-blue-500/20 transition-all duration-200 rounded-lg border border-transparent hover:border-blue-400/30"
              title={isZh ? '返回' : 'Back'}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          
          {icon && (
            <div className="text-blue-400">
              {icon}
            </div>
          )}
          
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="terminal-text-large terminal-text-white terminal-glow">
                {title}
              </h1>
              {/* 发布状态指示器 */}
              {isPublished !== undefined && (
                <Badge 
                  className={`text-xs rounded-full ${
                    isPublished 
                      ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                      : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  }`}
                >
                  {isPublished ? (isZh ? '已发布' : 'Published') : (isZh ? '草稿' : 'Draft')}
                </Badge>
              )}
            </div>
            {description && (
              <p className="terminal-text-small terminal-text-cyan mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* 连接状态指示器 */}
          {isOnline !== undefined && (
            <div className="flex items-center space-x-1 terminal-text-small terminal-text-cyan">
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3 text-green-400" />
                  <span>{isZh ? '在线' : 'Online'}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-red-400" />
                  <span>{isZh ? '离线' : 'Offline'}</span>
                </>
              )}
            </div>
          )}

          {/* 保存状态显示 */}
          {lastSavedTime && (
            <div className="terminal-text-small terminal-text-cyan">
              {formatLastSaved(lastSavedTime)}
            </div>
          )}

          {/* 草稿保存按钮 */}
          {showDraftSave && onSaveDraft && (
            <Button
              onClick={handleSaveDraft}
              disabled={isSavingDraft || (!hasUnsavedChanges && lastSavedTime !== null)}
              className={`transition-all duration-200 rounded-lg ${ 
                isSavingDraft || (!hasUnsavedChanges && lastSavedTime !== null)
                  ? 'bg-gray-600/50 text-gray-300 cursor-not-allowed border border-gray-500/30'
                  : 'bg-slate-600 hover:bg-slate-700 text-white border border-slate-500/50 shadow-lg shadow-slate-500/20 hover:shadow-slate-500/30'
              }`}
              size="sm"
              title={
                isSavingDraft ? (isZh ? '正在保存草稿...' : 'Saving draft...') :
                (!hasUnsavedChanges && lastSavedTime !== null) ? (isZh ? '没有更改需要保存' : 'No changes to save') :
                (isZh ? '保存草稿' : 'Save draft')
              }
            >
              {isSavingDraft ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isZh ? '保存中...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isZh ? '草稿' : 'Draft'}
                  {hasUnsavedChanges && <span className="ml-1 text-yellow-300">*</span>}
                </>
              )}
            </Button>
          )}

          {/* 主要保存/发布按钮 */}
          {onSave && (
            <Button
              onClick={handleSave}
              disabled={isSaving || (!hasUnsavedChanges && lastSavedTime !== null && isPublished)}
              className={`transition-all duration-200 rounded-lg ${ 
                isSaving || (!hasUnsavedChanges && lastSavedTime !== null && isPublished)
                  ? 'bg-gray-600/50 text-gray-300 cursor-not-allowed border border-gray-500/30'
                  : saveButtonText === (isZh ? '发布' : 'Publish') || saveButtonText === 'Publish'
                    ? 'bg-green-600 hover:bg-green-700 text-white border border-green-500/50 shadow-lg shadow-green-500/20 hover:shadow-green-500/30'
                    : 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-500/50 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30'
              }`}
              size="sm"
              title={
                isSaving ? (isZh ? '正在保存...' : 'Saving...') :
                (!hasUnsavedChanges && lastSavedTime !== null && isPublished) ? (isZh ? '没有更改需要发布' : 'No changes to publish') :
                saveButtonText ? saveButtonText : (isZh ? '保存更改' : 'Save changes')
              }
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {saveButtonText === (isZh ? '发布' : 'Publish') || saveButtonText === 'Publish' 
                    ? (isZh ? '发布中...' : 'Publishing...') 
                    : (isZh ? '保存中...' : 'Saving...')
                  }
                </>
              ) : (
                <>
                  {saveButtonText === (isZh ? '发布' : 'Publish') || saveButtonText === 'Publish' ? (
                    <Upload className="w-4 h-4 mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {saveButtonText || (isZh ? '保存' : 'Save')}
                  {hasUnsavedChanges && <span className="ml-1 text-yellow-300">*</span>}
                </>
              )}
            </Button>
          )}

          {/* 自定义右侧内容 */}
          {rightContent && (
            <>
              {rightContent}
            </>
          )}
        </div>
      </div>
    </div>
  );
}