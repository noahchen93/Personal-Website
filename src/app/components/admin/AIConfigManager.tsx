import React, { useState, useEffect } from 'react';
import { Settings, Key, Globe, Brain, CheckCircle, XCircle, AlertCircle, ExternalLink, Copy, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useLanguage } from '../language/LanguageContext';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface AIConfig {
  ai_configured: boolean;
  provider: string;
  model: string;
  has_api_url: boolean;
  has_api_key: boolean;
  timestamp: string;
}

const AI_PROVIDERS = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-3.5-turbo, GPT-4, etc.',
    defaultModel: 'gpt-3.5-turbo',
    apiUrlExample: 'https://api.openai.com/v1/chat/completions',
    models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o']
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Claude-3, Claude-3.5, etc.',
    defaultModel: 'claude-3-5-sonnet-20241022',
    apiUrlExample: 'https://api.anthropic.com/v1/messages',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307']
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Gemini Pro, Gemini Ultra, etc.',
    defaultModel: 'gemini-1.5-pro',
    apiUrlExample: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=YOUR_API_KEY',
    models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro']
  },
  {
    id: 'custom',
    name: 'Custom API',
    description: 'Your own AI API endpoint',
    defaultModel: 'custom-model',
    apiUrlExample: 'https://your-api.com/v1/chat/completions',
    models: []
  }
];

export default function AIConfigManager() {
  const { isZh } = useLanguage();
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');
  const [customApiUrl, setCustomApiUrl] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');

  useEffect(() => {
    checkAIConfig();
  }, []);

  const checkAIConfig = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-55b791b3/ai/config`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConfig(data);
        setSelectedProvider(data.provider || 'openai');
        setSelectedModel(data.model || 'gpt-3.5-turbo');
      }
    } catch (error) {
      console.error('Failed to check AI config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentProvider = () => {
    return AI_PROVIDERS.find(p => p.id === selectedProvider) || AI_PROVIDERS[0];
  };

  const getStatusIcon = () => {
    if (!config) return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    if (config.ai_configured) return <CheckCircle className="w-5 h-5 text-green-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusText = () => {
    if (!config) return isZh ? '检查中...' : 'Checking...';
    if (config.ai_configured) return isZh ? 'AI已配置' : 'AI Configured';
    return isZh ? 'AI未配置' : 'AI Not Configured';
  };

  const getStatusColor = () => {
    if (!config) return 'text-yellow-600';
    if (config.ai_configured) return 'text-green-600';
    return 'text-red-600';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(isZh ? '已复制到剪贴板' : 'Copied to clipboard');
  };

  const testAIConnection = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-55b791b3/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          message: isZh ? '你好，这是一个测试消息' : 'Hello, this is a test message'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success(isZh ? 'AI连接测试成功！' : 'AI connection test successful!');
        } else {
          toast.error(isZh ? 'AI连接测试失败' : 'AI connection test failed');
        }
      }
    } catch (error) {
      toast.error(isZh ? 'AI连接测试失败' : 'AI connection test failed');
    }
  };

  if (isLoading) {
    return (
      <Card className="border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            <span>{isZh ? '检查AI配置...' : 'Checking AI configuration...'}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <span>{isZh ? 'AI聊天配置' : 'AI Chat Configuration'}</span>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className={`text-sm ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {!config?.ai_configured && (
          <div className="bg-[rgba(60,96,82,1)] border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800 mb-1">
                  {isZh ? 'AI功能未配置' : 'AI Features Not Configured'}
                </h4>
                <p className="text-sm text-yellow-700">
                  {isZh 
                    ? '当前AI聊天功能使用演示模式。要启用真实的AI对话，请配置以下环境变量。'
                    : 'AI chat currently uses demo mode. To enable real AI conversations, please configure the following environment variables.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{isZh ? '当前状态' : 'Current Status'}</Label>
            <div className="p-3 bg-[rgba(54,78,100,1)] rounded-lg space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>{isZh ? '提供商:' : 'Provider:'}</span>
                <span className="font-mono">{config?.provider || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>{isZh ? '模型:' : 'Model:'}</span>
                <span className="font-mono">{config?.model || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>{isZh ? 'API URL:' : 'API URL:'}</span>
                <span className={config?.has_api_url ? 'text-green-600' : 'text-red-600'}>
                  {config?.has_api_url ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>{isZh ? 'API密钥:' : 'API Key:'}</span>
                <span className={config?.has_api_key ? 'text-green-600' : 'text-red-600'}>
                  {config?.has_api_key ? '✓' : '✗'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{isZh ? '操作' : 'Actions'}</Label>
            <div className="space-y-2">
              <Button 
                onClick={() => setIsExpanded(!isExpanded)}
                variant="outline" 
                className="w-full"
              >
                <Settings className="w-4 h-4 mr-2" />
                {isZh ? '配置AI' : 'Configure AI'}
              </Button>
              
              {config?.ai_configured && (
                <Button 
                  onClick={testAIConnection}
                  variant="secondary" 
                  className="w-full"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {isZh ? '测试连接' : 'Test Connection'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="border-t pt-4 space-y-4">
            <h4 className="font-medium flex items-center space-x-2">
              <Key className="w-4 h-4" />
              <span>{isZh ? '环境变量配置' : 'Environment Variables Configuration'}</span>
            </h4>

            <div className="space-y-4">
              <div>
                <Label>{isZh ? 'AI提供商' : 'AI Provider'}</Label>
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_PROVIDERS.map(provider => (
                      <SelectItem key={provider.id} value={provider.id}>
                        <div>
                          <div className="font-medium">{provider.name}</div>
                          <div className="text-xs text-gray-500">{provider.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{isZh ? 'AI模型' : 'AI Model'}</Label>
                {getCurrentProvider().models.length > 0 ? (
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getCurrentProvider().models.map(model => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    placeholder={isZh ? '输入自定义模型名称' : 'Enter custom model name'}
                  />
                )}
              </div>

              <div>
                <Label className="flex items-center justify-between">
                  <span>API URL</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(getCurrentProvider().apiUrlExample)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </Label>
                <Input
                  value={customApiUrl || getCurrentProvider().apiUrlExample}
                  onChange={(e) => setCustomApiUrl(e.target.value)}
                  placeholder={getCurrentProvider().apiUrlExample}
                />
              </div>

              <div>
                <Label className="flex items-center justify-between">
                  <span>API Key</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                </Label>
                <Input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder={isZh ? '输入API密钥' : 'Enter API key'}
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-800 mb-2">
                {isZh ? '配置说明' : 'Configuration Instructions'}
              </h5>
              <div className="text-sm text-blue-700 space-y-2">
                <p>
                  {isZh 
                    ? '在Supabase项目的Settings -> Edge Functions -> Environment Variables中添加以下变量:'
                    : 'Add the following variables in your Supabase project Settings -> Edge Functions -> Environment Variables:'
                  }
                </p>
                <div className="bg-white rounded border p-3 font-mono text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span>AI_PROVIDER = {selectedProvider}</span>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`AI_PROVIDER=${selectedProvider}`)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>AI_MODEL = {selectedModel}</span>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`AI_MODEL=${selectedModel}`)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>AI_API_URL = {customApiUrl || getCurrentProvider().apiUrlExample}</span>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`AI_API_URL=${customApiUrl || getCurrentProvider().apiUrlExample}`)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>AI_API_KEY = {apiKeyInput ? '***' + apiKeyInput.slice(-4) : 'your_api_key_here'}</span>
                    <Button variant="ghost" size="sm" onClick={() => apiKeyInput && copyToClipboard(`AI_API_KEY=${apiKeyInput}`)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <p className="flex items-center space-x-1">
                  <ExternalLink className="w-3 h-3" />
                  <a 
                    href="https://supabase.com/docs/guides/functions/environment-variables" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {isZh ? '查看Supabase环境变量文档' : 'View Supabase Environment Variables Documentation'}
                  </a>
                </p>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-800 mb-2">
                {isZh ? '获取API密钥' : 'Getting API Keys'}
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <a 
                  href="https://platform.openai.com/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-blue-600 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>OpenAI API Keys</span>
                </a>
                <a 
                  href="https://console.anthropic.com/settings/keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-blue-600 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Anthropic API Keys</span>
                </a>
                <a 
                  href="https://makersuite.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-blue-600 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Google AI Studio</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}