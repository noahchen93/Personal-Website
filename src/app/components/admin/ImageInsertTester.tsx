import React, { useState, useEffect } from 'react';
import { Image, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useContent } from '../content/ContentContext';
import { useLanguage } from '../language/LanguageContext';
import ImageSelectorDialog from './markdown/ImageSelectorDialog';
import { Button } from '../ui/button';
import { toast } from 'sonner';

export default function ImageInsertTester() {
  const { getImages, isOnline } = useContent();
  const { isZh } = useLanguage();
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [images, setImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insertedImage, setInsertedImage] = useState<string | null>(null);

  const testImageLoad = async () => {
    setIsLoading(true);
    setError(null);
    console.log('🔍 开始测试图片加载...');
    
    try {
      const imageList = await getImages(true); // 强制刷新
      setImages(imageList);
      console.log('✅ 图片加载成功:', imageList);
      
      if (imageList.length === 0) {
        setError(isZh ? '暂无图片，请先上传一些图片' : 'No images found, please upload some images first');
      }
    } catch (err) {
      console.error('❌ 图片加载失败:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (imageId: string, caption?: string) => {
    const imageRef = caption 
      ? `{{image:${imageId}|${caption}}}` 
      : `{{image:${imageId}}}`;
    setInsertedImage(imageRef);
    console.log('✅ 图片插入成功:', imageRef);
    toast.success(isZh ? '图片插入成功！' : 'Image inserted successfully!');
  };

  useEffect(() => {
    testImageLoad();
  }, []);

  return (
    <div className="space-y-4 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">
          {isZh ? '图片插入功能测试' : 'Image Insert Function Test'}
        </h3>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {isOnline ? (isZh ? '在线' : 'Online') : (isZh ? '离线' : 'Offline')}
          </span>
        </div>
      </div>

      {/* 测试结果显示 */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          ) : error ? (
            <AlertCircle className="w-4 h-4 text-red-500" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          )}
          <span className="text-sm">
            {isLoading 
              ? (isZh ? '正在加载图片...' : 'Loading images...') 
              : error 
                ? (isZh ? '加载失败' : 'Load failed')
                : (isZh ? `发现 ${images.length} 张图片` : `Found ${images.length} images`)
            }
          </span>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">
            {error}
          </div>
        )}

        {images.length > 0 && (
          <div className="text-sm text-green-600 bg-green-50 p-3 rounded-xl">
            {isZh ? '图片数据加载正常，可以进行插入测试' : 'Image data loaded successfully, ready for insert test'}
          </div>
        )}

        {insertedImage && (
          <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-xl">
            <strong>{isZh ? '插入的图片代码: ' : 'Inserted image code: '}</strong>
            <code className="bg-white px-2 py-1 rounded border">{insertedImage}</code>
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex space-x-3">
        <Button
          onClick={testImageLoad}
          disabled={isLoading}
          variant="outline"
          className="flex items-center space-x-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Image className="w-4 h-4" />
          )}
          <span>{isZh ? '重新测试加载' : 'Test Load Again'}</span>
        </Button>

        <Button
          onClick={() => setShowImageDialog(true)}
          disabled={isLoading || images.length === 0}
          className="flex items-center space-x-2"
        >
          <Image className="w-4 h-4" />
          <span>{isZh ? '打开图片选择器' : 'Open Image Selector'}</span>
        </Button>
      </div>

      {/* 图片预览 */}
      {images.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            {isZh ? '可用图片预览:' : 'Available Images Preview:'}
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {images.slice(0, 8).map((image) => (
              <div key={image.id} className="relative aspect-square">
                <img
                  src={image.file_url}
                  alt={image.alt_text || image.filename}
                  className="w-full h-full object-cover rounded-lg border"
                  onError={(e) => {
                    console.error('图片加载失败:', image.file_url);
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-lg truncate">
                  {image.filename}
                </div>
              </div>
            ))}
          </div>
          {images.length > 8 && (
            <p className="text-sm text-gray-500 mt-2">
              {isZh ? `还有 ${images.length - 8} 张图片...` : `And ${images.length - 8} more images...`}
            </p>
          )}
        </div>
      )}

      {/* 图片选择对话框 */}
      <ImageSelectorDialog
        open={showImageDialog}
        onOpenChange={setShowImageDialog}
        onImageSelect={handleImageSelect}
      />
    </div>
  );
}