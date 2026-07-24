import React, { useState } from 'react';
import { RefreshCw, AlertCircle, CheckCircle, Loader2, Image, ExternalLink } from 'lucide-react';
import { useLanguage } from '../language/LanguageContext';
import { supabaseUrl, publicAnonKey } from '../../utils/supabase/info';

interface ImageUrlFixResult {
  id: string;
  filename: string;
  oldUrl: string;
  newUrl: string;
  status: 'success' | 'failed' | 'skipped';
  error?: string;
}

export default function ImageUrlFixer() {
  const [isFixing, setIsFixing] = useState(false);
  const [results, setResults] = useState<ImageUrlFixResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, fixed: 0, failed: 0, skipped: 0 });
  const { isZh } = useLanguage();

  const fixImageUrls = async () => {
    try {
      setIsFixing(true);
      setError(null);
      setResults([]);
      
      console.log('开始修复图片URL...');
      
      // 获取所有图片
      const response = await fetch(`${supabaseUrl}/functions/v1/make-server-55b791b3/images`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'apikey': publicAnonKey,
        }
      });

      if (!response.ok) {
        throw new Error(`获取图片列表失败: HTTP ${response.status}`);
      }

      const result = await response.json();
      const images = result.success ? result.data : result;
      
      if (!Array.isArray(images) || images.length === 0) {
        setError('没有找到需要修复的图片');
        return;
      }

      console.log(`找到 ${images.length} 张图片，开始修复URL...`);

      const fixResults: ImageUrlFixResult[] = [];
      let fixed = 0, failed = 0, skipped = 0;

      for (const image of images) {
        try {
          console.log(`检查图片: ${image.filename} (${image.id})`);
          
          // 检查当前URL是否有效
          let needsFix = false;
          let currentUrlValid = false;
          
          if (!image.file_url) {
            needsFix = true;
            console.log(`图片 ${image.filename} 缺少URL`);
          } else {
            // 测试当前URL是否可访问
            try {
              const urlTest = await fetch(image.file_url, { method: 'HEAD' });
              currentUrlValid = urlTest.ok;
              if (!currentUrlValid) {
                needsFix = true;
                console.log(`图片 ${image.filename} 的URL无法访问: ${urlTest.status}`);
              }
            } catch (urlError) {
              needsFix = true;
              console.log(`图片 ${image.filename} 的URL测试失败:`, urlError);
            }
          }

          if (!needsFix) {
            fixResults.push({
              id: image.id,
              filename: image.filename,
              oldUrl: image.file_url,
              newUrl: image.file_url,
              status: 'skipped'
            });
            skipped++;
            continue;
          }

          // 修复URL
          const fixResponse = await fetch(`${supabaseUrl}/functions/v1/make-server-55b791b3/images/${image.id}/fix-url`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'apikey': publicAnonKey,
              'Content-Type': 'application/json'
            }
          });

          if (fixResponse.ok) {
            const fixResult = await fixResponse.json();
            if (fixResult.success) {
              fixResults.push({
                id: image.id,
                filename: image.filename,
                oldUrl: image.file_url || '(无URL)',
                newUrl: fixResult.newUrl,
                status: 'success'
              });
              fixed++;
              console.log(`✅ 修复成功: ${image.filename}`);
            } else {
              fixResults.push({
                id: image.id,
                filename: image.filename,
                oldUrl: image.file_url || '(无URL)',
                newUrl: '',
                status: 'failed',
                error: fixResult.error
              });
              failed++;
              console.log(`❌ 修复失败: ${image.filename} - ${fixResult.error}`);
            }
          } else {
            const errorData = await fixResponse.json().catch(() => ({}));
            fixResults.push({
              id: image.id,
              filename: image.filename,
              oldUrl: image.file_url || '(无URL)',
              newUrl: '',
              status: 'failed',
              error: errorData.error || `HTTP ${fixResponse.status}`
            });
            failed++;
            console.log(`❌ 修复请求失败: ${image.filename} - HTTP ${fixResponse.status}`);
          }
        } catch (imageError: any) {
          fixResults.push({
            id: image.id,
            filename: image.filename,
            oldUrl: image.file_url || '(无URL)',
            newUrl: '',
            status: 'failed',
            error: imageError.message
          });
          failed++;
          console.error(`❌ 处理图片失败: ${image.filename}`, imageError);
        }
      }

      setResults(fixResults);
      setStats({ total: images.length, fixed, failed, skipped });
      
      console.log(`修复完成: 总计 ${images.length}, 修复 ${fixed}, 失败 ${failed}, 跳过 ${skipped}`);
      
    } catch (err: any) {
      console.error('图片URL修复失败:', err);
      setError(err.message);
    } finally {
      setIsFixing(false);
    }
  };

  const testImageUrl = async (url: string) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Image className="w-5 h-5 text-blue-600" />
          <h3 className="font-medium text-gray-900">
            {isZh ? '图片URL修复工具' : 'Image URL Fixer'}
          </h3>
        </div>
        <button
          onClick={fixImageUrls}
          disabled={isFixing}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {isFixing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{isZh ? '修复中...' : 'Fixing...'}</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>{isZh ? '修复图片URL' : 'Fix Image URLs'}</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">
                {isZh ? '修复失败' : 'Fix Failed'}
              </p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {stats.total > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">
            {isZh ? '修复统计' : 'Fix Statistics'}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-gray-600">{isZh ? '总数' : 'Total'}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.fixed}</div>
              <div className="text-gray-600">{isZh ? '已修复' : 'Fixed'}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-gray-600">{isZh ? '失败' : 'Failed'}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-500">{stats.skipped}</div>
              <div className="text-gray-600">{isZh ? '跳过' : 'Skipped'}</div>
            </div>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">
            {isZh ? '修复结果' : 'Fix Results'}
          </h4>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  result.status === 'success' ? 'bg-green-50 border-green-200' :
                  result.status === 'failed' ? 'bg-red-50 border-red-200' :
                  'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {result.status === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : result.status === 'failed' ? (
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <RefreshCw className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className={`font-medium truncate ${
                        result.status === 'success' ? 'text-green-800' :
                        result.status === 'failed' ? 'text-red-800' :
                        'text-gray-800'
                      }`}>
                        {result.filename}
                      </p>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        result.status === 'success' ? 'bg-green-100 text-green-800' :
                        result.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {result.status === 'success' ? (isZh ? '成功' : 'Success') :
                         result.status === 'failed' ? (isZh ? '失败' : 'Failed') :
                         (isZh ? '跳过' : 'Skipped')}
                      </span>
                    </div>
                    
                    {result.status === 'success' && result.newUrl && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-600">{isZh ? '新URL:' : 'New URL:'}</span>
                          <a
                            href={result.newUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                          >
                            <span className="truncate max-w-xs">
                              {result.newUrl.length > 50 ? `${result.newUrl.substring(0, 50)}...` : result.newUrl}
                            </span>
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {result.error && (
                      <p className="mt-1 text-xs text-red-700">
                        {isZh ? '错误：' : 'Error: '}{result.error}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">
          {isZh ? '工具说明' : 'Tool Description'}
        </h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• {isZh ? '此工具会检查所有图片的URL是否可以正常访问' : 'This tool checks if all image URLs are accessible'}</p>
          <p>• {isZh ? '对于无法访问的图片，尝试重新生成有效的URL' : 'For inaccessible images, it attempts to regenerate valid URLs'}</p>
          <p>• {isZh ? '修复后的URL会自动保存到数据库' : 'Fixed URLs are automatically saved to the database'}</p>
          <p>• {isZh ? '建议在图片无法正常显示时使用此工具' : 'Recommended to use when images are not displaying properly'}</p>
        </div>
      </div>
    </div>
  );
}