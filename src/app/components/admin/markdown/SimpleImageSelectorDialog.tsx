import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Image, Upload, Search, X, Check, Loader2, AlertCircle, Wifi, WifiOff, Grid3X3, Grid2X2 } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { useContent, ImageItem } from '../../content/ContentContext';
import { useLanguage } from '../../language/LanguageContext';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { toast } from 'sonner';

interface SimpleImageSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageSelect: (imageId: string, caption?: string) => void;
}

export default function SimpleImageSelectorDialog({
  open,
  onOpenChange,
  onImageSelect
}: SimpleImageSelectorDialogProps) {
  const { getImages, uploadImage, isOnline } = useContent();
  const { isZh } = useLanguage();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [caption, setCaption] = useState('');
  const [altText, setAltText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [gridSize, setGridSize] = useState<'small' | 'medium' | 'large'>('medium');

  // 优化的搜索过滤
  const filteredImages = useMemo(() => {
    if (!searchQuery.trim()) {
      return images;
    }
    const query = searchQuery.toLowerCase();
    return images.filter(img => 
      img.filename.toLowerCase().includes(query) ||
      (img.alt_text && img.alt_text.toLowerCase().includes(query)) ||
      (img.caption && img.caption.toLowerCase().includes(query))
    );
  }, [images, searchQuery]);

  // 网格样式配置
  const gridConfig = useMemo(() => {
    switch (gridSize) {
      case 'small':
        return {
          className: 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10',
          gap: 'gap-2'
        };
      case 'medium':
        return {
          className: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6',
          gap: 'gap-3'
        };
      case 'large':
        return {
          className: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
          gap: 'gap-4'
        };
      default:
        return {
          className: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6',
          gap: 'gap-3'
        };
    }
  }, [gridSize]);

  // 当对话框打开时加载图片
  useEffect(() => {
    console.log('🚪 SimpleImageSelectorDialog useEffect triggered:', { open, isInitialized });
    if (open && !isInitialized) {
      console.log('📷 SimpleImageSelectorDialog 首次打开，开始初始化...');
      setIsInitialized(true);
      
      // 重置状态
      setSelectedImage(null);
      setCaption('');
      setAltText('');
      setSearchQuery('');
      setLoadError(null);
      setImages([]);
      
      // 异步加载图片
      loadImagesAsync();
    }
  }, [open, isInitialized]);

  // 当选择图片时，预填充信息
  useEffect(() => {
    if (selectedImage) {
      setAltText(selectedImage.alt_text || selectedImage.filename);
      // 不预填充caption，让用户自己决定是否需要
      setCaption('');
    }
  }, [selectedImage]);

  // 重置对话框关闭时的状态
  useEffect(() => {
    if (!open && isInitialized) {
      console.log('🚪 SimpleImageSelectorDialog 关闭，重置状态');
      setIsInitialized(false);
    }
  }, [open, isInitialized]);

  const loadImagesAsync = async () => {
    setIsLoading(true);
    setLoadError(null);
    
    try {
      console.log('🔍 异步加载图片数据...');
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('加载超时')), 15000)
      );
      
      const loadPromise = getImages(false);
      const imageList = await Promise.race([loadPromise, timeoutPromise]) as ImageItem[];
      
      console.log('✅ 成功加载图片:', imageList.length, '张');
      
      // 按上传时间倒序排列，最新的在前面
      const sortedImages = imageList.sort((a, b) => 
        new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
      );
      
      setImages(sortedImages);
      
      if (sortedImages.length === 0) {
        console.log('ℹ️ 没有找到图片');
        setLoadError(isZh ? '暂无图片，请先上传一些图片' : 'No images found, please upload some images first');
      }
    } catch (error) {
      console.error('❌ 加载图片失败:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setLoadError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(isZh ? '请选择图片文件' : 'Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error(isZh ? '图片文件不能超过10MB' : 'Image file cannot exceed 10MB');
      return;
    }

    setIsUploading(true);
    try {
      const uploadedImage = await uploadImage(file, altText || file.name, caption);
      setImages(prev => [uploadedImage, ...prev]);
      setSelectedImage(uploadedImage);
      toast.success(isZh ? '图片上传成功' : 'Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(isZh ? '图片上传失败' : 'Failed to upload image');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleInsertImage = () => {
    if (!selectedImage) {
      toast.error(isZh ? '请选择一张图片' : 'Please select an image');
      return;
    }

    console.log('✅ 插入图片:', selectedImage.id, caption);
    onImageSelect(selectedImage.id, caption.trim() || undefined);
    handleClose();
  };

  const handleClose = () => {
    console.log('🚪 关闭图片选择器');
    onOpenChange(false);
  };

  const handleRetryLoad = () => {
    console.log('🔄 重试加载图片');
    loadImagesAsync();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Keyboard event handler - 保持页面滚动功能
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (open && event.key === 'Escape') {
        handleClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  console.log('🔍 SimpleImageSelectorDialog render:', { 
    open, 
    isInitialized,
    imagesCount: images.length,
    selectedImageId: selectedImage?.id 
  });

  if (!open) return null;

  const dialogContent = (
    <>
      {/* 遮罩层 - 修复pointer-events */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(10, 14, 26, 0.8)',
          backdropFilter: 'blur(6px)',
          zIndex: 50000,
          pointerEvents: 'auto', // 确保可以接收点击事件
        }}
        onClick={handleClose}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
      />

      {/* 对话框内容 - 修复pointer-events */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '96vw',
          maxWidth: '96vw',
          height: '92vh',
          maxHeight: '92vh',
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          zIndex: 50001,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: 'SF Mono, Monaco, Inconsolata, Roboto Mono, Source Code Pro, Ubuntu Mono, monospace',
          pointerEvents: 'auto', // 确保对话框内容可以接收事件
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
      >
        {/* 对话框头部 */}
        <div style={{
          borderBottom: '1px solid #e5e7eb',
          padding: '1.5rem',
          flexShrink: 0,
          pointerEvents: 'auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#1f2937' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Image size={20} />
              <span style={{ fontSize: '18px', fontWeight: '500' }}>
                {isZh ? '选择图片' : 'Select Image'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: '1rem' }}>
                {isOnline ? <Wifi size={16} color="#10b981" /> : <WifiOff size={16} color="#ef4444" />}
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  {isOnline ? (isZh ? '在线' : 'Online') : (isZh ? '离线' : 'Offline')}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {filteredImages.length > 0 && (
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  {isZh ? `${filteredImages.length} 张图片` : `${filteredImages.length} images`}
                </span>
              )}
              <button
                onClick={handleClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  borderRadius: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'auto',
                }}
              >
                <X size={20} color="#6b7280" />
              </button>
            </div>
          </div>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '0.5rem', margin: 0 }}>
            {isZh 
              ? '从已上传的图片中选择一张插入到内容中，或上传新的图片。'
              : 'Select an image from your uploaded images to insert into your content, or upload a new image.'
            }
          </p>
        </div>

        {/* 主要内容区域 */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', pointerEvents: 'auto' }}>
          {/* 图片库区域 */}
          <div style={{ 
            flex: 3, 
            borderRight: '1px solid #e5e7eb', 
            display: 'flex', 
            flexDirection: 'column',
            pointerEvents: 'auto',
          }}>
            {/* 工具栏 */}
            <div style={{
              borderBottom: '1px solid #f3f4f6',
              padding: '0.75rem 1rem',
              flexShrink: 0,
              pointerEvents: 'auto',
            }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* 搜索框 */}
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                  <Search 
                    size={16} 
                    color="#9ca3af" 
                    style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none'
                    }}
                  />
                  <Input
                    placeholder={isZh ? '搜索图片文件名、描述...' : 'Search filename, description...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      paddingLeft: '2.5rem',
                      height: '2.25rem',
                      fontSize: '14px',
                      borderRadius: '0.5rem',
                      border: '1px solid #d1d5db',
                      backgroundColor: 'white',
                      pointerEvents: 'auto',
                    }}
                    disabled={isLoading}
                  />
                </div>

                {/* 上传按钮 */}
                <div style={{ position: 'relative' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: 0,
                      cursor: 'pointer',
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'auto',
                    }}
                    disabled={isUploading || !isOnline}
                  />
                  <button 
                    disabled={isUploading || !isOnline}
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid #d1d5db',
                      color: '#374151',
                      padding: '0.375rem 0.75rem',
                      borderRadius: '0.5rem',
                      fontSize: '14px',
                      height: '2.25rem',
                      whiteSpace: 'nowrap',
                      cursor: (isUploading || !isOnline) ? 'not-allowed' : 'pointer',
                      opacity: (isUploading || !isOnline) ? 0.5 : 1,
                      fontFamily: 'inherit',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      pointerEvents: 'none' // 让file input接收点击事件
                    }}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                        {isZh ? '上传中...' : 'Uploading...'}
                      </>
                    ) : (
                      <>
                        <Upload size={14} />
                        {isZh ? '上传' : 'Upload'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 图片网格 - 修复滚轮滚动 */}
            <div style={{ flex: 1, overflow: 'hidden', padding: '1rem', pointerEvents: 'auto' }}>
              <div 
                style={{ 
                  height: '100%', 
                  overflowY: 'auto', 
                  pointerEvents: 'auto',
                  scrollBehavior: 'smooth'
                }} 
                className="dialog-scrollbar"
                onWheel={(e) => {
                  // 确保滚轮事件不被阻止，允许在图片网格区域使用滚轮
                  e.stopPropagation();
                }}
              >
                {isLoading ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
                    <p style={{ color: '#6b7280', margin: 0 }}>
                      {isZh ? '正在加载图片...' : 'Loading images...'}
                    </p>
                  </div>
                ) : loadError ? (
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%',
                    padding: '2rem',
                    textAlign: 'center'
                  }}>
                    <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
                    <p style={{ color: '#dc2626', fontWeight: '500', margin: '0 0 0.5rem 0' }}>
                      {isZh ? '加载失败' : 'Loading Failed'}
                    </p>
                    <p style={{ color: '#6b7280', margin: '0 0 1rem 0', wordBreak: 'break-word' }}>
                      {loadError}
                    </p>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRetryLoad();
                      }}
                      style={{
                        backgroundColor: '#3b82f6',
                        border: '1px solid #3b82f6',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: '14px',
                        fontWeight: '500',
                        pointerEvents: 'auto',
                      }}
                    >
                      {isZh ? '重试' : 'Retry'}
                    </button>
                  </div>
                ) : filteredImages.length > 0 ? (
                  <div style={{
                    display: 'grid',
                    gap: '0.75rem',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                    pointerEvents: 'auto',
                  }}>
                    {filteredImages.map((image) => (
                      <div
                        key={image.id}
                        style={{
                          position: 'relative',
                          aspectRatio: '1',
                          cursor: 'pointer',
                          borderRadius: '0.5rem',
                          overflow: 'hidden',
                          border: selectedImage?.id === image.id ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                          backgroundColor: selectedImage?.id === image.id ? '#eff6ff' : 'white',
                          boxShadow: selectedImage?.id === image.id ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : undefined,
                          transform: selectedImage?.id === image.id ? 'scale(1.02)' : 'scale(1)',
                          transition: 'all 0.2s',
                          pointerEvents: 'auto'
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('🖼️ 图片容器被点击:', image.filename);
                          console.log('🖼️ 当前选中图片ID:', selectedImage?.id);
                          console.log('🖼️ 点击的图片ID:', image.id);
                          setSelectedImage(image);
                          console.log('🖼️ 设置选中图片完成:', image.id);
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('🖼️ 图片容器 mouseDown:', image.filename);
                        }}
                        onMouseUp={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('🖼️ 图片容器 mouseUp:', image.filename);
                        }}
                      >
                        <ImageWithFallback
                          src={image.file_url}
                          alt={image.alt_text || image.filename}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            pointerEvents: 'none'
                          }}
                        />
                        {selectedImage?.id === image.id && (
                          <div style={{
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem',
                            width: '1.5rem',
                            height: '1.5rem',
                            backgroundColor: '#3b82f6',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 0 2px white',
                            pointerEvents: 'none'
                          }}>
                            <Check size={16} color="white" />
                          </div>
                        )}
                        {/* 文件名显示 */}
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                          color: 'white',
                          padding: '0.5rem',
                          fontSize: '12px',
                          pointerEvents: 'none'
                        }}>
                          <p style={{ 
                            margin: 0, 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            whiteSpace: 'nowrap',
                            fontWeight: '500'
                          }}>
                            {image.filename}
                          </p>
                          <p style={{ margin: 0, opacity: 0.9 }}>
                            {formatFileSize(image.file_size)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%',
                    textAlign: 'center',
                    padding: '2rem'
                  }}>
                    <Image size={48} color="#9ca3af" style={{ marginBottom: '1rem' }} />
                    <p style={{ color: '#374151', fontWeight: '500', margin: '0 0 0.5rem 0' }}>
                      {searchQuery 
                        ? (isZh ? '未找到匹配的图片' : 'No matching images found')
                        : (isZh ? '暂无图片' : 'No images available')
                      }
                    </p>
                    <p style={{ color: '#6b7280', margin: 0 }}>
                      {searchQuery 
                        ? (isZh ? '尝试调整搜索条件' : 'Try adjusting your search terms')
                        : (isZh ? '请上传一些图片开始使用' : 'Please upload some images to get started')
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 侧边栏 - 修复滚轮滚动 */}
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            backgroundColor: '#f9fafb',
            overflow: 'hidden',
            pointerEvents: 'auto',
          }}>
            {selectedImage ? (
              <>
                <div style={{
                  borderBottom: '1px solid #e5e7eb',
                  padding: '0.75rem 1rem',
                  flexShrink: 0
                }}>
                  <h3 style={{ margin: 0, color: '#1f2937', fontSize: '16px', fontWeight: '500' }}>
                    {isZh ? '图片详情' : 'Image Details'}
                  </h3>
                </div>
                
                <div 
                  style={{ 
                    flex: 1, 
                    overflowY: 'auto', 
                    padding: '1rem', 
                    pointerEvents: 'auto',
                    scrollBehavior: 'smooth'
                  }} 
                  className="dialog-scrollbar"
                  onWheel={(e) => {
                    // 确保滚轮事件不被阻止，允许在侧边栏区域使用滚轮
                    e.stopPropagation();
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* 预览图 */}
                    <div>
                      <Label style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937', marginBottom: '0.5rem', display: 'block' }}>
                        {isZh ? '预览' : 'Preview'}
                      </Label>
                      <div style={{
                        aspectRatio: '1',
                        borderRadius: '0.5rem',
                        overflow: 'hidden',
                        border: '1px solid #e5e7eb',
                        backgroundColor: 'white'
                      }}>
                        <ImageWithFallback
                          src={selectedImage.file_url}
                          alt={selectedImage.alt_text || selectedImage.filename}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                    </div>

                    {/* 基本信息 */}
                    <div style={{
                      backgroundColor: 'white',
                      borderRadius: '0.5rem',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb'
                    }}>
                      <h4 style={{ 
                        margin: '0 0 0.75rem 0', 
                        color: '#1f2937', 
                        fontSize: '14px', 
                        fontWeight: '500',
                        borderBottom: '1px solid #f3f4f6',
                        paddingBottom: '0.5rem'
                      }}>
                        {isZh ? '基本信息' : 'Basic Info'}
                      </h4>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div>
                          <Label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '0.25rem' }}>
                            {isZh ? '文件名' : 'Filename'}
                          </Label>
                          <p style={{ 
                            margin: 0, 
                            fontSize: '12px', 
                            color: '#6b7280',
                            backgroundColor: '#f9fafb',
                            padding: '0.5rem',
                            borderRadius: '0.25rem',
                            border: '1px solid #f3f4f6',
                            wordBreak: 'break-all'
                          }}>
                            {selectedImage.filename}
                          </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                          <div>
                            <Label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '0.25rem' }}>
                              {isZh ? '文件大小' : 'Size'}
                            </Label>
                            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                              {formatFileSize(selectedImage.file_size)}
                            </p>
                          </div>
                          <div>
                            <Label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '0.25rem' }}>
                              {isZh ? '上传时间' : 'Uploaded'}
                            </Label>
                            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                              {new Date(selectedImage.uploaded_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 图片标题输入 */}
                    <div>
                      <Label style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937', marginBottom: '0.5rem', display: 'block' }}>
                        {isZh ? '图片标题（可选）' : 'Image Caption (Optional)'}
                      </Label>
                      <Textarea
                        placeholder={isZh ? '为图片添加标题或描述...' : 'Add a caption or description for the image...'}
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        style={{
                          minHeight: '80px',
                          fontSize: '14px',
                          borderRadius: '0.5rem',
                          border: '1px solid #d1d5db',
                          backgroundColor: 'white',
                          pointerEvents: 'auto',
                        }}
                      />
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: '0.5rem 0 0 0' }}>
                        {isZh 
                          ? '图片标题将显示在图片下方'
                          : 'The caption will be displayed below the image'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* 插入按钮 */}
                <div style={{
                  borderTop: '1px solid #e5e7eb',
                  padding: '1rem',
                  flexShrink: 0,
                  backgroundColor: 'white'
                }}>
                  <Button
                    onClick={handleInsertImage}
                    style={{
                      width: '100%',
                      backgroundColor: '#3b82f6',
                      border: '1px solid #3b82f6',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.5rem',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      pointerEvents: 'auto',
                    }}
                  >
                    {isZh ? '插入图片' : 'Insert Image'}
                  </Button>
                </div>
              </>
            ) : (
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '2rem',
                textAlign: 'center'
              }}>
                <Image size={48} color="#9ca3af" style={{ marginBottom: '1rem' }} />
                <p style={{ color: '#374151', fontWeight: '500', margin: '0 0 0.5rem 0' }}>
                  {isZh ? '选择图片' : 'Select an Image'}
                </p>
                <p style={{ color: '#6b7280', margin: 0 }}>
                  {isZh 
                    ? '从左侧图片库中选择一张图片查看详情'
                    : 'Choose an image from the gallery on the left to view details'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(dialogContent, document.body);
}