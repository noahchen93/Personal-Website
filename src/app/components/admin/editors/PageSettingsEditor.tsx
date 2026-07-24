import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2, Plus, Trash2, Link, ExternalLink } from 'lucide-react';
import { useContent, ContentItem } from '../../content/ContentContext';
import EditorHeader from '../shared/EditorHeader';
import StatusMessage from '../shared/StatusMessage';
import MarkdownEditor from '../MarkdownEditor';

interface NavigationButton {
  id: string;
  text: string;
  target: string;
  style: 'primary' | 'secondary';
  external?: boolean;
}

interface PageSettings {
  home?: {
    title: string;
    subtitle: string;
    navigationButtons: NavigationButton[];
  };
  projects?: {
    title: string;
    subtitle: string;
    navigationButtons: NavigationButton[];
  };
  interests?: {
    title: string;
    subtitle: string;
    navigationButtons: NavigationButton[];
  };
  blog?: {
    title: string;
    subtitle: string;
    navigationButtons: NavigationButton[];
  };
  contact?: {
    title: string;
    subtitle: string;
    description: string;
    navigationButtons: NavigationButton[];
  };
}

interface PageSettingsEditorProps {
  onBack: () => void;
}

export default function PageSettingsEditor({ onBack }: PageSettingsEditorProps) {
  const { getContent, updateContent, createContent } = useContent();
  const [pageSettings, setPageSettings] = useState<PageSettings>({
    home: {
      title: '欢迎来到我的作品集',
      subtitle: '展示我的项目经历、个人兴趣和创作成果',
      navigationButtons: []
    },
    projects: {
      title: '项目经历',
      subtitle: '记录我的项目经验、技术成长和创作历程',
      navigationButtons: []
    },
    interests: {
      title: '个人兴趣',
      subtitle: '分享我在技术之外的兴趣爱好和思考，记录生活中的点点滴滴',
      navigationButtons: []
    },
    blog: {
      title: '博客文章',
      subtitle: '分享技术见解、学习心得和生活感悟',
      navigationButtons: []
    },
    contact: {
      title: '联系我',
      subtitle: '欢迎交流合作，期待与您建立联系',
      description: '无论是技术交流、项目合作还是其他任何话题，我都很期待与您的交流。请选择最适合的方式联系我。',
      navigationButtons: []
    }
  });
  const [pageSettingsContent, setPageSettingsContent] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<keyof PageSettings>('home');

  const pageNames = {
    home: '首页',
    projects: '项目经历',
    interests: '个人兴趣',
    blog: '博客',
    contact: '联系我'
  };

  useEffect(() => {
    loadPageSettings();
  }, []);

  const loadPageSettings = async () => {
    try {
      const content = await getContent('page-settings');
      if (content.length > 0) {
        setPageSettingsContent(content[0]);
        const data = content[0].data || {};
        setPageSettings({
          home: data.home || pageSettings.home,
          projects: data.projects || pageSettings.projects,
          interests: data.interests || pageSettings.interests,
          blog: data.blog || pageSettings.blog,
          contact: data.contact || pageSettings.contact
        });
      }
    } catch (error) {
      console.error('Error loading page settings:', error);
      setMessage({ type: 'error', text: '加载页面设置失败' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (pageSettingsContent) {
        await updateContent(pageSettingsContent.id, { data: pageSettings });
        setMessage({ type: 'success', text: '页面设置已保存' });
      } else {
        const newContent = await createContent({
          type: 'page-settings',
          title: 'Page Settings',
          data: pageSettings,
          is_published: true
        });
        setPageSettingsContent(newContent);
        setMessage({ type: 'success', text: '页面设置已创建' });
      }
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving page settings:', error);
      setMessage({ type: 'error', text: '保存失败，请重试' });
    } finally {
      setIsSaving(false);
    }
  };

  const updatePageSetting = (page: keyof PageSettings, field: string, value: string) => {
    setPageSettings(prev => ({
      ...prev,
      [page]: {
        ...prev[page],
        [field]: value
      }
    }));
  };

  const addNavigationButton = (page: keyof PageSettings) => {
    const newButton: NavigationButton = {
      id: `nav-${Date.now()}`,
      text: '新按钮',
      target: '',
      style: 'primary'
    };
    setPageSettings(prev => ({
      ...prev,
      [page]: {
        ...prev[page]!,
        navigationButtons: [...(prev[page]?.navigationButtons || []), newButton]
      }
    }));
  };

  const updateNavigationButton = (page: keyof PageSettings, buttonId: string, field: keyof NavigationButton, value: string | boolean) => {
    setPageSettings(prev => ({
      ...prev,
      [page]: {
        ...prev[page]!,
        navigationButtons: (prev[page]?.navigationButtons || []).map(button =>
          button.id === buttonId ? { ...button, [field]: value } : button
        )
      }
    }));
  };

  const removeNavigationButton = (page: keyof PageSettings, buttonId: string) => {
    setPageSettings(prev => ({
      ...prev,
      [page]: {
        ...prev[page]!,
        navigationButtons: (prev[page]?.navigationButtons || []).filter(button => button.id !== buttonId)
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const currentPageSettings = pageSettings[activeTab];

  return (
    <div className="space-y-6">
      <EditorHeader
        title="页面设置管理"
        onBack={onBack}
        onSave={handleSave}
        isSaving={isSaving}
      />

      {message && (
        <StatusMessage type={message.type} message={message.text} />
      )}

      {/* 页面选择标签 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex space-x-1 overflow-x-auto">
          {Object.entries(pageNames).map(([key, name]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as keyof PageSettings)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === key
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {pageNames[activeTab]} 页面设置
          </h3>
        </div>

        {/* 基础设置 */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">页面标题</label>
            <input
              type="text"
              value={currentPageSettings?.title || ''}
              onChange={(e) => updatePageSetting(activeTab, 'title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="页面主标题"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">页面副标题</label>
            <input
              type="text"
              value={currentPageSettings?.subtitle || ''}
              onChange={(e) => updatePageSetting(activeTab, 'subtitle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="页面副标题或描述"
            />
          </div>

          {/* 联系页面额外的描述字段 */}
          {activeTab === 'contact' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">页面描述</label>
              <textarea
                value={(pageSettings.contact as any)?.description || ''}
                onChange={(e) => updatePageSetting(activeTab, 'description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="详细的页面描述"
              />
            </div>
          )}
        </div>

        {/* 跳转按钮管理 */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">页面跳转按钮</h4>
            <button
              onClick={() => addNavigationButton(activeTab)}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>添加按钮</span>
            </button>
          </div>

          <div className="space-y-4">
            {(currentPageSettings?.navigationButtons || []).map((button) => (
              <div key={button.id} className="bg-gray-50 rounded-lg p-4 relative">
                <button
                  onClick={() => removeNavigationButton(activeTab, button.id)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">按钮文字</label>
                    <input
                      type="text"
                      value={button.text}
                      onChange={(e) => updateNavigationButton(activeTab, button.id, 'text', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="按钮显示文字"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">跳转目标</label>
                    <select
                      value={button.external ? 'external' : button.target}
                      onChange={(e) => {
                        if (e.target.value === 'external') {
                          updateNavigationButton(activeTab, button.id, 'external', true);
                          updateNavigationButton(activeTab, button.id, 'target', '');
                        } else {
                          updateNavigationButton(activeTab, button.id, 'external', false);
                          updateNavigationButton(activeTab, button.id, 'target', e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">选择页面</option>
                      <option value="home">首页</option>
                      <option value="projects">项目经历</option>
                      <option value="interests">个人兴趣</option>
                      <option value="blog">博客</option>
                      <option value="contact">联系我</option>
                      <option value="external">外部链接</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">按钮样式</label>
                    <select
                      value={button.style}
                      onChange={(e) => updateNavigationButton(activeTab, button.id, 'style', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="primary">主要按钮（蓝色）</option>
                      <option value="secondary">次要按钮（白色边框）</option>
                    </select>
                  </div>
                </div>

                {button.external && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">外部链接URL</label>
                    <input
                      type="url"
                      value={button.target}
                      onChange={(e) => updateNavigationButton(activeTab, button.id, 'target', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com"
                    />
                  </div>
                )}
              </div>
            ))}

            {(currentPageSettings?.navigationButtons || []).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Link className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>还没有添加跳转按钮</p>
                <p className="text-sm">点击"添加按钮"来为这个页面添加跳转按钮</p>
              </div>
            )}
          </div>
        </div>

        {/* 使用说明 */}
        <div className="border-t border-gray-200 pt-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h5 className="font-medium text-blue-900 mb-2">使用说明</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 页面标题和副标题会显示在对应页面的顶部</li>
              <li>• 跳转按钮会显示在页面的适当位置，用于页面间导航</li>
              <li>• 外部链接按钮会在新窗口中打开</li>
              <li>• 按钮样式影响显示外观：主要按钮为蓝色背景，次要按钮为白色边框</li>
              <li>• 设置保存后会立即应用到对应页面</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}