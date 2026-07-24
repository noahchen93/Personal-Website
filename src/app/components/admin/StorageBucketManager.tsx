import React, { useState, useEffect } from 'react';
import { Settings, CheckCircle, AlertCircle, Loader2, Database, Lock, Unlock, RefreshCw, Info } from 'lucide-react';
import { useLanguage } from '../language/LanguageContext';
import { supabaseUrl, publicAnonKey } from '../../utils/supabase/info';

interface BucketInfo {
  exists: boolean;
  accessible: boolean;
  isPrivate: boolean | null;
  accessError: string | null;
  name?: string;
}

interface DiagnosticsResult {
  bucket: BucketInfo;
  files: {
    count: number;
    accessible: boolean;
  };
  policies: {
    count: number;
    error: string | null;
  };
  suggestions: string[];
  notes: string[];
}

export default function StorageBucketManager() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticsResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { isZh } = useLanguage();

  const runDiagnostics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Running storage diagnostics...');
      
      const response = await fetch(`${supabaseUrl}/functions/v1/make-server-55b791b3/storage/diagnostics`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'apikey': publicAnonKey,
        }
      });

      if (!response.ok) {
        throw new Error(`诊断请求失败: HTTP ${response.status}`);
      }

      const result = await response.json();
      setDiagnostics(result);
      
      console.log('Diagnostics result:', result);
      
    } catch (err: any) {
      console.error('Diagnostics failed:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const setupStorage = async () => {
    try {
      setIsSettingUp(true);
      setError(null);
      setSuccessMessage(null);
      
      console.log('Setting up storage bucket...');
      
      const response = await fetch(`${supabaseUrl}/functions/v1/make-server-55b791b3/storage/setup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'apikey': publicAnonKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `设置失败: HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setSuccessMessage(result.message);
        console.log('Storage setup successful:', result);
        
        // Refresh diagnostics after setup
        setTimeout(() => {
          runDiagnostics();
        }, 2000);
      } else {
        throw new Error(result.error || '设置失败');
      }
      
    } catch (err: any) {
      console.error('Storage setup failed:', err);
      setError(err.message);
    } finally {
      setIsSettingUp(false);
    }
  };

  const fixImageUrls = async () => {
    try {
      setIsFixing(true);
      setError(null);
      setSuccessMessage(null);
      
      console.log('Fixing all image URLs...');
      
      const response = await fetch(`${supabaseUrl}/functions/v1/make-server-55b791b3/images/fix-all-urls`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'apikey': publicAnonKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `修复失败: HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        const { stats } = result;
        setSuccessMessage(`URL修复完成: 修复 ${stats.fixed} 张，失败 ${stats.failed} 张，跳过 ${stats.skipped} 张`);
        console.log('URL fix completed:', result);
      } else {
        throw new Error(result.error || 'URL修复失败');
      }
      
    } catch (err: any) {
      console.error('URL fix failed:', err);
      setError(err.message);
    } finally {
      setIsFixing(false);
    }
  };

  // Auto-run diagnostics on component mount
  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <AlertCircle className="w-5 h-5 text-red-600" />
    );
  };

  const getStatusText = (condition: boolean) => {
    return condition ? (
      <span className="text-green-700">{isZh ? '正常' : 'OK'}</span>
    ) : (
      <span className="text-red-700">{isZh ? '异常' : 'Error'}</span>
    );
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Database className="w-5 h-5 text-blue-600" />
          <h3 className="font-medium text-gray-900">
            {isZh ? '存储桶管理器' : 'Storage Bucket Manager'}
          </h3>
        </div>
        <button
          onClick={runDiagnostics}
          disabled={isLoading}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isZh ? '刷新诊断' : 'Refresh'}</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">
                {isZh ? '操作失败' : 'Operation Failed'}
              </p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-green-800 font-medium">
                {isZh ? '操作成功' : 'Operation Successful'}
              </p>
              <p className="text-green-700 text-sm">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">{isZh ? '正在诊断存储状态...' : 'Diagnosing storage status...'}</p>
          </div>
        </div>
      )}

      {/* Diagnostics Results */}
      {diagnostics && !isLoading && (
        <div className="space-y-6">
          {/* Bucket Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>{isZh ? '存储桶状态' : 'Bucket Status'}</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{isZh ? '存储桶存在' : 'Bucket Exists'}</span>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(diagnostics.bucket.exists)}
                  {getStatusText(diagnostics.bucket.exists)}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{isZh ? '可访问性' : 'Accessible'}</span>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(diagnostics.bucket.accessible)}
                  {getStatusText(diagnostics.bucket.accessible)}
                </div>
              </div>
              
              {diagnostics.bucket.isPrivate !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{isZh ? '访问类型' : 'Access Type'}</span>
                  <div className="flex items-center space-x-2">
                    {diagnostics.bucket.isPrivate ? (
                      <>
                        <Lock className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-700">{isZh ? '私有' : 'Private'}</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-4 h-4 text-green-600" />
                        <span className="text-green-700">{isZh ? '公开' : 'Public'}</span>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{isZh ? '文件数量' : 'File Count'}</span>
                <span className="text-sm font-medium">{diagnostics.files.count}</span>
              </div>
            </div>

            {diagnostics.bucket.accessError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm">
                <p className="text-red-800">
                  <strong>{isZh ? '访问错误：' : 'Access Error: '}</strong>
                  {diagnostics.bucket.accessError}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {!diagnostics.bucket.exists && (
              <button
                onClick={setupStorage}
                disabled={isSettingUp}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {isSettingUp ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Settings className="w-4 h-4" />
                )}
                <span>{isSettingUp ? (isZh ? '设置中...' : 'Setting up...') : (isZh ? '创建存储桶' : 'Create Bucket')}</span>
              </button>
            )}

            {diagnostics.bucket.exists && !diagnostics.bucket.accessible && (
              <button
                onClick={setupStorage}
                disabled={isSettingUp}
                className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {isSettingUp ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                <span>{isSettingUp ? (isZh ? '修复中...' : 'Fixing...') : (isZh ? '修复权限' : 'Fix Permissions')}</span>
              </button>
            )}

            {diagnostics.bucket.exists && diagnostics.bucket.accessible && (
              <button
                onClick={fixImageUrls}
                disabled={isFixing}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {isFixing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>{isFixing ? (isZh ? '修复中...' : 'Fixing...') : (isZh ? '修复图片URL' : 'Fix Image URLs')}</span>
              </button>
            )}
          </div>

          {/* Suggestions */}
          {diagnostics.suggestions.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center space-x-2">
                <Info className="w-4 h-4" />
                <span>{isZh ? '建议操作' : 'Suggestions'}</span>
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                {diagnostics.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Notes */}
          {diagnostics.notes.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                <Info className="w-4 h-4" />
                <span>{isZh ? '注意事项' : 'Notes'}</span>
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {diagnostics.notes.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Manual Setup Guide */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-medium text-amber-900 mb-2">
              {isZh ? '手动设置指南' : 'Manual Setup Guide'}
            </h4>
            <p className="text-sm text-amber-800 mb-2">
              {isZh ? '如果自动设置失败，请按照以下步骤手动配置：' : 'If automatic setup fails, please follow these manual steps:'}
            </p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-amber-800">
              <li>
                {isZh ? '登录 Supabase Dashboard' : 'Login to Supabase Dashboard'}
              </li>
              <li>
                {isZh ? '进入 Storage 页面' : 'Go to Storage page'}
              </li>
              <li>
                {isZh ? '找到 make-55b791b3-portfolio-assets 存储桶' : 'Find make-55b791b3-portfolio-assets bucket'}
              </li>
              <li>
                {isZh ? '点击 Policies 并创建允许所有操作的策略' : 'Click Policies and create policies allowing all operations'}
              </li>
              <li>
                {isZh ? '返回应用并点击"刷新诊断"' : 'Return to app and click "Refresh Diagnostics"'}
              </li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}