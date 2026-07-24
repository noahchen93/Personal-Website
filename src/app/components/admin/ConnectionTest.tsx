import React, { useState } from 'react';
import { Play, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey, supabaseUrl } from '../../utils/supabase/info';

interface TestResult {
  name: string;
  url: string;
  status: 'pending' | 'success' | 'error' | 'loading';
  response?: any;
  error?: string;
  duration?: number;
}

export default function ConnectionTest() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const endpoints = [
    {
      name: '健康检查',
      url: `${supabaseUrl}/functions/v1/make-server-55b791b3/health`,
      method: 'GET'
    },
    {
      name: '内容API - Home',
      url: `${supabaseUrl}/functions/v1/make-server-55b791b3/content/home`,
      method: 'GET'
    },
    {
      name: '内容API - Projects',
      url: `${supabaseUrl}/functions/v1/make-server-55b791b3/content/projects`,
      method: 'GET'
    },
    {
      name: '内容API - Interests',
      url: `${supabaseUrl}/functions/v1/make-server-55b791b3/content/interests`,
      method: 'GET'
    },
    {
      name: '图片API',
      url: `${supabaseUrl}/functions/v1/make-server-55b791b3/images`,
      method: 'GET'
    },
    {
      name: '数据库表检查',
      url: `${supabaseUrl}/functions/v1/make-server-55b791b3/admin/check-tables`,
      method: 'GET'
    },
    {
      name: 'Supabase存储API',
      url: `${supabaseUrl}/storage/v1/bucket`,
      method: 'GET',
      headers: {
        'apikey': publicAnonKey
      }
    }
  ];

  const runAllTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = endpoints.map(endpoint => ({
      name: endpoint.name,
      url: endpoint.url,
      status: 'pending'
    }));
    setTests(results);

    for (let i = 0; i < endpoints.length; i++) {
      const endpoint = endpoints[i];
      const startTime = Date.now();
      
      // Update status to loading
      results[i].status = 'loading';
      setTests([...results]);

      try {
        const headers: Record<string, string> = {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
          ...endpoint.headers
        };

        const response = await fetch(endpoint.url, {
          method: endpoint.method,
          headers
        });

        const duration = Date.now() - startTime;
        
        if (response.ok) {
          const data = await response.json();
          results[i] = {
            ...results[i],
            status: 'success',
            response: data,
            duration
          };
        } else {
          const errorText = await response.text();
          results[i] = {
            ...results[i],
            status: 'error',
            error: `HTTP ${response.status}: ${errorText}`,
            duration
          };
        }
      } catch (error) {
        const duration = Date.now() - startTime;
        results[i] = {
          ...results[i],
          status: 'error',
          error: error instanceof Error ? error.message : '未知错误',
          duration
        };
      }

      setTests([...results]);
      
      // Add a small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'loading':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-300" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'loading':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">连接测试</h3>
          <p className="text-sm text-gray-600">测试所有API端点的连接状态</p>
        </div>
        <button
          onClick={runAllTests}
          disabled={isRunning}
          className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {isRunning ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          <span>{isRunning ? '测试中...' : '运行测试'}</span>
        </button>
      </div>

      {tests.length > 0 && (
        <div className="space-y-3">
          {tests.map((test, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${getStatusColor(test.status)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <h4 className="font-medium text-gray-900">{test.name}</h4>
                    <p className="text-xs text-gray-600 font-mono">{test.url}</p>
                  </div>
                </div>
                
                {test.duration && (
                  <span className="text-xs text-gray-500">
                    {test.duration}ms
                  </span>
                )}
              </div>

              {test.error && (
                <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded text-sm text-red-800">
                  <strong>错误:</strong> {test.error}
                </div>
              )}

              {test.response && (
                <details className="mt-3">
                  <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                    查看响应数据
                  </summary>
                  <pre className="text-xs text-gray-600 mt-2 whitespace-pre-wrap bg-white/50 p-2 rounded max-h-32 overflow-y-auto">
                    {JSON.stringify(test.response, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      {tests.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Play className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>点击"运行测试"开始连接测试</p>
        </div>
      )}

      {/* 测试结果摘要 */}
      {tests.length > 0 && !isRunning && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-2">测试结果摘要</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {tests.filter(t => t.status === 'success').length}
              </div>
              <div className="text-gray-600">成功</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {tests.filter(t => t.status === 'error').length}
              </div>
              <div className="text-gray-600">失败</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {tests.length}
              </div>
              <div className="text-gray-600">总数</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}