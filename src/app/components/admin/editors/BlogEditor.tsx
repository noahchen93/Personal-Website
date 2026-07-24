import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2, Plus, Trash2, Tag, Calendar, Image as ImageIcon } from 'lucide-react';
import { useContent, ContentItem } from '../../content/ContentContext';
import { useLanguage } from '../../language/LanguageContext';
import EditorHeader from '../shared/EditorHeader';
import StatusMessage from '../shared/StatusMessage';
import MarkdownEditor from '../MarkdownEditor';
import SimpleImageSelectorDialog from '../markdown/SimpleImageSelectorDialog';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { Button } from '../../ui/button';
import { toast } from 'sonner';

interface BlogData {
  title: string;
  content: string;
  excerpt?: string;
  cover_image_id?: string;
  cover_caption?: string;
  coverImage?: string; // 添加兼容字段
  tags: string[];
  published: boolean;
}

interface BlogEditorProps {
  onBack: () => void;
}

export default function BlogEditor({ onBack }: BlogEditorProps) {
  const { getContent, updateContent, createContent, deleteContent, getImageUrl } = useContent();
  const { currentLanguage, isZh } = useLanguage();
  const [blogs, setBlogs] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingBlog, setEditingBlog] = useState<ContentItem | null>(null);
  const [blogData, setBlogData] = useState<BlogData>({
    title: '',
    content: '',
    excerpt: '',
    tags: [],
    published: true
  });
  const [newTag, setNewTag] = useState('');
  const [showImageSelector, setShowImageSelector] = useState(false);

  useEffect(() => {
    loadBlogs();
  }, [currentLanguage]);

  const loadBlogs = async () => {
    try {
      const content = await getContent('blog', undefined, currentLanguage);
      setBlogs(content);
    } catch (error) {
      console.error('Error loading blogs:', error);
      setMessage({ type: 'error', text: isZh ? '加载博客文章失败' : 'Failed to load blog posts' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingBlog(null);
    setBlogData({
      title: '',
      content: '',
      excerpt: '',
      tags: [],
      published: true
    });
  };

  const handleEdit = (blog: ContentItem) => {
    setEditingBlog(blog);
    setBlogData(blog.data);
  };

  const handleSave = async () => {
    if (!blogData.title.trim()) {
      setMessage({ type: 'error', text: isZh ? '请输入文章标题' : 'Please enter article title' });
      return;
    }

    if (!blogData.content.trim()) {
      setMessage({ type: 'error', text: isZh ? '请输入文章内容' : 'Please enter article content' });
      return;
    }

    setIsSaving(true);
    setMessage(null); // Clear previous messages
    
    try {
      console.log('开始保存博客:', { 
        editing: !!editingBlog, 
        title: blogData.title,
        language: currentLanguage,
        published: blogData.published,
        data: blogData 
      });
      
      if (editingBlog) {
        const updatedBlog = await updateContent(editingBlog.id, {
          title: blogData.title,
          data: blogData,
          is_published: blogData.published,
          language: currentLanguage
        });
        console.log('博客更新成功:', updatedBlog);
        setBlogs(prev => prev.map(b => b.id === editingBlog.id ? updatedBlog : b));
        setMessage({ type: 'success', text: isZh ? '博客文章已更新' : 'Blog post updated successfully' });
        toast.success(isZh ? '✅ 博客文章已更新' : '✅ Blog post updated successfully');
      } else {
        const newBlog = await createContent({
          type: 'blog',
          title: blogData.title,
          data: blogData,
          is_published: blogData.published,
          language: currentLanguage
        });
        console.log('博客创建成功:', newBlog);
        setBlogs(prev => [newBlog, ...prev]);
        setMessage({ type: 'success', text: isZh ? '博客文章已创建' : 'Blog post created successfully' });
        toast.success(isZh ? '✅ 博客文章已创建' : '✅ Blog post created successfully');
      }
      
      // Reset form
      setEditingBlog(null);
      setBlogData({
        title: '',
        content: '',
        excerpt: '',
        tags: [],
        published: true
      });
      
      // 显示成功状态
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('保存博客时出现错误:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setMessage({ 
        type: 'error', 
        text: isZh ? `保存失败: ${errorMessage}` : `Save failed: ${errorMessage}` 
      });
      toast.error(isZh ? `❌ 保存失败: ${errorMessage}` : `❌ Save failed: ${errorMessage}`);
      // Don't auto-hide error messages
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (blogId: string) => {
    const confirmMessage = isZh ? '确定要删除这篇博客文章吗？' : 'Are you sure you want to delete this blog post?';
    if (!window.confirm(confirmMessage)) return;

    try {
      await deleteContent(blogId);
      setBlogs(prev => prev.filter(b => b.id !== blogId));
      setMessage({ type: 'success', text: isZh ? '博客文章已删除' : 'Blog post deleted successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting blog:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setMessage({ 
        type: 'error', 
        text: isZh ? `删除失败: ${errorMessage}` : `Delete failed: ${errorMessage}` 
      });
    }
  };

  const addTag = () => {
    if (newTag.trim() && !blogData.tags.includes(newTag.trim())) {
      setBlogData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setBlogData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Generate excerpt from content if not provided
  const generateExcerpt = () => {
    if (blogData.content.trim()) {
      const excerpt = blogData.content
        .replace(/[#*`]/g, '') // Remove markdown symbols
        .split('\n')
        .find(line => line.trim().length > 0) // Find first non-empty line
        ?.substring(0, 150) + '...';
      
      setBlogData(prev => ({ ...prev, excerpt: excerpt || '' }));
    }
  };

  // 图片选择处理函数 - 优化caption处理
  const handleImageSelect = (imageId: string, caption?: string) => {
    console.log('🖼️ BlogEditor - 图片选择回调:', { imageId, caption });
    
    // 只有用户输入了非空caption时才保存，否则不设置caption
    const trimmedCaption = caption?.trim();
    const finalCaption = trimmedCaption && trimmedCaption.length > 0 ? trimmedCaption : undefined;
    
    // 使用和其他编辑器一致的格式 {{image:imageId}}
    const imageRef = finalCaption 
      ? `{{image:${imageId}|${finalCaption}}}` 
      : `{{image:${imageId}}}`;
    
    setBlogData(prev => ({
      ...prev,
      cover_image_id: imageId,
      cover_caption: finalCaption, // 只有用户输入时才设置
      // 同时保存imageRef格式，用于兼容性
      coverImage: imageRef
    }));
    
    toast.success(isZh ? '✅ 封面图片已设置' : '✅ Cover image set');
    setShowImageSelector(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 admin-editor cms-container">
      <EditorHeader
        title={isZh ? '博客管理' : 'Blog Management'}
        onBack={onBack}
        rightContent={
          <button
            onClick={handleCreateNew}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl text-small"
          >
            <Plus className="w-4 h-4" />
            <span>{isZh ? '新建文章' : 'New Article'}</span>
          </button>
        }
      />

      {message && (
        <StatusMessage type={message.type} message={message.text} />
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 博客列表 */}
        <div className="cms-bg-card rounded-xl shadow-lg border border-blue-500/30">
          <div className="p-4 border-b border-blue-500/30">
            <h3 className="font-semibold text-white font-terminal">{isZh ? '博客文章列表' : 'Blog Posts List'}</h3>
          </div>
          
          <div className="divide-y divide-blue-500/20 max-h-96 overflow-y-auto">
            {blogs.map((blog) => (
              <div key={blog.id} className="p-4 hover:bg-slate-700/50 rounded-xl transition-all duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-white mb-1 font-terminal">
                      {blog.data.title}
                      {!blog.data.published && (
                        <span className="ml-2 text-xs bg-slate-700/80 text-cyan-200 px-2 py-1 rounded-full border border-blue-500/20">
                          草稿
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-slate-300 mb-2 line-clamp-2 font-terminal">
                      {blog.data.excerpt || blog.data.content.substring(0, 100) + '...'}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-slate-400 font-terminal">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                      </div>
                      {blog.data.tags && blog.data.tags.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Tag className="w-3 h-3" />
                          <span>{blog.data.tags.slice(0, 2).join(', ')}</span>
                          {blog.data.tags.length > 2 && <span>+{blog.data.tags.length - 2}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(blog)}
                      className="cms-secondary-button text-sm px-3 py-1"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(blog.id)}
                      className="cms-danger-button text-sm px-3 py-1"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {blogs.length === 0 && (
              <div className="p-8 text-center text-slate-400 font-terminal">
                还没有博客文章，点击"新建文章"开始写作
              </div>
            )}
          </div>
        </div>

        {/* 博客编辑表单 */}
        <div className="cms-bg-card rounded-xl shadow-lg border border-blue-500/30">
          <div className="p-4 border-b border-blue-500/30">
            <h3 className="font-semibold text-white font-terminal">
              {editingBlog ? (isZh ? '编辑文章' : 'Edit Article') : (isZh ? '新建文章' : 'New Article')}
            </h3>
          </div>
          
          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-white mb-1 font-terminal">文章标题 *</label>
              <input
                type="text"
                value={blogData.title}
                onChange={(e) => setBlogData(prev => ({ ...prev, title: e.target.value }))}
                className="cms-input w-full rounded-xl"
                placeholder="输入文章标题"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1 font-terminal">文章摘要</label>
              <div className="relative">
                <textarea
                  value={blogData.excerpt || ''}
                  onChange={(e) => setBlogData(prev => ({ ...prev, excerpt: e.target.value }))}
                  rows={3}
                  className="cms-textarea w-full rounded-xl"
                  placeholder="文章摘要，留空时会自动从正文生成"
                />
                <button
                  onClick={generateExcerpt}
                  className="absolute bottom-2 right-2 text-xs text-cyan-400 hover:text-cyan-300 font-terminal"
                >
                  自动生成
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1 font-terminal">{isZh ? '封面图片' : 'Cover Image'}</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={blogData.cover_caption || ''}
                  onChange={(e) => setBlogData(prev => ({ ...prev, cover_caption: e.target.value }))}
                  className="cms-input flex-1 rounded-xl"
                  placeholder={isZh ? '图片说明（可选）' : 'Image caption (optional)'}
                />
                <Button
                  type="button"
                  onClick={() => {
                    console.log('🖼️ BlogEditor - 点击选择封面图片按钮');
                    setShowImageSelector(true);
                  }}
                  className="cms-secondary-button px-3 py-2 rounded-xl text-sm"
                >
                  <ImageIcon className="w-4 h-4 mr-1" />
                  {isZh ? '选择图片' : 'Select Image'}
                </Button>
              </div>
              
              {blogData.cover_image_id && (
                <div className="relative mt-2">
                  <ImageWithFallback
                    src={getImageUrl(blogData.cover_image_id)}
                    alt={blogData.cover_caption || 'Blog cover'}
                    className="w-full h-32 object-cover rounded-xl border border-blue-500/30"
                  />
                  <button
                    onClick={() => setBlogData(prev => ({ ...prev, cover_image_id: undefined, cover_caption: undefined }))}
                    className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-600 text-white rounded-full p-1 transition-all duration-200"
                    title={isZh ? '移除封面图片' : 'Remove cover image'}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  {blogData.cover_caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 rounded-b-xl">
                      <p className="text-white text-xs">{blogData.cover_caption}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1 font-terminal">文章内容 *</label>
              <MarkdownEditor
                value={blogData.content}
                onChange={(value) => setBlogData(prev => ({ ...prev, content: value }))}
                placeholder="开始写作你的技术博客..."
                minHeight="300px"
                maxHeight="400px"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1 font-terminal">标签</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {blogData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center bg-slate-700/80 text-cyan-200 px-2 py-1 rounded-md text-sm border border-blue-500/20"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-cyan-400 hover:text-cyan-300"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  className="cms-input flex-1 rounded-xl"
                  placeholder="输入标签"
                />
                <button
                  onClick={addTag}
                  className="cms-primary-button px-3 py-2 rounded-xl text-sm"
                >
                  添加
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="published"
                checked={blogData.published}
                onChange={(e) => setBlogData(prev => ({ ...prev, published: e.target.checked }))}
                className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-blue-500/30 rounded bg-slate-700"
              />
              <label htmlFor="published" className="ml-2 text-sm text-white font-terminal">
                发布文章（取消勾选保存为草稿）
              </label>
            </div>
          </div>
          
          <div className="p-4 border-t border-blue-500/30">
            <div className="flex space-x-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl transition-all duration-200 shadow-lg transform ${
                  justSaved 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 scale-105 shadow-green-200' 
                    : isSaving
                      ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
                      : 'cms-primary-button hover:scale-105'
                } text-white font-terminal`}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>
                  {justSaved
                    ? (isZh ? '✓ 已保存' : '✓ Saved')
                    : isSaving 
                      ? (isZh ? '保存中...' : 'Saving...') 
                      : editingBlog 
                        ? (blogData.published ? (isZh ? '更新并发布' : 'Update & Publish') : (isZh ? '保存为草稿' : 'Save as Draft'))
                        : (blogData.published ? (isZh ? '发布文章' : 'Publish Article') : (isZh ? '保存草稿' : 'Save Draft'))
                  }
                </span>
              </button>
              
              {editingBlog && (
                <button
                  onClick={handleCreateNew}
                  className="cms-secondary-button px-4 py-2 rounded-xl"
                >
                  取消编辑
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* 图片选择对话框 */}
      <SimpleImageSelectorDialog
        open={showImageSelector}
        onOpenChange={setShowImageSelector}
        onImageSelect={handleImageSelect}
      />
    </div>
  );
}