import React, { useState } from 'react';
import { CheckSquare, Square, ExternalLink, Copy, AlertTriangle, CheckCircle, XCircle, FileText, Database, Key } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  action?: () => void;
  actionLabel?: string;
  url?: string;
  critical?: boolean;
}

export default function TroubleshootingGuide() {
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  
  // Move supabaseUrl declaration to the top to fix temporal dead zone issue
  const supabaseUrl = `https://${projectId}.supabase.co`;

  const toggleItem = (id: string) => {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(id)) {
      newCompleted.delete(id);
    } else {
      newCompleted.add(id);
    }
    setCompletedItems(newCompleted);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('已复制到剪贴板');
    });
  };

  const openApiKeysPage = () => {
    window.open(`https://supabase.com/dashboard/project/${projectId}/settings/api`, '_blank');
    alert('请复制 "anon public" 密钥，并更新 /utils/supabase/info.tsx 文件中的 publicAnonKey 值。');
  };

  const openManualSetupGuide = () => {
    window.open(`https://supabase.com/dashboard/project/${projectId}/sql`, '_blank');
    alert('请查看项目根目录的 DATABASE_MANUAL_SETUP.md 文件获取完整的设置指南，或复制其中的SQL脚本到刚打开的SQL编辑器中执行。');
  };

  const apiKeySetup: ChecklistItem[] = [
    {
      id: 'api-1',
      title: '🔑 获取真实的API密钥（必须）',
      description: '从Supabase控制台获取anon public密钥并更新配置文件',
      critical: true,
      action: openApiKeysPage,
      actionLabel: '获取API密钥'
    },
    {
      id: 'api-2',
      title: '📝 更新配置文件',
      description: '编辑 /utils/supabase/info.tsx 文件，替换 publicAnonKey 值',
      critical: true,
      action: () => copyToClipboard('/utils/supabase/info.tsx'),
      actionLabel: '复制文件路径'
    }
  ];

  const criticalSetup: ChecklistItem[] = [
    {
      id: 'critical-1',
      title: '🚨 创建数据库表（必须）',
      description: '这是最关键的步骤！数据库表不存在会导致所有功能无法工作',
      critical: true,
      action: openManualSetupGuide,
      actionLabel: '打开设置指南'
    },
    {
      id: 'critical-2',
      title: '🚨 创建存储桶（必须）',
      description: '创建名为 "make-55b791b3-portfolio-assets" 的存储桶用于图片上传',
      critical: true,
      url: `https://supabase.com/dashboard/project/${projectId}/storage/buckets`
    }
  ];

  const edgeFunctionChecklist: ChecklistItem[] = [
    {
      id: 'ef-1',
      title: '确认项目ID正确',
      description: `当前项目ID: ${projectId}`,
      action: () => copyToClipboard(projectId),
      actionLabel: '复制ID'
    },
    {
      id: 'ef-2',
      title: '检查 Edge Functions 控制台',
      description: '确认函数 "server" 存在且已部署',
      url: `https://supabase.com/dashboard/project/${projectId}/functions`
    },
    {
      id: 'ef-3',
      title: '测试健康检查端点',
      description: '直接在浏览器中测试函数响应',
      url: `${supabaseUrl}/functions/v1/make-server-55b791b3/health`
    },
    {
      id: 'ef-4',
      title: '检查函数日志',
      description: '查看是否有部署或运行错误',
      url: `https://supabase.com/dashboard/project/${projectId}/logs/edge-functions`
    }
  ];

  const databaseChecklist: ChecklistItem[] = [
    {
      id: 'db-1',
      title: '验证表创建完成',
      description: '确认 content, files, images, chat_logs 表已创建',
      url: `https://supabase.com/dashboard/project/${projectId}/editor`
    },
    {
      id: 'db-2',
      title: '检查示例数据',
      description: '确认已插入初始示例数据'
    },
    {
      id: 'db-3',
      title: '验证 RLS 策略',
      description: '确认行级安全策略已正确设置',
      url: `https://supabase.com/dashboard/project/${projectId}/auth/policies`
    }
  ];

  const storageChecklist: ChecklistItem[] = [
    {
      id: 'st-1',
      title: '验证存储桶存在',
      description: '确认 "make-55b791b3-portfolio-assets" 存储桶已创建',
      url: `https://supabase.com/dashboard/project/${projectId}/storage/buckets`
    },
    {
      id: 'st-2',
      title: '设置存储桶为私有',
      description: '确保存储桶设置为私有（不公开）'
    },
    {
      id: 'st-3',
      title: '配置文件类型限制',
      description: '允许的文件类型：image/*, video/*, audio/*, application/pdf'
    },
    {
      id: 'st-4',
      title: '设置文件大小限制',
      description: '设置最大文件大小为 10MB'
    }
  ];

  const authChecklist: ChecklistItem[] = [
    {
      id: 'au-1',
      title: '检查认证设置',
      description: '确认认证提供商已启用',
      url: `https://supabase.com/dashboard/project/${projectId}/auth/providers`
    },
    {
      id: 'au-2',
      title: '验证 API 密钥',
      description: '确认 anon key 和 service_role key 正确',
      url: `https://supabase.com/dashboard/project/${projectId}/settings/api`
    },
    {
      id: 'au-3',
      title: '测试管理员登录',
      description: '使用 admin@demo.com / admin123 测试登录'
    }
  ];

  const renderChecklist = (title: string, items: ChecklistItem[], color: string, icon?: React.ReactNode) => (
    <div className={`border-2 rounded-lg p-4 ${
      items.some(item => item.critical) 
        ? 'border-red-300 bg-red-50' 
        : 'border-gray-200'
    }`}>
      <h4 className={`font-medium text-${color}-900 mb-4 flex items-center space-x-2`}>
        {icon || <div className={`w-3 h-3 rounded-full bg-${color}-500`} />}
        <span>{title}</span>
        {items.some(item => item.critical) && (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-2">
            必须完成
          </span>
        )}
      </h4>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className={`flex items-start space-x-3 ${
            item.critical ? 'bg-red-100/50 p-3 rounded-lg border border-red-200' : ''
          }`}>
            <button
              onClick={() => toggleItem(item.id)}
              className="mt-1 flex-shrink-0"
            >
              {completedItems.has(item.id) ? (
                <CheckSquare className="w-5 h-5 text-green-600" />
              ) : (
                <Square className={`w-5 h-5 ${item.critical ? 'text-red-500' : 'text-gray-400'}`} />
              )}
            </button>
            <div className="flex-1">
              <h5 className={`font-medium ${item.critical ? 'text-red-900' : 'text-gray-900'}`}>
                {item.title}
              </h5>
              <p className={`text-sm ${item.critical ? 'text-red-800' : 'text-gray-600'}`}>
                {item.description}
              </p>
              <div className="flex space-x-2 mt-2">
                {item.url && (
                  <button
                    onClick={() => window.open(item.url, '_blank')}
                    className={`text-xs px-2 py-1 rounded hover:opacity-80 transition-colors flex items-center space-x-1 ${
                      item.critical 
                        ? 'bg-red-600 text-white' 
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>打开</span>
                  </button>
                )}
                {item.action && item.actionLabel && (
                  <button
                    onClick={item.action}
                    className={`text-xs px-2 py-1 rounded hover:opacity-80 transition-colors flex items-center space-x-1 ${
                      item.critical 
                        ? 'bg-red-700 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {item.critical ? <Key className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{item.actionLabel}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const totalItems = apiKeySetup.length + criticalSetup.length + edgeFunctionChecklist.length + databaseChecklist.length + storageChecklist.length + authChecklist.length;
  const progress = (completedItems.size / totalItems) * 100;
  
  // Utility functions
  const validateApiKey = (apiKey: string): boolean => {
    if (!apiKey || typeof apiKey !== 'string') return false;
    if (!apiKey.startsWith('eyJ')) return false;
    const parts = apiKey.split('.');
    if (parts.length !== 3) return false;
    if (apiKey.length < 100) return false;
    
    try {
      const header = JSON.parse(atob(parts[0]));
      return !!(header.alg && header.typ);
    } catch {
      return false;
    }
  };
  
  const isUsingPlaceholderKey = (): boolean => {
    return publicAnonKey === 'YOUR_NEW_ANON_KEY' || 
           publicAnonKey === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' ||
           !validateApiKey(publicAnonKey);
  };
  
  const apiKeyCompleted = apiKeySetup.every(item => completedItems.has(item.id));
  const criticalCompleted = criticalSetup.every(item => completedItems.has(item.id));
  const isApiKeyValid = !isUsingPlaceholderKey() && validateApiKey(publicAnonKey);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">故障排除检查清单</h3>
          <p className="text-sm text-gray-600">
            {isUsingPlaceholderKey() ? (
              <span className="text-red-600">🔑 请先配置API密钥，这是连接Supabase的前提条件</span>
            ) : !criticalCompleted ? (
              <span className="text-red-600">⚠️ 请完成关键设置步骤，否则应用无法正常工作</span>
            ) : (
              '逐步检查和修复所有配置问题'
            )}
          </p>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${
            isApiKeyValid ? (criticalCompleted ? 'text-blue-600' : 'text-yellow-600') : 'text-red-600'
          }`}>
            {Math.round(progress)}%
          </div>
          <div className="text-xs text-gray-600">
            {completedItems.size} / {totalItems} 完成
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className={`h-3 rounded-full transition-all duration-300 ${
            isApiKeyValid ? (criticalCompleted ? 'bg-blue-600' : 'bg-yellow-500') : 'bg-red-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* API Key Setup Alert */}
      {isUsingPlaceholderKey() && (
        <div className="border-2 border-red-300 rounded-lg p-4 bg-red-50">
          <div className="flex items-center space-x-2 mb-2">
            <Key className="w-5 h-5 text-red-600" />
            <h4 className="font-medium text-red-900">🔑 API密钥配置错误</h4>
          </div>
          <p className="text-sm text-red-800 mb-3">
            检测到JWT认证错误(401 Invalid JWT)。当前使用的是示例API密钥，需要配置真实密钥。
          </p>
          <div className="flex space-x-2">
            <button
              onClick={openApiKeysPage}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <Key className="w-4 h-4" />
              <span>获取真实API密钥</span>
            </button>
            <button
              onClick={() => copyToClipboard('API_KEY_SETUP.md')}
              className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition-colors"
            >
              查看详细指南
            </button>
          </div>
        </div>
      )}

      {/* Critical Setup Alert */}
      {isApiKeyValid && !criticalCompleted && (
        <div className="border-2 border-yellow-300 rounded-lg p-4 bg-yellow-50">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h4 className="font-medium text-yellow-900">⚠️ 需要完成关键设置</h4>
          </div>
          <p className="text-sm text-yellow-800 mb-3">
            API密钥已配置正确，现在需要创建数据库表和存储桶。
          </p>
          <div className="flex space-x-2">
            <button
              onClick={openManualSetupGuide}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
            >
              <Database className="w-4 h-4" />
              <span>创建数据库表</span>
            </button>
            <button
              onClick={() => window.open(`https://supabase.com/dashboard/project/${projectId}/storage/buckets`, '_blank')}
              className="bg-yellow-700 text-white px-4 py-2 rounded-lg hover:bg-yellow-800 transition-colors"
            >
              创建存储桶
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={() => window.open(`https://supabase.com/dashboard/project/${projectId}`, '_blank')}
          className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ExternalLink className="w-4 h-4 text-blue-600" />
          <span className="text-sm">Supabase 控制台</span>
        </button>
        <button
          onClick={openApiKeysPage}
          className={`flex items-center space-x-2 p-3 border rounded-lg transition-colors ${
            isUsingPlaceholderKey() 
              ? 'border-red-200 bg-red-50 hover:bg-red-100' 
              : 'border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Key className={`w-4 h-4 ${isUsingPlaceholderKey() ? 'text-red-600' : 'text-green-600'}`} />
          <span className="text-sm">API 密钥</span>
        </button>
        <button
          onClick={() => window.open(`https://supabase.com/dashboard/project/${projectId}/sql`, '_blank')}
          className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Database className="w-4 h-4 text-purple-600" />
          <span className="text-sm">SQL 编辑器</span>
        </button>
        <button
          onClick={() => window.open(`https://supabase.com/dashboard/project/${projectId}/storage/buckets`, '_blank')}
          className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ExternalLink className="w-4 h-4 text-orange-600" />
          <span className="text-sm">存储管理</span>
        </button>
      </div>

      {/* Checklists */}
      <div className="space-y-6">
        {isUsingPlaceholderKey() && 
          renderChecklist('🔑 API密钥配置（必须先完成）', apiKeySetup, 'red', <Key className="w-4 h-4 text-red-600" />)
        }
        {renderChecklist('🚨 关键设置（必须完成）', criticalSetup, 'red', <AlertTriangle className="w-4 h-4 text-red-600" />)}
        {renderChecklist('Edge Functions 配置', edgeFunctionChecklist, 'blue')}
        {renderChecklist('数据库验证', databaseChecklist, 'green')}
        {renderChecklist('存储配置', storageChecklist, 'purple')}
        {renderChecklist('认证设置', authChecklist, 'orange')}
      </div>

      {/* Summary */}
      <div className={`border rounded-lg p-4 ${
        progress === 100 
          ? 'border-green-200 bg-green-50' 
          : isApiKeyValid 
            ? 'border-yellow-200 bg-yellow-50' 
            : 'border-red-200 bg-red-50'
      }`}>
        <div className="flex items-center space-x-2">
          {progress === 100 ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : isApiKeyValid ? (
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
          <h4 className={`font-medium ${
            progress === 100 
              ? 'text-green-900' 
              : isApiKeyValid 
                ? 'text-yellow-900' 
                : 'text-red-900'
          }`}>
            {progress === 100 
              ? '✅ 所有检查项已完成！' 
              : isApiKeyValid 
                ? '⚠️ API密钥已配置，继续完成其他设置' 
                : '❌ 需要先配置API密钥'}
          </h4>
        </div>
        <p className={`text-sm mt-1 ${
          progress === 100 
            ? 'text-green-800' 
            : isApiKeyValid 
              ? 'text-yellow-800' 
              : 'text-red-800'
        }`}>
          {progress === 100 
            ? 'Supabase 已完全配置，您的应用应该能正常工作了！' 
            : isApiKeyValid 
              ? 'API密钥配置正确，现在需要创建数据库表和存储桶。' 
              : '请先从Supabase控制台获取真实的API密钥并更新配置文件。'}
        </p>
      </div>

      {/* API Key Status */}
      <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
        <h4 className="font-medium text-blue-900 mb-2 flex items-center space-x-2">
          <Key className="w-4 h-4" />
          <span>API密钥状态</span>
        </h4>
        <div className="text-sm text-blue-800 space-y-2">
          <div className="flex items-center space-x-2">
            <span>当前状态:</span>
            <span className={`px-2 py-1 rounded text-xs ${
              isUsingPlaceholderKey() 
                ? 'bg-red-100 text-red-800' 
                : isApiKeyValid 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
            }`}>
              {isUsingPlaceholderKey() 
                ? '使用示例密钥' 
                : isApiKeyValid 
                  ? 'API密钥有效' 
                  : '密钥格式错误'}
            </span>
          </div>
          {isUsingPlaceholderKey() && (
            <p className="text-xs bg-blue-200 p-2 rounded">
              当前401错误是因为使用了示例API密钥。请按照上面的步骤获取真实密钥。
            </p>
          )}
        </div>
      </div>
    </div>
  );
}