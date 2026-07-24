import React from 'react';

interface ImageCompressionOptions {
  maxSizeKB: number;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export class ImageCompressor {
  private static instance: ImageCompressor;
  
  public static getInstance(): ImageCompressor {
    if (!ImageCompressor.instance) {
      ImageCompressor.instance = new ImageCompressor();
    }
    return ImageCompressor.instance;
  }

  /**
   * 压缩图片到指定大小以下
   * @param file 原始文件
   * @param options 压缩选项
   * @returns 压缩后的File对象
   */
  async compressImage(file: File, options: ImageCompressionOptions = { maxSizeKB: 1024 }): Promise<File> {
    return new Promise((resolve, reject) => {
      // 如果文件已经小于目标大小，直接返回
      if (file.size <= options.maxSizeKB * 1024) {
        console.log(`🎯 图片 ${file.name} 已符合大小要求 (${(file.size / 1024).toFixed(1)} KB)`);
        resolve(file);
        return;
      }

      console.log(`📸 开始压缩图片: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        try {
          // 计算目标尺寸
          const { targetWidth, targetHeight } = this.calculateTargetSize(
            img.width, 
            img.height, 
            options.maxWidth || 1920, 
            options.maxHeight || 1080
          );

          // 设置画布尺寸
          canvas.width = targetWidth;
          canvas.height = targetHeight;

          // 使用高质量缩放算法
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          }

          // 确定输出格式
          const outputFormat = this.determineOutputFormat(file, options.format);
          
          // 二分法查找最优质量
          this.findOptimalQuality(canvas, outputFormat, options.maxSizeKB * 1024, file.name)
            .then(compressedFile => {
              const compressionRatio = ((file.size - compressedFile.size) / file.size * 100).toFixed(1);
              console.log(`✅ 压缩完成: ${file.name}`);
              console.log(`📊 压缩统计:`);
              console.log(`   原始大小: ${(file.size / (1024 * 1024)).toFixed(2)} MB`);
              console.log(`   压缩后: ${(compressedFile.size / 1024).toFixed(1)} KB`);
              console.log(`   压缩率: ${compressionRatio}%`);
              console.log(`   尺寸: ${img.width}×${img.height} → ${targetWidth}×${targetHeight}`);
              
              resolve(compressedFile);
            })
            .catch(reject);
        } catch (error) {
          console.error('压缩过程中发生错误:', error);
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error(`无法加载图片: ${file.name}`));
      };

      // 加载图片
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * 批量压缩图片
   * @param files 文件列表
   * @param options 压缩选项
   * @param onProgress 进度回调
   * @returns 压缩后的文件数组
   */
  async compressImages(
    files: File[], 
    options: ImageCompressionOptions = { maxSizeKB: 1024 },
    onProgress?: (current: number, total: number, filename: string) => void
  ): Promise<File[]> {
    const compressedFiles: File[] = [];
    
    console.log(`🚀 开始批量压缩 ${files.length} 张图片`);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file.type.startsWith('image/')) {
        console.warn(`⚠️ 跳过非图片文件: ${file.name}`);
        compressedFiles.push(file);
        continue;
      }

      try {
        onProgress?.(i + 1, files.length, file.name);
        
        const compressedFile = await this.compressImage(file, options);
        compressedFiles.push(compressedFile);
        
      } catch (error) {
        console.error(`❌ 压缩失败: ${file.name}`, error);
        // 如果压缩失败，使用原文件
        compressedFiles.push(file);
      }
    }
    
    console.log(`🎉 批量压缩完成! 共处理 ${files.length} 个文件`);
    return compressedFiles;
  }

  /**
   * 计算目标尺寸，保持宽高比
   */
  private calculateTargetSize(
    originalWidth: number, 
    originalHeight: number, 
    maxWidth: number, 
    maxHeight: number
  ): { targetWidth: number; targetHeight: number } {
    let targetWidth = originalWidth;
    let targetHeight = originalHeight;

    // 如果图片太大，按比例缩小
    if (targetWidth > maxWidth || targetHeight > maxHeight) {
      const widthRatio = maxWidth / targetWidth;
      const heightRatio = maxHeight / targetHeight;
      const ratio = Math.min(widthRatio, heightRatio);
      
      targetWidth = Math.round(targetWidth * ratio);
      targetHeight = Math.round(targetHeight * ratio);
    }

    // 确保尺寸为偶数，避免某些编码器问题
    targetWidth = targetWidth % 2 === 0 ? targetWidth : targetWidth - 1;
    targetHeight = targetHeight % 2 === 0 ? targetHeight : targetHeight - 1;

    return { targetWidth, targetHeight };
  }

  /**
   * 确定最佳输出格式
   */
  private determineOutputFormat(originalFile: File, preferredFormat?: string): string {
    if (preferredFormat) {
      return `image/${preferredFormat}`;
    }

    // PNG文件如果没有透明度，转换为JPEG以获得更好的压缩率
    if (originalFile.type === 'image/png') {
      return 'image/jpeg';
    }

    // 其他格式保持原样，但确保是支持的格式
    if (['image/jpeg', 'image/jpg', 'image/webp'].includes(originalFile.type)) {
      return originalFile.type;
    }

    // 默认使用JPEG
    return 'image/jpeg';
  }

  /**
   * 使用二分法查找最优质量设置
   */
  private async findOptimalQuality(
    canvas: HTMLCanvasElement, 
    format: string, 
    targetSize: number, 
    filename: string
  ): Promise<File> {
    let minQuality = 0.1;
    let maxQuality = 0.95;
    let bestFile: File | null = null;
    let bestSize = Infinity;

    // 最多尝试15次，确保找到最优解
    for (let attempt = 0; attempt < 15; attempt++) {
      const currentQuality = (minQuality + maxQuality) / 2;
      
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, format, currentQuality);
      });

      const file = new File([blob], filename, { type: format });
      
      if (file.size <= targetSize) {
        // 文件大小符合要求，尝试提高质量
        if (file.size > bestSize || !bestFile) {
          bestFile = file;
          bestSize = file.size;
        }
        minQuality = currentQuality;
      } else {
        // 文件太大，降低质量
        maxQuality = currentQuality;
      }

      // 如果已经找到很接近目标大小的文件，就停止
      if (bestFile && targetSize - bestFile.size < targetSize * 0.05) {
        break;
      }
    }

    // 如果仍然没有找到符合大小要求的文件，使用最低质量
    if (!bestFile) {
      console.warn(`⚠️ 无法将 ${filename} 压缩到目标大小，使用最低质量`);
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, format, 0.1);
      });
      bestFile = new File([blob], filename, { type: format });
    }

    return bestFile;
  }

  /**
   * 获取图片信息
   */
  async getImageInfo(file: File): Promise<{
    width: number;
    height: number;
    size: number;
    format: string;
  }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          size: file.size,
          format: file.type
        });
        URL.revokeObjectURL(img.src);
      };

      img.onerror = () => {
        reject(new Error(`无法加载图片信息: ${file.name}`));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * 检查图片是否需要压缩
   */
  needsCompression(file: File, maxSizeKB: number = 1024): boolean {
    return file.size > maxSizeKB * 1024;
  }

  /**
   * 格式化文件大小显示
   */
  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}

// 导出单例实例
export const imageCompressor = ImageCompressor.getInstance();

// React Hook for using the compressor
export const useImageCompressor = () => {
  const [isCompressing, setIsCompressing] = React.useState(false);
  const [compressionProgress, setCompressionProgress] = React.useState({ current: 0, total: 0, filename: '' });

  const compressFile = React.useCallback(async (file: File, options?: ImageCompressionOptions) => {
    setIsCompressing(true);
    try {
      const compressedFile = await imageCompressor.compressImage(file, options);
      return compressedFile;
    } finally {
      setIsCompressing(false);
    }
  }, []);

  const compressFiles = React.useCallback(async (files: File[], options?: ImageCompressionOptions) => {
    setIsCompressing(true);
    try {
      const compressedFiles = await imageCompressor.compressImages(files, options, (current, total, filename) => {
        setCompressionProgress({ current, total, filename });
      });
      return compressedFiles;
    } finally {
      setIsCompressing(false);
      setCompressionProgress({ current: 0, total: 0, filename: '' });
    }
  }, []);

  return {
    compressFile,
    compressFiles,
    isCompressing,
    compressionProgress,
    imageCompressor
  };
};

// 压缩进度组件
export const CompressionProgress: React.FC<{
  isCompressing: boolean;
  progress: { current: number; total: number; filename: string };
}> = ({ isCompressing, progress }) => {
  if (!isCompressing || progress.total === 0) return null;

  const percentage = Math.round((progress.current / progress.total) * 100);

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 min-w-[280px]">
      <div className="flex items-center space-x-3">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900">
            压缩图片中... ({progress.current}/{progress.total})
          </div>
          <div className="text-xs text-gray-500 truncate">
            {progress.filename}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCompressor;