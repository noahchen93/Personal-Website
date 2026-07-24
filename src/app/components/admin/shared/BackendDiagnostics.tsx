import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, CheckCircle, XCircle, Info, Settings } from 'lucide-react';
import { useLanguage } from '../../language/LanguageContext';
import { toast } from 'sonner';

interface DiagnosticResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

interface BackendDiagnosticsProps {
  className?: string;
}

export default function BackendDiagnostics({ className = '' }: BackendDiagnosticsProps) {
  const { isZh } = useLanguage();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);
    const diagnosticResults: DiagnosticResult[] = [];

    try {
      // 获取Supabase配置
      const { projectId, publicAnonKey } = await import('../../utils/supabase/info');
      
      // 测试1: 健康检查
      try {
        const healthResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-55b791b3/health`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });

        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          diagnosticResults.push({
            test: isZh ? '后端健康检查' : 'Backend Health Check',
            status: 'pass',
            message: isZh ? `服务器运行正常 (v${healthData.version})` : `Server running normally (v${healthData.version})`,
            details: healthData
          });

          // 检查数据库连接状态
          if (healthData.database) {
            diagnosticResults.push({
              test: isZh ? '数据库连接' : 'Database Connection',
              status: healthData.database.languageColumn === 'exists' ? 'pass' : 'warning',
              message: isZh 
                ? `数据库连接正常，语言列${healthData.database.languageColumn === 'exists' ? '存在' : '缺失'}`
                : `Database connected, language column ${healthData.database.languageColumn}`,
              details: healthData.database
            });
          }

          // 检查存储状态
          if (healthData.storage) {
            diagnosticResults.push({
              test: isZh ? '存储连接' : 'Storage Connection',
              status: healthData.storage.accessible ? 'pass' : 'warning',
              message: isZh 
                ? `存储桶${healthData.storage.accessible ? '可访问' : '不可访问'}`
                : `Storage bucket ${healthData.storage.accessible ? 'accessible' : 'not accessible'}`,
              details: healthData.storage
            });
          }
        } else {
          diagnosticResults.push({
            test: isZh ? '后端健康检查' : 'Backend Health Check',
            status: 'fail',
            message: isZh ? `健康检查失败: ${healthResponse.status}` : `Health check failed: ${healthResponse.status}`,
            details: { status: healthResponse.status, statusText: healthResponse.statusText }
          });
        }
      } catch (healthError) {
        diagnosticResults.push({
          test: isZh ? '后端健康检查' : 'Backend Health Check',
          status: 'fail',
          message: isZh ? `连接失败: ${(healthError as Error).message}` : `Connection failed: ${(healthError as Error).message}`,
          details: { error: (healthError as Error).message }
        });
      }

      // 测试2: 内容API测试
      try {
        const contentResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-55b791b3/content/projects?language=zh&_test=1`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });

        if (contentResponse.ok) {
          const contentData = await contentResponse.json();
          diagnosticResults.push({
            test: isZh ? '内容API测试' : 'Content API Test',
            status: 'pass',
            message: isZh ? `成功获取${Array.isArray(contentData) ? contentData.length : 0}个项目` : `Successfully fetched ${Array.isArray(contentData) ? contentData.length : 0} projects`,
            details: { count: Array.isArray(contentData) ? contentData.length : 0 }
          });
        } else {
          diagnosticResults.push({
            test: isZh ? '内容API测试' : 'Content API Test',
            status: 'fail',
            message: isZh ? `API调用失败: ${contentResponse.status}` : `API call failed: ${contentResponse.status}`,
            details: { status: contentResponse.status }
          });
        }
      } catch (contentError) {
        diagnosticResults.push({
          test: isZh ? '内容API测试' : 'Content API Test',
          status: 'fail',
          message: isZh ? `API测试失败: ${(contentError as Error).message}` : `API test failed: ${(contentError as Error).message}`,
          details: { error: (contentError as Error).message }
        });
      }

      // 测试3: 排序API测试（模拟调用）
      try {
        const reorderResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-55b791b3/reorder-projects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            projectIds: [], // 空数组测试
            language: 'zh'
          })
        });

        if (reorderResponse.ok) {
          const reorderData = await reorderResponse.json();
          diagnosticResults.push({
            test: isZh ? '排序API测试' : 'Reorder API Test',
            status: 'pass',
            message: isZh ? '排序API响应正常' : 'Reorder API responding normally',
            details: reorderData
          });
        } else {
          const errorText = await reorderResponse.text();
          diagnosticResults.push({
            test: isZh ? '排序API测试' : 'Reorder API Test',
            status: 'fail',
            message: isZh ? `排序API失败: ${reorderResponse.status}` : `Reorder API failed: ${reorderResponse.status}`,
            details: { status: reorderResponse.status, error: errorText }
          });
        }
      } catch (reorderError) {
        diagnosticResults.push({
          test: isZh ? '排序API测试' : 'Reorder API Test',
          status: 'fail',
          message: isZh ? `排序API测试失败: ${(reorderError as Error).message}` : `Reorder API test failed: ${(reorderError as Error).message}`,
          details: { error: (reorderError as Error).message }
        });
      }

      // 测试4: 网络延迟测试
      const networkStartTime = Date.now();
      try {
        await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-55b791b3/health`, {
          method: 'HEAD',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });
        const latency = Date.now() - networkStartTime;
        
        diagnosticResults.push({
          test: isZh ? '网络延迟' : 'Network Latency',
          status: latency < 1000 ? 'pass' : latency < 3000 ? 'warning' : 'fail',
          message: isZh ? `网络延迟: ${latency}ms` : `Network latency: ${latency}ms`,
          details: { latency }
        });
      } catch (networkError) {
        diagnosticResults.push({
          test: isZh ? '网络延迟' : 'Network Latency',
          status: 'fail',
          message: isZh ? '网络连接失败' : 'Network connection failed',
          details: { error: (networkError as Error).message }
        });
      }

    } catch (globalError) {
      diagnosticResults.push({
        test: isZh ? '全局错误' : 'Global Error',
        status: 'fail',
        message: isZh ? `诊断过程中出现错误: ${(globalError as Error).message}` : `Error during diagnostics: ${(globalError as Error).message}`,
        details: { error: (globalError as Error).message }
      });
    }

    setResults(diagnosticResults);
    setIsRunning(false);

    // 显示总结toast
    const passCount = diagnosticResults.filter(r => r.status === 'pass').length;
    const totalCount = diagnosticResults.length;
    
    if (passCount === totalCount) {
      toast.success(isZh ? '✅ 所有测试通过' : '✅ All tests passed');
    } else {
      toast.warning(isZh ? `⚠️ ${passCount}/${totalCount} 测试通过` : `⚠️ ${passCount}/${totalCount} tests passed`);
    }
  };

  const getStatusIcon = (status: 'pass' | 'fail' | 'warning') => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getStatusColor = (status: 'pass' | 'fail' | 'warning') => {
    switch (status) {
      case 'pass':
        return 'text-green-400';
      case 'fail':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      default:
        return 'text-blue-400';
    }
  };

  const overallStatus = results.length === 0 ? 'unknown' : 
    results.every(r => r.status === 'pass') ? 'pass' :
    results.some(r => r.status === 'fail') ? 'fail' : 'warning';

  return (
    <div className={`cms-bg-card border border-blue-500/30 rounded-xl ${className}`}>
      <div className="p-4 border-b border-blue-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <h3 className="font-medium text-white font-terminal">
              {isZh ? '后端连接诊断' : 'Backend Connection Diagnostics'}
            </h3>
            {results.length > 0 && (
              <div className="flex items-center space-x-1">
                {getStatusIcon(overallStatus)}
                <span className={`text-sm font-terminal ${getStatusColor(overallStatus)}`}>
                  {overallStatus === 'pass' ? (isZh ? '正常' : 'Normal') :
                   overallStatus === 'fail' ? (isZh ? '异常' : 'Error') :
                   overallStatus === 'warning' ? (isZh ? '警告' : 'Warning') : ''}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-400 hover:text-blue-300 text-sm underline font-terminal"
            >
              {isExpanded ? (isZh ? '收起' : 'Collapse') : (isZh ? '展开' : 'Expand')}
            </button>
            <button
              onClick={runDiagnostics}
              disabled={isRunning}
              className="flex items-center space-x-1 cms-primary-button px-3 py-1.5 rounded-xl text-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? (isZh ? '诊断中...' : 'Running...') : (isZh ? '运行诊断' : 'Run Diagnostics')}</span>
            </button>
          </div>
        </div>
        <p className="text-sm text-blue-300 mt-2 font-terminal">
          {isZh 
            ? '如果项目排序保存失败，请运行此诊断来检查后端连接状态。'
            : 'If project ordering fails to save, run this diagnostic to check backend connection status.'
          }
        </p>
      </div>
      
      {isExpanded && (
        <div className="p-4">
          {results.length === 0 && !isRunning && (
            <div className="text-center py-8">
              <Info className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-blue-300 font-terminal">
                {isZh ? '点击"运行诊断"开始检查' : 'Click "Run Diagnostics" to start checking'}
              </p>
            </div>
          )}
          
          {isRunning && (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 text-blue-400 mx-auto mb-2 animate-spin" />
              <p className="text-blue-300 font-terminal">
                {isZh ? '正在运行诊断测试...' : 'Running diagnostic tests...'}
              </p>
            </div>
          )}
          
          {results.length > 0 && (
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-slate-700/30 rounded-xl border border-blue-500/20">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-white font-terminal">{result.test}</h4>
                      <span className={`text-xs font-terminal ${getStatusColor(result.status)}`}>
                        {result.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-blue-200 mt-1 font-terminal">{result.message}</p>
                    {result.details && (
                      <details className="mt-2">
                        <summary className="text-xs text-blue-400 cursor-pointer hover:text-blue-300 font-terminal">
                          {isZh ? '详细信息' : 'Details'}
                        </summary>
                        <pre className="text-xs text-blue-300 mt-1 bg-slate-800/50 p-2 rounded overflow-x-auto font-mono">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <h4 className="font-medium text-blue-200 mb-2 font-terminal">
                  {isZh ? '建议解决方案' : 'Suggested Solutions'}
                </h4>
                <ul className="text-sm text-blue-300 space-y-1 font-terminal">
                  {results.some(r => r.status === 'fail') && (
                    <>
                      <li>• {isZh ? '检查网络连接是否正常' : 'Check if network connection is stable'}</li>
                      <li>• {isZh ? '确认Supabase项目配置正确' : 'Verify Supabase project configuration'}</li>
                      <li>• {isZh ? '检查Edge Functions是否正常部署' : 'Check if Edge Functions are properly deployed'}</li>
                    </>
                  )}
                  {results.some(r => r.status === 'warning') && (
                    <>
                      <li>• {isZh ? '网络延迟较高，可能影响保存速度' : 'High network latency may affect save speed'}</li>
                      <li>• {isZh ? '某些功能可能受限，但基本功能可用' : 'Some features may be limited, but basic functions work'}</li>
                    </>
                  )}
                  <li>• {isZh ? '如问题持续，请刷新页面重试' : 'If issues persist, refresh the page and try again'}</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}