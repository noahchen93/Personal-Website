import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2, Plus, Trash2, Edit, Image, X, Link, FileText, Globe, ImagePlus, Upload } from 'lucide-react';
import { useContent, ContentItem } from '../../content/ContentContext';
import { useLanguage } from '../../language/LanguageContext';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { toast } from 'sonner';
import EditorHeader from '../shared/EditorHeader';
import StatusMessage from '../shared/StatusMessage';
import MarkdownEditor from '../MarkdownEditor';
import ImageSelectorDialog from '../markdown/ImageSelectorDialog';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface InterestData {
  title: string;
  description: string;
  content: string;
  imageId?: string; // 改为图片ID引用
  // URL链接相关字段
  type?: 'content' | 'url'; // 内容类型：普通内容或URL链接
  url?: string; // 链接地址
  urlTitle?: string; // 链接标题（从抓取的元数据中获取）
  urlDescription?: string; // 链接描述
  urlImage?: string; // 链接封面图片
  urlDomain?: string; // 链接域名
  // 手动封面图片支持
  manualCoverImageId?: string; // 手动设置的封面图片ID，优先级高于URL图片
  // 播客相关字段
  isPodcast?: boolean; // 是否为播客内容
  podcastData?: {
    platform: string; // 播客平台
    type: 'show' | 'episode' | 'playlist' | 'unknown'; // 播客类型
    episodes: Array<{
      title: string;
      url: string;
      platform: string;
      duration?: string;
    }>; // 播客单集列表
    showInfo?: {
      title: string;
      platform: string;
      description?: string;
    }; // 播客节目信息
    playUrl?: string; // 播放链接
    rssUrl?: string; // RSS链接
  };
}

interface InterestsEditorProps {
  onBack: () => void;
}

export default function InterestsEditor({ onBack }: InterestsEditorProps) {
  const { getContent, updateContent, createContent, deleteContent, getImageUrl } = useContent();
  const { currentLanguage, isZh } = useLanguage();
  const [interests, setInterests] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingInterest, setEditingInterest] = useState<ContentItem | null>(null);
  const [interestData, setInterestData] = useState<InterestData>({
    title: '',
    description: '',
    content: '',
    imageId: '', // 使用图片ID
    type: 'content', // 默认为普通内容
    url: '',
    urlTitle: '',
    urlDescription: '',
    urlImage: '',
    urlDomain: '',
    manualCoverImageId: '', // 手动封面图片ID
    isPodcast: false, // 播客标识
    podcastData: undefined // 播客数据
  });
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [showManualCoverImageSelector, setShowManualCoverImageSelector] = useState(false);
  
  // URL抓取相关状态
  const [isUrlFetching, setIsUrlFetching] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  useEffect(() => {
    loadData();
  }, [currentLanguage]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 加载兴趣内容 - 使用当前语言
      const interests = await getContent('interests', undefined, currentLanguage);
      setInterests(interests);
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage({ type: 'error', text: isZh ? '加载数据失败' : 'Failed to load data' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!interestData.title) {
      setMessage({ type: 'error', text: isZh ? '请输入标题' : 'Please enter a title' });
      return;
    }

    setIsSaving(true);
    try {
      const dataToSave = {
        ...interestData,
        // 确保空字符串不保存
        imageId: interestData.imageId || undefined,
        manualCoverImageId: interestData.manualCoverImageId || undefined
      };

      if (editingInterest) {
        await updateContent(editingInterest.id, dataToSave);
        setMessage({ type: 'success', text: isZh ? '兴趣已更新' : 'Interest updated successfully' });
      } else {
        await createContent('interests', dataToSave, currentLanguage);
        setMessage({ type: 'success', text: isZh ? '兴趣已创建' : 'Interest created successfully' });
      }
      
      await loadData();
      handleCancel();
    } catch (error) {
      console.error('Error saving interest:', error);
      setMessage({ type: 'error', text: isZh ? '保存失败' : 'Failed to save' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingInterest(null);
    setInterestData({
      title: '',
      description: '',
      content: '',
      imageId: '',
      type: 'content',
      url: '',
      urlTitle: '',
      urlDescription: '',
      urlImage: '',
      urlDomain: '',
      manualCoverImageId: '',
      isPodcast: false,
      podcastData: undefined
    });
    setUrlInput('');
  };

  const handleEdit = (interest: ContentItem) => {
    setEditingInterest(interest);
    setInterestData(interest.data);
    setUrlInput(interest.data.url || '');
  };

  const handleDelete = async (id: string) => {
    const confirmMessage = isZh ? '确定要删除这个兴趣吗？' : 'Are you sure you want to delete this interest?';
    if (!window.confirm(confirmMessage)) return;

    try {
      await deleteContent(id);
      setMessage({ type: 'success', text: isZh ? '兴趣已删除' : 'Interest deleted successfully' });
      await loadData();
    } catch (error) {
      console.error('Error deleting interest:', error);
      setMessage({ type: 'error', text: isZh ? '删除失败' : 'Failed to delete' });
    }
  };

  const handleCreateNew = () => {
    setEditingInterest(null);
    setInterestData({
      title: '',
      description: '',
      content: '',
      imageId: '',
      type: 'content',
      url: '',
      urlTitle: '',
      urlDescription: '',
      urlImage: '',
      urlDomain: '',
      manualCoverImageId: '',
      isPodcast: false,
      podcastData: undefined
    });
    setUrlInput('');
  };

  const handleImageSelect = (imageId: string) => {
    setInterestData(prev => ({ ...prev, imageId }));
  };

  const handleManualCoverImageSelect = (imageId: string) => {
    setInterestData(prev => ({ ...prev, manualCoverImageId: imageId }));
  };

  // 抓取URL元数据
  const fetchUrlMetadata = async () => {
    if (!urlInput.trim()) return;
    
    setIsUrlFetching(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-55b791b3/url-metadata`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ url: urlInput.trim() })
      });

      const result = await response.json();
      
      if (result.success && result.data) {
        const metadata = result.data;
        setInterestData(prev => ({
          ...prev,
          type: 'url',
          url: metadata.url,
          urlTitle: metadata.title,
          urlDescription: metadata.description,
          urlImage: metadata.image,
          urlDomain: metadata.urlDomain || new URL(metadata.url).hostname,
          title: metadata.title || prev.title,
          description: metadata.description || prev.description,
          isPodcast: metadata.isPodcast || false,
          podcastData: metadata.podcastData || undefined
        }));
        
        if (metadata.isPodcast) {
          toast.success(isZh ? '✅ 播客信息已获取' : '✅ Podcast information fetched successfully');
        } else {
          toast.success(isZh ? '✅ URL元数据已获取' : '✅ URL metadata fetched successfully');
        }
      } else {
        // 即使失败也设置基本信息
        if (result.fallback_data) {
          const fallback = result.fallback_data;
          setInterestData(prev => ({
            ...prev,
            type: 'url',
            url: fallback.url,
            urlTitle: fallback.title,
            urlDescription: fallback.description,
            urlImage: fallback.image,
            urlDomain: fallback.domain,
            title: fallback.title || prev.title,
            description: fallback.description || prev.description
          }));
        }
        
        toast.warning(isZh ? '⚠️ URL信息获取不完整，请手动完善' : '⚠️ URL metadata partially fetched, please complete manually');
      }
    } catch (error) {
      console.error('Error fetching URL metadata:', error);
      
      // 设置基本URL信息
      try {
        const url = new URL(urlInput.trim());
        setInterestData(prev => ({
          ...prev,
          type: 'url',
          url: url.toString(),
          urlDomain: url.hostname,
          title: url.hostname || prev.title,
          description: `Link to ${url.hostname}` || prev.description
        }));
      } catch {
        // URL格式无效
      }
      
      toast.error(isZh ? '❌ URL信息获取失败' : '❌ Failed to fetch URL metadata');
    } finally {
      setIsUrlFetching(false);
    }
  };

  // 切换内容类型
  const handleTypeChange = (newType: 'content' | 'url') => {
    setInterestData(prev => ({
      ...prev,
      type: newType,
      // 清空相关字段
      ...(newType === 'content' ? {
        url: '',
        urlTitle: '',
        urlDescription: '',
        urlImage: '',
        urlDomain: ''
      } : {})
    }));
    
    if (newType === 'content') {
      setUrlInput('');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 cms-container">
      <EditorHeader
        title={isZh ? "兴趣管理" : "Interest Management"}
        onBack={onBack}
        rightContent={
          <div className="flex items-center space-x-4">
            {/* 语言指示器 */}
            <div className="flex items-center space-x-2 px-3 py-1 bg-slate-700/50 rounded-lg border border-blue-500/30">
              <span className="text-xs text-cyan-400 font-terminal">
                {isZh ? '当前语言' : 'Language'}:
              </span>
              <span className="text-xs text-white font-terminal font-medium">
                {currentLanguage === 'zh' ? '中文' : 'English'}
              </span>
            </div>
            
            <button
              onClick={handleCreateNew}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl text-small"
            >
              <Plus className="w-4 h-4" />
              <span>{isZh ? '新建兴趣' : 'New Interest'}</span>
            </button>
          </div>
        }
      />

      {message && (
        <StatusMessage type={message.type} message={message.text} />
      )}

      {/* 图片选择对话框 */}
      <ImageSelectorDialog
        open={showImageSelector}
        onOpenChange={setShowImageSelector}
        onImageSelect={handleImageSelect}
      />

      {/* 手动封面图片选择对话框 */}
      <ImageSelectorDialog
        open={showManualCoverImageSelector}
        onOpenChange={setShowManualCoverImageSelector}
        onImageSelect={handleManualCoverImageSelect}
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 兴趣列表 */}
        <div className="cms-bg-card rounded-xl shadow-lg border border-blue-500/30">
          <div className="p-4 border-b border-blue-500/30">
            <h3 className="font-semibold text-white font-terminal">{isZh ? '兴趣列表' : 'Interest List'}</h3>
          </div>
          
          <div className="divide-y divide-blue-500/20 overflow-y-auto custom-scrollbar">
            {interests.map((interest) => {
              // 获取兴趣封面图片和内容类型 - 优先级：手动封面图片 > imageId > URL图片
              const contentType = interest.data.type || 'content';
              const manualCoverImageId = interest.data.manualCoverImageId;
              const imageId = interest.data.imageId || (interest.data.imageUrl && interest.data.imageUrl.match(/^\{\{image:([^|}]+)\}\}$/)?.[1]);
              
              let imageUrl = null;
              if (manualCoverImageId) {
                // 优先使用手动设置的封面图片
                imageUrl = getImageUrl(manualCoverImageId);
              } else if (imageId) {
                // 其次使用普通的封面图片
                imageUrl = getImageUrl(imageId);
              } else if (contentType === 'url' && interest.data.urlImage) {
                // 最后使用URL解析的图片
                imageUrl = interest.data.urlImage;
              }
              
              return (
                <div key={interest.id} className="p-4 hover:bg-slate-700/50 rounded-xl transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* 兴趣封面图片 */}
                      {imageUrl && (
                        <div className="mb-3">
                          <img 
                            src={imageUrl} 
                            alt={interest.data.title}
                            className="w-full h-32 object-cover rounded-lg border border-blue-500/30"
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2 mb-1">
                        {/* 播客内容标识 */}
                        {interest.data.isPodcast && (
                          <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-md flex items-center space-x-1">
                            <span className="text-xs">🎧</span>
                            <span>{isZh ? '播客' : 'Podcast'}</span>
                          </span>
                        )}
                        {/* 内容类型标识 */}
                        {contentType === 'url' && !interest.data.isPodcast && (
                          <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-md flex items-center space-x-1">
                            <Link className="w-3 h-3" />
                            <span>{isZh ? 'URL' : 'URL'}</span>
                          </span>
                        )}
                        {/* 手动封面图片标识 */}
                        {manualCoverImageId && (
                          <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-md flex items-center space-x-1">
                            <ImagePlus className="w-3 h-3" />
                            <span>{isZh ? '手动封面' : 'Manual Cover'}</span>
                          </span>
                        )}
                      </div>
                      
                      <h4 className="font-medium text-white mb-1 font-terminal">
                        {interest.data.title}
                      </h4>
                      <p className="text-sm text-slate-300 mb-2 line-clamp-2 font-terminal">
                        {interest.data.description}
                      </p>
                      
                      {/* URL域名显示 */}
                      {contentType === 'url' && interest.data.urlDomain && (
                        <div className="flex items-center space-x-1 text-xs text-green-400 mb-2">
                          <Globe className="w-3 h-3" />
                          <span>{interest.data.urlDomain}</span>
                        </div>
                      )}
                      
                      <p className="text-xs text-slate-400 font-terminal">
                        {new Date(interest.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-center space-y-2 ml-4">
                      <button
                        onClick={() => handleEdit(interest)}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all duration-200"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(interest.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {interests.length === 0 && (
              <div className="p-8 text-center text-slate-400 font-terminal">
                {isZh ? '还没有兴趣内容' : 'No interests yet'}
              </div>
            )}
          </div>
        </div>

        {/* 编辑表单 */}
        <div className="cms-bg-card rounded-xl shadow-lg border border-blue-500/30">
          <div className="p-4 border-b border-blue-500/30">
            <h3 className="font-semibold text-white font-terminal">
              {editingInterest ? (isZh ? '编辑兴趣' : 'Edit Interest') : (isZh ? '新建兴趣' : 'New Interest')}
            </h3>
          </div>
          
          <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
            {/* 内容类型选择 */}
            <div>
              <label className="block text-sm font-medium text-white mb-2 font-terminal">
                {isZh ? '内容类型' : 'Content Type'}
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleTypeChange('content')}
                  className={`flex-1 p-2 rounded-lg border transition-all ${
                    interestData.type === 'content'
                      ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                      : 'border-gray-600 text-gray-400 hover:border-blue-500/50'
                  }`}
                >
                  <FileText className="w-4 h-4 mx-auto mb-1" />
                  <div className="text-xs">{isZh ? '普通内容' : 'Content'}</div>
                </button>
                <button
                  onClick={() => handleTypeChange('url')}
                  className={`flex-1 p-2 rounded-lg border transition-all ${
                    interestData.type === 'url'
                      ? 'border-green-500 bg-green-500/20 text-green-300'
                      : 'border-gray-600 text-gray-400 hover:border-green-500/50'
                  }`}
                >
                  <Link className="w-4 h-4 mx-auto mb-1" />
                  <div className="text-xs">{isZh ? 'URL链接' : 'URL Link'}</div>
                </button>
              </div>
            </div>

            {/* URL输入和抓取（仅URL类型显示） */}
            {interestData.type === 'url' && (
              <div>
                <label className="block text-sm font-medium text-white mb-2 font-terminal">
                  {isZh ? 'URL地址' : 'URL Address'}
                </label>
                <div className="flex space-x-2">
                  <Input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder={isZh ? '输入URL地址...' : 'Enter URL address...'}
                    className="cms-input flex-1"
                  />
                  <Button
                    onClick={fetchUrlMetadata}
                    disabled={isUrlFetching || !urlInput.trim()}
                    className="cms-primary-button"
                  >
                    {isUrlFetching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* 标题 */}
            <div>
              <label className="block text-sm font-medium text-white mb-2 font-terminal">
                {isZh ? '标题' : 'Title'} *
              </label>
              <Input
                value={interestData.title}
                onChange={(e) => setInterestData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={isZh ? '输入标题...' : 'Enter title...'}
                className="cms-input"
              />
            </div>

            {/* 描述 */}
            <div>
              <label className="block text-sm font-medium text-white mb-2 font-terminal">
                {isZh ? '描述' : 'Description'}
              </label>
              <Input
                value={interestData.description}
                onChange={(e) => setInterestData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={isZh ? '输入描述...' : 'Enter description...'}
                className="cms-input"
              />
            </div>

            {/* 内容（仅普通内容显示） */}
            {interestData.type === 'content' && (
              <div>
                <label className="block text-sm font-medium text-white mb-2 font-terminal">
                  {isZh ? '内容' : 'Content'}
                </label>
                <MarkdownEditor
                  value={interestData.content}
                  onChange={(value) => setInterestData(prev => ({ ...prev, content: value }))}
                  placeholder={isZh ? '输入内容...' : 'Enter content...'}
                />
              </div>
            )}

            {/* 图片选择 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2 font-terminal">
                  {isZh ? '主图片' : 'Main Image'}
                </label>
                <div className="flex flex-col space-y-2">
                  {interestData.imageId && (
                    <img
                      src={getImageUrl(interestData.imageId)}
                      alt="Preview"
                      className="w-full h-20 object-cover rounded border border-blue-500/30"
                    />
                  )}
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setShowImageSelector(true)}
                      className="cms-secondary-button flex-1 text-xs"
                    >
                      <Image className="w-3 h-3 mr-1" />
                      {isZh ? '选择' : 'Select'}
                    </Button>
                    {interestData.imageId && (
                      <Button
                        onClick={() => setInterestData(prev => ({ ...prev, imageId: '' }))}
                        className="cms-danger-button text-xs"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2 font-terminal">
                  {isZh ? '封面图片' : 'Cover Image'}
                </label>
                <div className="flex flex-col space-y-2">
                  {interestData.manualCoverImageId && (
                    <img
                      src={getImageUrl(interestData.manualCoverImageId)}
                      alt="Cover Preview"
                      className="w-full h-20 object-cover rounded border border-purple-500/30"
                    />
                  )}
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setShowManualCoverImageSelector(true)}
                      className="cms-secondary-button flex-1 text-xs"
                    >
                      <ImagePlus className="w-3 h-3 mr-1" />
                      {isZh ? '选择' : 'Select'}
                    </Button>
                    {interestData.manualCoverImageId && (
                      <Button
                        onClick={() => setInterestData(prev => ({ ...prev, manualCoverImageId: '' }))}
                        className="cms-danger-button text-xs"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 保存和取消按钮 */}
            <div className="flex space-x-3 pt-4 border-t border-blue-500/30">
              <Button
                onClick={handleSave}
                disabled={isSaving || !interestData.title}
                className="cms-primary-button flex-1"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {isZh ? '保存中...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isZh ? '保存' : 'Save'}
                  </>
                )}
              </Button>
              
              {editingInterest && (
                <Button
                  onClick={handleCancel}
                  className="cms-secondary-button"
                >
                  {isZh ? '取消' : 'Cancel'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}