import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Image, Upload, Search, X, Check, Loader2, AlertCircle, Wifi, WifiOff, Grid3X3, Grid2X2, Type } from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { useContent, ImageItem } from '../../content/ContentContext';
import { useLanguage } from '../../language/LanguageContext';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { toast } from 'sonner';

interface ImageSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageSelect: (imageId: string, caption?: string) => void;
}

export default function ImageSelectorDialog({
  open,
  onOpenChange,
  onImageSelect
}: ImageSelectorDialogProps) {
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
  const [gridSize, setGridSize] = useState<'small' | 'medium' | 'large'>('medium');
  
  // 创建文件输入引用
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 搜索过滤
  const filteredImages = useMemo(() => {
    if (!searchQuery.trim()) return images;
    const query = searchQuery.toLowerCase();
    return images.filter(img => 
      img.filename.toLowerCase().includes(query) ||
      (img.alt_text && img.alt_text.toLowerCase().includes(query)) ||
      (img.caption && img.caption.toLowerCase().includes(query))
    );
  }, [images, searchQuery]);

  // 网格配置
  const gridConfig = useMemo(() => {
    switch (gridSize) {
      case 'small':
        return { className: 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-6', gap: 'gap-2' };
      case 'medium':
        return { className: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4', gap: 'gap-3' };
      case 'large':
        return { className: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3', gap: 'gap-4' };
      default:
        return { className: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4', gap: 'gap-3' };
    }
  }, [gridSize]);

  // 加载图片
  useEffect(() => {
    if (open) {
      loadImages();
      // 重置选择状态
      setSelectedImage(null);
      setCaption('');
      setAltText('');
    }
  }, [open]);

  // 选择图片时预填信息
  useEffect(() => {
    if (selectedImage) {
      setAltText(selectedImage.alt_text || selectedImage.filename);
      setCaption(selectedImage.caption || '');
    }
  }, [selectedImage]);

  const loadImages = async () => {
    setIsLoading(true);
    setLoadError(null);
    
    try {
      const imageList = await getImages(false);
      const sortedImages = imageList.sort((a, b) => 
        new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
      );
      setImages(sortedImages);
      
      if (sortedImages.length === 0) {
        setLoadError(isZh ? '暂无图片，请先上传一些图片' : 'No images found, please upload some images first');
      }
    } catch (error) {
      console.error('Failed to load images:', error);
      setLoadError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  };

  // 触发文件选择
  const handleUploadClick = () => {
    if (fileInputRef.current && !isUploading && isOnline) {
      fileInputRef.current.click();
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
      // 清空文件输入，允许重复选择同一文件
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleInsertImage = () => {
    if (!selectedImage) {
      toast.error(isZh ? '请选择一张图片' : 'Please select an image');
      return;
    }

    // 获取最终的caption，优先使用用户当前输入的内容
    const finalCaption = caption.trim() || undefined;
    
    console.log('✅ 插入图片:', selectedImage.id, 'caption:', finalCaption);
    onImageSelect(selectedImage.id, finalCaption);
    
    // 显示成功消息，包含caption信息
    if (finalCaption) {
      toast.success(isZh ? `✅ 图片插入成功！说明: ${finalCaption}` : `✅ Image inserted successfully! Caption: ${finalCaption}`);
    } else {
      toast.success(isZh ? '✅ 图片插入成功！' : '✅ Image inserted successfully!');
    }
    
    onOpenChange(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // 内联样式对象
  const scrollbarStyles = {
    overflowY: 'auto' as const,
    maxHeight: 'calc(100vh - 300px)',
    scrollbarWidth: 'auto' as const,
    scrollbarColor: '#3b82f6 #e5e7eb'
  };

  const sidebarScrollbarStyles = {
    overflowY: 'auto' as const,
    maxHeight: 'calc(100vh - 200px)'
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100000]" />
        
        <DialogPrimitive.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[96vw] max-w-6xl h-[92vh] bg-white rounded-lg shadow-xl z-[100001] flex flex-col">
          <DialogPrimitive.Title className="sr-only">
            {isZh ? '选择图片' : 'Select Image'}
          </DialogPrimitive.Title>
          
          <DialogPrimitive.Description className="sr-only">
            {isZh 
              ? '选择一个图片文件并可选择添加说明文字，然后插入到内容编辑器中。您可以上传新图片、搜索现有图片或从图库中选择。'
              : 'Select an image file and optionally add a caption, then insert it into the content editor. You can upload new images, search existing images, or select from the gallery.'
            }
          </DialogPrimitive.Description>
          
          {/* CSS样式 */}
          <style dangerouslySetInnerHTML={{
            __html: `
              .image-grid-container::-webkit-scrollbar {
                width: 12px;
              }
              .image-grid-container::-webkit-scrollbar-track {
                background: #e5e7eb;
                border-radius: 6px;
              }
              .image-grid-container::-webkit-scrollbar-thumb {
                background: #3b82f6;
                border-radius: 6px;
                border: 2px solid #e5e7eb;
              }
              .image-grid-container::-webkit-scrollbar-thumb:hover {
                background: #1d4ed8;
              }
            `
          }} />
          
          {/* 头部 */}
          <div className="border-b border-gray-200 px-6 py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Image className="w-5 h-5 text-gray-600" />
                <span className="text-large text-gray-900">{isZh ? '选择图片' : 'Select Image'}</span>
                <div className="flex items-center space-x-1 ml-4">
                  {isOnline ? (
                    <Wifi className="w-4 h-4 text-green-500" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-small text-gray-500">
                    {isOnline ? (isZh ? '在线' : 'Online') : (isZh ? '离线' : 'Offline')}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-small text-gray-600 mt-2">
              {isZh 
                ? '选择图片并可选择添加说明文字，然后插入到内容中。可用滚轮浏览所有图片。'
                : 'Select an image and optionally add a caption, then insert it into your content. Use scroll wheel to browse all images.'
              }
            </p>
          </div>

          {/* 主要内容 */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full grid grid-cols-1 lg:grid-cols-4 gap-0">
              {/* 图片网格区域 - 修复滚动条 */}
              <div className="col-span-1 lg:col-span-3 border-r border-gray-200 flex flex-col">
                {/* 工具栏 */}
                <div className="border-b border-gray-100 px-4 py-3 flex-shrink-0">
                  <div className="flex items-center space-x-3">
                    {/* 搜索框 */}
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder={isZh ? '搜索图片...' : 'Search images...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white border-gray-300 text-gray-900"
                        disabled={isLoading}
                      />
                    </div>

                    {/* 网格尺寸 */}
                    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                      <Button
                        size="sm"
                        variant={gridSize === 'large' ? 'default' : 'ghost'}
                        onClick={() => setGridSize('large')}
                        className="h-7 w-7 p-0"
                      >
                        <Grid2X2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant={gridSize === 'medium' ? 'default' : 'ghost'}
                        onClick={() => setGridSize('medium')}
                        className="h-7 w-7 p-0"
                      >
                        <Grid3X3 className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    {/* 上传按钮 - 修复点击问题 */}
                    <div>
                      {/* 隐藏的文件输入 */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={isUploading || !isOnline}
                      />
                      <Button 
                        onClick={handleUploadClick}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                        disabled={isUploading || !isOnline}
                      >
                        {isUploading ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        {isUploading ? (isZh ? '上传中...' : 'Uploading...') : (isZh ? '上传' : 'Upload')}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 图片网格 - 简单直接的滚动条修复 */}
                <div 
                  className="flex-1 p-4 image-grid-container" 
                  style={scrollbarStyles}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                        <p className="text-gray-500">{isZh ? '正在加载图片...' : 'Loading images...'}</p>
                      </div>
                    </div>
                  ) : loadError ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                        <p className="text-red-600 mb-4">{loadError}</p>
                        <Button onClick={loadImages}>{isZh ? '重试' : 'Retry'}</Button>
                      </div>
                    </div>
                  ) : filteredImages.length > 0 ? (
                    <div className={`grid ${gridConfig.className} ${gridConfig.gap}`}>
                      {filteredImages.map((image) => (
                        <div
                          key={image.id}
                          className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImage?.id === image.id
                              ? 'border-blue-500 shadow-lg'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedImage(image)}
                        >
                          <ImageWithFallback
                            src={image.file_url}
                            alt={image.alt_text || image.filename}
                            className="w-full h-full object-cover"
                          />
                          {selectedImage?.id === image.id && (
                            <div className="absolute top-2 right-2">
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                            <p className="text-white text-xs truncate">{image.filename}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">
                          {isZh ? '没有找到图片' : 'No images found'}
                        </p>
                        <p className="text-gray-500 text-small">
                          {isZh ? '请上传一些图片开始使用' : 'Please upload some images to get started'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 侧边栏 - 图片详情和caption输入 */}
              <div className="col-span-1 flex flex-col bg-gray-50">
                {selectedImage ? (
                  <div 
                    className="flex-1 p-4 space-y-4"
                    style={sidebarScrollbarStyles}
                  >
                    {/* 预览区域 */}
                    <div>
                      <Label className="text-small text-gray-700 flex items-center gap-2">
                        <Image className="w-4 h-4" />
                        {isZh ? '预览' : 'Preview'}
                      </Label>
                      <div className="mt-2 aspect-square rounded-lg overflow-hidden border shadow-sm">
                        <ImageWithFallback
                          src={selectedImage.file_url}
                          alt={selectedImage.alt_text || selectedImage.filename}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Caption输入 - 突出显示 */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <Label htmlFor="caption" className="text-small text-blue-800 flex items-center gap-2 mb-2">
                        <Type className="w-4 h-4" />
                        {isZh ? '图片说明' : 'Caption'}
                        <span className="text-xs text-blue-600 font-normal">
                          ({isZh ? '可选' : 'Optional'})
                        </span>
                      </Label>
                      <Textarea
                        id="caption"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder={isZh ? '为图片添加说明文字，将显示在图片下方...' : 'Add a caption for the image, will be displayed below the image...'}
                        rows={3}
                        className="bg-white border-blue-300 text-gray-900 placeholder-blue-400 focus:border-blue-500 focus:ring-blue-200"
                      />
                      <p className="text-xs text-blue-600 mt-1">
                        {isZh 
                          ? '图片说明会显示在插入的图片下方，可以留空。'
                          : 'The caption will be displayed below the inserted image, can be left empty.'
                        }
                      </p>
                    </div>

                    {/* Alt Text输入 */}
                    <div>
                      <Label htmlFor="altText" className="text-small text-gray-700">
                        {isZh ? 'Alt文本' : 'Alt Text'}
                      </Label>
                      <Input
                        id="altText"
                        value={altText}
                        onChange={(e) => setAltText(e.target.value)}
                        placeholder={isZh ? '描述图片内容' : 'Describe the image'}
                        className="mt-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {isZh ? '用于屏幕阅读器和SEO' : 'Used for screen readers and SEO'}
                      </p>
                    </div>

                    {/* 文件信息 */}
                    <div className="text-xs text-gray-500 space-y-1 bg-gray-100 rounded p-3">
                      <p><span className="font-medium">{isZh ? '文件名' : 'Filename'}:</span> {selectedImage.filename}</p>
                      <p><span className="font-medium">{isZh ? '大小' : 'Size'}:</span> {formatFileSize(selectedImage.file_size)}</p>
                      <p><span className="font-medium">{isZh ? '上传时间' : 'Uploaded'}:</span> {new Date(selectedImage.uploaded_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center text-gray-500">
                      <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-small">{isZh ? '请选择一张图片' : 'Please select an image'}</p>
                      <p className="text-xs mt-1">{isZh ? '选择后可添加说明文字' : 'You can add a caption after selecting'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 底部操作栏 */}
          <div className="border-t border-gray-200 px-6 py-4 flex justify-between items-center flex-shrink-0">
            <div className="text-small text-gray-500">
              {selectedImage ? (
                <div className="flex items-center gap-4">
                  <span>{isZh ? `已选择: ${selectedImage.filename}` : `Selected: ${selectedImage.filename}`}</span>
                  {caption.trim() && (
                    <span className="text-blue-600 flex items-center gap-1">
                      <Type className="w-3 h-3" />
                      {isZh ? '包含说明' : 'With caption'}
                    </span>
                  )}
                </div>
              ) : (
                <span>{isZh ? '请选择一张图片' : 'Please select an image'}</span>
              )}
            </div>
            <div className="flex space-x-3">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                {isZh ? '取消' : 'Cancel'}
              </Button>
              <Button 
                onClick={handleInsertImage} 
                disabled={!selectedImage}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {caption.trim() ? (
                  <>
                    {isZh ? '插入图片和说明' : 'Insert Image with Caption'}
                  </>
                ) : (
                  <>
                    {isZh ? '插入图片' : 'Insert Image'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}