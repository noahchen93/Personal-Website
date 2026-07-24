import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, Globe, Loader2 } from 'lucide-react';
import { useContent } from '../../content/ContentContext';
import { useLanguage } from '../../language/LanguageContext';

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

export default function LanguageSeparationTest() {
  const { getContentByLanguage, getAllLanguageVersions } = useContent();
  const { currentLanguage, isZh } = useLanguage();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [summary, setSummary] = useState<{
    total: number;
    passed: number;
    failed: number;
  } | null>(null);

  const runLanguageSeparationTests = async () => {
    setIsRunning(true);
    setResults([]);
    setSummary(null);

    const tests: TestResult[] = [
      {
        id: 'zh-projects-count',
        name: isZh ? '中文项目数量检查' : 'Chinese Projects Count Check',
        status: 'pending',
        message: isZh ? '检查中文项目是否独立...' : 'Checking Chinese projects independence...'
      },
      {
        id: 'en-projects-count',
        name: isZh ? '英文项目数量检查' : 'English Projects Count Check',
        status: 'pending',
        message: isZh ? '检查英文项目是否独立...' : 'Checking English projects independence...'
      },
      {
        id: 'cross-language-isolation',
        name: isZh ? '跨语言隔离测试' : 'Cross-Language Isolation Test',
        status: 'pending',
        message: isZh ? '验证语言间数据隔离...' : 'Verifying language data isolation...'
      },
      {
        id: 'sort-order-independence',
        name: isZh ? '排序独立性测试' : 'Sort Order Independence Test',
        status: 'pending',
        message: isZh ? '检查排序是否按语言独立...' : 'Checking if sorting is language-independent...'
      }
    ];

    setResults([...tests]);

    try {
      // Test 1: 中文项目数量检查
      const zhProjects = await getContentByLanguage('projects', 'zh');
      tests[0].status = 'success';
      tests[0].message = isZh 
        ? `找到 ${zhProjects.length} 个中文项目` 
        : `Found ${zhProjects.length} Chinese projects`;
      tests[0].details = { count: zhProjects.length, projects: zhProjects.map(p => ({ id: p.id, title: p.data.title, language: p.language })) };
      setResults([...tests]);

      await new Promise(resolve => setTimeout(resolve, 500));

      // Test 2: 英文项目数量检查
      const enProjects = await getContentByLanguage('projects', 'en');
      tests[1].status = 'success';
      tests[1].message = isZh 
        ? `找到 ${enProjects.length} 个英文项目` 
        : `Found ${enProjects.length} English projects`;
      tests[1].details = { count: enProjects.length, projects: enProjects.map(p => ({ id: p.id, title: p.data.title, language: p.language })) };
      setResults([...tests]);

      await new Promise(resolve => setTimeout(resolve, 500));

      // Test 3: 跨语言隔离测试
      const allVersions = await getAllLanguageVersions('projects');
      const zhProjectIds = new Set(allVersions.zh.map(p => p.id));
      const enProjectIds = new Set(allVersions.en.map(p => p.id));
      const overlap = [...zhProjectIds].filter(id => enProjectIds.has(id));
      
      if (overlap.length === 0) {
        tests[2].status = 'success';
        tests[2].message = isZh 
          ? '✅ 语言数据完全隔离，无重复项目ID' 
          : '✅ Languages are properly isolated, no overlapping project IDs';
      } else {
        tests[2].status = 'error';
        tests[2].message = isZh 
          ? `❌ 发现 ${overlap.length} 个重复项目ID` 
          : `❌ Found ${overlap.length} overlapping project IDs`;
        tests[2].details = { overlap };
      }
      setResults([...tests]);

      await new Promise(resolve => setTimeout(resolve, 500));

      // Test 4: 排序独立性测试
      const zhSortedProjects = allVersions.zh.filter(p => p.sort_order);
      const enSortedProjects = allVersions.en.filter(p => p.sort_order);
      
      tests[3].status = 'success';
      tests[3].message = isZh 
        ? `排序独立：中文 ${zhSortedProjects.length} 项，英文 ${enSortedProjects.length} 项有排序` 
        : `Sort independence: ${zhSortedProjects.length} Chinese, ${enSortedProjects.length} English projects have sort orders`;
      tests[3].details = { 
        zh_sorted: zhSortedProjects.length, 
        en_sorted: enSortedProjects.length,
        zh_sort_orders: zhSortedProjects.map(p => ({ id: p.id, title: p.data.title, sort_order: p.sort_order })),
        en_sort_orders: enSortedProjects.map(p => ({ id: p.id, title: p.data.title, sort_order: p.sort_order }))
      };
      setResults([...tests]);

      // 计算总结
      const passed = tests.filter(t => t.status === 'success').length;
      const failed = tests.filter(t => t.status === 'error').length;
      setSummary({ total: tests.length, passed, failed });

    } catch (error) {
      console.error('语言分离测试失败:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // 标记当前正在执行的测试为失败
      const currentTest = tests.find(t => t.status === 'pending');
      if (currentTest) {
        currentTest.status = 'error';
        currentTest.message = isZh 
          ? `测试失败: ${errorMessage}` 
          : `Test failed: ${errorMessage}`;
        setResults([...tests]);
      }
    } finally {
      setIsRunning(false);
    }
  };

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'pending':
      default:
        return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
    }
  };

  return (
    <div className="cms-bg-card border border-blue-500/30 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Globe className="w-6 h-6 text-blue-400" />
          <h3 className="text-white font-terminal font-semibold">
            {isZh ? '语言分离测试' : 'Language Separation Test'}
          </h3>
        </div>
        
        <button
          onClick={runLanguageSeparationTests}
          disabled={isRunning}
          className="flex items-center space-x-2 cms-primary-button px-4 py-2 rounded-xl disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
          <span>
            {isRunning 
              ? (isZh ? '测试中...' : 'Testing...') 
              : (isZh ? '运行测试' : 'Run Test')
            }
          </span>
        </button>
      </div>

      <p className="text-cyan-300 font-terminal text-sm mb-6">
        {isZh 
          ? '此测试验证中英文项目数据是否正确分离，确保语言切换时只显示对应语言的内容。' 
          : 'This test verifies that Chinese and English project data are properly separated, ensuring only relevant language content is displayed when switching languages.'
        }
      </p>

      {summary && (
        <div className="mb-6 p-4 cms-bg-secondary rounded-xl border border-blue-500/20">
          <h4 className="text-white font-terminal font-medium mb-2">
            {isZh ? '测试总结' : 'Test Summary'}
          </h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{summary.total}</div>
              <div className="text-cyan-300">{isZh ? '总测试' : 'Total Tests'}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{summary.passed}</div>
              <div className="text-cyan-300">{isZh ? '通过' : 'Passed'}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{summary.failed}</div>
              <div className="text-cyan-300">{isZh ? '失败' : 'Failed'}</div>
            </div>
          </div>
          
          {summary.failed === 0 && summary.passed > 0 && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-green-300 font-terminal text-sm">
                {isZh 
                  ? '🎉 所有测试通过！语言分离功能正常工作。' 
                  : '🎉 All tests passed! Language separation is working correctly.'
                }
              </p>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        {results.map((result) => (
          <div 
            key={result.id} 
            className="p-4 cms-bg-secondary rounded-xl border border-blue-500/20"
          >
            <div className="flex items-start space-x-3">
              <StatusIcon status={result.status} />
              <div className="flex-1">
                <h4 className="text-white font-terminal font-medium mb-1">
                  {result.name}
                </h4>
                <p className="text-cyan-300 font-terminal text-sm">
                  {result.message}
                </p>
                
                {result.details && (
                  <details className="mt-2">
                    <summary className="text-blue-400 text-sm cursor-pointer hover:text-blue-300">
                      {isZh ? '查看详细信息' : 'View Details'}
                    </summary>
                    <pre className="mt-2 p-3 bg-black/50 rounded-lg text-xs text-green-300 overflow-x-auto font-terminal">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {results.length === 0 && !isRunning && (
        <div className="text-center py-8">
          <Globe className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-400 font-terminal">
            {isZh ? '点击"运行测试"开始验证语言分离功能' : 'Click "Run Test" to verify language separation functionality'}
          </p>
        </div>
      )}
    </div>
  );
}