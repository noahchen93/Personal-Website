import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Upload, Trash2, Eye, Copy, Check, Image, Search, Grid3X3, Grid2X2, AlertCircle, Loader2, RefreshCw, Info, Clock, Database, HardDrive, Wrench, Plus, X, ExternalLink, Edit, CloudDownload } from 'lucide-react';
import { useContent, ImageItem } from '../content/ContentContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useLanguage } from '../language/LanguageContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import StorageDiagnostics from './StorageDiagnostics';

interface ImageManagerPanelProps {
  onSelect?: (image: ImageItem) => void;
  selectionMode?: boolean;
}

export default function ImageManagerPanel({ onSelect, selectionMode = false }: ImageManagerPanelProps) {
  const { uploadImage, getImages, deleteImage, updateImage, syncStorage, isOnline, clearCache } = useContent();
  const { isZh } = useLanguage();
  
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [copiedImageId, setCopiedImageId] = useState<string | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const [editingImageName, setEditingImageName] = useState(false);
  const [editedImageName, setEditedImageName] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load images on component mount
  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async (forceRefresh: boolean = false) => {
    setIsLoading(true);
    try {
      console.log('📸 Loading images...', { forceRefresh });
      const imageList = await getImages(forceRefresh);
      setImages(imageList);
      setLastRefreshTime(Date.now());
      console.log('✅ Images loaded:', imageList.length);
    } catch (error) {
      console.error('❌ Error loading images:', error);
      setUploadError(isZh ? '加载图片失败' : 'Failed to load images');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      console.log('🔄 Manual refresh requested');
      clearCache();
      // 使用forceRefresh参数强制从服务器获取最新数据
      const freshImages = await getImages(true);
      setImages(freshImages);
      setLastRefreshTime(Date.now());
      console.log('✅ Manual refresh completed:', freshImages.length, 'images loaded');
    } catch (error) {
      console.error('❌ Error refreshing images:', error);
      setUploadError(isZh ? '刷新图片失败，请重试' : 'Failed to refresh images, please try again');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleStorageSync = async (forceSync: boolean = false) => {
    if (!isOnline) {
      setUploadError(isZh ? '离线模式下无法同步存储' : 'Cannot sync storage in offline mode');
      return;
    }

    setIsSyncing(true);
    setSyncMessage(null);
    setUploadError(null);

    try {
      console.log('🔄 Storage sync requested...', { forceSync });
      const result = await syncStorage(forceSync);
      
      if (result.success) {
        setSyncMessage(result.message);
        console.log('✅ Storage sync successful:', result);
        
        // 刷新图片列表
        setTimeout(() => {
          loadImages(true);
        }, 1000);
      } else {
        setUploadError(result.message);
        console.error('❌ Storage sync failed:', result);
      }
    } catch (error) {
      console.error('❌ Storage sync error:', error);
      setUploadError(isZh ? `存储同步失败: ${error.message}` : `Storage sync failed: ${error.message}`);
    } finally {
      setIsSyncing(false);
      
      // 清除成功消息
      if (syncMessage) {
        setTimeout(() => {
          setSyncMessage(null);
        }, 5000);
      }
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;
    
    setIsUploading(true);
    setUploadError(null);
    
    const uploadResults: ImageItem[] = [];
    const errors: string[] = [];
    
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          errors.push(`${file.name} ${isZh ? '不是有效的图片文件' : 'is not a valid image file'}`);
          continue;
        }
        
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          errors.push(`${file.name} ${isZh ? '文件太大（超过10MB）' : 'file too large (over 10MB)'}`);
          continue;
        }
        
        try {
          const result = await uploadImage(file, file.name, '');
          uploadResults.push(result);
        } catch (error: any) {
          errors.push(`${file.name} ${isZh ? '上传失败' : 'upload failed'}: ${error.message}`);
        }
      }

      if (uploadResults.length > 0) {
        // Refresh images list
        setTimeout(() => {
          loadImages();
        }, 1000);
      }
      
      if (errors.length > 0) {
        setUploadError(errors.join('\n'));
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(isZh ? '图片上传失败，请检查网络连接' : 'Image upload failed, please check network connection');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    const imageToDelete = images.find(img => img.id === imageId);
    if (!imageToDelete) return;

    const confirmMessage = isZh 
      ? `确定要删除图片\"${imageToDelete.filename}\"吗？\n\n⚠️ 删除后的图片将从云端永久移除，无法恢复！`
      : `Are you sure you want to delete image \"${imageToDelete.filename}\"?\n\n⚠️ The image will be permanently removed from cloud storage and cannot be recovered!`;
    
    if (!window.confirm(confirmMessage)) return;
    
    try {
      // Remove from local list immediately for better UX
      const updatedImages = images.filter(img => img.id !== imageId);
      setImages(updatedImages);
      
      if (selectedImage?.id === imageId) {
        setSelectedImage(null);
      }

      // Call delete API
      await deleteImage(imageId);
      
      // Refresh list after a delay
      setTimeout(() => {
        loadImages();
      }, 1000);
      
    } catch (error) {
      console.error('Error deleting image:', error);
      // Revert the UI change on error
      setImages(images);
      alert(isZh ? '删除图片失败，请重试' : 'Failed to delete image, please try again');
    }
  };

  const handleImageSelect = (image: ImageItem) => {
    if (selectionMode && onSelect) {
      onSelect(image);
    } else {
      setSelectedImage(image);
      setEditedImageName(image.filename);
      setEditingImageName(false);
    }
  };

  const handleImageNameEdit = async () => {
    if (!selectedImage || !editedImageName.trim()) return;

    try {
      const updatedImage = await updateImage(selectedImage.id, {
        filename: editedImageName.trim()
      });
      
      setSelectedImage(updatedImage);
      setEditingImageName(false);
      
      // Refresh the images list
      setTimeout(() => {
        loadImages();
      }, 500);
    } catch (error) {
      console.error('Error updating image name:', error);
      alert(isZh ? '更新图片名称失败，请重试' : 'Failed to update image name, please try again');
    }
  };

  const handleImageNameCancel = () => {
    if (selectedImage) {
      setEditedImageName(selectedImage.filename);
    }
    setEditingImageName(false);
  };

  const copyImageReference = async (image: ImageItem) => {
    const reference = `{{image:${image.id}}}`;
    try {
      await navigator.clipboard.writeText(reference);
      setCopiedImageId(image.id + '_ref');
      setTimeout(() => setCopiedImageId(null), 2000);
    } catch (err) {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = reference;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedImageId(image.id + '_ref');
      setTimeout(() => setCopiedImageId(null), 2000);
    }
  };

  const copyImageUrl = async (image: ImageItem) => {
    try {
      await navigator.clipboard.writeText(image.file_url);
      setCopiedImageId(image.id + '_url');
      setTimeout(() => setCopiedImageId(null), 2000);
    } catch (err) {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = image.file_url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedImageId(image.id + '_url');
      setTimeout(() => setCopiedImageId(null), 2000);
    }
  };

  // Filtered and paginated images
  const { filteredImages, totalPages, currentPageImages } = useMemo(() => {
    const filtered = images.filter(image =>
      image.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.alt_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.caption?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageImages = filtered.slice(startIndex, endIndex);

    return {
      filteredImages: filtered,
      totalPages,
      currentPageImages
    };
  }, [images, searchTerm, currentPage, itemsPerPage]);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatLastRefreshTime = (): string => {
    if (lastRefreshTime === 0) return isZh ? '未刷新' : 'Not refreshed';
    const seconds = Math.floor((Date.now() - lastRefreshTime) / 1000);
    if (seconds < 60) return `${seconds}${isZh ? '秒前' : 's ago'}`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}${isZh ? '分钟前' : 'm ago'}`;
    const hours = Math.floor(minutes / 60);
    return `${hours}${isZh ? '小时前' : 'h ago'}`;
  };

  return (
    <div className="space-y-6 cms-container">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg cms-bg-secondary">
            <Image className="w-5 h-5 terminal-text-cyan" />
          </div>
          <div>
            <h3 className="terminal-text-large cms-text-primary">
              {selectionMode 
                ? (isZh ? '选择图片' : 'Select Image')
                : (isZh ? '图片管理' : 'Image Management')
              }
            </h3>
            <p className="terminal-text-small cms-text-secondary">
              {isOnline ? (isZh ? '云端图片库' : 'Cloud image library') : (isZh ? '本地图片库' : 'Local image library')} · 
              {images.length} {isZh ? '张图片' : 'images'}
              {filteredImages.length !== images.length && (
                <span> · {isZh ? '筛选后' : 'filtered'} {filteredImages.length}</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            variant="outline"
            size="sm"
            title={isZh ? '存储诊断工具' : 'Storage diagnostics tools'}
            className="cms-secondary-button"
          >
            <Wrench className="w-4 h-4 mr-2" />
            {isZh ? '诊断' : 'Diagnose'}
          </Button>
          <Button
            onClick={() => handleStorageSync(false)}
            variant="outline"
            size="sm"
            disabled={isSyncing || !isOnline}
            title={isZh ? '同步云端存储和本地缓存' : 'Sync cloud storage with local cache'}
            className="cms-secondary-button"
          >
            <CloudDownload className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-bounce' : ''}`} />
            {isSyncing ? (isZh ? '同步中...' : 'Syncing...') : (isZh ? '同步' : 'Sync')}
          </Button>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            className="cms-secondary-button"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isZh ? '刷新' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Diagnostics Panel */}
      {showDiagnostics && (
        <div className="cms-bg-card p-4 rounded-lg border border-blue-400/30">
          <StorageDiagnostics />
        </div>
      )}

      {/* Sync Success Message */}
      {syncMessage && (
        <Alert className="cms-bg-card border-green-400/50">
          <Check className="w-4 h-4 text-green-400" />
          <AlertDescription className="cms-text-primary">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium">{isZh ? '同步成功' : 'Sync Successful'}</p>
                <p className="terminal-text-small">{syncMessage}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSyncMessage(null)}
                className="text-green-400 hover:text-green-300 p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Error */}
      {uploadError && (
        <Alert className="cms-bg-card border-red-400/50">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <AlertDescription className="cms-text-primary">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium">{isZh ? '操作错误' : 'Operation Error'}</p>
                <p className="terminal-text-small whitespace-pre-wrap">{uploadError}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUploadError(null)}
                className="text-red-400 hover:text-red-300 p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center space-x-4">
          {/* File Upload */}
          <div>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="cms-primary-button"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {isUploading ? (isZh ? '上传中...' : 'Uploading...') : (isZh ? '上传图片' : 'Upload Images')}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
              disabled={isUploading}
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" />
            <Input
              type="text"
              placeholder={isZh ? '搜索图片...' : 'Search images...'}
              className="pl-10 w-64 cms-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex cms-bg-secondary rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'cms-primary-button' : 'cms-text-secondary'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'cms-primary-button' : 'cms-text-secondary'}`}
            >
              <Grid2X2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin terminal-text-cyan" />
        </div>
      ) : currentPageImages.length === 0 ? (
        <div className="text-center py-12">
          <Image className="w-16 h-16 cms-text-secondary mx-auto mb-4" />
          <h3 className="terminal-text-large cms-text-primary mb-2">
            {searchTerm 
              ? (isZh ? '未找到匹配的图片' : 'No matching images found')
              : (isZh ? '还没有上传图片' : 'No images uploaded yet')
            }
          </h3>
          <p className="terminal-text-small cms-text-secondary mb-6">
            {searchTerm 
              ? (isZh ? '尝试调整搜索词' : 'Try adjusting your search terms')
              : (isZh ? '点击上传按钮开始添加图片' : 'Click the upload button to start adding images')
            }
          </p>
          {!searchTerm && (
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="cms-primary-button"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isZh ? '上传第一张图片' : 'Upload First Image'}
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
            : 'space-y-4'
          }>
            {currentPageImages.map((image) => (
              <Card
                key={image.id}
                className="group cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden cms-bg-card border border-blue-400/30 hover:border-blue-400/50"
                onClick={() => handleImageSelect(image)}
              >
                {viewMode === 'grid' ? (
                  <div className="aspect-square relative overflow-hidden">
                    <ImageWithFallback
                      src={image.file_url}
                      alt={image.alt_text || image.filename}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyImageReference(image);
                          }}
                          className="cms-secondary-button h-8 w-8 p-0"
                        >
                          {copiedImageId === image.id + '_ref' ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteImage(image.id);
                          }}
                          className="cms-danger-button h-8 w-8 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <p className="text-white text-xs truncate">{image.filename}</p>
                    </div>
                  </div>
                ) : (
                  <CardContent className="p-4 cms-bg-card">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-blue-400/30">
                        <ImageWithFallback
                          src={image.file_url}
                          alt={image.alt_text || image.filename}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="cms-text-primary font-medium truncate">{image.filename}</h4>
                        <p className="terminal-text-small cms-text-secondary">
                          {formatFileSize(image.file_size || 0)} • {new Date(image.uploaded_at).toLocaleDateString()}
                        </p>
                        {image.alt_text && (
                          <p className="terminal-text-small cms-text-muted truncate">{image.alt_text}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyImageReference(image);
                          }}
                          className="cms-secondary-button"
                        >
                          {copiedImageId === image.id + '_ref' ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteImage(image.id);
                          }}
                          className="cms-danger-button"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="cms-secondary-button"
              >
                {isZh ? '上一页' : 'Previous'}
              </Button>
              <span className="terminal-text-small cms-text-secondary">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="cms-secondary-button"
              >
                {isZh ? '下一页' : 'Next'}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Image Detail Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="cms-bg-primary border border-blue-400/50 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-blue-400/30">
              <h3 className="terminal-text-large cms-text-primary truncate mr-4">{selectedImage.filename}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedImage(null)}
                className="flex-shrink-0 cms-secondary-button"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 dialog-scrollbar">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <ImageWithFallback
                    src={selectedImage.file_url}
                    alt={selectedImage.alt_text || selectedImage.filename}
                    className="w-full h-auto rounded-lg shadow-sm border border-blue-400/30"
                  />
                </div>
                <div className="lg:w-80 space-y-4">
                  <div>
                    <h4 className="terminal-text-large cms-text-primary mb-2">{isZh ? '图片信息' : 'Image Info'}</h4>
                    <div className="space-y-3 terminal-text-small cms-text-secondary">
                      <div className="space-y-2">
                        <span className="font-medium block cms-text-primary">{isZh ? '文件名:' : 'Filename:'}</span>
                        {editingImageName ? (
                          <div className="space-y-2">
                            <Input
                              value={editedImageName}
                              onChange={(e) => setEditedImageName(e.target.value)}
                              className="cms-input terminal-text-small w-full"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleImageNameEdit();
                                } else if (e.key === 'Escape') {
                                  handleImageNameCancel();
                                }
                              }}
                              placeholder={isZh ? '输入新的文件名' : 'Enter new filename'}
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleImageNameCancel}
                                className="h-7 cms-secondary-button"
                              >
                                <X className="w-3 h-3 mr-1" />
                                {isZh ? '取消' : 'Cancel'}
                              </Button>
                              <Button
                                size="sm"
                                onClick={handleImageNameEdit}
                                disabled={!editedImageName.trim()}
                                className="h-7 cms-primary-button"
                              >
                                <Check className="w-3 h-3 mr-1" />
                                {isZh ? '保存' : 'Save'}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2 min-h-[2rem]">
                            <span className="break-all flex-1 leading-5 cms-text-primary">{selectedImage.filename}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingImageName(true)}
                              className="p-1 h-6 w-6 flex-shrink-0 mt-0.5 cms-secondary-button"
                              title={isZh ? '编辑文件名' : 'Edit filename'}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="font-medium cms-text-primary">{isZh ? '文件大小:' : 'File size:'}</span>
                        <span className="ml-2">{formatFileSize(selectedImage.file_size || 0)}</span>
                      </div>
                      <div>
                        <span className="font-medium cms-text-primary">{isZh ? '上传时间:' : 'Upload time:'}</span>
                        <span className="ml-2">{new Date(selectedImage.uploaded_at).toLocaleString()}</span>
                      </div>
                      {selectedImage.alt_text && (
                        <div>
                          <span className="font-medium cms-text-primary">{isZh ? '描述:' : 'Description:'}</span>
                          <span className="ml-2">{selectedImage.alt_text}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyImageReference(selectedImage)}
                      className="w-full justify-start cms-secondary-button"
                    >
                      {copiedImageId === selectedImage.id + '_ref' ? (
                        <Check className="w-4 h-4 mr-2 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 mr-2" />
                      )}
                      {isZh ? '复制引用码' : 'Copy Reference'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyImageUrl(selectedImage)}
                      className="w-full justify-start cms-secondary-button"
                    >
                      {copiedImageId === selectedImage.id + '_url' ? (
                        <Check className="w-4 h-4 mr-2 text-green-400" />
                      ) : (
                        <ExternalLink className="w-4 h-4 mr-2" />
                      )}
                      {isZh ? '复制图片URL' : 'Copy Image URL'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        handleDeleteImage(selectedImage.id);
                        setSelectedImage(null);
                      }}
                      className="w-full justify-start cms-danger-button"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {isZh ? '删除图片' : 'Delete Image'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}