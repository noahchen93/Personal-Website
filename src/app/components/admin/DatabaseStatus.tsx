import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Clock, RefreshCw, Database, Loader2, Image, Wrench } from 'lucide-react';
import { useLanguage } from '../language/LanguageContext';
import { supabaseUrl, publicAnonKey } from '../../utils/supabase/info';

interface DatabaseStatusData {
  status: string;
  multilingual: {
    supported: boolean;
    migrationRequired: boolean;
  };
  database: {
    languageColumn: string;
    imagesTable: string;
  };
  images: {
    tableExists: boolean;
    tableUpdated: boolean;
    bucketExists: boolean;
  };
  version: string;
  features: string[];
}

interface ImageFixResult {
  success: boolean;
  message: string;
  fixed: number;
  failed: number;
  details?: {
    fixedIds: string[];
    failures: Array<{ id: string; error: string }>;
  };
  error?: string;
}

export default function DatabaseStatus() {
  const [statusData, setStatusData] = useState<DatabaseStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);
  const [isFixingImages, setIsFixingImages] = useState(false);
  const [isMigratingImages, setIsMigratingImages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [migrationResult, setMigrationResult] = useState<string | null>(null);
  const [imageFixResult, setImageFixResult] = useState<ImageFixResult | null>(null);
  const [imageMigrationResult, setImageMigrationResult] = useState<string | null>(null);
  const { isZh } = useLanguage();

  const checkStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${supabaseUrl}/functions/v1/make-server-55b791b3/health`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'apikey': publicAnonKey,
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setStatusData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const runMigration = async () => {
    try {
      setIsMigrating(true);
      setMigrationResult(null);
      setError(null);

      const response = await fetch(`${supabaseUrl}/functions/v1/make-server-55b791b3/migrate/language`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'apikey': publicAnonKey,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMigrationResult(result.message);
        // Refresh status after migration
        setTimeout(checkStatus, 1000);
      } else {
        throw new Error(result.error || 'Migration failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsMigrating(false);
    }
  };

  const fixImageUrls = async () => {
    try {
      setIsFixingImages(true);
      setImageFixResult(null);
      setError(null);

      const response = await fetch(`${supabaseUrl}/functions/v1/make-server-55b791b3/images/fix-urls`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'apikey': publicAnonKey,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok) {
        setImageFixResult(result);
        // Refresh status after fixing
        setTimeout(checkStatus, 1000);
      } else {
        throw new Error(result.error || 'Image fix failed');
      }
    } catch (err: any) {
      setError(err.message);
      setImageFixResult({
        success: false,
        message: 'Failed to fix image URLs',
        fixed: 0,
        failed: 0,
        error: err.message
      });
    } finally {
      setIsFixingImages(false);
    }
  };

  const runImageSchemaMigration = async () => {
    try {
      setIsMigratingImages(true);
      setImageMigrationResult(null);
      setError(null);

      const response = await fetch(`${supabaseUrl}/functions/v1/make-server-55b791b3/migrate/images-schema`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'apikey': publicAnonKey,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setImageMigrationResult(result.message);
        // Refresh status after migration
        setTimeout(checkStatus, 1000);
      } else {
        throw new Error(result.error || 'Images schema migration failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsMigratingImages(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <h3 className="font-medium text-gray-900">
            {isZh ? '检查数据库状态...' : 'Checking database status...'}
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Database className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">
            {isZh ? '数据库状态' : 'Database Status'}
          </h3>
        </div>
        <button
          onClick={checkStatus}
          disabled={isLoading}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          title={isZh ? '刷新状态' : 'Refresh Status'}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <p className="text-red-800 text-sm">
              {isZh ? '错误：' : 'Error: '}{error}
            </p>
          </div>
        </div>
      )}

      {migrationResult && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <p className="text-green-800 text-sm">{migrationResult}</p>
          </div>
        </div>
      )}

      {imageMigrationResult && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <p className="text-green-800 text-sm">{imageMigrationResult}</p>
          </div>
        </div>
      )}

      {imageFixResult && (
        <div className={`mb-4 p-3 rounded-md border ${imageFixResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center space-x-2">
            {imageFixResult.success ? (
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            )}
            <div>
              <p className={`text-sm font-medium ${imageFixResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {imageFixResult.message}
              </p>
              {imageFixResult.success && imageFixResult.fixed > 0 && (
                <p className="text-xs text-green-700 mt-1">
                  {isZh ? 
                    `已修复 ${imageFixResult.fixed} 张图片，${imageFixResult.failed} 张失败` :
                    `Fixed ${imageFixResult.fixed} images, ${imageFixResult.failed} failed`
                  }
                </p>
              )}
              {!imageFixResult.success && imageFixResult.error && (
                <p className="text-xs text-red-700 mt-1">{imageFixResult.error}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {statusData && (
        <div className="space-y-4">
          {/* Overall Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${statusData.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm font-medium text-gray-900">
                {isZh ? '服务状态' : 'Service Status'}
              </span>
            </div>
            <span className={`text-sm px-2 py-1 rounded ${statusData.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {statusData.status}
            </span>
          </div>

          {/* Language Support Status */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">
              {isZh ? '多语言支持' : 'Multilingual Support'}
            </h4>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex items-center space-x-2">
                {statusData.multilingual.supported ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                )}
                <span className="text-sm text-gray-700">
                  {isZh ? '语言列支持' : 'Language Column'}
                </span>
              </div>
              <span className={`text-sm px-2 py-1 rounded ${statusData.multilingual.supported ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                {statusData.database.languageColumn === 'exists' ? 
                  (isZh ? '已存在' : 'Exists') : 
                  (isZh ? '缺失' : 'Missing')
                }
              </span>
            </div>

            {/* Migration Required */}
            {statusData.multilingual.migrationRequired && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-amber-800">
                      {isZh ? '需要数据库迁移' : 'Database Migration Required'}
                    </h5>
                    <p className="text-sm text-amber-700 mt-1">
                      {isZh ? 
                        '您的数据库需要更新以支持多语言功能。点击下面的按钮进行自动迁移。' :
                        'Your database needs to be updated to support multilingual features. Click the button below to run the automatic migration.'
                      }
                    </p>
                    <button
                      onClick={runMigration}
                      disabled={isMigrating}
                      className="mt-3 inline-flex items-center space-x-2 px-3 py-2 bg-amber-600 text-white text-sm rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isMigrating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{isZh ? '迁移中...' : 'Migrating...'}</span>
                        </>
                      ) : (
                        <>
                          <Database className="w-4 h-4" />
                          <span>{isZh ? '运行自动迁移' : 'Run Auto Migration'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Images Support Status */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">
              {isZh ? '图片管理' : 'Image Management'}
            </h4>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex items-center space-x-2">
                {statusData.images.tableExists ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <span className="text-sm text-gray-700">
                  {isZh ? '图片表' : 'Images Table'}
                </span>
              </div>
              <span className={`text-sm px-2 py-1 rounded ${statusData.images.tableExists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {statusData.database.imagesTable === 'exists' ? 
                  (isZh ? '已存在' : 'Exists') : 
                  (isZh ? '缺失' : 'Missing')
                }
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex items-center space-x-2">
                {statusData.images.bucketExists ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <span className="text-sm text-gray-700">
                  {isZh ? '存储桶' : 'Storage Bucket'}
                </span>
              </div>
              <span className={`text-sm px-2 py-1 rounded ${statusData.images.bucketExists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {statusData.images.bucketExists ? 
                  (isZh ? '已存在' : 'Exists') : 
                  (isZh ? '缺失' : 'Missing')
                }
              </span>
            </div>

            {/* Images Table Schema Migration */}
            {!statusData.images.tableExists && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-amber-800">
                      {isZh ? '需要创建图片表' : 'Images Table Creation Required'}
                    </h5>
                    <p className="text-sm text-amber-700 mt-1">
                      {isZh ? 
                        '图片管理功能需要一个专用的数据库表。点击下面的按钮创建图片表和必要的索引。' :
                        'Image management requires a dedicated database table. Click the button below to create the images table and necessary indexes.'
                      }
                    </p>
                    <button
                      onClick={runImageSchemaMigration}
                      disabled={isMigratingImages}
                      className="mt-3 inline-flex items-center space-x-2 px-3 py-2 bg-amber-600 text-white text-sm rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isMigratingImages ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{isZh ? '创建中...' : 'Creating...'}</span>
                        </>
                      ) : (
                        <>
                          <Database className="w-4 h-4" />
                          <span>{isZh ? '创建图片表' : 'Create Images Table'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Image URL Fix Tool */}
            {statusData.images.tableExists && statusData.images.bucketExists && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-start space-x-3">
                  <Image className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-blue-800">
                      {isZh ? '图片URL修复工具' : 'Image URL Repair Tool'}
                    </h5>
                    <p className="text-sm text-blue-700 mt-1">
                      {isZh ? 
                        '如果您的图片无法显示或一直在加载中，可能是由于URL丢失。点击下面的按钮修复所有损坏的图片URL。' :
                        'If your images are not displaying or stuck loading, it might be due to missing URLs. Click the button below to fix all broken image URLs.'
                      }
                    </p>
                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={runImageSchemaMigration}
                        disabled={isMigratingImages}
                        className="inline-flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isMigratingImages ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{isZh ? '更新中...' : 'Updating...'}</span>
                          </>
                        ) : (
                          <>
                            <Database className="w-4 h-4" />
                            <span>{isZh ? '更新表结构' : 'Update Schema'}</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={fixImageUrls}
                        disabled={isFixingImages}
                        className="inline-flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isFixingImages ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{isZh ? '修复中...' : 'Fixing...'}</span>
                          </>
                        ) : (
                          <>
                            <Wrench className="w-4 h-4" />
                            <span>{isZh ? '修复图片URL' : 'Fix Image URLs'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Success State */}
          {statusData.multilingual.supported && !statusData.multilingual.migrationRequired && statusData.images.tableExists && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <h5 className="text-sm font-medium text-green-800">
                    {isZh ? '数据库配置完成' : 'Database Configuration Complete'}
                  </h5>
                  <p className="text-sm text-green-700 mt-1">
                    {isZh ? 
                      '数据库已成功配置多语言支持和图片管理功能。系统运行正常。' :
                      'Database is successfully configured with multilingual support and image management. System is running normally.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Server Version */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
            <span>{isZh ? '服务器版本' : 'Server Version'}: {statusData.version}</span>
            <span>{isZh ? '功能数量' : 'Features'}: {statusData.features?.length || 0}</span>
          </div>
        </div>
      )}
    </div>
  );
}