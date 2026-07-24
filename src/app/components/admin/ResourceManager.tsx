import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Upload, Trash2, Eye, Copy, Check, Folder, Search, Grid3X3, Grid2X2, AlertCircle, Loader2, RefreshCw, Info, Clock, Database, HardDrive, Wrench, Plus, X, ExternalLink, FileText, Music, Video, Link, Play, Image as ImageIcon } from 'lucide-react';
import { useContent, ImageItem } from '../content/ContentContext';
import { ImageWithFallback, ImagePresets } from '../figma/ImageWithFallback';
import { useLanguage } from '../language/LanguageContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface ResourceManagerProps {
  onSelect?: (resource: ImageItem) => void;
  selectionMode?: boolean;
}

type ResourceType = 'all' | 'images' | 'videos' | 'audio' | 'documents' | 'links';

export default function ResourceManager({ onSelect, selectionMode = false }: ResourceManagerProps) {
  const { uploadImage, getImages, deleteImage, isOnline, clearCache } = useContent();
  const { isZh } = useLanguage();
  
  const [resources, setResources] = useState<ImageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedResource, setSelectedResource] = useState<ImageItem | null>(null);
  const [copiedResourceId, setCopiedResourceId] = useState<string | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const [activeResourceType, setActiveResourceType] = useState<ResourceType>('all');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resource type filters
  const resourceTypes = [
    { id: 'all' as ResourceType, name: isZh ? '全部' : 'All', icon: Folder },
    { id: 'images' as ResourceType, name: isZh ? '图片' : 'Images', icon: ImageIcon },
    { id: 'videos' as ResourceType, name: isZh ? '视频' : 'Videos', icon: Video },
    { id: 'audio' as ResourceType, name: isZh ? '音频' : 'Audio', icon: Music },
    { id: 'documents' as ResourceType, name: isZh ? '文档' : 'Documents', icon: FileText },
    { id: 'links' as ResourceType, name: isZh ? '链接' : 'Links', icon: Link }
  ];

  // Load resources on component mount
  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setIsLoading(true);
    try {
      const resourceList = await getImages();
      setResources(resourceList);
      setLastRefreshTime(Date.now());
    } catch (error) {
      console.error('Error loading resources:', error);
      setUploadError(isZh ? '加载资源失败' : 'Failed to load resources');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      clearCache();
      await loadResources();
    } catch (error) {
      console.error('Error refreshing resources:', error);
    } finally {
      setIsRefreshing(false);
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
        // 支持更多文件类型
        const allowedTypes = [
          'image/', 'video/', 'audio/',
          'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument',
          'text/plain'
        ];
        
        const isAllowed = allowedTypes.some(type => file.type.startsWith(type));
        
        if (!isAllowed) {
          errors.push(`${file.name} ${isZh ? '不是支持的文件类型' : 'is not a supported file type'}`);
          continue;
        }
        
        if (file.size > 50 * 1024 * 1024) { // 50MB limit for videos and documents
          errors.push(`${file.name} ${isZh ? '文件太大（超过50MB）' : 'file too large (over 50MB)'}`);
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
        // Refresh resources list
        setTimeout(() => {
          loadResources();
        }, 1000);
      }
      
      if (errors.length > 0) {
        setUploadError(errors.join('\n'));
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(isZh ? '资源上传失败，请检查网络连接' : 'Resource upload failed, please check network connection');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    const resourceToDelete = resources.find(res => res.id === resourceId);
    if (!resourceToDelete) return;

    const confirmMessage = isZh 
      ? `确定要删除资源"${resourceToDelete.filename}"吗？\n\n⚠️ 删除后的资源将从云端永久移除，无法恢复！`
      : `Are you sure you want to delete resource "${resourceToDelete.filename}"?\n\n⚠️ The resource will be permanently removed from cloud storage and cannot be recovered!`;
    
    if (!window.confirm(confirmMessage)) return;
    
    try {
      // Remove from local list immediately for better UX
      const updatedResources = resources.filter(res => res.id !== resourceId);
      setResources(updatedResources);
      
      if (selectedResource?.id === resourceId) {
        setSelectedResource(null);
      }

      // Call delete API
      await deleteImage(resourceId);
      
      // Refresh list after a delay
      setTimeout(() => {
        loadResources();
      }, 1000);
      
    } catch (error) {
      console.error('Error deleting resource:', error);
      // Revert the UI change on error
      setResources(resources);
      alert(isZh ? '删除资源失败，请重试' : 'Failed to delete resource, please try again');
    }
  };

  const handleResourceSelect = (resource: ImageItem) => {
    if (selectionMode && onSelect) {
      onSelect(resource);
    } else {
      setSelectedResource(resource);
    }
  };

  const copyResourceReference = async (resource: ImageItem) => {
    const reference = `{{image:${resource.id}}}`;
    try {
      await navigator.clipboard.writeText(reference);
      setCopiedResourceId(resource.id);
      setTimeout(() => setCopiedResourceId(null), 2000);
    } catch (err) {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = reference;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedResourceId(resource.id);
      setTimeout(() => setCopiedResourceId(null), 2000);
    }
  };

  const copyResourceUrl = async (resource: ImageItem) => {
    try {
      await navigator.clipboard.writeText(resource.file_url);
      setCopiedResourceId(resource.id);
      setTimeout(() => setCopiedResourceId(null), 2000);
    } catch (err) {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = resource.file_url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedResourceId(resource.id);
      setTimeout(() => setCopiedResourceId(null), 2000);
    }
  };

  // Get resource type from file
  const getResourceType = (resource: ImageItem): ResourceType => {
    const filename = resource.filename.toLowerCase();
    const ext = filename.split('.').pop();
    
    if (!ext) return 'images'; // Default
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) return 'images';
    if (['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv', 'flv', 'm4v', 'mkv'].includes(ext)) return 'videos';
    if (['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma'].includes(ext)) return 'audio';
    if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) return 'documents';
    
    return 'images'; // Default to images for better compatibility
  };

  // Filtered and paginated resources
  const { filteredResources, totalPages, currentPageResources } = useMemo(() => {
    let filtered = resources.filter(resource =>
      resource.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.alt_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.caption?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply resource type filter
    if (activeResourceType !== 'all') {
      filtered = filtered.filter(resource => getResourceType(resource) === activeResourceType);
    }

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageResources = filtered.slice(startIndex, endIndex);

    return {
      filteredResources: filtered,
      totalPages,
      currentPageResources
    };
  }, [resources, searchTerm, currentPage, itemsPerPage, activeResourceType]);

  // Reset to first page when search term or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeResourceType]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getResourceIcon = (resource: ImageItem) => {
    const type = getResourceType(resource);
    switch (type) {
      case 'videos': return Video;
      case 'audio': return Music;
      case 'documents': return FileText;
      case 'links': return Link;
      default: return ImageIcon;
    }
  };

  // 简化的资源缩略图渲染器 - 移除所有overlay
  const renderResourceThumbnail = (resource: ImageItem) => {
    const type = getResourceType(resource);
    const ResourceIcon = getResourceIcon(resource);

    switch (type) {
      case 'images':
        return (
          <div className="w-full h-full relative">
            <img
              src={resource.file_url}
              alt={resource.alt_text || resource.filename}
              className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
              loading="lazy"
              onError={(e) => {
                console.error('Image failed to load:', resource.file_url, e);
                const target = e.currentTarget;
                target.style.display = 'none';
                
                // Create fallback element
                const fallback = document.createElement('div');
                fallback.className = 'w-full h-full bg-gray-100 flex items-center justify-center';
                fallback.innerHTML = `
                  <div class="text-center">
                    <svg class="w-8 h-8 text-gray-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                    </svg>
                    <p class="text-xs text-gray-500">加载失败</p>
                  </div>
                `;
                target.parentElement?.appendChild(fallback);
              }}
            />
            
            {/* 文件类型指示器 */}
            {resource.filename.toLowerCase().endsWith('.gif') && (
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                GIF
              </div>
            )}
            
            {resource.filename.toLowerCase().endsWith('.png') && (
              <div className="absolute top-2 left-2 bg-blue-500/70 text-white text-xs px-2 py-1 rounded">
                PNG
              </div>
            )}
          </div>
        );
        
      case 'videos':
        return (
          <div className="w-full h-full bg-gray-900 flex items-center justify-center relative">
            <Video className="w-12 h-12 text-white opacity-80" />
            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              VIDEO
            </div>
          </div>
        );
        
      case 'audio':
        return (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center relative">
            <Music className="w-12 h-12 text-blue-600" />
            <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
              AUDIO
            </div>
          </div>
        );
        
      default:
        return (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <ResourceIcon className="w-12 h-12 text-gray-400" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-600/20">
            <Folder className="w-5 h-5 text-pink-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              {selectionMode 
                ? (isZh ? '选择资源' : 'Select Resource')
                : (isZh ? '资源管理' : 'Resource Management')
              }
            </h3>
            <p className="text-sm text-gray-600">
              {isOnline ? (isZh ? '云端资源库' : 'Cloud resource library') : (isZh ? '本地资源库' : 'Local resource library')} · 
              {resources.length} {isZh ? '个资源' : 'resources'}
              {filteredResources.length !== resources.length && (
                <span> · {isZh ? '筛选后' : 'filtered'} {filteredResources.length}</span>
              )}
            </p>
          </div>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isZh ? '刷新' : 'Refresh'}
        </Button>
      </div>

      {/* Upload Error */}
      {uploadError && (
        <Alert className="bg-red-50/80 border-red-200/50">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium">{isZh ? '操作错误' : 'Operation Error'}</p>
                <p className="text-sm whitespace-pre-wrap">{uploadError}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUploadError(null)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Resource Type Filters */}
      <div className="flex flex-wrap gap-2">
        {resourceTypes.map((type) => {
          const Icon = type.icon;
          const isActive = activeResourceType === type.id;
          const count = type.id === 'all' ? resources.length : resources.filter(r => getResourceType(r) === type.id).length;
          
          return (
            <Button
              key={type.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveResourceType(type.id)}
              className={`flex items-center space-x-2 ${
                isActive ? 'bg-blue-500 text-white' : 'text-gray-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{type.name}</span>
              <Badge variant="secondary" className="text-xs ml-1">
                {count}
              </Badge>
            </Button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center space-x-4">
          {/* File Upload */}
          <div>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {isUploading ? (isZh ? '上传中...' : 'Uploading...') : (isZh ? '上传资源' : 'Upload Resources')}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.rtf"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
              disabled={isUploading}
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder={isZh ? '搜索资源...' : 'Search resources...'}
              className="pl-10 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
            >
              <Grid2X2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Resource Gallery */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : currentPageResources.length === 0 ? (
        <div className="text-center py-12">
          <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="font-medium text-gray-900 mb-2">
            {searchTerm || activeResourceType !== 'all'
              ? (isZh ? '未找到匹配的资源' : 'No matching resources found')
              : (isZh ? '还没有上传资源' : 'No resources uploaded yet')
            }
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || activeResourceType !== 'all'
              ? (isZh ? '尝试调整搜索词或筛选条件' : 'Try adjusting your search terms or filters')
              : (isZh ? '点击上传按钮开始添加资源' : 'Click the upload button to start adding resources')
            }
          </p>
          {!searchTerm && activeResourceType === 'all' && (
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isZh ? '上传第一个资源' : 'Upload First Resource'}
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
            : 'space-y-4'
          }>
            {currentPageResources.map((resource) => {
              const ResourceIcon = getResourceIcon(resource);
              const resourceType = getResourceType(resource);
              
              return (
                <Card
                  key={resource.id}
                  className="group cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden"
                  onClick={() => handleResourceSelect(resource)}
                >
                  {viewMode === 'grid' ? (
                    <>
                      {/* 简化的图片容器 - 无overlay */}
                      <div className="aspect-square relative overflow-hidden">
                        {renderResourceThumbnail(resource)}
                      </div>
                      
                      {/* 信息区域 */}
                      <div className="p-3">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {resource.filename}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatFileSize(resource.file_size || 0)}
                        </p>
                        
                        {/* 操作按钮 - 移到图片外部 */}
                        <div className="flex items-center space-x-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyResourceReference(resource);
                            }}
                            className="flex-1 text-xs"
                          >
                            {copiedResourceId === resource.id ? (
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
                              handleDeleteResource(resource.id);
                            }}
                            className="text-xs"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          {renderResourceThumbnail(resource)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{resource.filename}</h4>
                          <p className="text-sm text-gray-600">
                            {formatFileSize(resource.file_size || 0)} • {new Date(resource.uploaded_at).toLocaleDateString()}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <p className="text-xs text-gray-500 capitalize">{resourceType}</p>
                          </div>
                          {resource.alt_text && (
                            <p className="text-xs text-gray-500 truncate">{resource.alt_text}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyResourceReference(resource);
                            }}
                          >
                            {copiedResourceId === resource.id ? (
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
                              handleDeleteResource(resource.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                {isZh ? '上一页' : 'Previous'}
              </Button>
              <span className="text-sm text-gray-600">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                {isZh ? '下一页' : 'Next'}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Resource Detail Modal */}
      {selectedResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-medium text-gray-900">{selectedResource.filename}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedResource(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 flex items-center justify-center min-h-[300px]">
                  {getResourceType(selectedResource) === 'images' ? (
                    <img
                      src={selectedResource.file_url}
                      alt={selectedResource.alt_text || selectedResource.filename}
                      className="max-w-full max-h-96 rounded-lg shadow-sm"
                      loading="lazy"
                    />
                  ) : getResourceType(selectedResource) === 'videos' ? (
                    <video
                      src={selectedResource.file_url}
                      controls
                      className="max-w-full max-h-96 rounded-lg shadow-sm"
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : getResourceType(selectedResource) === 'audio' ? (
                    <div className="w-full max-w-md">
                      <audio
                        src={selectedResource.file_url}
                        controls
                        className="w-full"
                        preload="metadata"
                      >
                        Your browser does not support the audio tag.
                      </audio>
                    </div>
                  ) : (
                    <div className="bg-gray-100 rounded-lg p-12 flex flex-col items-center">
                      {React.createElement(getResourceIcon(selectedResource), { 
                        className: "w-16 h-16 text-gray-400 mb-4" 
                      })}
                      <p className="text-gray-600 text-center">{selectedResource.filename}</p>
                    </div>
                  )}
                </div>
                
                <div className="lg:w-80 space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{isZh ? '资源信息' : 'Resource Info'}</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">{isZh ? '文件名:' : 'Filename:'}</span>
                        <span className="ml-2">{selectedResource.filename}</span>
                      </div>
                      <div>
                        <span className="font-medium">{isZh ? '文件大小:' : 'File size:'}</span>
                        <span className="ml-2">{formatFileSize(selectedResource.file_size || 0)}</span>
                      </div>
                      <div>
                        <span className="font-medium">{isZh ? '上传时间:' : 'Upload time:'}</span>
                        <span className="ml-2">{new Date(selectedResource.uploaded_at).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="font-medium">{isZh ? '资源类型:' : 'Resource type:'}</span>
                        <span className="ml-2 capitalize">{getResourceType(selectedResource)}</span>
                      </div>
                      {selectedResource.alt_text && (
                        <div>
                          <span className="font-medium">{isZh ? '描述:' : 'Description:'}</span>
                          <span className="ml-2">{selectedResource.alt_text}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyResourceReference(selectedResource)}
                      className="w-full justify-start"
                    >
                      {copiedResourceId === selectedResource.id ? (
                        <Check className="w-4 h-4 mr-2 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 mr-2" />
                      )}
                      {isZh ? '复制引用码' : 'Copy Reference'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyResourceUrl(selectedResource)}
                      className="w-full justify-start"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {isZh ? '复制资源URL' : 'Copy Resource URL'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        handleDeleteResource(selectedResource.id);
                        setSelectedResource(null);
                      }}
                      className="w-full justify-start"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {isZh ? '删除资源' : 'Delete Resource'}
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