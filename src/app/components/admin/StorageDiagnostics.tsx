import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { useContent } from '../content/ContentContext';
import { useLanguage } from '../language/LanguageContext';
import { 
  CloudDownload, 
  Database, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Settings,
  Wrench,
  Info
} from 'lucide-react';

interface DiagnosticResult {
  test: string;
  status: 'pending' | 'success' | 'warning' | 'error';
  message: string;
  details?: any;
}

export default function StorageDiagnostics() {
  const { getImages, syncStorage, cleanupImages, isOnline } = useContent();
  const { isZh } = useLanguage();
  
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);

    const tests: DiagnosticResult[] = [
      { test: 'connection', status: 'pending', message: isZh ? '检查网络连接...' : 'Checking network connection...' },
      { test: 'server', status: 'pending', message: isZh ? '测试服务器连接...' : 'Testing server connection...' },
      { test: 'images', status: 'pending', message: isZh ? '获取图片列表...' : 'Fetching images list...' },
      { test: 'storage', status: 'pending', message: isZh ? '测试存储同步...' : 'Testing storage sync...' }
    ];

    setResults([...tests]);

    try {
      // Import Supabase config
      const { supabaseUrl } = await import('../../utils/supabase/info');

      // Test 1: Network connection
      await updateTestResult('connection', () => {
        if (!isOnline) {
          throw new Error(isZh ? '当前处于离线模式' : 'Currently in offline mode');
        }
        return { message: isZh ? '网络连接正常' : 'Network connection OK' };
      });

      // Test 2: Server connection
      await updateTestResult('server', async () => {
        const healthUrl = `${supabaseUrl}/functions/v1/make-server-55b791b3/health`;
        console.log('Testing server health at:', healthUrl);
        
        const response = await fetch(healthUrl, { 
          method: 'GET',
          cache: 'no-cache',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} - ${response.statusText}`);
        }
        
        const healthData = await response.json();
        console.log('Health check response:', healthData);
        
        return { 
          message: isZh ? '服务器连接正常' : 'Server connection OK',
          details: healthData
        };
      });

      // Test 3: Images fetch
      await updateTestResult('images', async () => {
        const images = await getImages(true);
        return { 
          message: isZh ? `成功获取 ${images.length} 张图片` : `Successfully fetched ${images.length} images`,
          details: { count: images.length }
        };
      });

      // Test 4: Storage sync
      await updateTestResult('storage', async () => {
        const result = await syncStorage(false);
        if (!result.success) {
          throw new Error(result.message);
        }
        return { 
          message: isZh ? '存储同步成功' : 'Storage sync successful',
          details: result.results
        };
      });

      // Test 5: Cleanup if needed
      if (results.some(r => r.status === 'error')) {
        tests.push({ test: 'cleanup', status: 'pending', message: isZh ? '清理损坏数据...' : 'Cleaning corrupted data...' });
        setResults([...tests]);
        
        await updateTestResult('cleanup', async () => {
          const result = await cleanupImages();
          if (!result.success) {
            throw new Error(result.message);
          }
          return { 
            message: isZh ? '数据清理完成' : 'Data cleanup completed',
            details: result.results
          };
        });
      }

    } catch (error) {
      console.error('Diagnostics error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const updateTestResult = async (testName: string, testFn: () => Promise<any> | any) => {
    try {
      const result = await testFn();
      setResults(prev => prev.map(test => 
        test.test === testName 
          ? { ...test, status: 'success', message: result.message, details: result.details }
          : test
      ));
    } catch (error: any) {
      setResults(prev => prev.map(test => 
        test.test === testName 
          ? { 
              ...test, 
              status: 'error', 
              message: error.message || (isZh ? '测试失败' : 'Test failed'),
              details: error
            }
          : test
      ));
    }
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'pending':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-blue-600" />
          {isZh ? '存储诊断工具' : 'Storage Diagnostics'}
        </CardTitle>
        <CardDescription>
          {isZh ? '检测图片存储系统的连接状态和数据同步' : 'Check image storage system connectivity and data sync'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {isZh ? '运行完整的系统诊断来检测和修复存储问题' : 'Run comprehensive system diagnostics to detect and fix storage issues'}
          </p>
          <div className="flex gap-2">
            <Button 
              onClick={async () => {
                if (!isOnline) return;
                setIsRunning(true);
                try {
                  const result = await cleanupImages();
                  console.log('Manual cleanup result:', result);
                  
                  // 显示清理结果
                  const cleanupTest: DiagnosticResult = {
                    test: 'manual-cleanup',
                    status: result.success ? 'success' : 'error',
                    message: result.message,
                    details: result.results
                  };
                  
                  setResults(prev => [...prev, cleanupTest]);
                } catch (error) {
                  console.error('Manual cleanup error:', error);
                  const errorTest: DiagnosticResult = {
                    test: 'manual-cleanup',
                    status: 'error',
                    message: `${isZh ? '清理失败' : 'Cleanup failed'}: ${error.message}`,
                    details: error
                  };
                  setResults(prev => [...prev, errorTest]);
                } finally {
                  setIsRunning(false);
                }
              }}
              disabled={isRunning || !isOnline}
              variant="outline"
              size="sm"
              title={isZh ? '清理损坏的图片数据' : 'Clean corrupted image data'}
            >
              <Database className={`w-4 h-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
              {isRunning ? (isZh ? '清理中...' : 'Cleaning...') : (isZh ? '清理' : 'Cleanup')}
            </Button>
            <Button 
              onClick={runDiagnostics}
              disabled={isRunning || !isOnline}
              className="flex items-center gap-2"
            >
              <Settings className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
              {isRunning ? (isZh ? '诊断中...' : 'Running...') : (isZh ? '开始诊断' : 'Start Diagnostics')}
            </Button>
          </div>
        </div>

        {!isOnline && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              {isZh ? '当前处于离线模式，某些诊断功能可能不可用' : 'Currently in offline mode, some diagnostic features may not be available'}
            </AlertDescription>
          </Alert>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Database className="w-4 h-4" />
              {isZh ? '诊断结果' : 'Diagnostic Results'}
            </h4>
            
            {results.map((result, index) => (
              <div 
                key={result.test} 
                className={`p-3 rounded-lg border ${getStatusColor(result.status)} transition-all duration-200`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <span className="font-medium text-sm">
                      {result.test === 'connection' && (isZh ? '网络连接' : 'Network Connection')}
                      {result.test === 'server' && (isZh ? '服务器状态' : 'Server Status')}
                      {result.test === 'images' && (isZh ? '图片数据' : 'Images Data')}
                      {result.test === 'storage' && (isZh ? '存储同步' : 'Storage Sync')}
                      {result.test === 'cleanup' && (isZh ? '数据清理' : 'Data Cleanup')}
                      {result.test === 'manual-cleanup' && (isZh ? '手动清理' : 'Manual Cleanup')}
                    </span>
                  </div>
                  <Badge 
                    variant={result.status === 'success' ? 'default' : result.status === 'error' ? 'destructive' : 'secondary'}
                  >
                    {result.status === 'pending' && (isZh ? '检测中' : 'Testing')}
                    {result.status === 'success' && (isZh ? '正常' : 'OK')}
                    {result.status === 'warning' && (isZh ? '警告' : 'Warning')}
                    {result.status === 'error' && (isZh ? '错误' : 'Error')}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                
                {result.details && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                      {isZh ? '查看详情' : 'View Details'}
                    </summary>
                    <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}

        {results.length > 0 && !isRunning && (
          <div className="pt-4 border-t">
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <p className="font-medium mb-2">{isZh ? '常见问题解决方案:' : 'Common Solutions:'}</p>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>{isZh ? '如果图片无法显示，请点击"同步"按钮' : 'If images don\'t display, click the "Sync" button'}</li>
                  <li>{isZh ? '网络错误时请检查互联网连接' : 'Check internet connection for network errors'}</li>
                  <li>{isZh ? '存储错误可能需要重新配置Supabase' : 'Storage errors may require Supabase reconfiguration'}</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}