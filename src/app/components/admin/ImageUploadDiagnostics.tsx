import React, { useState, useEffect } from 'react';
import { Upload, Database, HardDrive, AlertCircle, CheckCircle, Clock, RefreshCw, Loader2, FileImage, Info, X } from 'lucide-react';
import { useLanguage } from '../language/LanguageContext';
import { supabaseUrl, publicAnonKey } from '../../utils/supabase/info';

interface DiagnosticsData {
  storage: {
    bucketExists: boolean;
    bucketName: string;
    bucketAccessible?: boolean;
    error?: string;
  };
  database: {
    tableExists: boolean;
    recordCount: number;
    sampleRecords: any[];
    error?: string;
  };
  upload: {
    lastUploadId?: string;
    lastError?: string;
    lastSuccess?: boolean;
  };
}

interface StorageDiagnostics {
  bucketExists: boolean;
  bucketPublic: boolean;
  bucketAccessible: boolean;
  canList: boolean;
  canUpload: boolean;
  canDownload: boolean;
  errors: string[];
}

interface TestUploadResult {
  success: boolean;
  uploadId?: string;
  image?: any;
  error?: string;
  details?: any;
}

export default function ImageUploadDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticsData | null>(null);
  const [storageDiagnostics, setStorageDiagnostics] = useState<StorageDiagnostics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingUpload, setIsTestingUpload] = useState(false);
  const [isRunningStorageDiagnostics, setIsRunningStorageDiagnostics] = useState(false);
  const [isRecreatingBucket, setIsRecreatingBucket] = useState(false);
  const [testResult, setTestResult] = useState<TestUploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isZh } = useLanguage();

  const runDiagnostics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Running comprehensive image upload diagnostics...');
      
      // Check system health
      const healthResponse = await fetch(`${supabaseUrl}/functions/v1/make-server-55b791b3/health`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'apikey': publicAnonKey,
        }
      });

      if (!healthResponse.ok) {
        throw new Error(`Health check failed: HTTP ${healthResponse.status}`);
      }

      const healthData = await healthResponse.json();
      console.log('Health check data:', healthData);
      
      // Get images list for database info
      const imagesResponse = await fetch(`${supabaseUrl}/functions/v1/make-server-55b791b3/images`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'apikey': publicAnonKey,
        }
      });

      let imagesData = [];
      let dbError = null;
      
      if (imagesResponse.ok) {
        const result = await imagesResponse.json();
        imagesData = result.data || result;
      } else {
        const errorData = await imagesResponse.json().catch(() => ({}));
        dbError = errorData.error || `HTTP ${imagesResponse.status}`;
      }

      const diagnosticsResult: DiagnosticsData = {
        storage: {
          bucketExists: healthData.images?.bucketExists || false,
          bucketName: healthData.bucket?.name || 'make-55b791b3-portfolio-assets',
          bucketAccessible: healthData.images?.bucketAccessible,
          error: healthData.bucket?.error || healthData.storage?.accessError
        },
        database: {
          tableExists: healthData.images?.tableExists || false,
          recordCount: Array.isArray(imagesData) ? imagesData.length : 0,
          sampleRecords: Array.isArray(imagesData) ? imagesData.slice(0, 3) : [],
          error: dbError
        },
        upload: {}
      };

      setDiagnostics(diagnosticsResult);
      
    } catch (err: any) {
      console.error('Diagnostics error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const testUpload = async () => {
    try {
      setIsTestingUpload(true);
      setTestResult(null);
      setError(null);

      // Create a small test image blob
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#4F46E5';
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText('TEST', 35, 55);
      }

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png');
      });

      const formData = new FormData();
      formData.append('file', blob, 'test-image.png');
      formData.append('alt_text', 'Test image for diagnostics');
      formData.append('caption', 'Generated test image');

      console.log('Starting test upload...');

      const response = await fetch(`${supabaseUrl}/functions/v1/make-server-55b791b3/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'apikey': publicAnonKey,
        },
        body: formData
      });

      const result = await response.json();
      console.log('Test upload result:', result);

      if (response.ok && result.success) {
        setTestResult({
          success: true,
          uploadId: result.uploadId,
          image: result.image,
          message: result.message
        });
      } else {
        setTestResult({
          success: false,
          uploadId: result.uploadId,
          error: result.error || 'Unknown error',
          details: result
        });
      }

      // Refresh diagnostics after test
      setTimeout(runDiagnostics, 1000);

    } catch (err: any) {
      console.error('Test upload error:', err);
      setTestResult({
        success: false,
        error: err.message
      });
    } finally {
      setIsTestingUpload(false);
    }
  };

  const runStorageDiagnostics = async () => {
    try {
      setIsRunningStorageDiagnostics(true);
      setError(null);
      
      console.log('Running detailed storage diagnostics...');
      
      const response = await fetch(`${supabaseUrl}/functions/v1/make-server-55b791b3/storage/diagnostics`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'apikey': publicAnonKey,
        }
      });

      if (!response.ok) {
        throw new Error(`Storage diagnostics failed: HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('Storage diagnostics result:', result);
      setStorageDiagnostics(result.diagnostics);
      
    } catch (err: any) {
      console.error('Storage diagnostics error:', err);
      setError(err.message);
    } finally {
      setIsRunningStorageDiagnostics(false);
    }
  };

  const recreateBucket = async () => {
    try {
      setIsRecreatingBucket(true);
      setError(null);
      
      console.log('Recreating storage bucket...');
      
      const response = await fetch(`${supabaseUrl}/functions/v1/make-server-55b791b3/storage/recreate-bucket`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'apikey': publicAnonKey,
        }
      });

      const result = await response.json();
      console.log('Bucket recreation result:', result);

      if (response.ok && result.success) {
        // Refresh diagnostics after recreation
        setTimeout(() => {
          runDiagnostics();
          runStorageDiagnostics();
        }, 2000);
      } else {
        throw new Error(result.error || 'Failed to recreate bucket');
      }
      
    } catch (err: any) {
      console.error('Bucket recreation error:', err);
      setError(err.message);
    } finally {
      setIsRecreatingBucket(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FileImage className="w-5 h-5 text-blue-600" />
          <h3 className="font-medium text-gray-900">
            {isZh ? '图片上传诊断' : 'Image Upload Diagnostics'}
          </h3>
        </div>
        <button
          onClick={runDiagnostics}
          disabled={isLoading}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          title={isZh ? '刷新诊断' : 'Refresh Diagnostics'}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <p className="text-red-800 text-sm">
              {isZh ? '诊断错误：' : 'Diagnostics Error: '}{error}
            </p>
          </div>
        </div>
      )}

      {testResult && (
        <div className={`mb-6 p-4 rounded-md border ${testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-start space-x-3">
            {testResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className={`font-medium ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {testResult.success ? 
                  (isZh ? '测试上传成功' : 'Test Upload Successful') :
                  (isZh ? '测试上传失败' : 'Test Upload Failed')
                }
              </h4>
              
              {testResult.success && testResult.image && (
                <div className="mt-2 text-sm text-green-700">
                  <p><strong>Upload ID:</strong> {testResult.uploadId}</p>
                  <p><strong>Image ID:</strong> {testResult.image.id}</p>
                  <p><strong>Filename:</strong> {testResult.image.filename}</p>
                  <p><strong>File Path:</strong> {testResult.image.file_path}</p>
                  <p><strong>URL:</strong> {testResult.image.file_url ? 'Generated' : 'Missing'}</p>
                </div>
              )}
              
              {!testResult.success && (
                <div className="mt-2 text-sm text-red-700">
                  <p><strong>Error:</strong> {testResult.error}</p>
                  {testResult.uploadId && <p><strong>Upload ID:</strong> {testResult.uploadId}</p>}
                  {testResult.details && (
                    <details className="mt-2">
                      <summary>详细信息</summary>
                      <pre className="mt-1 text-xs bg-red-100 p-2 rounded overflow-auto">
                        {JSON.stringify(testResult.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {diagnostics && (
        <div className="space-y-6">
          {/* Storage Status */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <HardDrive className="w-4 h-4" />
              <span>{isZh ? 'Supabase Storage状态' : 'Supabase Storage Status'}</span>
            </h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-2">
                  {diagnostics.storage.bucketExists ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm text-gray-700">
                    Storage Bucket
                  </span>
                </div>
                <div className="text-right">
                  <span className={`text-sm px-2 py-1 rounded ${diagnostics.storage.bucketExists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {diagnostics.storage.bucketExists ? 
                      (isZh ? '存在' : 'Exists') : 
                      (isZh ? '不存在' : 'Missing')
                    }
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {diagnostics.storage.bucketName}
                  </p>
                </div>
              </div>

              {/* Storage Accessibility */}
              {diagnostics.storage.bucketExists && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center space-x-2">
                    {diagnostics.storage.bucketAccessible ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className="text-sm text-gray-700">
                      Bucket Access
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm px-2 py-1 rounded ${diagnostics.storage.bucketAccessible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {diagnostics.storage.bucketAccessible ? 
                        (isZh ? '可访问' : 'Accessible') : 
                        (isZh ? '访问被拒绝' : 'Access Denied')
                      }
                    </span>
                  </div>
                </div>
              )}

              {diagnostics.storage.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">
                    <strong>Storage Error:</strong> {diagnostics.storage.error}
                  </p>
                  {diagnostics.storage.error.includes('401') && (
                    <div className="mt-2 text-xs text-red-700">
                      <p><strong>💡 {isZh ? '解决建议：' : 'Solution:'}</strong></p>
                      <p>{isZh ? '这是权限错误。请在Supabase控制台中将Storage bucket设置为公开，或配置正确的RLS策略。' : 'This is a permissions error. Please make the Storage bucket public in Supabase dashboard, or configure proper RLS policies.'}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Database Status */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>{isZh ? '数据库状态' : 'Database Status'}</span>
            </h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-2">
                  {diagnostics.database.tableExists ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm text-gray-700">
                    Images Table
                  </span>
                </div>
                <div className="text-right">
                  <span className={`text-sm px-2 py-1 rounded ${diagnostics.database.tableExists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {diagnostics.database.tableExists ? 
                      (isZh ? '存在' : 'Exists') : 
                      (isZh ? '不存在' : 'Missing')
                    }
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {diagnostics.database.recordCount} {isZh ? '条记录' : 'records'}
                  </p>
                </div>
              </div>

              {diagnostics.database.sampleRecords.length > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <h5 className="text-sm font-medium text-blue-800 mb-2">
                    {isZh ? '最近的图片记录' : 'Recent Image Records'}
                  </h5>
                  <div className="space-y-2">
                    {diagnostics.database.sampleRecords.map((record, index) => (
                      <div key={index} className="text-xs text-blue-700 bg-blue-100 p-2 rounded">
                        <div><strong>ID:</strong> {record.id}</div>
                        <div><strong>Filename:</strong> {record.filename}</div>
                        <div><strong>File Path:</strong> {record.file_path}</div>
                        <div><strong>Has URL:</strong> {record.file_url ? 'Yes' : 'No'}</div>
                        <div><strong>Uploaded:</strong> {new Date(record.uploaded_at).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {diagnostics.database.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">
                    <strong>Database Error:</strong> {diagnostics.database.error}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Storage Detailed Diagnostics */}
          {storageDiagnostics && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center space-x-2">
                <HardDrive className="w-4 h-4" />
                <span>{isZh ? '详细Storage诊断' : 'Detailed Storage Diagnostics'}</span>
              </h4>
              
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className={`p-2 rounded text-xs ${storageDiagnostics.bucketExists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <strong>{isZh ? 'Bucket存在：' : 'Bucket Exists: '}</strong>{storageDiagnostics.bucketExists ? 'Yes' : 'No'}
                  </div>
                  <div className={`p-2 rounded text-xs ${storageDiagnostics.bucketPublic ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    <strong>{isZh ? 'Bucket公开：' : 'Bucket Public: '}</strong>{storageDiagnostics.bucketPublic ? 'Yes' : 'No'}
                  </div>
                  <div className={`p-2 rounded text-xs ${storageDiagnostics.canList ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <strong>{isZh ? '可列表：' : 'Can List: '}</strong>{storageDiagnostics.canList ? 'Yes' : 'No'}
                  </div>
                  <div className={`p-2 rounded text-xs ${storageDiagnostics.canUpload ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <strong>{isZh ? '可上传：' : 'Can Upload: '}</strong>{storageDiagnostics.canUpload ? 'Yes' : 'No'}
                  </div>
                </div>
                
                {storageDiagnostics.errors.length > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <h5 className="text-sm font-medium text-red-800 mb-1">Storage Errors:</h5>
                    <ul className="text-xs text-red-700 space-y-1">
                      {storageDiagnostics.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Test Upload */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>{isZh ? '上传测试' : 'Upload Test'}</span>
            </h4>
            
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700 mb-3">
                {isZh ? 
                  '点击下面的按钮进行测试上传，这将创建一个小的测试图片并尝试上传到系统中。' :
                  'Click the button below to perform a test upload. This will create a small test image and attempt to upload it to the system.'
                }
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={runStorageDiagnostics}
                  disabled={isRunningStorageDiagnostics}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isRunningStorageDiagnostics ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isZh ? '诊断中...' : 'Diagnosing...'}</span>
                    </>
                  ) : (
                    <>
                      <HardDrive className="w-4 h-4" />
                      <span>{isZh ? 'Storage诊断' : 'Storage Diagnosis'}</span>
                    </>
                  )}
                </button>
                <button
                  onClick={recreateBucket}
                  disabled={isRecreatingBucket}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isRecreatingBucket ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isZh ? '重建中...' : 'Recreating...'}</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>{isZh ? '重建Bucket' : 'Recreate Bucket'}</span>
                    </>
                  )}
                </button>
                <button
                  onClick={testUpload}
                  disabled={isTestingUpload}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isTestingUpload ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isZh ? '测试中...' : 'Testing...'}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>{isZh ? '运行测试上传' : 'Run Test Upload'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Troubleshooting Tips */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <Info className="w-4 h-4" />
              <span>{isZh ? '故障排除建议' : 'Troubleshooting Tips'}</span>
            </h4>
            
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
              <div className="text-sm text-amber-800 space-y-2">
                <p><strong>{isZh ? '如果遇到401错误（权限被拒绝）：' : 'If you get 401 error (permission denied):'}</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>{isZh ? '进入Supabase控制台 → Storage → 选择bucket → 设置 → 勾选"Public bucket"' : 'Go to Supabase Dashboard → Storage → Select bucket → Settings → Check "Public bucket"'}</li>
                  <li>{isZh ? '或者配置Row Level Security (RLS)策略以允许匿名访问' : 'Or configure Row Level Security (RLS) policies to allow anonymous access'}</li>
                  <li>{isZh ? '检查SUPABASE_SERVICE_ROLE_KEY是否正确配置' : 'Check if SUPABASE_SERVICE_ROLE_KEY is correctly configured'}</li>
                </ul>
                
                <p className="mt-3"><strong>{isZh ? '如果上传失败：' : 'If upload fails:'}</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>{isZh ? '运行"Storage诊断"检查详细权限状态' : 'Run "Storage Diagnosis" to check detailed permissions'}</li>
                  <li>{isZh ? '如果遇到schema错误，点击"重建Bucket"' : 'If encountering schema errors, click "Recreate Bucket"'}</li>
                  <li>{isZh ? '检查Storage bucket是否存在' : 'Check if Storage bucket exists'}</li>
                  <li>{isZh ? '检查images表是否创建' : 'Check if images table is created'}</li>
                  <li>{isZh ? '查看浏览器控制台的详细错误' : 'Check browser console for detailed errors'}</li>
                </ul>
                
                <p className="mt-3"><strong>{isZh ? '如果图片不显示：' : 'If images don\'t show:'}</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>{isZh ? '使用"修复图片URL"工具' : 'Use the "Fix Image URLs" tool'}</li>
                  <li>{isZh ? '检查file_url字段是否为空' : 'Check if file_url field is empty'}</li>
                  <li>{isZh ? 'Storage文件可能已删除但数据库记录仍存在' : 'Storage files may be deleted but database records remain'}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}