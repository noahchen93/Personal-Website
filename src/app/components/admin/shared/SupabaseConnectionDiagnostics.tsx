import React, { useState, useRef } from 'react';
import { AlertTriangle, RefreshCw, CheckCircle, XCircle, Info, Settings, Zap, WifiOff, Database, Cloud, Terminal, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../language/LanguageContext';
import { toast } from 'sonner';

interface DiagnosticTest {
  name: string;
  description: string;
  status: 'pass' | 'fail' | 'warning' | 'pending' | 'running';
  message: string;
  details?: any;
  fix?: () => Promise<void>;
  fixLabel?: string;
}

interface DiagnosticCategory {
  name: string;
  tests: DiagnosticTest[];
}

export default function SupabaseConnectionDiagnostics() {
  const { isZh } = useLanguage();
  const [isRunning, setIsRunning] = useState(false);
  const [categories, setCategories] = useState<DiagnosticCategory[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const getText = (zh: string, en: string) => isZh ? zh : en;

  const runComprehensiveDiagnostics = async () => {
    setIsRunning(true);
    setCategories([]);
    setCurrentStep(getText('正在初始化诊断...', 'Initializing diagnostics...'));

    // 创建abort controller以便取消请求
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    try {
      // 获取Supabase配置
      const { projectId, publicAnonKey } = await import('../../utils/supabase/info');
      const supabaseUrl = `https://${projectId}.supabase.co`;

      const diagnosticCategories: DiagnosticCategory[] = [
        {
          name: getText('基础连接检测', 'Basic Connection Tests'),
          tests: []
        },
        {
          name: getText('API端点测试', 'API Endpoint Tests'),
          tests: []
        },
        {
          name: getText('数据库连接测试', 'Database Connection Tests'),
          tests: []
        },
        {
          name: getText('存储服务测试', 'Storage Service Tests'),
          tests: []
        },
        {
          name: getText('Edge Functions测试', 'Edge Functions Tests'),
          tests: []
        }
      ];

      // 1. 基础连接检测
      setCurrentStep(getText('检测网络连接...', 'Testing network connectivity...'));
      
      // 网络连通性测试
      const networkStartTime = Date.now();
      try {
        const pingResponse = await fetch(`${supabaseUrl}/health`, {
          method: 'HEAD',
          signal,
          headers: { 'Cache-Control': 'no-cache' }
        });
        const networkLatency = Date.now() - networkStartTime;
        
        diagnosticCategories[0].tests.push({
          name: getText('网络连通性', 'Network Connectivity'),
          description: getText('基础网络连接检测', 'Basic network connection test'),
          status: pingResponse.ok ? 'pass' : 'warning',
          message: getText(
            `网络连通性${pingResponse.ok ? '正常' : '异常'}, 延迟: ${networkLatency}ms`,
            `Network ${pingResponse.ok ? 'reachable' : 'unreachable'}, latency: ${networkLatency}ms`
          ),
          details: { latency: networkLatency, status: pingResponse.status }
        });
      } catch (networkError) {
        diagnosticCategories[0].tests.push({
          name: getText('网络连通性', 'Network Connectivity'),
          description: getText('基础网络连接检测', 'Basic network connection test'),
          status: 'fail',
          message: getText('网络连接失败', 'Network connection failed'),
          details: { error: (networkError as Error).message }
        });
      }

      // DNS解析测试
      setCurrentStep(getText('检测DNS解析...', 'Testing DNS resolution...'));
      try {
        const dnsStartTime = Date.now();
        await fetch(`${supabaseUrl}/health`, { 
          method: 'HEAD', 
          signal,
          headers: { 'Cache-Control': 'no-cache' }
        });
        const dnsTime = Date.now() - dnsStartTime;
        
        diagnosticCategories[0].tests.push({
          name: getText('DNS解析', 'DNS Resolution'),
          description: getText('域名解析速度检测', 'Domain name resolution speed test'),
          status: dnsTime < 500 ? 'pass' : dnsTime < 2000 ? 'warning' : 'fail',
          message: getText(
            `DNS解析时间: ${dnsTime}ms ${dnsTime < 500 ? '(快速)' : dnsTime < 2000 ? '(中等)' : '(缓慢)'}`,
            `DNS resolution time: ${dnsTime}ms ${dnsTime < 500 ? '(fast)' : dnsTime < 2000 ? '(moderate)' : '(slow)'}`
          ),
          details: { dnsTime }
        });
      } catch (error) {
        diagnosticCategories[0].tests.push({
          name: getText('DNS解析', 'DNS Resolution'),
          description: getText('域名解析速度检测', 'Domain name resolution speed test'),
          status: 'fail',
          message: getText('DNS解析失败', 'DNS resolution failed'),
          details: { error: (error as Error).message }
        });
      }

      // 2. API端点测试
      setCurrentStep(getText('测试健康检查API...', 'Testing health check API...'));
      
      const healthTest: DiagnosticTest = {
        name: getText('健康检查端点', 'Health Check Endpoint'),
        description: getText('测试Edge Function健康状态', 'Test Edge Function health status'),
        status: 'running',
        message: getText('检测中...', 'Testing...')
      };
      
      try {
        const healthResponse = await fetch(`${supabaseUrl}/functions/v1/make-server-55b791b3/health`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'apikey': publicAnonKey,
            'Content-Type': 'application/json'
          },
          signal
        });

        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          healthTest.status = 'pass';
          healthTest.message = getText(
            `健康检查通过 (v${healthData.version})`,
            `Health check passed (v${healthData.version})`
          );
          healthTest.details = healthData;
        } else {
          healthTest.status = 'fail';
          healthTest.message = getText(
            `健康检查失败: HTTP ${healthResponse.status}`,
            `Health check failed: HTTP ${healthResponse.status}`
          );
          healthTest.details = { 
            status: healthResponse.status, 
            statusText: healthResponse.statusText 
          };
        }
      } catch (error) {
        healthTest.status = 'fail';
        healthTest.message = getText(
          `健康检查异常: ${(error as Error).message}`,
          `Health check error: ${(error as Error).message}`
        );
        healthTest.details = { error: (error as Error).message };
      }

      diagnosticCategories[1].tests.push(healthTest);

      // 内容API测试
      setCurrentStep(getText('测试内容API...', 'Testing content API...'));
      
      const contentTest: DiagnosticTest = {
        name: getText('内容API', 'Content API'),
        description: getText('测试内容获取功能', 'Test content retrieval functionality'),
        status: 'running',
        message: getText('检测中...', 'Testing...')
      };

      try {
        const contentResponse = await fetch(`${supabaseUrl}/functions/v1/make-server-55b791b3/content/projects?language=zh&limit=1`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'apikey': publicAnonKey
          },
          signal
        });

        if (contentResponse.ok) {
          const contentData = await contentResponse.json();
          contentTest.status = 'pass';
          contentTest.message = getText(
            `内容API正常 (${Array.isArray(contentData) ? contentData.length : 0}项)`,
            `Content API working (${Array.isArray(contentData) ? contentData.length : 0} items)`
          );
          contentTest.details = { itemCount: Array.isArray(contentData) ? contentData.length : 0 };
        } else {
          contentTest.status = 'fail';
          contentTest.message = getText(
            `内容API失败: HTTP ${contentResponse.status}`,
            `Content API failed: HTTP ${contentResponse.status}`
          );
          contentTest.details = { status: contentResponse.status };
        }
      } catch (error) {
        contentTest.status = 'fail';
        contentTest.message = getText(
          `内容API异常: ${(error as Error).message}`,
          `Content API error: ${(error as Error).message}`
        );
        contentTest.details = { error: (error as Error).message };
      }

      diagnosticCategories[1].tests.push(contentTest);

      // 3. 数据库连接测试（通过健康检查数据）
      setCurrentStep(getText('分析数据库状态...', 'Analyzing database status...'));
      
      if (healthTest.status === 'pass' && healthTest.details) {
        const dbTest: DiagnosticTest = {
          name: getText('数据库连接', 'Database Connection'),
          description: getText('检查数据库连接和表结构', 'Check database connection and table structure'),
          status: healthTest.details.database ? 'pass' : 'warning',
          message: getText(
            `数据库${healthTest.details.database ? '连接正常' : '连接异常'}`,
            `Database ${healthTest.details.database ? 'connected' : 'connection issues'}`
          ),
          details: healthTest.details.database
        };

        if (healthTest.details.database?.languageColumn) {
          const langColumnTest: DiagnosticTest = {
            name: getText('多语言支持', 'Multilingual Support'),
            description: getText('检查language列是否存在', 'Check if language column exists'),
            status: healthTest.details.database.languageColumn === 'exists' ? 'pass' : 'warning',
            message: getText(
              `语言列${healthTest.details.database.languageColumn === 'exists' ? '存在' : '缺失'}`,
              `Language column ${healthTest.details.database.languageColumn}`
            ),
            details: { languageColumn: healthTest.details.database.languageColumn }
          };
          diagnosticCategories[2].tests.push(langColumnTest);
        }

        diagnosticCategories[2].tests.push(dbTest);
      } else {
        diagnosticCategories[2].tests.push({
          name: getText('数据库连接', 'Database Connection'),
          description: getText('检查数据库连接和表结构', 'Check database connection and table structure'),
          status: 'fail',
          message: getText('无法检测数据库状态', 'Cannot detect database status'),
          details: null
        });
      }

      // 4. 存储服务测试
      setCurrentStep(getText('测试存储服务...', 'Testing storage service...'));
      
      const storageTest: DiagnosticTest = {
        name: getText('存储连接', 'Storage Connection'),
        description: getText('测试存储桶访问权限', 'Test storage bucket access permissions'),
        status: 'running',
        message: getText('检测中...', 'Testing...')
      };

      try {
        const storageDiagResponse = await fetch(`${supabaseUrl}/functions/v1/make-server-55b791b3/storage/diagnose`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'apikey': publicAnonKey
          },
          signal
        });

        if (storageDiagResponse.ok) {
          const storageData = await storageDiagResponse.json();
          const isOperational = storageData.overall_status?.bucket_operational;
          
          storageTest.status = isOperational ? 'pass' : 'warning';
          storageTest.message = getText(
            `存储${isOperational ? '连接正常' : '连接异常'}`,
            `Storage ${isOperational ? 'operational' : 'issues detected'}`
          );
          storageTest.details = storageData;

          // 如果存储有问题，添加修复功能
          if (!isOperational) {
            storageTest.fix = async () => {
              try {
                const fixResponse = await fetch(`${supabaseUrl}/functions/v1/make-server-55b791b3/storage/fix`, {
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
                    toast.success(getText('✅ 存储问题已修复', '✅ Storage issues fixed'));
                    // 重新运行诊断
                    setTimeout(() => runComprehensiveDiagnostics(), 1000);
                  } else {
                    toast.error(getText('❌ 存储修复失败', '❌ Storage fix failed'));
                  }
                } else {
                  throw new Error(`Fix request failed: ${fixResponse.status}`);
                }
              } catch (error) {
                toast.error(getText(
                  `❌ 修复失败: ${(error as Error).message}`,
                  `❌ Fix failed: ${(error as Error).message}`
                ));
              }
            };
            storageTest.fixLabel = getText('修复存储', 'Fix Storage');
          }
        } else {
          storageTest.status = 'fail';
          storageTest.message = getText(
            `存储诊断失败: HTTP ${storageDiagResponse.status}`,
            `Storage diagnosis failed: HTTP ${storageDiagResponse.status}`
          );
          storageTest.details = { status: storageDiagResponse.status };
        }
      } catch (error) {
        storageTest.status = 'fail';
        storageTest.message = getText(
          `存储测试异常: ${(error as Error).message}`,
          `Storage test error: ${(error as Error).message}`
        );
        storageTest.details = { error: (error as Error).message };
      }

      diagnosticCategories[3].tests.push(storageTest);

      // 5. Edge Functions全面测试
      setCurrentStep(getText('测试Edge Functions...', 'Testing Edge Functions...'));
      
      // 排序API测试
      const reorderTest: DiagnosticTest = {
        name: getText('项目排序API', 'Project Reorder API'),
        description: getText('测试项目排序保存功能', 'Test project ordering save functionality'),
        status: 'running',
        message: getText('检测中...', 'Testing...')
      };

      try {
        const reorderResponse = await fetch(`${supabaseUrl}/functions/v1/make-server-55b791b3/reorder-projects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'apikey': publicAnonKey
          },
          body: JSON.stringify({
            projectIds: [], // 空数组测试
            language: 'zh'
          }),
          signal
        });

        if (reorderResponse.ok) {
          const reorderData = await reorderResponse.json();
          reorderTest.status = 'pass';
          reorderTest.message = getText('排序API响应正常', 'Reorder API responding normally');
          reorderTest.details = reorderData;
        } else {
          const errorText = await reorderResponse.text();
          reorderTest.status = 'fail';
          reorderTest.message = getText(
            `排序API失败: HTTP ${reorderResponse.status}`,
            `Reorder API failed: HTTP ${reorderResponse.status}`
          );
          reorderTest.details = { status: reorderResponse.status, error: errorText };
        }
      } catch (error) {
        reorderTest.status = 'fail';
        reorderTest.message = getText(
          `排序API异常: ${(error as Error).message}`,
          `Reorder API error: ${(error as Error).message}`
        );
        reorderTest.details = { error: (error as Error).message };
      }

      diagnosticCategories[4].tests.push(reorderTest);

      // 设置最终结果
      setCategories(diagnosticCategories);
      setCurrentStep('');

      // 显示总结
      const allTests = diagnosticCategories.flatMap(cat => cat.tests);
      const passCount = allTests.filter(test => test.status === 'pass').length;
      const totalCount = allTests.length;
      
      if (passCount === totalCount) {
        toast.success(getText('✅ 所有诊断测试通过', '✅ All diagnostic tests passed'));
      } else {
        const failCount = allTests.filter(test => test.status === 'fail').length;
        const warnCount = allTests.filter(test => test.status === 'warning').length;
        
        if (failCount > 0) {
          toast.error(getText(
            `❌ 发现${failCount}个严重问题，${warnCount}个警告`,
            `❌ ${failCount} critical issues, ${warnCount} warnings detected`
          ));
        } else {
          toast.warning(getText(
            `⚠️ 发现${warnCount}个警告问题`,
            `⚠️ ${warnCount} warnings detected`
          ));
        }
      }

    } catch (error) {
      if (!abortControllerRef.current?.signal.aborted) {
        toast.error(getText(
          `❌ 诊断过程异常: ${(error as Error).message}`,
          `❌ Diagnostic process error: ${(error as Error).message}`
        ));
      }
    } finally {
      setIsRunning(false);
      setCurrentStep('');
      abortControllerRef.current = null;
    }
  };

  const cancelDiagnostics = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsRunning(false);
      setCurrentStep('');
      toast.info(getText('⏹️ 诊断已取消', '⏹️ Diagnostics cancelled'));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />;
      case 'running':
        return <RefreshCw className="w-4 h-4 text-blue-400 animate-spin flex-shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-gray-400 flex-shrink-0" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'text-green-400';
      case 'fail':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      case 'running':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    if (categoryName.includes('基础') || categoryName.includes('Basic')) {
      return <WifiOff className="w-4 h-4" />;
    }
    if (categoryName.includes('API') || categoryName.includes('端点')) {
      return <Terminal className="w-4 h-4" />;
    }
    if (categoryName.includes('数据库') || categoryName.includes('Database')) {
      return <Database className="w-4 h-4" />;
    }
    if (categoryName.includes('存储') || categoryName.includes('Storage')) {
      return <Cloud className="w-4 h-4" />;
    }
    if (categoryName.includes('Edge') || categoryName.includes('Functions')) {
      return <Zap className="w-4 h-4" />;
    }
    return <Settings className="w-4 h-4" />;
  };

  const overallStatus = categories.length === 0 ? 'unknown' : 
    categories.every(cat => cat.tests.every(test => test.status === 'pass')) ? 'pass' :
    categories.some(cat => cat.tests.some(test => test.status === 'fail')) ? 'fail' : 'warning';

  return (
    <div className="cms-bg-card border border-blue-500/30 rounded-xl">
      {/* 头部 */}
      <div className="p-4 border-b border-blue-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-blue-400" />
            <div>
              <h3 className="font-semibold text-white font-terminal">
                {getText('Supabase连接全面诊断', 'Comprehensive Supabase Connection Diagnostics')}
              </h3>
              <p className="text-sm text-blue-300 font-terminal">
                {getText('全面检测后端连接、API、数据库和存储状态', 'Comprehensive backend connection, API, database, and storage status check')}
              </p>
            </div>
            {categories.length > 0 && (
              <div className="flex items-center space-x-2 ml-4">
                {getStatusIcon(overallStatus)}
                <span className={`text-sm font-terminal font-medium ${getStatusColor(overallStatus)}`}>
                  {overallStatus === 'pass' ? getText('全部正常', 'All Normal') :
                   overallStatus === 'fail' ? getText('发现问题', 'Issues Found') :
                   overallStatus === 'warning' ? getText('有警告', 'Warnings') : ''}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-400 hover:text-blue-300 text-sm underline font-terminal"
            >
              {isExpanded ? getText('收起详情', 'Hide Details') : getText('展开详情', 'Show Details')}
            </button>
            
            {isRunning ? (
              <button
                onClick={cancelDiagnostics}
                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-all duration-200"
              >
                <XCircle className="w-4 h-4" />
                <span className="text-sm font-terminal">{getText('取消', 'Cancel')}</span>
              </button>
            ) : (
              <button
                onClick={runComprehensiveDiagnostics}
                className="flex items-center space-x-2 cms-primary-button px-4 py-2 rounded-xl text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="font-terminal">{getText('运行全面诊断', 'Run Full Diagnostics')}</span>
              </button>
            )}
          </div>
        </div>

        {/* 当前步骤指示器 */}
        {isRunning && currentStep && (
          <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
              <span className="text-blue-200 font-terminal text-sm">{currentStep}</span>
            </div>
          </div>
        )}
      </div>

      {/* 详细结果 */}
      {isExpanded && (
        <div className="p-4">
          {categories.length === 0 && !isRunning && (
            <div className="text-center py-8">
              <Info className="w-12 h-12 text-blue-400 mx-auto mb-3" />
              <p className="text-blue-300 font-terminal">
                {getText('点击"运行全面诊断"开始检测', 'Click "Run Full Diagnostics" to start testing')}
              </p>
            </div>
          )}

          {isRunning && categories.length === 0 && (
            <div className="text-center py-8">
              <RefreshCw className="w-12 h-12 text-blue-400 mx-auto mb-3 animate-spin" />
              <p className="text-blue-300 font-terminal">
                {getText('正在进行全面诊断，请稍候...', 'Running comprehensive diagnostics, please wait...')}
              </p>
            </div>
          )}

          {/* 诊断结果分类显示 */}
          {categories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-6 last:mb-0">
              <div className="flex items-center space-x-2 mb-3">
                {getCategoryIcon(category.name)}
                <h4 className="font-medium text-white font-terminal text-lg">{category.name}</h4>
                <span className="text-xs text-slate-400 font-terminal">
                  ({category.tests.length} {getText('项测试', 'tests')})
                </span>
              </div>

              <div className="space-y-3">
                {category.tests.map((test, testIndex) => (
                  <div key={testIndex} className="bg-slate-700/30 rounded-lg border border-blue-500/20 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {getStatusIcon(test.status)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="font-medium text-white font-terminal">{test.name}</h5>
                            <span className={`text-xs font-terminal ${getStatusColor(test.status)} font-medium`}>
                              {test.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300 font-terminal mb-2">{test.description}</p>
                          <p className="text-sm text-blue-200 font-terminal">{test.message}</p>
                          
                          {test.details && (
                            <details className="mt-3">
                              <summary className="text-xs text-blue-400 cursor-pointer hover:text-blue-300 font-terminal">
                                {getText('详细信息', 'Details')}
                              </summary>
                              <pre className="text-xs text-blue-300 mt-2 bg-slate-800/50 p-3 rounded overflow-x-auto font-mono max-h-32 overflow-y-auto">
                                {JSON.stringify(test.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>

                      {/* 修复按钮 */}
                      {test.fix && test.fixLabel && (
                        <button
                          onClick={test.fix}
                          className="ml-4 flex items-center space-x-1 cms-primary-button px-3 py-1 rounded text-xs"
                        >
                          <Zap className="w-3 h-3" />
                          <span className="font-terminal">{test.fixLabel}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* 综合建议 */}
          {categories.length > 0 && (
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h4 className="font-medium text-blue-200 mb-3 font-terminal flex items-center space-x-2">
                <ExternalLink className="w-4 h-4" />
                <span>{getText('综合建议', 'Overall Recommendations')}</span>
              </h4>
              
              <div className="space-y-2 text-sm text-blue-300 font-terminal">
                {overallStatus === 'pass' && (
                  <div className="flex items-center space-x-2 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>{getText('所有系统运行正常，连接状态良好！', 'All systems operational, connection status is good!')}</span>
                  </div>
                )}
                
                {categories.some(cat => cat.tests.some(test => test.status === 'fail')) && (
                  <>
                    <div className="text-red-400">• {getText('发现严重连接问题，建议：', 'Critical connection issues found, recommendations:')}</div>
                    <div className="ml-4 text-blue-300">
                      - {getText('检查网络连接稳定性', 'Check network connection stability')}<br/>
                      - {getText('验证Supabase项目配置和密钥', 'Verify Supabase project configuration and keys')}<br/>
                      - {getText('确认Edge Functions已正确部署', 'Confirm Edge Functions are properly deployed')}<br/>
                      - {getText('检查数据库表结构完整性', 'Check database table structure integrity')}
                    </div>
                  </>
                )}
                
                {categories.some(cat => cat.tests.some(test => test.status === 'warning')) && (
                  <>
                    <div className="text-yellow-400">• {getText('发现性能或配置警告：', 'Performance or configuration warnings found:')}</div>
                    <div className="ml-4 text-blue-300">
                      - {getText('网络延迟较高，可能影响用户体验', 'High network latency may affect user experience')}<br/>
                      - {getText('某些功能可能受限，但基本功能正常', 'Some features may be limited, but basic functions work')}<br/>
                      - {getText('建议优化网络环境或服务器配置', 'Consider optimizing network environment or server configuration')}
                    </div>
                  </>
                )}
                
                <div className="mt-3 pt-3 border-t border-blue-500/20 text-blue-400">
                  {getText('💡 如问题持续，请尝试刷新页面或联系技术支持', '💡 If issues persist, try refreshing the page or contact technical support')}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}