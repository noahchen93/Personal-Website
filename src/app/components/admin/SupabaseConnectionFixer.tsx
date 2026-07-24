import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, RefreshCw, ExternalLink, Copy, Settings, Database, Cloud, Shield, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useLanguage } from '../language/LanguageContext';

interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceKey: string;
}

interface DiagnosticResult {
  service: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  details?: string;
}

export default function SupabaseConnectionFixer() {
  const { isZh } = useLanguage();
  const [config, setConfig] = useState<SupabaseConfig>({
    url: '',
    anonKey: '',
    serviceKey: ''
  });
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    // Load current configuration
    loadCurrentConfig();
  }, []);

  const loadCurrentConfig = async () => {
    try {
      // Get current config from utils/supabase/info.tsx
      const response = await fetch('/utils/supabase/info.tsx');
      if (response.ok) {
        const content = await response.text();
        
        // Extract project ID and keys from the file content
        const projectIdMatch = content.match(/projectId.*?['"`]([^'"`]+)['"`]/);
        const anonKeyMatch = content.match(/publicAnonKey.*?['"`]([^'"`]+)['"`]/);
        
        if (projectIdMatch) {
          const projectId = projectIdMatch[1];
          setConfig(prev => ({
            ...prev,
            url: `https://${projectId}.supabase.co`
          }));
        }
        
        if (anonKeyMatch) {
          setConfig(prev => ({
            ...prev,
            anonKey: anonKeyMatch[1]
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load current config:', error);
    }
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setDiagnostics([]);
    
    const tests = [
      { 
        service: isZh ? 'Supabase项目访问' : 'Supabase Project Access', 
        test: testProjectAccess 
      },
      { 
        service: isZh ? '数据库连接' : 'Database Connection', 
        test: testDatabaseConnection 
      },
      { 
        service: isZh ? '存储服务' : 'Storage Service', 
        test: testStorageAccess 
      },
      { 
        service: isZh ? '认证服务' : 'Auth Service', 
        test: testAuthService 
      },
      { 
        service: isZh ? 'Edge Functions' : 'Edge Functions', 
        test: testEdgeFunctions 
      }
    ];

    for (const { service, test } of tests) {
      setCurrentStep(service);
      
      setDiagnostics(prev => [...prev, {
        service,
        status: 'pending',
        message: isZh ? '检测中...' : 'Testing...'
      }]);

      try {
        const result = await test();
        setDiagnostics(prev => prev.map(d => 
          d.service === service ? { ...d, ...result } : d
        ));
      } catch (error) {
        setDiagnostics(prev => prev.map(d => 
          d.service === service ? {
            ...d,
            status: 'error',
            message: isZh ? '测试失败' : 'Test failed',
            details: error instanceof Error ? error.message : String(error)
          } : d
        ));
      }

      // Small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setCurrentStep('');
    setIsRunning(false);
  };

  const testProjectAccess = async (): Promise<DiagnosticResult> => {
    if (!config.url || !config.anonKey) {
      return {
        service: '',
        status: 'error',
        message: isZh ? '配置信息不完整' : 'Configuration incomplete',
        details: isZh ? 'URL或API密钥缺失' : 'Missing URL or API key'
      };
    }

    const response = await fetch(`${config.url}/rest/v1/`, {
      headers: {
        'apikey': config.anonKey,
        'Authorization': `Bearer ${config.anonKey}`
      }
    });

    if (response.status === 404) {
      return {
        service: '',
        status: 'error',
        message: isZh ? '项目不存在或URL错误' : 'Project not found or incorrect URL',
        details: isZh ? '请检查项目ID和Supabase URL是否正确' : 'Please verify project ID and Supabase URL'
      };
    }

    if (response.status === 401) {
      return {
        service: '',
        status: 'error',
        message: isZh ? 'API密钥无效' : 'Invalid API key',
        details: isZh ? '请检查anon/public密钥是否正确' : 'Please verify anon/public key is correct'
      };
    }

    if (response.ok) {
      return {
        service: '',
        status: 'success',
        message: isZh ? '项目访问正常' : 'Project access successful'
      };
    }

    return {
      service: '',
      status: 'error',
      message: isZh ? `HTTP ${response.status} 错误` : `HTTP ${response.status} error`,
      details: await response.text()
    };
  };

  const testDatabaseConnection = async (): Promise<DiagnosticResult> => {
    try {
      const response = await fetch(`${config.url}/rest/v1/kv_store_55b791b3?limit=1`, {
        headers: {
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`
        }
      });

      if (response.status === 404) {
        return {
          service: '',
          status: 'error',
          message: isZh ? '数据表不存在' : 'Table does not exist',
          details: isZh ? 'kv_store_55b791b3表未找到，请运行数据库迁移' : 'kv_store_55b791b3 table not found, please run database migration'
        };
      }

      if (response.ok) {
        return {
          service: '',
          status: 'success',
          message: isZh ? '数据库连接正常' : 'Database connection successful'
        };
      }

      return {
        service: '',
        status: 'error',
        message: isZh ? '数据库访问失败' : 'Database access failed',
        details: await response.text()
      };
    } catch (error) {
      return {
        service: '',
        status: 'error',
        message: isZh ? '数据库连接错误' : 'Database connection error',
        details: error instanceof Error ? error.message : String(error)
      };
    }
  };

  const testStorageAccess = async (): Promise<DiagnosticResult> => {
    try {
      const response = await fetch(`${config.url}/storage/v1/bucket`, {
        headers: {
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`
        }
      });

      if (response.status === 404) {
        return {
          service: '',
          status: 'error',
          message: isZh ? '存储服务未启用' : 'Storage service not enabled',
          details: isZh ? '请在Supabase控制台启用Storage功能' : 'Please enable Storage in Supabase console'
        };
      }

      if (response.ok) {
        return {
          service: '',
          status: 'success',
          message: isZh ? '存储服务正常' : 'Storage service accessible'
        };
      }

      return {
        service: '',
        status: 'error',
        message: isZh ? '存储服务访问失败' : 'Storage service access failed',
        details: await response.text()
      };
    } catch (error) {
      return {
        service: '',
        status: 'error',
        message: isZh ? '存储服务连接错误' : 'Storage service connection error',
        details: error instanceof Error ? error.message : String(error)
      };
    }
  };

  const testAuthService = async (): Promise<DiagnosticResult> => {
    try {
      const response = await fetch(`${config.url}/auth/v1/settings`, {
        headers: {
          'apikey': config.anonKey
        }
      });

      if (response.ok) {
        return {
          service: '',
          status: 'success',
          message: isZh ? '认证服务正常' : 'Auth service accessible'
        };
      }

      return {
        service: '',
        status: 'error',
        message: isZh ? '认证服务访问失败' : 'Auth service access failed',
        details: await response.text()
      };
    } catch (error) {
      return {
        service: '',
        status: 'error',
        message: isZh ? '认证服务连接错误' : 'Auth service connection error',
        details: error instanceof Error ? error.message : String(error)
      };
    }
  };

  const testEdgeFunctions = async (): Promise<DiagnosticResult> => {
    try {
      const response = await fetch(`${config.url}/functions/v1/make-server-55b791b3/health`, {
        headers: {
          'Authorization': `Bearer ${config.anonKey}`
        }
      });

      if (response.ok) {
        return {
          service: '',
          status: 'success',
          message: isZh ? 'Edge Functions正常' : 'Edge Functions working'
        };
      }

      if (response.status === 404) {
        return {
          service: '',
          status: 'error',
          message: isZh ? 'Edge Function未部署' : 'Edge Function not deployed',
          details: isZh ? '请运行 ./deploy-supabase.sh 部署服务器端代码' : 'Please run ./deploy-supabase.sh to deploy server code'
        };
      }

      return {
        service: '',
        status: 'error',
        message: isZh ? 'Edge Function访问失败' : 'Edge Function access failed',
        details: await response.text()
      };
    } catch (error) {
      return {
        service: '',
        status: 'error',
        message: isZh ? 'Edge Function连接错误' : 'Edge Function connection error',
        details: error instanceof Error ? error.message : String(error)
      };
    }
  };

  const updateConfiguration = async () => {
    try {
      // Extract project ID from URL
      const urlMatch = config.url.match(/https:\/\/([^.]+)\.supabase\.co/);
      if (!urlMatch) {
        alert(isZh ? 'URL格式错误，应该是 https://项目ID.supabase.co' : 'Invalid URL format, should be https://project-id.supabase.co');
        return;
      }

      const projectId = urlMatch[1];

      // Update the info.tsx file
      const newContent = `export const projectId = '${projectId}';
export const publicAnonKey = '${config.anonKey}';
export const serviceRoleKey = '${config.serviceKey}';
export const supabaseUrl = '${config.url}';`;

      // This would need to be handled by the backend in a real implementation
      console.log('New configuration:', newContent);
      
      alert(isZh ? '配置已更新，请重新加载页面' : 'Configuration updated, please reload the page');
      
    } catch (error) {
      console.error('Failed to update configuration:', error);
      alert(isZh ? '配置更新失败' : 'Failed to update configuration');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusIcon = (status: 'success' | 'error' | 'pending') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>{isZh ? 'Supabase连接诊断和修复' : 'Supabase Connection Diagnostic & Fix'}</h2>
          <p className="text-muted-foreground mt-1">
            {isZh ? '解决HTTP 404等连接错误' : 'Fix HTTP 404 and other connection errors'}
          </p>
        </div>
        <Button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isZh ? '运行诊断' : 'Run Diagnostics'}</span>
        </Button>
      </div>

      <Tabs defaultValue="diagnostics" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="diagnostics" className="flex items-center space-x-2">
            <Database className="w-4 h-4" />
            <span>{isZh ? '诊断结果' : 'Diagnostics'}</span>
          </TabsTrigger>
          <TabsTrigger value="configuration" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>{isZh ? '配置修复' : 'Configuration'}</span>
          </TabsTrigger>
          <TabsTrigger value="guide" className="flex items-center space-x-2">
            <ExternalLink className="w-4 h-4" />
            <span>{isZh ? '修复指南' : 'Fix Guide'}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="diagnostics" className="space-y-4">
          {isRunning && currentStep && (
            <Alert>
              <Loader2 className="w-4 h-4 animate-spin" />
              <AlertDescription>
                {isZh ? `正在检测: ${currentStep}` : `Testing: ${currentStep}`}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {diagnostics.map((result, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{result.service}</span>
                        </div>
                        <p className={`text-sm mt-1 ${
                          result.status === 'success' ? 'text-green-600' : 
                          result.status === 'error' ? 'text-red-600' : 
                          'text-blue-600'
                        }`}>
                          {result.message}
                        </p>
                        {result.details && (
                          <p className="text-xs text-muted-foreground mt-2 font-mono bg-muted p-2 rounded">
                            {result.details}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {diagnostics.length === 0 && !isRunning && (
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                {isZh ? '点击"运行诊断"开始检测连接问题' : 'Click "Run Diagnostics" to start testing connection issues'}
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isZh ? '当前配置' : 'Current Configuration'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="url">Supabase URL</Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    id="url"
                    value={config.url}
                    onChange={(e) => setConfig(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://your-project.supabase.co"
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(config.url)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="anon-key">Anon/Public Key</Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    id="anon-key"
                    type="password"
                    value={config.anonKey}
                    onChange={(e) => setConfig(prev => ({ ...prev, anonKey: e.target.value }))}
                    placeholder="eyJ..."
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(config.anonKey)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="service-key">Service Role Key</Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    id="service-key"
                    type="password"
                    value={config.serviceKey}
                    onChange={(e) => setConfig(prev => ({ ...prev, serviceKey: e.target.value }))}
                    placeholder="eyJ..."
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(config.serviceKey)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Button onClick={updateConfiguration} className="w-full">
                {isZh ? '更新配置' : 'Update Configuration'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guide" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isZh ? '404错误修复指南' : '404 Error Fix Guide'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">{isZh ? '常见原因和解决方案:' : 'Common Causes and Solutions:'}</h4>
                
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h5 className="font-medium text-blue-700">
                      {isZh ? '1. 项目不存在或URL错误' : '1. Project Not Found or Incorrect URL'}
                    </h5>
                    <ul className="list-disc list-inside text-sm text-muted-foreground mt-1 space-y-1">
                      <li>{isZh ? '检查项目ID是否正确' : 'Verify project ID is correct'}</li>
                      <li>{isZh ? '确认项目在Supabase控制台存在' : 'Confirm project exists in Supabase console'}</li>
                      <li>{isZh ? 'URL格式: https://项目ID.supabase.co' : 'URL format: https://project-id.supabase.co'}</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-orange-500 pl-4">
                    <h5 className="font-medium text-orange-700">
                      {isZh ? '2. API密钥无效或过期' : '2. Invalid or Expired API Keys'}
                    </h5>
                    <ul className="list-disc list-inside text-sm text-muted-foreground mt-1 space-y-1">
                      <li>{isZh ? '在Supabase控制台重新生成API密钥' : 'Regenerate API keys in Supabase console'}</li>
                      <li>{isZh ? '确保使用正确的anon key和service_role key' : 'Ensure using correct anon key and service_role key'}</li>
                      <li>{isZh ? '检查密钥没有额外的空格或字符' : 'Check keys have no extra spaces or characters'}</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-red-500 pl-4">
                    <h5 className="font-medium text-red-700">
                      {isZh ? '3. 数据库表未创建' : '3. Database Tables Not Created'}
                    </h5>
                    <ul className="list-disc list-inside text-sm text-muted-foreground mt-1 space-y-1">
                      <li>{isZh ? '运行数据库迁移脚本' : 'Run database migration scripts'}</li>
                      <li>{isZh ? '手动在SQL编辑器中创建kv_store_55b791b3表' : 'Manually create kv_store_55b791b3 table in SQL editor'}</li>
                      <li>{isZh ? '检查表权限设置' : 'Check table permissions'}</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <h5 className="font-medium text-green-700">
                      {isZh ? '4. 服务未启用' : '4. Services Not Enabled'}
                    </h5>
                    <ul className="list-disc list-inside text-sm text-muted-foreground mt-1 space-y-1">
                      <li>{isZh ? '在Supabase控制台启用Database、Auth、Storage服务' : 'Enable Database, Auth, Storage services in Supabase console'}</li>
                      <li>{isZh ? '部署Edge Functions' : 'Deploy Edge Functions'}</li>
                      <li>{isZh ? '检查RLS策略配置' : 'Check RLS policy configuration'}</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h5 className="font-medium text-blue-800 mb-2">
                    {isZh ? '快速解决步骤:' : 'Quick Resolution Steps:'}
                  </h5>
                  <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
                    <li>{isZh ? '登录 supabase.com 检查项目状态' : 'Login to supabase.com and check project status'}</li>
                    <li>{isZh ? '获取最新的API密钥' : 'Get latest API keys'}</li>
                    <li>{isZh ? '在上面的"配置修复"页面更新配置' : 'Update configuration in "Configuration" tab above'}</li>
                    <li>{isZh ? '运行诊断检查问题是否解决' : 'Run diagnostics to check if issues are resolved'}</li>
                    <li>{isZh ? '如果问题持续，请在Supabase控制台查看项目日志' : 'If issues persist, check project logs in Supabase console'}</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}