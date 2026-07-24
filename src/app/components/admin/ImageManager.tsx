import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { useContent, type ImageItem } from '../content/ContentContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { 
  Upload, 
  Search, 
  Trash2, 
  Edit, 
  Download, 
  RefreshCw, 
  FolderOpen, 
  Database,
  AlertCircle,
  CheckCircle,
  Loader2,
  Sync,
  HardDrive,
  FileImage,
  Eye,
  Info
} from 'lucide-react';
import { toast } from '../ui/sonner';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';

interface SyncStats {
  totalFiles: number;
  imageFiles: number;
  dbRecords: number;
  synchronized: number;
  updated: number;
  orphanedFiles: number;
  orphanedRecords: number;
  errors: number;
  directories: string[];
  storageMethod?: string;
}

interface SyncResult {
  success: boolean;
  message: string;
  stats?: SyncStats;
  results?: {
    totalFiles: number;
    imageFiles: number;
    synchronized: number;
    updated: number;
    orphanedFiles: number;
    orphanedRecords: number;
    errors: number;
    directoriesFound: string[];
    storageMethod?: string;
  };
}

export default function ImageManager() {
  const { getImages, uploadImage, deleteImage, updateImage, syncStorage, cleanupImages } = useContent();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [editingImage, setEditingImage] = useState<ImageItem | null>(null);
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStats, setSyncStats] = useState<SyncStats | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // 加载图片列表
  const loadImages = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      console.log('🔄 ImageManager: Loading images...');
      const imageList = await getImages(true); // 强制刷新
      console.log(`📸 ImageManager: Loaded ${imageList.length} images`);
      setImages(imageList);
      
      if (imageList.length > 0) {
        console.log('✅ Images loaded successfully:', imageList.map(img => ({ 
          id: img.id, 
          filename: img.filename, 
          hasUrl: !!img.file_url 
        })));
      } else {
        console.log('⚠️ No images found in the system');
      }
    } catch (error) {
      console.error('❌ Failed to load images:', error);
      toast.error('加载图片列表失败');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // 增强的存储同步功能
  const handleStorageSync = async (force = false) => {
    setSyncing(true);
    setSyncProgress(0);
    setSyncStats(null);
    
    try {
      console.log('🔄 Starting enhanced storage sync...');
      toast.info('开始同步存储桶文件...');
      
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);
      
      const result = await syncStorage(force) as SyncResult;
      
      clearInterval(progressInterval);
      setSyncProgress(100);
      
      console.log('📊 Sync result received:', result);
      
      if (result.success) {
        console.log('✅ Storage sync completed:', result);
        
        // 设置同步统计信息
        const stats = result.stats || result.results;
        if (stats) {
          setSyncStats(stats as SyncStats);
        }
        
        // 记录同步时间
        setLastSyncTime(new Date().toLocaleString());
        
        toast.success(result.message || '存储同步完成');
        
        // 等待一下再刷新，让同步完全完成
        setTimeout(async () => {
          console.log('🔄 Refreshing images after sync...');
          await loadImages(false);
          
          // 检查图片是否成功加载
          const freshImages = await getImages(true);
          if (freshImages.length > 0) {
            console.log(`✅ Successfully loaded ${freshImages.length} images after sync`);
            setImages(freshImages);
          } else {
            console.log('⚠️ Still no images after sync, checking localStorage...');
            // 尝试从localStorage检查
            try {
              const stored = localStorage.getItem('portfolio-images');
              if (stored) {
                const storedImages = JSON.parse(stored);
                console.log(`📦 Found ${storedImages.length} images in localStorage`);
                if (storedImages.length > 0) {
                  setImages(storedImages);
                }
              }
            } catch (error) {
              console.error('Failed to load from localStorage:', error);
            }
          }
        }, 2000);
      } else {
        throw new Error(result.message || '同步失败');
      }
    } catch (error: any) {
      console.error('❌ Storage sync failed:', error);
      toast.error(`存储同步失败: ${error.message}`);
    } finally {
      setSyncing(false);
      setSyncProgress(0);
      setTimeout(() => setSyncStats(null), 15000); // 15秒后清除统计信息
    }
  };

  // 图片清理功能
  const handleImageCleanup = async () => {
    setCleaning(true);
    try {
      toast.info('开始清理孤立图片记录...');
      
      const result = await cleanupImages();
      
      if (result.success) {
        toast.success(result.message || '图片清理完成');
        // 清理后刷新图片列表
        setTimeout(async () => {
          await loadImages(false);
        }, 1000);
      } else {
        throw new Error(result.message || '清理失败');
      }
    } catch (error: any) {
      console.error('❌ Image cleanup failed:', error);
      toast.error(`图片清理失败: ${error.message}`);
    } finally {
      setCleaning(false);
    }
  };

  // 文件上传处理
  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error('请选择要上传的文件');
      return;
    }

    setUploading(true);
    try {
      console.log('📤 Uploading file:', selectedFile.name);
      await uploadImage(selectedFile, altText || selectedFile.name, caption);
      
      toast.success('图片上传成功');
      setUploadDialog(false);
      setSelectedFile(null);
      setAltText('');
      setCaption('');
      await loadImages(false);
    } catch (error: any) {
      console.error('❌ Upload failed:', error);
      toast.error(`上传失败: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // 编辑图片信息
  const handleImageEdit = async () => {
    if (!editingImage) return;

    try {
      await updateImage(editingImage.id, {
        alt_text: altText,
        caption: caption
      });
      
      toast.success('图片信息更新成功');
      setEditDialog(false);
      setEditingImage(null);
      setAltText('');
      setCaption('');
      await loadImages(false);
    } catch (error: any) {
      console.error('❌ Update failed:', error);
      toast.error(`更新失败: ${error.message}`);
    }
  };

  // 删除图片
  const handleImageDelete = async (image: ImageItem) => {
    if (!confirm(`确定要删除图片 "${image.filename}" 吗？`)) return;

    try {
      await deleteImage(image.id);
      toast.success('图片删除成功');
      await loadImages(false);
    } catch (error: any) {
      console.error('❌ Delete failed:', error);
      toast.error(`删除失败: ${error.message}`);
    }
  };

  // 打开编辑对话框
  const openEditDialog = (image: ImageItem) => {
    setEditingImage(image);
    setAltText(image.alt_text || '');
    setCaption(image.caption || '');
    setEditDialog(true);
  };

  // 手动刷新图片列表
  const handleManualRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    await loadImages(true);
  };

  // 查看图片详情
  const viewImageDetails = (image: ImageItem) => {
    console.log('📋 Image details:', image);
    toast.info(`图片ID: ${image.id}\n文件名: ${image.filename}\n大小: ${formatFileSize(image.file_size)}\n上传时间: ${new Date(image.uploaded_at).toLocaleString()}`);
  };

  // 过滤图片
  const filteredImages = images.filter(image =>
    image.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (image.alt_text && image.alt_text.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (image.caption && image.caption.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 组件加载时获取图片列表
  useEffect(() => {
    console.log('📱 ImageManager component mounted');
    loadImages();
  }, []);

  return (
    <div className="glass-blue rounded-xl p-6 space-y-6">
      {/* 标题和操作栏 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="terminal-text-large terminal-text-white">图片管理</h2>
          <p className="terminal-text terminal-text">管理和同步存储桶中的图片文件</p>
          {lastSyncTime && (
            <p className="terminal-text-small text-gray-400">
              上次同步: {lastSyncTime}
            </p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          {/* 手动刷新按钮 */}
          <Button
            onClick={handleManualRefresh}
            disabled={loading}
            className="btn-glass-green"
            title="刷新图片列表"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                刷新中...
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                刷新列表
              </>
            )}
          </Button>

          {/* 存储同步按钮 */}
          <Button
            onClick={() => handleStorageSync(false)}
            disabled={syncing || loading}
            className="btn-glass-cyan"
          >
            {syncing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                同步中...
              </>
            ) : (
              <>
                <Sync className="w-4 h-4 mr-2" />
                同步存储桶
              </>
            )}
          </Button>

          {/* 强制同步按钮 */}
          <Button
            onClick={() => handleStorageSync(true)}
            disabled={syncing || loading}
            className="btn-glass-amber"
            variant="outline"
          >
            {syncing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                强制同步中...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                强制同步
              </>
            )}
          </Button>

          {/* 清理按钮 */}
          <Button
            onClick={handleImageCleanup}
            disabled={cleaning || loading}
            className="btn-glass-orange"
            variant="outline"
          >
            {cleaning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                清理中...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                清理孤立记录
              </>
            )}
          </Button>

          {/* 上传按钮 */}
          <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
            <DialogTrigger asChild>
              <Button className="btn-glass-blue">
                <Upload className="w-4 h-4 mr-2" />
                上传图片
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-blue rounded-xl">
              <DialogHeader>
                <DialogTitle className="terminal-text-white">上传新图片</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file" className="terminal-text-white">选择文件</Label>
                  <Input
                    id="file"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="cms-input"
                  />
                </div>
                
                <div>
                  <Label htmlFor="alt-text" className="terminal-text-white">替代文本</Label>
                  <Input
                    id="alt-text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="图片描述"
                    className="cms-input"
                  />
                </div>
                
                <div>
                  <Label htmlFor="caption" className="terminal-text-white">图片说明</Label>
                  <Input
                    id="caption"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="可选的图片说明"
                    className="cms-input"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleFileUpload} 
                    disabled={!selectedFile || uploading}
                    className="cms-primary-button flex-1"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        上传中...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        上传
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setUploadDialog(false)}
                    className="btn-glass-amber"
                  >
                    取消
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 同步进度显示 */}
      {syncing && (
        <Card className="glass-cyan">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
              <span className="terminal-text-white">正在同步存储桶文件...</span>
            </div>
            <Progress value={syncProgress} className="h-2" />
            <p className="terminal-text-small mt-2">扫描所有文件夹和子目录...</p>
          </CardContent>
        </Card>
      )}

      {/* 同步统计信息 */}
      {syncStats && (
        <Alert className="glass-green border-green-500/50">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <AlertDescription className="terminal-text-white">
            <div className="space-y-2">
              <div className="terminal-text-large">同步完成统计</div>
              {syncStats.storageMethod && (
                <div className="text-small text-green-300">
                  存储方式: {syncStats.storageMethod === 'database' ? '数据库' : 'KV存储'}
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-small">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-blue-400" />
                  <span>总文件: {syncStats.totalFiles}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileImage className="w-4 h-4 text-green-400" />
                  <span>图片文件: {syncStats.imageFiles}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-400" />
                  <span>数据库记录: {syncStats.dbRecords}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>新同步: {syncStats.synchronized}</span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-orange-400" />
                  <span>已更新: {syncStats.updated}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  <span>孤立文件: {syncStats.orphanedFiles}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-red-400" />
                  <span>孤立记录: {syncStats.orphanedRecords}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-amber-400" />
                  <span>目录数: {syncStats.directories?.length || 0}</span>
                </div>
              </div>
              {syncStats.directories && syncStats.directories.length > 0 && (
                <div className="mt-3">
                  <div className="terminal-text-small text-gray-300 mb-1">发现的目录:</div>
                  <div className="flex flex-wrap gap-2">
                    {syncStats.directories.map((dir, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-blue-500/20 border-blue-500/50 text-blue-300">
                        {dir}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-3 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                <p className="terminal-text-small text-green-300">
                  💡 如果图片仍未显示，请点击"刷新列表"按钮或等待几秒钟后自动刷新
                </p>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* 搜索栏 */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="搜索图片文件名、描述或说明..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 cms-input"
          />
        </div>
        <Button
          onClick={() => loadImages()}
          disabled={loading}
          variant="outline"
          className="btn-glass-blue"
          title="刷新图片列表"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* 图片统计 */}
      <div className="flex items-center gap-4">
        <Badge variant="outline" className="bg-blue-500/20 border-blue-500/50 text-blue-300">
          总计: {images.length} 张图片
        </Badge>
        {searchTerm && (
          <Badge variant="outline" className="bg-green-500/20 border-green-500/50 text-green-300">
            搜索结果: {filteredImages.length} 张
          </Badge>
        )}
        <Badge variant="outline" className="bg-purple-500/20 border-purple-500/50 text-purple-300">
          显示中: {filteredImages.length} 张
        </Badge>
      </div>

      <Separator className="border-blue-500/30" />

      {/* 图片网格 */}
      <ScrollArea className="h-[600px] custom-scrollbar">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
            <p className="terminal-text">加载图片列表中...</p>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-12">
            <FileImage className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="terminal-text mb-4">
              {searchTerm ? '没有找到匹配的图片' : images.length === 0 ? '暂无图片，点击"同步存储桶"来同步现有文件或上传新图片' : '没有匹配的图片'}
            </p>
            {images.length === 0 && (
              <div className="space-y-2">
                <Button
                  onClick={() => handleStorageSync(false)}
                  disabled={syncing}
                  className="btn-glass-cyan mr-2"
                >
                  <Sync className="w-4 h-4 mr-2" />
                  同步存储桶
                </Button>
                <Button
                  onClick={handleManualRefresh}
                  disabled={loading}
                  className="btn-glass-green"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  刷新列表
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredImages.map((image) => (
              <Card key={image.id} className="glass-card overflow-hidden hover:glass-blue transition-all duration-300">
                <div className="aspect-square relative overflow-hidden rounded-t-lg">
                  <ImageWithFallback
                    src={image.file_url}
                    alt={image.alt_text || image.filename}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="terminal-text-white truncate" title={image.filename}>
                      {image.filename}
                    </h3>
                    <p className="terminal-text-small text-gray-400">
                      {formatFileSize(image.file_size)}
                    </p>
                    <p className="terminal-text-small text-gray-500">
                      ID: {image.id}
                    </p>
                  </div>
                  
                  {(image.alt_text || image.caption) && (
                    <div className="space-y-1">
                      {image.alt_text && (
                        <p className="terminal-text-small text-gray-300 truncate" title={image.alt_text}>
                          描述: {image.alt_text}
                        </p>
                      )}
                      {image.caption && (
                        <p className="terminal-text-small text-gray-300 truncate" title={image.caption}>
                          说明: {image.caption}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => viewImageDetails(image)}
                      className="btn-glass-purple"
                      title="查看详情"
                    >
                      <Info className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => openEditDialog(image)}
                      className="btn-glass-green"
                      title="编辑信息"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = image.file_url;
                        link.download = image.filename;
                        link.click();
                      }}
                      className="btn-glass-cyan"
                      title="下载"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleImageDelete(image)}
                      className="btn-glass-orange"
                      title="删除"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* 编辑对话框 */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="glass-blue rounded-xl">
          <DialogHeader>
            <DialogTitle className="terminal-text-white">编辑图片信息</DialogTitle>
          </DialogHeader>
          {editingImage && (
            <div className="space-y-4">
              <div className="aspect-video relative overflow-hidden rounded-lg">
                <ImageWithFallback
                  src={editingImage.file_url}
                  alt={editingImage.alt_text || editingImage.filename}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-alt-text" className="terminal-text-white">替代文本</Label>
                <Input
                  id="edit-alt-text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="图片描述"
                  className="cms-input"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-caption" className="terminal-text-white">图片说明</Label>
                <Input
                  id="edit-caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="可选的图片说明"
                  className="cms-input"
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleImageEdit}
                  className="cms-primary-button flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  保存更改
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setEditDialog(false)}
                  className="btn-glass-amber"
                >
                  取消
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}