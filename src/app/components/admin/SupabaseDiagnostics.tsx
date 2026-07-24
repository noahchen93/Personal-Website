import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, RefreshCcw, Settings, Database, Folder, Wifi, WifiOff, Globe } from 'lucide-react';
import { Button } from '../ui/button';
import { useContent } from '../content/ContentContext';
import { useLanguage } from '../language/LanguageContext';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import LanguageSeparationTest from './testing/LanguageSeparationTest';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: any;
  recommendations?: string[];
}

interface StorageDiagnostics {
  timestamp: string;
  bucket_name: string;
  supabase_url: string;
  has_service_role_key: boolean;
  tests: {
    list_buckets?: {
      success: boolean;
      error?: string;
      bucket_count: number;
      bucket_names: string[];
      target_bucket_exists: boolean;
      critical_error?: boolean;
    };
    bucket_access?: {
      success: boolean;
      error?: string;
      file_count: number;
      can_list_files: boolean;
      is_html_response?: boolean;
    };
    bucket_creation?: {
      success: boolean;
      error?: string;
      bucket_created: boolean;
      critical_error?: boolean;
    };
  };
  overall_status: {
    bucket_operational: boolean;
    needs_bucket_creation: boolean;
    has_config_issues: boolean;
    recommendations: string[];
  };
}

export default function SupabaseDiagnostics() {
  const { isOnline } = useContent();
  const { isZh } = useLanguage();
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [storageDiagnostics, setStorageDiagnostics] = useState<StorageDiagnostics | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const supabaseUrl = `https://${projectId}.supabase.co`;

  const runDiagnostics = async () => {
    setIsRunning(true);
    setDiagnostics([]);
    setConnectionError(null);
    
    const results: DiagnosticResult[] = [];

    // Test 1: Environment Variables
    results.push({
      test: '环境变量检查',
      status: projectId && publicAnonKey ? 'success' : 'error',
      message: projectId && publicAnonKey ? '环境变量配置正确' : '缺少必要的环境变量',
      details: {
        SUPABASE_URL: supabaseUrl,
        HAS_PUBLIC_ANON_KEY: !!publicAnonKey,
        PROJECT_ID: projectId
      },
      recommendations: !projectId || !publicAnonKey ? [
        '检查 /utils/supabase/info.tsx 文件',
        '确保 projectId 和 publicAnonKey 已正确设置'
      ] : undefined
    });

    // Test 2: Network Connection
    let networkResult: DiagnosticResult = {
      test: '网络连接检查',
      status: 'pending',
      message: '检查网络连接...'
    };
    results.push(networkResult);
    setDiagnostics([...results]);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const healthResponse = await fetch(`${supabaseUrl}/functions/v1/make-server-55b791b3/health`, {
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'apikey': publicAnonKey,
        }
      });
      
      clearTimeout(timeoutId);

      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        networkResult.status = 'success';
        networkResult.message = '服务器连接正常';
        networkResult.details = healthData;
      } else {
        const errorText = await healthResponse.text();
        networkResult.status = 'error';
        networkResult.message = `服务器返回错误: HTTP ${healthResponse.status}`;
        networkResult.details = { status: healthResponse.status, response: errorText };
        
        if (errorText.includes('<html>') || errorText.includes('<!DOCTYPE')) {
          networkResult.recommendations = [
            '服务器返回HTML页面而非JSON，可能原因：',
            '1. Edge Function未正确部署',
            '2. API路径错误',
            '3. 项目暂停或计费问题',
            '4. Supabase服务异常'
          ];
        }
      }
    } catch (error: any) {
      networkResult.status = 'error';
      networkResult.message = `网络连接失败: ${error.message}`;
      networkResult.recommendations = [
        '检查网络连接',
        '确认Supabase项目状态',
        '验证Edge Function是否已部署'
      ];
      setConnectionError(error.message);
    }

    // Test 3: Storage Diagnostics (only if network is working)
    if (networkResult.status === 'success') {
      const storageResult: DiagnosticResult = {
        test: '存储桶诊断',
        status: 'pending',
        message: '检查存储配置...'
      };
      results[results.length - 1] = networkResult;
      results.push(storageResult);
      setDiagnostics([...results]);

      try {
        const storageResponse = await fetch(`${supabaseUrl}/functions/v1/make-server-55b791b3/storage/diagnose`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'apikey': publicAnonKey,
          }
        });

        if (storageResponse.ok) {
          const storageData: StorageDiagnostics = await storageResponse.json();
          setStorageDiagnostics(storageData);
          
          if (storageData.overall_status.bucket_operational) {
            storageResult.status = 'success';
            storageResult.message = '存储桶配置正常';
          } else {
            storageResult.status = 'error';
            storageResult.message = '存储桶配置有问题';
            storageResult.recommendations = storageData.overall_status.recommendations;
          }
          storageResult.details = storageData;
        } else {
          storageResult.status = 'error';
          storageResult.message = `存储诊断失败: HTTP ${storageResponse.status}`;
        }
      } catch (error: any) {
        storageResult.status = 'error';
        storageResult.message = `存储诊断错误: ${error.message}`;
      }
    }

    // Test 4: Image Loading Test
    const imageResult: DiagnosticResult = {
      test: '图片加载测试',
      status: 'pending',
      message: '测试图片API...'
    };
    results[results.length - 1] = results[results.length - 1]; // Update previous result
    results.push(imageResult);
    setDiagnostics([...results]);

    try {
      const imagesResponse = await fetch(`${supabaseUrl}/functions/v1/make-server-55b791b3/images`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'apikey': publicAnonKey,
          'Content-Type': 'application/json'
        }
      });

      if (imagesResponse.ok) {
        const imagesData = await imagesResponse.json();
        imageResult.status = 'success';
        imageResult.message = `图片API正常 (${Array.isArray(imagesData) ? imagesData.length : 'unknown'} 张图片)`;
        imageResult.details = { 
          responseType: typeof imagesData,
          imageCount: Array.isArray(imagesData) ? imagesData.length : 'unknown',
          sample: Array.isArray(imagesData) && imagesData.length > 0 ? imagesData[0] : null
        };
      } else {
        const errorText = await imagesResponse.text();
        imageResult.status = 'error';
        imageResult.message = `图片API错误: HTTP ${imagesResponse.status}`;
        imageResult.details = { status: imagesResponse.status, response: errorText };
        
        if (errorText.includes('<html>') || errorText.includes('<!DOCTYPE')) {
          imageResult.recommendations = [
            '图片API返回HTML页面，可能原因：',
            '1. RLS (Row Level Security) 策略阻止访问',
            '2. 存储桶权限配置错误',
            '3. API路径不存在',
            '4. 认证问题'
          ];
        }
      }
    } catch (error: any) {
      imageResult.status = 'error';
      imageResult.message = `图片API测试失败: ${error.message}`;
    }

    // Final update
    results[results.length - 1] = imageResult;
    setDiagnostics(results);
    setIsRunning(false);
  };

  const fixStorage = async () => {
    if (!storageDiagnostics) return;

    setIsRunning(true);
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/make-server-55b791b3/storage/fix`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'apikey': publicAnonKey,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Storage fix result:', result);
        // Re-run diagnostics after fix attempt
        setTimeout(() => runDiagnostics(), 1000);
      }
    } catch (error) {
      console.error('Storage fix error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <RefreshCcw className="w-5 h-5 text-blue-500 animate-spin" />;
    }
  };

  return (
    <div className="space-y-6 cms-container">
      {/* Header */}
      <div className="cms-bg-card rounded-xl shadow-lg border border-blue-500/30 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Database className="w-6 h-6 text-cyan-400" />
            <div>
              <h2 className="text-large text-white font-terminal">
                {isZh ? 'Supabase 连接诊断' : 'Supabase Connection Diagnostics'}
              </h2>
              <p className="text-small text-slate-300 font-terminal">
                {isZh ? '检查数据库和存储连接状态' : 'Check database and storage connection status'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-small ${
              isOnline ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              <span>{isOnline ? '在线' : '离线'}</span>
            </div>
            <Button
              onClick={runDiagnostics}
              disabled={isRunning}
              className="cms-primary-button"
            >
              <RefreshCcw className={`w-4 h-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
              {isZh ? '重新检查' : 'Recheck'}
            </Button>
          </div>
        </div>
      </div>

      {/* Connection Error Alert */}
      {connectionError && (
        <div className="cms-bg-card rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <div className="flex items-start space-x-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-white font-terminal mb-2">连接错误</h3>
              <p className="text-red-300 text-small font-terminal mb-3">{connectionError}</p>
              <div className="bg-red-500/20 rounded-lg p-3 text-small text-red-200 font-terminal">
                <p className="mb-2">这个错误通常表示以下问题之一：</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Supabase Edge Function未正确部署</li>
                  <li>项目暂停或计费问题</li>
                  <li>API密钥配置错误</li>
                  <li>网络连接问题</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Diagnostic Results */}
      <div className="space-y-4">
        {diagnostics.map((result, index) => (
          <div key={index} className="cms-bg-card rounded-xl border border-blue-500/30 p-4">
            <div className="flex items-start space-x-3">
              {getStatusIcon(result.status)}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-terminal">{result.test}</h3>
                  <span className={`text-small px-2 py-1 rounded-full ${
                    result.status === 'success' ? 'bg-green-500/20 text-green-400' :
                    result.status === 'error' ? 'bg-red-500/20 text-red-400' :
                    result.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {result.status === 'success' ? '正常' :
                     result.status === 'error' ? '错误' :
                     result.status === 'warning' ? '警告' : '检查中'}
                  </span>
                </div>
                <p className="text-slate-300 text-small font-terminal mb-2">{result.message}</p>
                
                {result.recommendations && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mt-2">
                    <h4 className="text-yellow-400 text-small font-terminal mb-2">建议解决方案：</h4>
                    <ul className="list-disc list-inside space-y-1 text-yellow-300 text-small font-terminal">
                      {result.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.details && (
                  <details className="mt-2">
                    <summary className="text-cyan-400 text-small cursor-pointer hover:text-cyan-300 font-terminal">
                      查看详细信息
                    </summary>
                    <pre className="mt-2 p-3 bg-slate-800/50 rounded-lg text-xs text-slate-300 overflow-auto font-mono">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Storage Fix Button */}
      {storageDiagnostics && !storageDiagnostics.overall_status.bucket_operational && (
        <div className="cms-bg-card rounded-xl border border-blue-500/30 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Folder className="w-5 h-5 text-yellow-500" />
              <div>
                <h3 className="text-white font-terminal">存储修复</h3>
                <p className="text-slate-300 text-small font-terminal">
                  检测到存储配置问题，点击尝试自动修复
                </p>
              </div>
            </div>
            <Button
              onClick={fixStorage}
              disabled={isRunning}
              className="cms-secondary-button"
            >
              <Settings className="w-4 h-4 mr-2" />
              尝试修复
            </Button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="cms-bg-card rounded-xl border border-blue-500/30 p-4">
        <h3 className="text-white font-terminal mb-3">快速操作</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => window.open(`https://supabase.com/dashboard/project/${projectId}`, '_blank')}
            className="cms-secondary-button p-3 text-left"
          >
            <Database className="w-4 h-4 mb-2" />
            <div className="text-small">
              <div className="text-white">打开项目控制台</div>
              <div className="text-slate-400">管理数据库和存储</div>
            </div>
          </button>
          
          <button
            onClick={() => window.open(`https://supabase.com/dashboard/project/${projectId}/storage/buckets`, '_blank')}
            className="cms-secondary-button p-3 text-left"
          >
            <Folder className="w-4 h-4 mb-2" />
            <div className="text-small">
              <div className="text-white">存储管理</div>
              <div className="text-slate-400">查看存储桶设置</div>
            </div>
          </button>
          
          <button
            onClick={() => window.open(`https://supabase.com/dashboard/project/${projectId}/functions`, '_blank')}
            className="cms-secondary-button p-3 text-left"
          >
            <Settings className="w-4 h-4 mb-2" />
            <div className="text-small">
              <div className="text-white">Edge Functions</div>
              <div className="text-slate-400">检查函数部署</div>
            </div>
          </button>
        </div>
      </div>

      {/* Language Separation Test */}
      <LanguageSeparationTest />
    </div>
  );
}